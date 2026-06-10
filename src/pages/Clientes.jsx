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

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    razaoSocial: "",
    cnpj: "",
    status: "Ativo",
  });

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(lista);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    setFormData({ ...formData, cnpj: value });
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ razaoSocial: "", cnpj: "", status: "Ativo" });
    setIsModalOpen(true);
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setFormData({
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj,
      status: cliente.status || "Ativo",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nome) => {
    const confirmacao = window.confirm(
      `Tens a certeza que desejas eliminar o cliente "${nome}"?`,
    );
    if (!confirmacao) return;

    try {
      await deleteDoc(doc(db, "clients", id));
      fetchClientes();
    } catch (error) {
      console.error("Erro ao eliminar:", error);
      alert("Erro ao eliminar cliente.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.razaoSocial || !formData.cnpj) {
      alert("Preenche a Razão Social e o CNPJ.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const clienteRef = doc(db, "clients", editingId);
        await updateDoc(clienteRef, {
          razaoSocial: formData.razaoSocial,
          cnpj: formData.cnpj,
          status: formData.status,
        });
      } else {
        await addDoc(collection(db, "clients"), {
          razaoSocial: formData.razaoSocial,
          cnpj: formData.cnpj,
          status: formData.status,
          criadoEm: new Date(),
        });
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-bold text-primary">
          Empresas e Clientes
        </h1>
        <button
          onClick={openNewModal}
          className="bg-navy-800 text-lime-400 font-semibold text-[13px] py-[9px] px-4 rounded-md transition-colors duration-200 hover:bg-navy-900 flex items-center gap-2"
        >
          <i className="ti ti-plus text-[16px]"></i> Novo Cliente
        </button>
      </div>

      <div className="k-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted text-[13px]">
            A carregar dados...
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="ti ti-users text-[48px] text-muted mb-3"></i>
            <h3 className="text-[15px] font-bold text-primary mb-1">
              Nenhum cliente encontrado
            </h3>
            <p className="text-[13px] text-muted">
              Adiciona a tua primeira empresa para começar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-subtle border-b border-DEFAULT transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-[32px] h-[32px] rounded-full bg-navy-800 text-lime-400 flex items-center justify-center text-[11px] font-bold">
                          {cliente.razaoSocial?.substring(0, 2).toUpperCase() ||
                            "EM"}
                        </div>
                        <span className="text-[13px] font-medium text-primary">
                          {cliente.razaoSocial}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-secondary">
                      {cliente.cnpj}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 bg-[#F4FBDA] text-[#5C7A0E] px-[9px] py-[3px] rounded-full text-[11px] font-semibold">
                        <span className="w-[5px] h-[5px] rounded-full bg-[#5C7A0E]"></span>
                        {cliente.status || "Ativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-muted hover:text-primary transition-colors p-1"
                          title="Editar"
                        >
                          <i className="ti ti-edit text-[18px]"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cliente.id, cliente.razaoSocial)
                          }
                          className="text-muted hover:text-red-500 transition-colors p-1"
                          title="Eliminar"
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
                {editingId ? "Editar Empresa" : "Cadastrar Empresa"}
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
                  Razão Social
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tech Solutions LTDA"
                  className="k-input w-full"
                  value={formData.razaoSocial}
                  onChange={(e) =>
                    setFormData({ ...formData, razaoSocial: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                  CNPJ
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  className="k-input w-full"
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                  Status
                </label>
                <select
                  className="k-input w-full cursor-pointer"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  disabled={isSubmitting}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em negociação">Em negociação</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
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
                  {isSubmitting ? "A guardar..." : "Salvar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
