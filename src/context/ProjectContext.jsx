// src/context/ProjectContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { createProject, getProjects } from "../services/projectService";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  const addProject = async (newProject) => {
    await createProject(newProject);
    await fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
