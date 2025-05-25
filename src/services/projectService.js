// projectService.js

import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Crear proyecto
export const createProject = async (projectData) => {
  const projectRef = doc(db, 'projects', projectData.titulo);
  await setDoc(projectRef, projectData);
};

// Obtener un proyecto
export const getProject = async (projectId) => {
  const projectDoc = await getDoc(doc(db, 'projects', projectId));
  return projectDoc.data();
};
