
import { jsPDF } from 'jspdf';


export const generateProjectReport = (projectData) => {
  const doc = new jsPDF();
  doc.text('Reporte del Proyecto', 10, 10);
  doc.text(`Título: ${projectData.titulo}`, 10, 20);
  doc.text(`Área: ${projectData.area}`, 10, 30);
  doc.text(`Objetivos: ${projectData.objetivos}`, 10, 40);
  doc.text(`Presupuesto: ${projectData.presupuesto}`, 10, 50);
 

  return doc;
};
