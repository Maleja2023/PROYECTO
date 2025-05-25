import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          ...userData, 
        });
      } else {
        console.error("No se encontraron los datos del usuario");
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);


  const logout = () => {
    signOut(auth)
      .then(() => {
        setCurrentUser(null);
        console.log("Sesión cerrada con éxito");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
