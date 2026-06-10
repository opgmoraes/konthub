import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Tarefas from "./pages/Tarefas";
import Financeiro from "./pages/Financeiro";
import Perfil from "./pages/Perfil"; // <-- Importe aqui
import Layout from "./components/Layout";
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
            <Route path="/perfil" element={<Perfil />} />{" "}
            {/* <-- Adicione esta linha */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
