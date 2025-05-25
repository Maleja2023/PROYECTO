import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./ProjectList.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedaTitulo, setBusquedaTitulo] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("Todos");
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState("Todos");
  const [docentesUnicos, setDocentesUnicos] = useState([]);
  const [institucionesUnicas, setInstitucionesUnicas] = useState([]);
  const [docentesInfo, setDocentesInfo] = useState({});

  const navigate = useNavigate();


  const getDocenteResponsable = async (projectData) => {
    try {
      
      if (projectData.miembros?.length > 0) {
        const docentes = projectData.miembros.filter(m => m.rol === "docente");
        if (docentes.length > 0) {
         
          const docenteDoc = await getDoc(doc(db, "users", docentes[0].userId));
          if (docenteDoc.exists()) {
            return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
          }
        }
      }
      
      
      if (projectData.docenteId) {
        const docenteDoc = await getDoc(doc(db, "users", projectData.docenteId));
        if (docenteDoc.exists()) {
          return `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim();
        }
      }
      
      return "No asignado";
    } catch (error) {
      console.error("Error obteniendo docente:", error);
      return "Error cargando docente";
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = [];
        const docentesSet = new Set();
        const institucionesSet = new Set();

        // Procesar cada proyecto
        for (const docSnapshot of querySnapshot.docs) {
          const projectData = docSnapshot.data();
          
          // Obtener docente responsable como en ProjectDetail
          const docenteResponsable = await getDocenteResponsable(projectData);
          
          const project = {
            id: docSnapshot.id,
            ...projectData,
            docenteResponsable,
            estado: projectData.estado || "No especificado"
          };

          projectsList.push(project);
          
         
          if (docenteResponsable !== "No asignado") {
            docentesSet.add(docenteResponsable);
          }
         
          if (projectData.institucion) {
            institucionesSet.add(projectData.institucion);
          }
        }

        setProjects(projectsList);
        setDocentesUnicos(["Todos", ...Array.from(docentesSet).sort()]);
        setInstitucionesUnicas(["Todos", ...Array.from(institucionesSet).sort()]);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const proyectosFiltrados = projects.filter((project) => {
    const tituloMatch = project.titulo?.toLowerCase().includes(busquedaTitulo.toLowerCase());
    const docenteMatch = docenteSeleccionado === "Todos" || 
                       project.docenteResponsable === docenteSeleccionado;
    const institucionMatch = institucionSeleccionada === "Todos" || 
                           project.institucion === institucionSeleccionada;
    return tituloMatch && docenteMatch && institucionMatch;
  });

  if (loading) return <p className="loading">Cargando proyectos...</p>;

  return (
    <div className="project-list">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1 className="list-title">Lista de Proyectos</h1>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar por título"
          value={busquedaTitulo}
          onChange={(e) => setBusquedaTitulo(e.target.value)}
          className="search-input"
        />

        <select
          value={docenteSeleccionado}
          onChange={(e) => setDocenteSeleccionado(e.target.value)}
          className="search-select"
        >
          {docentesUnicos.map((docente, index) => (
            <option key={index} value={docente}>
              {docente === "Todos" ? "Todos los docentes" : docente}
            </option>
          ))}
        </select>

        <select
          value={institucionSeleccionada}
          onChange={(e) => setInstitucionSeleccionada(e.target.value)}
          className="search-select"
        >
          {institucionesUnicas.map((institucion, index) => (
            <option key={index} value={institucion}>
              {institucion === "Todos" ? "Todas las instituciones" : institucion}
            </option>
          ))}
        </select>
      </div>

      {proyectosFiltrados.length === 0 ? (
        <p className="no-projects">No hay proyectos disponibles.</p>
      ) : (
        <ul className="project-cards">
          {proyectosFiltrados.map((project) => (
            <li key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`}>
                <h3 className="project-title">{project.titulo}</h3>
                <p className="project-meta">
                  <strong>Docente responsable:</strong> {project.docenteResponsable}
                </p>
                <p className="project-meta">
                  <strong>Área:</strong> {project.area || "No especificada"}
                </p>
                <p className="project-meta">
                  <strong>Institución:</strong> {project.institucion || "No especificada"}
                </p>
                <p className="project-meta">
                  <strong>Estado:</strong> 
                  <span className={`status-badge ${project.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.estado}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;