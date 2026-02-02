import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";

// --- IMPORTS DE COMPONENTES ---
import MateriaNode from "./components/MateriaNode";
import Sidebar from "./components/Sidebar";
import ProgressBar from "./components/ProgressBar";
import SearchBar from "./components/SearchBar";
import LabelNode from "./components/LabelNode";
import LoginModal from "./components/LoginModal";
import ToastContainer from "./components/Toast";
import Footer from "./components/Footer";

// --- IMPORT DE DATOS MULTI-CARRERA ---
import { PLANES, DEFAULT_PLAN } from "./data/index";

const nodeTypes = { materia: MateriaNode, label: LabelNode };
const nodeWidth = 170;
const nodeHeight = 80;
const COLUMN_WIDTH = 350;

// --- PROCESAMIENTO DE DATOS ---
const processData = (data, userSelections = {}) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", nodesep: 30, ranksep: 120 });

  data.materias.forEach((m) =>
    dagreGraph.setNode(m.id, { width: nodeWidth, height: nodeHeight }),
  );
  data.correlatividades.forEach((c) => dagreGraph.setEdge(c.source, c.target));

  dagre.layout(dagreGraph);

  // 1. Mapeo inicial
  let materiaNodes = data.materias.map((m) => {
    const nodeWithPosition = dagreGraph.node(m.id);
    let positionX = m.cuatrimestre
      ? (m.cuatrimestre - 1) * COLUMN_WIDTH
      : nodeWithPosition.x - nodeWidth / 2;

    let displayLabel = m.label;
    if (userSelections[m.id]) {
      const grupo = m.grupo;
      if (grupo && data.opciones[grupo]) {
        const opt = data.opciones[grupo].find(
          (o) => o.label === userSelections[m.id],
        );
        if (opt) displayLabel = opt.label;
        else displayLabel = userSelections[m.id];
      } else {
        displayLabel = userSelections[m.id];
      }
    }

    return {
      id: m.id,
      type: "materia",
      data: {
        label: displayLabel,
        originalLabel: m.label,
        cuatrimestre: m.cuatrimestre,
        requeridas: m.requeridas || 0,
        esSlot: m.esSlot || false,
        grupo: m.grupo || null,
        descripcion: m.descripcion || null,
        link: m.link || null,
      },
      position: { x: positionX, y: nodeWithPosition.y - nodeHeight / 2 },
      style: { opacity: 1 },
    };
  });

  // 2. Anti-Colisión
  const GAP_VERTICAL = 30;
  const groupsByCuatri = {};

  materiaNodes.forEach((node) => {
    const cuatri = node.data.cuatrimestre || 999;
    if (!groupsByCuatri[cuatri]) groupsByCuatri[cuatri] = [];
    groupsByCuatri[cuatri].push(node);
  });

  Object.values(groupsByCuatri).forEach((group) => {
    group.sort((a, b) => a.position.y - b.position.y);
    for (let i = 1; i < group.length; i++) {
      const prevNode = group[i - 1];
      const currentNode = group[i];
      const minY = prevNode.position.y + nodeHeight + GAP_VERTICAL;
      if (currentNode.position.y < minY) {
        currentNode.position.y = minY;
      }
    }
  });

  // 3. Etiquetas
  const totalCuatrimestres = Math.max(
    ...data.materias.map((m) => m.cuatrimestre || 0),
  );
  const labelNodes = [];
  for (let i = 1; i <= totalCuatrimestres; i++) {
    labelNodes.push({
      id: `label-cuatri-${i}`,
      type: "label",
      draggable: false,
      selectable: false,
      data: { label: `${i}° Cuatrimestre` },
      position: { x: (i - 1) * COLUMN_WIDTH + nodeWidth / 2 - 100, y: -100 },
      zIndex: -1,
    });
  }

  const edges = data.correlatividades.map((c) => ({
    id: `${c.source}-${c.target}`,
    source: c.source,
    target: c.target,
    style: { stroke: "#71717a", strokeWidth: 1.5 },
    animated: false,
  }));

  return { nodes: [...materiaNodes, ...labelNodes], edges };
};

// --- HELPERS ---
function getAncestors(nodeId, edges) {
  const ancestorNodes = new Set();
  const traverse = (currentId) => {
    edges
      .filter((e) => e.target === currentId)
      .forEach((e) => {
        ancestorNodes.add(e.source);
        traverse(e.source);
      });
  };
  traverse(nodeId);
  return { nodes: ancestorNodes };
}
function getDescendants(nodeId, edges) {
  const descendantNodes = new Set();
  const traverse = (currentId) => {
    edges
      .filter((e) => e.source === currentId)
      .forEach((e) => {
        descendantNodes.add(e.target);
        traverse(e.target);
      });
  };
  traverse(nodeId);
  return { nodes: descendantNodes };
}

