import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuthContext } from '../../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuthContext();
  const isCoordinador = currentUser?.rol === "coordinador";
  const isDocente = currentUser?.rol === "docente";

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div>Proyectos Escolares</div>
      </div>

      <ul className="navbar-links">
       
        {isCoordinador && (
          <>
            <li><Link to="/projects/create">Crear Proyecto</Link></li>
            <li><Link to="/user-management">Gestión de Usuarios</Link></li>
          </>
        )}

        
        {isDocente && (
          <li><Link to="/projects/create">Crear Proyecto</Link></li>
        )}

        
        {currentUser && (
          <>
            <li><Link to="/projects">Proyectos</Link></li>
            <li><Link to="/reports">Reportes</Link></li>
            <li>
              <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
