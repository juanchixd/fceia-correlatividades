# 🎓 Gestor de Correlativas - FCEIA UNR

Una aplicación web interactiva diseñada para estudiantes de la **Facultad de Ciencias Exactas, Ingeniería y Agrimensura (FCEIA - UNR)**. Permite visualizar el plan de estudios como un grafo dinámico, gestionar el progreso académico y verificar automáticamente el estado de las materias (disponibles, regularizadas, aprobadas) respetando el régimen de correlatividades.

## ✨ Características Principales

- **🗺️ Grafo Interactivo:** Visualización completa del plan de estudios utilizando nodos y aristas inteligentes.
- **🚦 Semáforo de Correlativas:**
  - **Verde:** Materia Aprobada.
  - **Amarillo:** Materia Disponible (correlativas cumplidas).
  - **Gris:** Materia Bloqueada (falta aprobar anteriores).
- **💾 Persistencia de Datos:**
  - Guardado automático en **LocalStorage** (tu progreso no se pierde al cerrar el navegador).
  - Sincronización en la nube (Google Sheets) mediante inicio de sesión.
- **⚡ Validación de Requisitos:** Control automático de correlativas fuertes, regularidades y requisitos de cantidad de materias (ej. para Proyectos o PPS).
- **🔍 Buscador Integrado:** Encuentra rápidamente cualquier materia y centra el mapa en ella.
- **📊 Métricas en Tiempo Real:** Barra de progreso con porcentaje de avance y cálculo automático de promedio.
- **🎨 UI Moderna:** Diseño limpio ("Zinc style") con soporte para Modo Oscuro automático y efectos de vidrio (glassmorphism).
- **🔀 Soporte Multi-Carrera:** Arquitectura preparada para cargar múltiples planes de estudio (Ing. Electrónica, Civil, Mecánica, Licenciaturas, etc.) desde archivos JSON.

## 🛠️ Tecnologías Utilizadas

- **[React](https://react.dev/):** Biblioteca principal para la interfaz de usuario.
- **[Vite](https://vitejs.dev/):** Entorno de desarrollo ultrarrápido.
- **[React Flow (@xyflow/react)](https://reactflow.dev/):** Motor para la renderización del grafo interactivo.
- **[Dagre](https://github.com/dagrejs/dagre):** Algoritmo para el layout automático y ordenado de los nodos.
- **CSS Puro:** Estilos personalizados con variables CSS para temas y responsive design.

## 🚀 Instalación y Uso

Sigue estos pasos para correr el proyecto en tu máquina local:

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/juanchixd/fceia-correlatividades.git
    cd fceia-correlatividades
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador:**
    La aplicación estará corriendo generalmente en `http://localhost:5173`.

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── Footer.jsx        # Créditos y enlaces
│   ├── LoginModal.jsx    # Modal de autenticación
│   ├── MateriaNode.jsx   # Diseño visual de cada nodo (tarjeta de materia)
│   ├── ProgressBar.jsx   # Barra de avance y promedio
│   ├── SearchBar.jsx     # Buscador de materias
│   └── Sidebar.jsx       # Panel lateral de edición y detalles
├── data/
│   ├── index.js          # Gestor de importación de planes
│   ├── eca.json          # Plan de Ing. Electrónica
│   ├── civ.json          # Plan de Ing. Civil
│   └── ...               # Otros planes de estudio
├── App.jsx               # Lógica principal (Grafo, Estados, Validaciones)
├── index.css             # Estilos globales y temas
└── main.jsx              # Punto de entrada
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un error en las correlatividades de alguna carrera o quieres agregar una funcionalidad nueva:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 📬 Contacto

Para cualquier consulta o sugerencia, puedes contactarme a través de mi perfil de GitHub: [juanchixd](https://github.com/juanchixd) [contacto@juangonzalez.com.ar](mailto:contacto@juangonzalez.com.ar).

¡Gracias por visitar el Gestor de Correlativas de FCEIA UNR! 🎉
