import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import './Register.css';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [grado, setGrado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, clave);
      const user = userCredential.user;

      const data = {
        id: user.uid,
        email,
        nombre,
        apellido,
        rol,
        institucion,
        fechaRegistro: serverTimestamp()
      };

      if (rol === 'estudiante') {
        data.grado = parseInt(grado);
      }

      if (telefono) {
        data.telefono = parseInt(telefono);
      }

      await setDoc(doc(db, 'users', user.uid), data);

      setMensaje('Cuenta creada con éxito. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else {
        setError('Error al registrar el usuario');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      {error && <p className="error-message">{error}</p>}
      {mensaje && <p className="success-message">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-field">
          <input
            type={verClave ? 'text' : 'password'}
            placeholder="Clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <button type="button" onClick={() => setVerClave(!verClave)}>
            {verClave ? 'Ocultar' : 'Ver'}
          </button>
        </div>
        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
          <option value="">Selecciona un rol</option>
          <option value="estudiante">Estudiante</option>
        </select>
        {rol === 'estudiante' && (
          <input
            type="number"
            placeholder="Grado"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Institución"
          value={institucion}
          onChange={(e) => setInstitucion(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Teléfono (opcional)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <button type="submit">Registrarse</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </div>
  );
}
