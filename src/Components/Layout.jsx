import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  // 1. Monitoriza o tema atual
  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(currentTheme);
  }, []);

  // 2. Procura os dados do utilizador logado no Firebase (Foto, Nome, Email)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const getPageTitle = () => {
    if (isActive("/dashboard")) return "Visão Geral";
    if (isActive("/clientes")) return "Empresas e Clientes";
    if (isActive("/tarefas")) return "Quadro de Tarefas";
    if (isActive("/financeiro")) return "Controle Financeiro";
    if (isActive("/documentos")) return "Gestão de Documentos";
    if (isActive("/equipe")) return "Gestão da Equipe";
    return "Painel";
  };

  // Componente interno para os botões do menu lateral estilo 'Pill'
  const MenuItem = ({ label, icon, path, disabled }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => !disabled && navigate(path)}
        disabled={disabled}
        className={`w-full flex items-center gap-3.5 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-white text-[#041B47] shadow-lg"
            : disabled
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:bg-white/05 hover:text-white"
        }`}
      >
        <i className={`${icon} ${active ? "text-lg" : "text-base"}`}></i>
        {label}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#020F28] text-primary transition-colors duration-300 font-sans">
      {/* SIDEBAR FLUTUANTE (ESTILO GLASSMORPHISM) */}
      <aside className="w-[280px] p-5 flex flex-col h-screen sticky top-0 z-20">
        <div className="flex-1 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/[0.05] p-6 flex flex-col shadow-2xl shadow-black/20">
          {/* TOPO ESQUERDO: LOGO E NOME KONT HUB */}
          <div className="flex items-center gap-3.5 mb-10 px-2 mt-2">
            <img
              src="/logo-dark.png"
              alt="Logo Kont Hub"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-white font-bold text-[22px] tracking-tight">
              Kont Hub
            </span>
          </div>

          {/* MENU DE NAVEGAÇÃO */}
          <nav className="flex-1 space-y-2.5">
            <div className="px-5 pb-2">
              <p className="text-[11px] font-bold uppercase text-[#AED93F]/60 tracking-[0.1em]">
                Principal
              </p>
            </div>
            <MenuItem
              label="Dashboard"
              icon="ti ti-layout-dashboard"
              path="/dashboard"
            />
            <MenuItem label="Clientes" icon="ti ti-users" path="/clientes" />

            <div className="px-5 pb-2 pt-6">
              <p className="text-[11px] font-bold uppercase text-[#AED93F]/60 tracking-[0.1em]">
                Operações
              </p>
            </div>
            <MenuItem
              label="Tarefas"
              icon="ti ti-layout-kanban"
              path="/tarefas"
            />
            <MenuItem
              label="Financeiro"
              icon="ti ti-receipt-2"
              path="/financeiro"
            />
            <MenuItem
              label="Documentos"
              icon="ti ti-folder"
              path="/documentos"
            />

            <div className="px-5 pb-2 pt-6">
              <p className="text-[11px] font-bold uppercase text-[#AED93F]/60 tracking-[0.1em]">
                Gerenciamento
              </p>
            </div>
            <MenuItem
              label="Minha Equipe"
              icon="ti ti-users-group"
              path="/equipe"
            />
          </nav>

          {/* SAIR DO SISTEMA */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-5 py-3 rounded-full text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <i className="ti ti-logout text-lg"></i>
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden py-5 pr-5">
        {/* TOPBAR SUPERIOR */}
        <header className="h-[76px] bg-surface rounded-t-[32px] border-b border-DEFAULT flex items-center justify-between px-8 transition-colors duration-300 shadow-sm z-10">
          {/* TÍTULO DA TELA */}
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-primary tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          {/* LADO DIREITO: BUSCA, TEMA E PERFIL DO UTILIZADOR */}
          <div className="flex items-center gap-5">
            {/* BARRA DE BUSCA EM PÍLULA ALINHADA */}
            <div className="relative hidden md:block">
              <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[15px]"></i>
              <input
                type="text"
                placeholder="Buscar no sistema..."
                className="w-64 lg:w-72 h-[38px] pl-10 pr-4 bg-page text-primary text-[13px] rounded-full border border-DEFAULT focus:outline-none focus:border-[#AED93F] transition-colors placeholder:text-muted/70"
              />
            </div>

            {/* BOTÃO ALTERNAR TEMA CLARO/ESCURO */}
            <button
              onClick={toggleTheme}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-page hover:bg-subtle text-muted transition-colors border border-DEFAULT"
              title={
                theme === "dark"
                  ? "Mudar para Tema Claro"
                  : "Mudar para Tema Escuro"
              }
            >
              {theme === "dark" ? (
                <i className="ti ti-sun text-[18px]"></i>
              ) : (
                <i className="ti ti-moon text-[18px]"></i>
              )}
            </button>

            {/* SEPARADOR VISUAL */}
            <div className="w-[1px] h-7 bg-DEFAULT mx-1"></div>

            {/* EXIBIÇÃO DE PERFIL DO UTILIZADOR (CLICÁVEL) */}
            <div
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-full hover:bg-white/[0.03] transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-[13px] font-bold text-primary leading-tight group-hover:text-[#AED93F] transition-colors">
                  {user?.displayName || "Administrador"}
                </p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  {user?.email || "Conectado"}
                </p>
              </div>

              <div className="relative">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${user?.displayName || user?.email || "A"}&background=041B47&color=AED93F&bold=true`
                  }
                  alt="Perfil do Utilizador"
                  className="w-[38px] h-[38px] rounded-full object-cover border-2 border-[#AED93F]/30 group-hover:border-[#AED93F] transition-colors"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime-500 border-2 border-surface rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* EXIBIÇÃO DAS PÁGINAS INTERNAS */}
        <main className="flex-1 bg-surface rounded-b-[32px] overflow-y-auto p-8 shadow-inner border border-t-0 border-DEFAULT">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
