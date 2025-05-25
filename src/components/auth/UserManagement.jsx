import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';

const UserManagement = () => {
  const { currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (currentUser.rol === 'coordinador') {
      await deleteDoc(doc(db, 'users', userId));
      alert('Usuario eliminado');
    } else {
      alert('Solo los coordinadores pueden eliminar usuarios');
    }
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.email}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.email)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
