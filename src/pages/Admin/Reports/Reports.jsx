import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reports.css"; 

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    };

    fetchProjects();
  }, []);

  
  const estados = ["formulacion", "evaluacion", "activo", "inactivo", "finalizado"];
  const estadosCount = estados.map(
    estado => projects.filter(p => p.estado === estado).length
  );

  const chartData = {
    labels: estados,
    datasets: [
      {
        label: "Proyectos por estado",
        data: estadosCount,
        backgroundColor: "#7768FF",
      },
    ],
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Proyectos", 14, 20);
    doc.setFontSize(12);
    doc.text(`Total de proyectos: ${projects.length}`, 14, 30);

    // Datos para tabla
    const tableData = projects.map((p, index) => [
      index + 1,
      p.titulo,
      p.area,
      p.estado,
      p.institucion,
      p.presupuesto?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      }) ?? "N/A",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Título", "Área", "Estado", "Institución", "Presupuesto"]],
      body: tableData,
    });

    doc.save("reporte_proyectos.pdf");
  };

  return (
    <div className="reportes-container">
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h2>Visualización de Reportes</h2>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Bar data={chartData} />
      </div>

      <button onClick={generatePDF} className="pdf-btn">
        📄 Generar PDF
      </button>

      <div className="tabla-preview">
        <h3>Listado de Proyectos</h3>
        <ul>
          {projects.map((p, i) => (
            <li key={p.id}>
              <strong>{i + 1}. {p.titulo}</strong> – {p.area} – Estado: <em>{p.estado}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reports;
