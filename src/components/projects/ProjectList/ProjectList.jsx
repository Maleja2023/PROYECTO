// ProjectList.jsx

import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      setProjects(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchProjects();
  }, []);

  return (
    <div>
      <h2>Lista de Proyectos</h2>
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

export default ProjectList;
