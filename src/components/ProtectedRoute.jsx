import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fica escutando se existe um usuário logado no Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpa o ouvinte quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-[13px] text-muted font-medium tracking-widest uppercase">
          Verificando acesso...
        </p>
      </div>
    );
  }

  // Se tem usuário, renderiza as páginas internas (Outlet). Se não tem, chuta para o Login (/).
  return user ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoute;
