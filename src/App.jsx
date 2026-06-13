import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Tarefas from "./pages/Tarefas";
import Financeiro from "./pages/Financeiro";
import Perfil from "./pages/Perfil";
import Documentos from "./pages/Documentos";
import Equipes from "./pages/Equipes"; // <-- Agora procura o arquivo exato com 'S'
import Layout from "./Components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/equipes" element={<Equipes />} />{" "}
            {/* <-- Rota no plural */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
