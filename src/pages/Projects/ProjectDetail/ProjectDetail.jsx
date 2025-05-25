import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import { useAuthContext } from "../../../context/AuthContext";
import "./ProjectDetail.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const [proyecto, setProyecto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Permisos por rol
  const permisos = {
    coordinador: {
      puedeEditar: true,
      campos: ['estado'],
      puedeEliminar: true,
      puedeAgregarHitos: false
    },
    docente: {
      puedeEditar: true,
      campos: ['titulo', 'area', 'objetivos', 'observaciones'],
      puedeEliminar: false,
      puedeAgregarHitos: true
    },
    estudiante: {
      puedeEditar: true,
      campos: ['titulo', 'area', 'objetivos', 'observaciones'],
      puedeEliminar: false,
      puedeAgregarHitos: true
    }
  };

  // Obtiene los permisos según el rol del usuario actual
  const permisosUsuario = currentUser?.rol ? permisos[currentUser.rol] : {
    puedeEditar: false,
    campos: [],
    puedeEliminar: false,
    puedeAgregarHitos: false
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setCargando(true);
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Obtener nombres de los miembros del equipo
          const miembrosConNombres = await Promise.all(
            data.miembros?.map(async (miembro) => {
              try {
                const userDoc = await getDoc(doc(db, "users", miembro.userId));
                return {
                  ...miembro,
                  nombre: userDoc.exists() ? `${userDoc.data().nombre} ${userDoc.data().apellido || ''}`.trim() : "Usuario desconocido"
                };
              } catch (error) {
                console.error(`Error cargando usuario ${miembro.userId}:`, error);
                return {
                  ...miembro,
                  nombre: "Error cargando usuario"
                };
              }
            }) || []
          );

          // Separar docentes y estudiantes
          const docentes = miembrosConNombres.filter(m => m.rol === "docente");
          const estudiantes = miembrosConNombres.filter(m => m.rol === "estudiante");

          // El docente responsable es el primer docente de la lista o el docenteId
          let docenteResponsable = "No asignado";
          if (docentes.length > 0) {
            docenteResponsable = docentes[0].nombre;
          } else if (data.docenteId) {
            try {
              const docenteDoc = await getDoc(doc(db, "users", data.docenteId));
              docenteResponsable = docenteDoc.exists() ?
                `${docenteDoc.data().nombre} ${docenteDoc.data().apellido || ''}`.trim() :
                "Docente desconocido";
            } catch (error) {
              console.error("Error cargando docente:", error);
            }
          }

          // Cargar hitos del cronograma
          const hitosFormateados = data.cronograma?.hitos?.map((hito, index) => ({
            id: index,
            nombre: hito.nombre,
            fecha: hito.fecha,
            fechaFormateada: formatDate(hito.fecha),
            imagen: hito.imagen,
            documento: hito.documento
          })) || [];

          setProyecto({
            id: docSnap.id,
            ...data,
            miembros: miembrosConNombres,
            docentes: docentes,
            estudiantes: estudiantes,
            docenteResponsable: docenteResponsable,
            hitosFormateados: hitosFormateados
          });

          setForm({
            ...data,
            nuevosHitos: [] // Para manejar los hitos nuevos
          });
        } else {
          console.error("Proyecto no encontrado");
        }
      } catch (err) {
        console.error("Error cargando proyecto:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjetivoChange = (tipo, index = null, value) => {
    if (tipo === 'general') {
      setForm(prev => ({
        ...prev,
        objetivos: {
          ...prev.objetivos,
          general: value
        }
      }));
    } else if (tipo === 'especifico') {
      const nuevosEspecificos = [...(form.objetivos?.especificos || [])];
      nuevosEspecificos[index] = value;
      setForm(prev => ({
        ...prev,
        objetivos: {
          ...prev.objetivos,
          especificos: nuevosEspecificos
        }
      }));
    }
  };

  const addObjetivoEspecifico = () => {
    setForm(prev => ({
      ...prev,
      objetivos: {
        ...prev.objetivos,
        especificos: [...(prev.objetivos?.especificos || []), ""]
      }
    }));
  };

  const removeObjetivoEspecifico = (index) => {
    const nuevosEspecificos = form.objetivos?.especificos?.filter((_, i) => i !== index) || [];
    setForm(prev => ({
      ...prev,
      objetivos: {
        ...prev.objetivos,
        especificos: nuevosEspecificos
      }
    }));
  };

  const handleHitoChange = (index, key, value) => {
    const nuevosHitos = [...(form.nuevosHitos || [])];
    if (!nuevosHitos[index]) {
      nuevosHitos[index] = { nombre: "", fecha: "", imagen: null, documento: null };
    }
    nuevosHitos[index][key] = value;
    setForm({ ...form, nuevosHitos });
  };

  const addHito = () => {
    setForm(prev => ({
      ...prev,
      nuevosHitos: [...(prev.nuevosHitos || []), { nombre: "", fecha: "", imagen: null, documento: null }]
    }));
  };

  const removeHito = (index) => {
    const nuevosHitos = form.nuevosHitos?.filter((_, i) => i !== index) || [];
    setForm({ ...form, nuevosHitos });
  };

  const handleFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nuevosHitos = [...(form.nuevosHitos || [])];
    if (!nuevosHitos[index]) {
      nuevosHitos[index] = { nombre: "", fecha: "", imagen: null, documento: null };
    }
    nuevosHitos[index][fileType] = file;
    setForm({ ...form, nuevosHitos });
  };

  const handleGuardar = async () => {
    try {
      const actualizaciones = {};

      // Solo actualizar campos permitidos según el rol
      if (permisosUsuario.campos.includes('estado')) {
        actualizaciones.estado = form.estado;
      }
      if (permisosUsuario.campos.includes('titulo')) {
        actualizaciones.titulo = form.titulo;
      }
      if (permisosUsuario.campos.includes('area')) {
        actualizaciones.area = form.area;
      }
      if (permisosUsuario.campos.includes('objetivos')) {
        actualizaciones.objetivos = form.objetivos;
      }
      if (permisosUsuario.campos.includes('observaciones')) {
        actualizaciones.observaciones = form.observaciones;
      }

      // Procesar nuevos hitos si el usuario puede agregarlos
      if (permisosUsuario.puedeAgregarHitos && form.nuevosHitos?.length > 0) {
        const hitosExistentes = proyecto.cronograma?.hitos || [];

        // Subir archivos de los nuevos hitos
        const hitosConArchivos = await Promise.all(
          form.nuevosHitos.map(async (hito, index) => {
            if (!hito.nombre || !hito.fecha) return null; // Skip incomplete milestones

            let imagenUrl = null;
            let documentoUrl = null;

            if (hito.imagen) {
              const ext = hito.imagen.name.split(".").pop().toLowerCase();
              const allowedImg = ["jpg", "jpeg", "png", "webp", "svg"];
              if (!allowedImg.includes(ext)) {
                throw new Error(`Formato de imagen no permitido en el hito ${index + 1}.`);
              }
              const imagenRef = ref(storage, `hitos/${Date.now()}_${hito.imagen.name}`);
              await uploadBytes(imagenRef, hito.imagen);
              imagenUrl = await getDownloadURL(imagenRef);
            }

            if (hito.documento) {
              const ext = hito.documento.name.split(".").pop().toLowerCase();
              const allowedDoc = ["pdf", "docx", "doc", "pptx", "ppt"];
              if (!allowedDoc.includes(ext)) {
                throw new Error(`Formato de documento no permitido en el hito ${index + 1}.`);
              }
              const documentoRef = ref(storage, `hitos/${Date.now()}_${hito.documento.name}`);
              await uploadBytes(documentoRef, hito.documento);
              documentoUrl = await getDownloadURL(documentoRef);
            }

            return {
              nombre: hito.nombre,
              fecha: Timestamp.fromDate(new Date(hito.fecha)),
              imagen: imagenUrl,
              documento: documentoUrl,
            };
          })
        );

        // Filtrar hitos válidos
        const hitosValidos = hitosConArchivos.filter(hito => hito !== null);

        if (hitosValidos.length > 0) {
          actualizaciones.cronograma = {
            ...proyecto.cronograma,
            hitos: [...hitosExistentes, ...hitosValidos]
          };
        }
      }

      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, actualizaciones);

      alert("Proyecto actualizado exitosamente");

      // Recargar los datos del proyecto
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProyecto(prev => ({ ...prev, ...data }));
        setForm(prev => ({ ...prev, ...data, nuevosHitos: [] }));
      }

      setEditando(false);
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
      alert(`Error al actualizar el proyecto: ${error.message}`);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        alert("Proyecto eliminado");
        navigate("/projects");
      } catch (error) {
        console.error("Error eliminando proyecto:", error);
        alert("Error al eliminar el proyecto");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No especificada";

    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString("es-ES", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return "Formato inválido";
    } catch {
      return "Fecha inválida";
    }
  };

  const estadosDisponibles = ["formulacion", "evaluacion", "activo", "inactivo", "finalizado"];

  if (cargando) return (
    <div className="loading-container">
      <p>Cargando proyecto...</p>
      <div className="loading-spinner"></div>
    </div>
  );

  if (!proyecto) return <p className="error-message">Proyecto no encontrado</p>;

  return (
    <div className="project-detail">
      <button className="back-button" onClick={() => navigate("/projects")}>
        ← Volver a proyectos
      </button>

      {editando ? (
        <div className="edit-form">
          <h3>Editando Proyecto</h3>

          {/* Solo coordinadores pueden editar el estado */}
          {permisosUsuario.campos.includes('estado') && (
            <div className="form-group">
              <label>Estado:</label>
              <select name="estado" value={form.estado || ""} onChange={handleChange}>
                {estadosDisponibles.map(estado => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Docentes y estudiantes pueden editar estos campos */}
          {permisosUsuario.campos.includes('titulo') && (
            <div className="form-group">
              <label>Título:</label>
              <input name="titulo" value={form.titulo || ""} onChange={handleChange} />
            </div>
          )}

          {permisosUsuario.campos.includes('area') && (
            <div className="form-group">
              <label>Área:</label>
              <input name="area" value={form.area || ""} onChange={handleChange} />
            </div>
          )}

          {permisosUsuario.campos.includes('objetivos') && (
            <div className="form-group">
              <label>Objetivo General:</label>
              <textarea
                value={form.objetivos?.general || ""}
                onChange={(e) => handleObjetivoChange('general', null, e.target.value)}
              />

              <label>Objetivos Específicos:</label>
              {form.objetivos?.especificos?.map((obj, index) => (
                <div key={index} className="objetivo-especifico">
                  <textarea
                    value={obj}
                    onChange={(e) => handleObjetivoChange('especifico', index, e.target.value)}
                    placeholder={`Objetivo específico ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeObjetivoEspecifico(index)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button type="button" onClick={addObjetivoEspecifico} className="add-btn">
                + Añadir objetivo específico
              </button>
            </div>
          )}

          {permisosUsuario.campos.includes('observaciones') && (
            <div className="form-group">
              <label>Observaciones:</label>
              <textarea name="observaciones" value={form.observaciones || ""} onChange={handleChange} />
            </div>
          )}

          {/* Agregar nuevos hitos (docentes y estudiantes) */}
          {permisosUsuario.puedeAgregarHitos && (
            <div className="form-group">
              <label>Nuevos Hitos:</label>
              {form.nuevosHitos?.map((hito, index) => (
                <div key={index} className="hito-form">
                  <h5>Hito {index + 1}</h5>
                  <input
                    placeholder="Nombre del hito"
                    value={hito.nombre || ""}
                    onChange={(e) => handleHitoChange(index, "nombre", e.target.value)}
                  />
                  <input
                    type="date"
                    value={hito.fecha || ""}
                    onChange={(e) => handleHitoChange(index, "fecha", e.target.value)}
                  />
                  <div>
                    <label>Imagen:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, "imagen", e)}
                    />
                  </div>
                  <div>
                    <label>Documento:</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => handleFileChange(index, "documento", e)}
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeHito(index)}
                  >
                    Eliminar Hito
                  </button>
                </div>
              ))}
              <button type="button" onClick={addHito} className="add-btn">
                + Añadir Hito
              </button>
            </div>
          )}

          <div className="form-actions">
            <button className="save-button" onClick={handleGuardar}>Guardar</button>
            <button className="cancel-button" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="project-info">
          <div className="project-header">
            <h2>{proyecto.titulo}</h2>
            <span className={`status-badge ${proyecto.estado?.toLowerCase()}`}>
              {proyecto.estado}
            </span>
            
          </div>

          <div className="project-meta">
            <div className="meta-item">
              <strong>Área:</strong> {proyecto.area}
            </div>
            <div className="meta-item">
              <strong>Institución:</strong> {proyecto.institucion}
            </div>
            <div className="meta-item">
              <strong>Docente responsable:</strong> {proyecto.docenteResponsable}
            </div>
            <div className="meta-item">
              <strong>Fecha de creación:</strong> {formatDate(proyecto.fechaCreacion)}
            </div>
            <div className="meta-item">
              <strong>Presupuesto:</strong> ${proyecto.presupuesto?.toLocaleString("es-CO")}
            </div>
            <div className="meta-item">
        <strong>Estado:</strong> <span className={`status-text ${proyecto.estado?.toLowerCase()}`}>{proyecto.estado}</span>
      </div>
          </div>

          <div className="project-section">
            <h3>Objetivos</h3>
            <div className="objective">
              <h4>Objetivo General</h4>
              <p>{proyecto.objetivos?.general || "No especificado"}</p>
            </div>

            <div className="objective">
              <h4>Objetivos Específicos</h4>
              {proyecto.objetivos?.especificos?.length > 0 ? (
                <ul className="objectives-list">
                  {proyecto.objetivos.especificos.map((esp, idx) => (
                    <li key={idx}>{esp}</li>
                  ))}
                </ul>
              ) : (
                <p>No se han definido objetivos específicos</p>
              )}
            </div>
          </div>

          <div className="project-section">
            <h3>Cronograma</h3>
            <div className="timeline">
              <div className="timeline-item">
                <strong>Fecha de inicio:</strong> {formatDate(proyecto.cronograma?.inicio)}
              </div>
              <div className="timeline-item">
                <strong>Fecha de finalización:</strong> {formatDate(proyecto.cronograma?.fin)}
              </div>
            </div>

            <h4>Hitos del Proyecto</h4>
            {proyecto.hitosFormateados?.length > 0 ? (
              <div className="milestones-container">
                {proyecto.hitosFormateados.map((hito) => (
                  <div key={hito.id} className="milestone-card">
                    <div className="milestone-header">
                      <h5>{hito.nombre}</h5>
                    </div>
                    <div className="milestone-date">
                      <strong>Fecha:</strong> {hito.fechaFormateada}
                    </div>
                    {hito.imagen && (
                      <div className="milestone-image">
                        <strong>Imagen:</strong>
                        <a href={hito.imagen} target="_blank" rel="noopener noreferrer">
                          Ver imagen
                        </a>
                      </div>
                    )}
                    {hito.documento && (
                      <div className="milestone-document">
                        <strong>Documento:</strong>
                        <a href={hito.documento} target="_blank" rel="noopener noreferrer">
                          Descargar documento
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No se han registrado hitos para este proyecto</p>
            )}
          </div>

          <div className="project-section">
            <h3>Equipo de Trabajo</h3>

            {proyecto.docentes?.length > 0 && (
              <div className="team-subsection">
                <h4>Docentes</h4>
                <div className="team-members">
                  {proyecto.docentes.map((miembro, idx) => (
                    <div key={`docente-${idx}`} className="team-member docente">
                      <div className="member-name">{miembro.nombre}</div>
                      <div className="member-role">Docente</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {proyecto.estudiantes?.length > 0 && (
              <div className="team-subsection">
                <h4>Estudiantes</h4>
                <div className="team-members">
                  {proyecto.estudiantes.map((miembro, idx) => (
                    <div key={`estudiante-${idx}`} className="team-member estudiante">
                      <div className="member-name">{miembro.nombre}</div>
                      <div className="member-role">Estudiante</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!proyecto.docentes?.length && !proyecto.estudiantes?.length) && (
              <p>No hay miembros registrados en este proyecto</p>
            )}
          </div>

          <div className="project-section">
            <h3>Observaciones</h3>
            <div className="observations">
              {proyecto.observaciones || "No hay observaciones registradas"}
            </div>
          </div>

          {permisosUsuario.puedeEditar && (
            <div className="project-actions">
              <button className="edit-button" onClick={() => setEditando(true)}>
                Editar Proyecto
              </button>
              {permisosUsuario.puedeEliminar && (
                <button className="delete-button" onClick={handleEliminar}>
                  Eliminar Proyecto
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;