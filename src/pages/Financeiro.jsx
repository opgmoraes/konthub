import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle de Edição
  const [editingId, setEditingId] = useState(null);

  // Estado do Formulário (Agora inclui a data editável)
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "receita", // receita ou despesa
    data: new Date().toISOString().split("T")[0],
  });

  // Busca as transações ordenadas pela data mais recente
  const fetchFinanceiro = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("data", "desc"));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransacoes(lista);
    } catch (error) {
      console.error("Erro ao buscar financeiro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceiro();
  }, []);

  // Prepara o modal para um NOVO lançamento
  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      descricao: "",
      valor: "",
      tipo: "receita",
      data: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  // Prepara o modal para EDITAR um lançamento existente
  const handleEdit = (transacao) => {
    setEditingId(transacao.id);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      data: transacao.data || new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  // Lógica para EXCLUIR uma transação
  const handleDelete = async (id, descricao) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir o lançamento "${descricao}"? Esta ação vai alterar o saldo e o Dashboard.`,
    );
    if (!confirmacao) return;

    try {
      await deleteDoc(doc(db, "transactions", id));
      fetchFinanceiro(); // Recarrega a lista para atualizar o saldo na hora
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir. Tente novamente.");
    }
  };

  // Lógica para SALVAR (Criação ou Edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.valor || !formData.descricao || !formData.data) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const valorNumerico = parseFloat(formData.valor);

      if (editingId) {
        // MODO EDIÇÃO
        const transacaoRef = doc(db, "transactions", editingId);
        await updateDoc(transacaoRef, {
          descricao: formData.descricao,
          valor: valorNumerico,
          tipo: formData.tipo,
          data: formData.data,
        });
      } else {
        // MODO CRIAÇÃO
        await addDoc(collection(db, "transactions"), {
          descricao: formData.descricao,
          valor: valorNumerico,
          tipo: formData.tipo,
          data: formData.data,
          criadoEm: new Date(),
        });
      }

      setIsModalOpen(false);
      fetchFinanceiro();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar lançamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos rápidos para os Cards
  const totalReceitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <div className="w-full relative">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-bold text-primary">
          Controle Financeiro
        </h1>
        <button
          onClick={openNewModal}
          className="bg-navy-800 text-lime-400 font-semibold text-[13px] py-[9px] px-4 rounded-md hover:bg-navy-900 flex items-center gap-2 transition-colors"
        >
          <i className="ti ti-plus text-[16px]"></i> Novo Lançamento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="k-card border-l-4 border-lime-500">
          <p className="text-[11px] font-semibold uppercase text-muted mb-1 tracking-wider">
            Total Receitas
          </p>
          <h3 className="text-[20px] font-bold text-primary">
            R${" "}
            {totalReceitas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="k-card border-l-4 border-red-500">
          <p className="text-[11px] font-semibold uppercase text-muted mb-1 tracking-wider">
            Total Despesas
          </p>
          <h3 className="text-[20px] font-bold text-primary">
            R${" "}
            {totalDespesas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="k-card border-l-4 border-navy-800">
          <p className="text-[11px] font-semibold uppercase text-muted mb-1 tracking-wider">
            Saldo Líquido
          </p>
          <h3
            className={`text-[20px] font-bold ${saldoLiquido >= 0 ? "text-lime-600" : "text-red-500"}`}
          >
            R${" "}
            {saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="k-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted text-[13px]">
            Carregando transações...
          </div>
        ) : transacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="ti ti-receipt-2 text-[48px] text-muted mb-3"></i>
            <h3 className="text-[15px] font-bold text-primary mb-1">
              Nenhum lançamento
            </h3>
            <p className="text-[13px] text-muted">
              Cadastre receitas e despesas para visualizar o fluxo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Data
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Descrição
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Tipo
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                    Valor
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t, index) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-subtle transition-colors ${index === transacoes.length - 1 ? "" : "border-b border-DEFAULT"}`}
                  >
                    <td className="px-5 py-3 text-[13px] text-secondary">
                      {/* Força a data a usar o fuso horário correto evitando problemas de UTC */}
                      {new Date(t.data + "T00:00:00").toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-medium text-primary">
                      {t.descricao}
                    </td>
                    <td className="px-5 py-3 text-[13px]">
                      <span
                        className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${t.tipo === "receita" ? "bg-lime-500/10 text-lime-600" : "bg-red-500/10 text-red-600"}`}
                      >
                        {t.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3 text-[13px] font-bold text-right ${t.tipo === "receita" ? "text-lime-600" : "text-red-500"}`}
                    >
                      {t.tipo === "despesa" ? "-" : ""} R${" "}
                      {t.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-muted hover:text-primary transition-colors p-1"
                          title="Editar Lançamento"
                        >
                          <i className="ti ti-edit text-[18px]"></i>
                        </button>
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDelete(t.id, t.descricao)}
                          className="text-muted hover:text-red-500 transition-colors p-1"
                          title="Excluir Lançamento"
                        >
                          <i className="ti ti-trash text-[18px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Inteligente (Criação e Edição) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020F28]/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-[18px] w-full max-w-md p-6 shadow-2xl border border-DEFAULT transform transition-all">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-DEFAULT">
              <h3 className="text-[15px] font-bold text-primary">
                {editingId ? "Editar Lançamento" : "Novo Lançamento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-primary transition-colors"
              >
                <i className="ti ti-x text-[20px]"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5 tracking-wider">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Honorários Contábeis"
                  className="k-input w-full"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5 tracking-wider">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="k-input w-full"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5 tracking-wider">
                    Tipo
                  </label>
                  <select
                    className="k-input w-full cursor-pointer"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="receita">Receita (+)</option>
                    <option value="despesa">Despesa (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5 tracking-wider">
                  Data do Lançamento
                </label>
                <input
                  type="date"
                  className="k-input w-full cursor-pointer"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-5 flex gap-3 justify-end border-t border-DEFAULT mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-md text-[13px] font-semibold transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-md text-[13px] font-semibold transition-colors bg-navy-800 text-lime-400 hover:bg-navy-900"
                >
                  {isSubmitting
                    ? "Aguarde..."
                    : editingId
                      ? "Salvar Edição"
                      : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;
