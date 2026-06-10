import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Dashboard() {
  const [stats, setStats] = useState({
    receita: "R$ 0,00",
    pendentes: 0,
    contratos: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Busca todos os clientes
        const clientsSnap = await getDocs(collection(db, "clients"));
        const clients = clientsSnap.docs.map((doc) => doc.data());

        // 2. Busca todas as tarefas
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const tasks = tasksSnap.docs.map((doc) => doc.data());

        // 3. Busca todas as transações financeiras
        const transSnap = await getDocs(collection(db, "transactions"));
        const transactions = transSnap.docs.map((doc) => doc.data());

        // 4. Faz a matemática para os indicadores
        const contratosAtivos = clients.filter(
          (c) => c.status === "Ativo",
        ).length;
        const novosLeads = clients.filter(
          (c) => c.status === "Lead" || c.status === "Em negociação",
        ).length;
        const tarefasPendentes = tasks.filter(
          (t) => t.status === "todo" || t.status === "doing",
        ).length;

        // Soma apenas o que for receita para o card principal
        const faturamento = transactions
          .filter((t) => t.tipo === "receita")
          .reduce((acc, t) => acc + t.valor, 0);

        setStats({
          receita: `R$ ${faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          pendentes: tarefasPendentes,
          contratos: contratosAtivos,
          leads: novosLeads,
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full">
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[24px]">
        {/* Card de Faturamento (Navy) */}
        <div className="bg-navy-800 border border-navy-800 rounded-[14px] p-[22px] shadow-card text-white hover:-translate-y-[1px] transition-transform duration-200">
          <p className="text-[11px] font-semibold uppercase text-lime-400/80 tracking-[0.06em] mb-2">
            Receita Mensal
          </p>
          <h3 className="text-[26px] font-bold tracking-[-1px] text-white">
            {loading ? "..." : stats.receita}
          </h3>
        </div>

        {/* Card Tarefas */}
        <div className="k-card">
          <p className="text-[11px] font-semibold uppercase text-muted tracking-[0.06em] mb-2">
            Tarefas Pendentes
          </p>
          <h3 className="text-[26px] font-bold tracking-[-1px] text-primary">
            {loading ? "..." : stats.pendentes}
          </h3>
        </div>

        {/* Card Contratos */}
        <div className="k-card">
          <p className="text-[11px] font-semibold uppercase text-muted tracking-[0.06em] mb-2">
            Contratos Ativos
          </p>
          <h3 className="text-[26px] font-bold tracking-[-1px] text-primary">
            {loading ? "..." : stats.contratos}
          </h3>
        </div>

        {/* Card Leads */}
        <div className="k-card">
          <p className="text-[11px] font-semibold uppercase text-muted tracking-[0.06em] mb-2">
            Novos Leads
          </p>
          <h3 className="text-[26px] font-bold tracking-[-1px] text-primary">
            {loading ? "..." : stats.leads}
          </h3>
        </div>
      </div>

      {/* Cartão Informativo Inferior */}
      <div className="k-card text-secondary text-[13px] p-8 flex flex-col items-center justify-center text-center mt-6">
        <i className="ti ti-rocket text-[40px] text-lime-500 mb-4"></i>
        <h3 className="text-[16px] font-bold text-primary mb-2">
          Sistema Operacional!
        </h3>
        <p className="max-w-md text-muted">
          Os números acima estão refletindo os dados em tempo real do seu banco
          de dados. Navegue pelo menu para adicionar novos clientes, tarefas e
          transações.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
