// ProjectState.jsx

import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';

const ProjectState = ({ projectId }) => {
  const { currentUser } = useAuthContext();
  const [estado, setEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      setEstado(projectData.estado);
      setHistorico(projectData.historico || []);
    };

    fetchProjectData();
  }, [projectId]);

  const handleEstadoChange = async (newEstado) => {
    if (currentUser.rol === 'coordinador') {
      const projectRef = doc(db, 'projects', projectId);
      const newHistorico = [
        ...historico,
        { estado: newEstado, observacion, fecha: new Date().toISOString() },
      ];

      await updateDoc(projectRef, {
        estado: newEstado,
        historico: newHistorico,
      });

      setEstado(newEstado);
      setHistorico(newHistorico);
      setObservacion('');
      alert('Estado actualizado');
    } else {
      alert('Solo el coordinador puede cambiar el estado del proyecto');
    }
  };

  return (
    <div>
      <h3>Estado Actual: {estado}</h3>
      <div>
        <textarea
          placeholder="Observación"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
        />
        <button onClick={() => handleEstadoChange('Activo')}>Activar Proyecto</button>
        <button onClick={() => handleEstadoChange('Inactivo')}>Desactivar Proyecto</button>
        <button onClick={() => handleEstadoChange('Finalizado')}>Finalizar Proyecto</button>
      </div>

      <h4>Histórico de Estado:</h4>
      <ul>
        {historico.map((entry, index) => (
          <li key={index}>
            {entry.estado} - {entry.fecha} - {entry.observacion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectState;
