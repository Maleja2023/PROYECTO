// MilestoneList.jsx

import { useState } from 'react';
import { db } from '../../config/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';

const MilestoneList = ({ projectId }) => {
  const { currentUser } = useAuthContext();
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    documentos: [],
    fotografias: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser.rol === 'docente' || currentUser.rol === 'coordinador') {
      const milestoneRef = doc(db, 'milestones', projectId + formData.fecha);
      await setDoc(milestoneRef, formData);
      alert('Hito registrado exitosamente');
    } else {
      alert('Solo los docentes o coordinadores pueden registrar hitos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={formData.fecha}
        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
        required
      />
      <textarea
        placeholder="Descripción"
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
        required
      />
      {/* Añadir campos para documentos y fotos */}
      <button type="submit">Registrar Hito</button>
    </form>
  );
};

export default MilestoneList;
