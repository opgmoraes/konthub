import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

function Equipe() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "Contador",
    funcao: "operador",
  });

  const fetchEquipe = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "team"));
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembros(lista);
    } catch (error) {
      console.error("Erro ao procurar equipa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipe();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ nome: "", email: "", cargo: "Contador", funcao: "operador" });
    setIsModalOpen(true);
  };

  const handleEdit = (membro) => {
    setEditingId(membro.id);
    setFormData({
      nome: membro.nome || "",
      email: membro.email || "",
      cargo: membro.cargo || "Contador",
      funcao: membro.funcao || "operador",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nome) => {
    const confirmacao = window.confirm(
      `Remover "${nome}" da equipa do escritório?`,
    );
    if (!confirmacao) return;

    try {
      await deleteDoc(doc(db, "team", id));
      fetchEquipe();
    } catch (error) {
      console.error("Erro ao remover membro:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.email) {
      alert("Nome e E-mail são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "team", editingId), formData);
      } else {
        await addDoc(collection(db, "team"), {
          ...formData,
          criadoEm: new Date(),
        });
      }
      setIsModalOpen(false);
      fetchEquipe();
    } catch (error) {
      console.error("Erro ao guardar membro da equipa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-primary tracking-tight">
            Gestão da Equipa
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Controle quem acede ao escritório e gira permissões.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-navy-800 text-lime-400 font-semibold text-[13px] py-[9px] px-4 rounded-md hover:bg-navy-900 flex items-center gap-2 transition-colors"
        >
          <i className="ti ti-user-plus text-[16px]"></i> Convidar Membro
        </button>
      </div>

      <div className="k-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted text-[13px]">
            A procurar membros da equipa...
          </div>
        ) : membros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="ti ti-users-group text-[44px] text-muted/40 mb-2"></i>
            <h4 className="text-[13px] font-bold text-primary">
              Apenas você está no escritório
            </h4>
            <p className="text-[11px] text-muted mt-0.5">
              Clique em convidar para adicionar sócios ou colaboradores.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Nome / Cargo
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    E-mail
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Nível de Acesso
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-subtle border-b border-DEFAULT transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-800 text-lime-400 flex items-center justify-center text-[11px] font-bold">
                          {m.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-primary">
                            {m.nome}
                          </p>
                          <p className="text-[11px] text-muted">{m.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-secondary">
                      {m.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.funcao === "administrador" ? "bg-lime-500/10 text-lime-600" : "bg-slate-500/10 text-muted"}`}
                      >
                        {m.funcao}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(m)}
                          className="text-muted hover:text-primary p-1 transition-colors"
                          title="Editar"
                        >
                          <i className="ti ti-edit text-[18px]"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.nome)}
                          className="text-muted hover:text-red-500 p-1 transition-colors"
                          title="Remover"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020F28]/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-DEFAULT rounded-[18px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-DEFAULT flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-primary">
                {editingId ? "Editar Membro" : "Convidar para Equipa"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-primary transition-colors"
              >
                <i className="ti ti-x text-[20px]"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="k-input w-full"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  placeholder="joao@escritorio.com"
                  className="k-input w-full"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Analista Fiscal"
                    className="k-input w-full"
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                    Permissão
                  </label>
                  <select
                    className="k-input w-full cursor-pointer"
                    value={formData.funcao}
                    onChange={(e) =>
                      setFormData({ ...formData, funcao: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="operador">Operador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="pt-5 flex gap-3 justify-end border-t border-DEFAULT mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-md text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md text-[13px] font-semibold bg-navy-800 text-lime-400 hover:bg-navy-900"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "A guardar..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipe;
