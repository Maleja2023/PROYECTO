import { useAuthContext } from '../../context/AuthContext';
import Navbar from '../../components/ui/Navbar/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuthContext();

  if (!currentUser) {
    return <div className="loading">Cargando...</div>;
  }

  const isCoordinador = currentUser.rol === "coordinador";
  const isDocente = currentUser.rol === "docente";

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">
        <h1>Bienvenido, {currentUser.nombre} {currentUser.apellido}</h1>
        {isCoordinador && (
          <p>Tienes acceso completo a la gestión de usuarios y proyectos.</p>
        )}
        {isDocente && (
          <p>Acceso a la creación de proyectos escolares y seguimiento.</p>
        )}
      </main>
    </div>
  );
}
