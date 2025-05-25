// ProjectReport.jsx

import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProjectReport = ({ projectId }) => {
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      setProjectData(projectDoc.data());
    };

    fetchProjectData();
  }, [projectId]);

  const generateReport = () => {
    const doc = new jsPDF();
    doc.text('Reporte del Proyecto', 10, 10);
    doc.text(`Título: ${projectData?.titulo}`, 10, 20);
    doc.text(`Área: ${projectData?.area}`, 10, 30);
    doc.text(`Objetivos: ${projectData?.objetivos}`, 10, 40);
    doc.text(`Presupuesto: ${projectData?.presupuesto}`, 10, 50);
    // Agregar más información relevante del proyecto

    doc.save(`${projectData?.titulo}-reporte.pdf`);
  };

  return (
    <div>
      <h2>Generar Reporte del Proyecto</h2>
      <button onClick={generateReport}>Generar PDF</button>
    </div>
  );
};

export default ProjectReport;
