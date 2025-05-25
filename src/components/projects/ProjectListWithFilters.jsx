// ProjectListWithFilters.jsx

import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ProjectListWithFilters = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsRef = collection(db, 'projects');
      let q;

      if (filter) {
        q = query(projectsRef, where('institucion', '==', filter));
      } else {
        q = query(projectsRef);
      }

      const querySnapshot = await getDocs(q);
      setProjects(querySnapshot.docs.map(doc => doc.data()));
    };

    fetchProjects();
  }, [filter]);

  return (
    <div>
      <h2>Lista de Proyectos</h2>
      <input
        type="text"
        placeholder="Filtrar por institución"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {projects.map((project) => (
          <li key={project.titulo}>
            <h3>{project.titulo}</h3>
            <p>{project.area}</p>
            <button>Ver Detalles</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectListWithFilters;
