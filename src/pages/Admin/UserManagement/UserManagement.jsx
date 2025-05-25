import React, { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom"; // 👈 Agregado para navegación
import "./UserManagement.css";

const UserManagement = ({ currentUser }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const navigate = useNavigate(); // 👈 Inicializar navegación

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    obtenerUsuarios();
  }, []);

  const handleEditar = (user) => {
    setEditando(user.id);
    setForm({ ...user });
  };

  const handleCancelar = () => {
    setEditando(null);
    setForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "grado" || name === "telefono" ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    try {
      const ref = doc(db, "users", editando);
      await updateDoc(ref, form);
      alert("Usuario actualizado correctamente");
      setEditando(null);

     
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      alert("Error al actualizar");
    }
  };

  const handleEliminar = async (userId) => {
    if (userId === currentUser?.uid) {
      alert("No puedes eliminar tu propio usuario.");
      return;
    }

    const confirmar = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      alert("Usuario eliminado");
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("No se pudo eliminar");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="user-management">
      
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Volver al Dashboard
      </button>

      <h1>Gestión de Usuarios</h1>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px", width: "100%" }}
      />

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Institución</th>
            <th>Grado</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((user) =>
            editando === user.id ? (
              <tr key={user.id}>
                <td>
                  <input
                    name="nombre"
                    value={form.nombre || ""}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <input
                    name="apellido"
                    value={form.apellido || ""}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    disabled
                  />
                </td>
                <td>
                  <select name="rol" value={form.rol || ""} onChange={handleChange}>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="coordinador">Coordinador</option>
                  </select>
                </td>
                <td>
                  <input
                    name="institucion"
                    value={form.institucion || ""}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <input
                    name="grado"
                    type="number"
                    value={form.grado || ""}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <input
                    name="telefono"
                    value={form.telefono || ""}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <button onClick={handleGuardar}>💾 Guardar</button>
                  <button onClick={handleCancelar}>❌ Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={user.id}>
                <td>{user.nombre}</td>
                <td>{user.apellido}</td>
                <td>{user.email}</td>
                <td>{user.rol}</td>
                <td>{user.institucion}</td>
                <td>{user.grado}</td>
                <td>{user.telefono}</td>
                <td>
                  <button onClick={() => handleEditar(user)}>✏️ Editar</button>
                  {user.id !== currentUser?.uid && (
                    <button onClick={() => handleEliminar(user.id)}>🗑️ Eliminar</button>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
