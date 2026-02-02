import agr from "./agr.json";
import civ from "./civ.json";
import eca from "./eca.json";
import eta from "./eta.json";
import ind from "./ind.json";
import lcc from "./lcc.json";
import lf from "./lf.json";
import lm from "./lm.json";
import mec from "./mec.json";
import pf from "./pf.json";
import pm from "./pm.json";
import tuia from "./tuia.json";

export const PLANES = {
  agr: { id: "agr", nombre: "Agrimensura", data: agr },
  civ: { id: "civ", nombre: "Ingeniería Civil", data: civ },

  eca: { id: "eca", nombre: "Ingeniería Electrónica", data: eca },
  eta: { id: "eta", nombre: "Ingeniería Eléctrica", data: eta },
  ind: { id: "ind", nombre: "Ingeniería Industrial", data: ind },
  lcc: {
    id: "lcc",
    nombre: "Licenciatura en Ciencias de la Computación",
    data: lcc,
  },
  lf: { id: "lf", nombre: "Licenciatura en Física", data: lf },
  lm: { id: "lm", nombre: "Licenciatura en Matemática", data: lm },
  mec: { id: "mec", nombre: "Ingeniería Mecánica", data: mec },
  pf: { id: "pf", nombre: "Profesorado de Física", data: pf },
  pm: { id: "pm", nombre: "Profesorado de Matemática", data: pm },
  tuia: {
    id: "tuia",
    nombre: "Tecnicatura Universitaria en Inteligencia Artificial",
    data: tuia,
  },
};

export const DEFAULT_PLAN = "eca";