const getConnectedSet = (nodeId, edges) => {
  if (!nodeId) return new Set();
  const connected = new Set([nodeId]);
  const traverseUp = (currId) => {
    edges
      .filter((e) => e.target === currId)
      .forEach((e) => {
        connected.add(e.source);
        traverseUp(e.source);
      });
  };
  const traverseDown = (currId) => {
    edges
      .filter((e) => e.source === currId)
      .forEach((e) => {
        connected.add(e.target);
        traverseDown(e.target);
      });
  };
  traverseUp(nodeId);
  traverseDown(nodeId);
  return connected;
};

const getLockedBranch = (selections, planData) => {
  if (!planData.opciones) return null;
  const opt1Label = selections["OPT1"];
  if (opt1Label && planData.opciones.optativa1) {
    const option = planData.opciones.optativa1.find(
      (o) => o.label === opt1Label,
    );
    if (option) return option.rama;
  }
  return null;
};

// --- COMPONENTE PRINCIPAL ---
function Flow() {
  const { setCenter, fitView } = useReactFlow();

  const [currentPlanKey, setCurrentPlanKey] = useState(DEFAULT_PLAN);
  const [studentRecords, setStudentRecords] = useState({});
  const [studentGrades, setStudentGrades] = useState({});
  const [nodeSelections, setNodeSelections] = useState({});

  const initialData = useMemo(
    () => processData(PLANES[currentPlanKey].data, nodeSelections),
    [currentPlanKey, nodeSelections],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  useEffect(() => {
    const newData = processData(PLANES[currentPlanKey].data, nodeSelections);
    setNodes(newData.nodes);
    setEdges(newData.edges);
  }, [currentPlanKey, nodeSelections, setNodes, setEdges]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userCredentials, setUserCredentials] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  // --- PERSISTENCIA ---
  useEffect(() => {
    try {
      const rec = localStorage.getItem(`records-${currentPlanKey}`);
      const gra = localStorage.getItem(`grades-${currentPlanKey}`);
      const sel = localStorage.getItem(`selections-${currentPlanKey}`);
      setStudentRecords(rec ? JSON.parse(rec) : {});
      setStudentGrades(gra ? JSON.parse(gra) : {});
      setNodeSelections(sel ? JSON.parse(sel) : {});
    } catch (e) {
      console.error("Error loading local storage", e);
    }
  }, [currentPlanKey]);

  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    localStorage.setItem(
      `records-${currentPlanKey}`,
      JSON.stringify(studentRecords),
    );
    localStorage.setItem(
      `grades-${currentPlanKey}`,
      JSON.stringify(studentGrades),
    );
    localStorage.setItem(
      `selections-${currentPlanKey}`,
      JSON.stringify(nodeSelections),
    );

    if (userCredentials) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          const allData = {};
          Object.keys(PLANES).forEach((planId) => {
            const r = localStorage.getItem(`records-${planId}`);
            const g = localStorage.getItem(`grades-${planId}`);
            const s = localStorage.getItem(`selections-${planId}`);
            if (r || g || s) {
              allData[planId] = {
                records: r ? JSON.parse(r) : {},
                grades: g ? JSON.parse(g) : {},
                selections: s ? JSON.parse(s) : {},
              };
            }
          });
          await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save",
              legajo: userCredentials.legajo,
              data: allData,
            }),
          });
        } catch (e) {
          notify("Error al guardar en la nube", "error");
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    }
  }, [
    studentRecords,
    studentGrades,
    nodeSelections,
    currentPlanKey,
    userCredentials,
  ]);

  const handleLoginSuccess = (cloudData, credentials) => {
    setUserCredentials(credentials);
    notify(`¡Hola ${credentials.legajo}! Datos sincronizados.`);
    if (cloudData) {
      Object.keys(cloudData).forEach((planId) => {
        const { records, grades, selections } = cloudData[planId];
        if (records)
          localStorage.setItem(`records-${planId}`, JSON.stringify(records));
        if (grades)
          localStorage.setItem(`grades-${planId}`, JSON.stringify(grades));
        if (selections)
          localStorage.setItem(
            `selections-${planId}`,
            JSON.stringify(selections),
          );
      });
      const currentCloud = cloudData[currentPlanKey];
      if (currentCloud) {
        if (currentCloud.records) setStudentRecords(currentCloud.records);
        if (currentCloud.grades) setStudentGrades(currentCloud.grades);
        if (currentCloud.selections) setNodeSelections(currentCloud.selections);
      }
    }
  };

  const currentEdges = edges;
  const currentNodes = nodes;

  const handleUpdateStatus = useCallback(
    (node, newStatus) => {
      setErrorMessage(null);
      setStudentRecords((prev) => {
        const next = { ...prev };
        const parents = currentEdges
          .filter((e) => e.target === node.id)
          .map((e) => e.source);
        const parentsApproved = parents.every(
          (pid) => next[pid] === "approved",
        );
        const totalApprovedCount = Object.values(next).filter(
          (s) => s === "approved",
        ).length;
        const requiredCount = node.data.requeridas || 0;
        const quantityMet = totalApprovedCount >= requiredCount;

        let specificPrereqsMet = true;
        let missingSpecifics = [];

        if (node.data.esSlot && nodeSelections[node.id]) {
          const selectedLabel = nodeSelections[node.id];
          const group = node.data.grupo;
          const planData = PLANES[currentPlanKey].data;
          const optionData = planData.opciones[group]?.find(
            (o) => o.label === selectedLabel,
          );

          if (optionData && optionData.previas) {
            optionData.previas.forEach((previaId) => {
              let isApproved = next[previaId] === "approved";
              if (!isApproved) {
                const parentSlotEntry = Object.entries(nodeSelections).find(
                  ([sId, sLabel]) => {
                    for (const g in planData.opciones) {
                      const found = planData.opciones[g].find(
                        (o) => o.id === previaId,
                      );
                      if (found && found.label === sLabel) return true;
                    }
                    return false;
                  },
                );
                if (parentSlotEntry) {
                  const [slotId] = parentSlotEntry;
                  if (next[slotId] === "approved") isApproved = true;
                }
              }
              if (!isApproved) {
                specificPrereqsMet = false;
                const missingNode = planData.materias.find(
                  (m) => m.id === previaId,
                );
                let missingName = previaId;
                if (missingNode) missingName = missingNode.label;
                else {
                  for (const g in planData.opciones) {
                    const f = planData.opciones[g].find(
                      (o) => o.id === previaId,
                    );
                    if (f) missingName = f.label;
                  }
                }
                missingSpecifics.push(missingName);
              }
            });
          }
        }

        if (newStatus === "CI") {
          if (!parentsApproved) {
            setErrorMessage(`⛔ Faltan correlativas del plan.`);
            return prev;
          }
          if (!quantityMet) {
            setErrorMessage(
              `⛔ Requiere ${requiredCount} finales totales (tienes ${totalApprovedCount}).`,
            );
            return prev;
          }
          if (!specificPrereqsMet) {
            setErrorMessage(
              `⛔ Para cursar "${nodeSelections[node.id]}" necesitas: ${missingSpecifics.join(", ")}`,
            );
            return prev;
          }
          next[node.id] = "CI";
          setStudentGrades((g) => {
            const ng = { ...g };
            delete ng[node.id];
            return ng;
          });
        } else if (newStatus === "approved") {
          if (!parentsApproved || !quantityMet || !specificPrereqsMet) {
            setErrorMessage("⛔ No cumples los requisitos.");
            return prev;
          }
          next[node.id] = "approved";
        } else if (newStatus === "pending") {
          delete next[node.id];
          setStudentGrades((g) => {
            const ng = { ...g };
            delete ng[node.id];
            return ng;
          });
          const descendants = getDescendants(node.id, currentEdges);
          descendants.nodes.forEach((childId) => {
            delete next[childId];
            setStudentGrades((g) => {
              const ng = { ...g };
              delete ng[childId];
              return ng;
            });
          });
        }
        return next;
      });
    },
    [currentEdges, currentNodes, nodeSelections, currentPlanKey],
  );

  const handleUpdateGrade = (id, g) =>
    setStudentGrades((prev) => ({ ...prev, [id]: g === "" ? undefined : g }));
  const handleSelectMateria = (slotId, realName) =>
    setNodeSelections((prev) => ({ ...prev, [slotId]: realName }));
  const handleUnselectMateria = (slotId) => {
    setNodeSelections((prev) => {
      const n = { ...prev };
      delete n[slotId];
      return n;
    });
    setStudentRecords((prev) => {
      const n = { ...prev };
      delete n[slotId];
      return n;
    });
  };

  const currentAverage = useMemo(() => {
    const g = Object.values(studentGrades);
    return g.length ? g.reduce((a, b) => a + b, 0) / g.length : 0;
  }, [studentGrades]);

  // --- EFECTO VISUAL (Aquí estaba el bug) ---
  useEffect(() => {
    const connectedSet = getConnectedSet(selectedNodeId, edges);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === "label") return node;
        const myStatus = studentRecords[node.id];
        const parents = currentEdges
          .filter((e) => e.target === node.id)
          .map((e) => e.source);
        const allParentsApproved = parents.every(
          (id) => studentRecords[id] === "approved",
        );
        const totalAprobadas = Object.values(studentRecords).filter(
          (s) => s === "approved",
        ).length;
        const quantityMet = totalAprobadas >= (node.data.requeridas || 0);

        let status = "pending";
        if (myStatus === "approved") status = "approved";
        else if (myStatus === "CI") status = "CI";
        else if (allParentsApproved && quantityMet) status = "available";

        let displayLabel = node.data.originalLabel || node.data.label;
        if (nodeSelections[node.id]) displayLabel = nodeSelections[node.id];

        const isDimmed = selectedNodeId && !connectedSet.has(node.id);

        return {
          ...node,
          data: {
            ...node.data,
            status,
            label: displayLabel,
            descripcion: node.data.descripcion,
            link: node.data.link,
          },
          style: {
            ...node.style,
            opacity: isDimmed ? 0.2 : 1,
            transition: "opacity 0.3s",
          },
        };
      }),
    );

    setEdges((eds) =>
      eds.map((edge) => {
        const sourceApproved = studentRecords[edge.source] === "approved";
        const targetApproved = studentRecords[edge.target] === "approved";
        const isProgressPath = sourceApproved && targetApproved;
        const isAvailablePath = sourceApproved && !targetApproved;
        const isSelectedPath =
          !selectedNodeId ||
          (connectedSet.has(edge.source) && connectedSet.has(edge.target));

        let strokeColor = "#71717a";
        let strokeWidth = 1.5;

        if (isProgressPath) {
          strokeColor = "#10b981";
          strokeWidth = 2.5;
        } else if (isAvailablePath) {
          strokeColor = "#eab308";
          strokeWidth = 2.5;
        }

        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            opacity: isSelectedPath ? 1 : 0.1,
            transition: "all 0.3s",
          },
          animated: true,
        };
      }),
    );
  }, [studentRecords, setNodes, setEdges, nodeSelections, selectedNodeId]);

  const onNodeClick = useCallback(
    (_, node) => {
      if (node.type === "label") return;
      setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
      setErrorMessage(null);
    },
    [selectedNodeId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onSearchSelect = (id) => {
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setCenter(node.position.x + 85, node.position.y + 40, {
        zoom: 1.2,
        duration: 800,
      });
      setSelectedNodeId(node.id);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const notify = (m, t) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message: m, type: t }]);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const planData = PLANES[currentPlanKey].data;
  const lockedBranch = useMemo(
    () => getLockedBranch(nodeSelections, planData),
    [nodeSelections, planData],
  );

  const getAvailableOptionsForSlot = (slotNode) => {
    if (!slotNode?.data?.esSlot || !slotNode?.data?.grupo) return [];
    const allOptions = planData.opciones[slotNode.data.grupo] || [];
    if (slotNode.data.grupo.includes("optativa")) {
      if (lockedBranch) {
        return allOptions.filter((opt) => opt.rama === lockedBranch);
      }
    }
    return allOptions;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ToastContainer notifications={toasts} removeNotification={removeToast} />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLoginSuccess}
        currentData={{}}
      />

      <div className="controls-layout">
        <div className="control-group">
          <select
            className="card-style control-select"
            value={currentPlanKey}
            onChange={(e) => setCurrentPlanKey(e.target.value)}
          >
            {Object.values(PLANES).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button
            className="card-style control-btn-primary"
            onClick={() =>
              userCredentials ? setUserCredentials(null) : setIsLoginOpen(true)
            }
          >
            {userCredentials ? "👤 Salir" : "Entrar"}
          </button>
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <SearchBar
            nodes={nodes.filter((n) => n.type === "materia")}
            onSelect={onSearchSelect}
          />
        </div>
      </div>

      <div className="progress-position">
        <ProgressBar
          total={nodes.filter((n) => n.type === "materia").length}
          approved={
            Object.values(studentRecords).filter((s) => s === "approved").length
          }
          average={currentAverage}
        />
      </div>

      <Sidebar
        node={selectedNode}
        status={selectedNodeId ? studentRecords[selectedNodeId] : null}
        grade={selectedNodeId ? studentGrades[selectedNodeId] : null}
        onUpdateStatus={handleUpdateStatus}
        onUpdateGrade={handleUpdateGrade}
        onClose={onPaneClick}
        error={errorMessage}
        onSelectMateria={handleSelectMateria}
        onUnselectMateria={handleUnselectMateria}
        currentSelection={selectedNodeId ? nodeSelections[selectedNodeId] : ""}
        availableOptions={getAvailableOptionsForSlot(selectedNode)}
      />
      <Footer />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
      >
        <Controls showInteractive={false} />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
