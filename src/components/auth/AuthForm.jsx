
import React, { useState } from "react";
import { registerUser, loginUser } from "../../services/authService";
import "./AuthForm.css";

const AuthForm = ({ isRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>
      {error && <p className="error">{error}</p>}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required />
      <button type="submit">{isRegister ? "Registrarse" : "Entrar"}</button>
    </form>
  );
};

export default AuthForm;
