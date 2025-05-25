// ProjectForm.jsx

import { useState } from 'react';
import { db } from '../../config/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';

const ProjectForm = () => {
  const { currentUser } = useAuthContext();
  const [formData, setFormData] = useState({
    titulo: '',
    area: '',
    objetivos: '',
    cronograma: '',
    presupuesto: '',
    institucion: '',
    integrantes: '',
    observaciones: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser.rol === 'docente') {
      const projectRef = doc(db, 'projects', formData.titulo);
      await setDoc(projectRef, formData);
      alert('Proyecto creado exitosamente');
    } else {
      alert('Solo los docentes pueden crear proyectos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título"
        value={formData.titulo}
        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Área"
        value={formData.area}
        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
        required
      />
      <textarea
        placeholder="Objetivos"
        value={formData.objetivos}
        onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
        required
      />
      {/* Aquí puedes añadir el resto de los campos: cronograma, presupuesto, etc. */}
      <button type="submit">Crear Proyecto</button>
    </form>
  );
};

export default ProjectForm;
