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

function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    prioridade: "media",
    status: "todo",
    clienteId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const tasksSnapshot = await getDocs(collection(db, "tasks"));
      const tasksList = tasksSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const clientsSnapshot = await getDocs(collection(db, "clients"));
      const clientsList = clientsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setTarefas(tasksList);
      setClientes(clientsList);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepara o modal para NOVA tarefa
  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      titulo: "",
      prioridade: "media",
      status: "todo",
      clienteId: "",
    });
    setIsModalOpen(true);
  };

  // Prepara o modal para EDITAR tarefa
  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      titulo: task.titulo,
      prioridade: task.prioridade,
      status: task.status,
      clienteId: task.clienteId || "",
    });
    setIsModalOpen(true);
  };

  // Lógica para EXCLUIR tarefa
  const handleDelete = async (id, titulo) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a tarefa "${titulo}"?`,
    );
    if (!confirmacao) return;

    try {
      await deleteDoc(doc(db, "tasks", id));
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert("Erro ao excluir.");
    }
  };

  // Lógica de SALVAR (Criar ou Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.clienteId) {
      alert("O título e o cliente são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const clienteSelecionado = clientes.find(
        (c) => c.id === formData.clienteId,
      );

      if (editingId) {
        // MODO EDIÇÃO
        const taskRef = doc(db, "tasks", editingId);
        await updateDoc(taskRef, {
          titulo: formData.titulo,
          prioridade: formData.prioridade,
          status: formData.status,
          clienteId: formData.clienteId,
          clienteNome: clienteSelecionado ? clienteSelecionado.razaoSocial : "",
        });
      } else {
        // MODO CRIAÇÃO
        await addDoc(collection(db, "tasks"), {
          titulo: formData.titulo,
          prioridade: formData.prioridade,
          status: formData.status,
          clienteId: formData.clienteId,
          clienteNome: clienteSelecionado ? clienteSelecionado.razaoSocial : "",
          criadoEm: new Date(),
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao guardar tarefa:", error);
      alert("Erro ao salvar dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LÓGICA DE DRAG AND DROP ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Atualização otimista
    setTarefas((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      console.error("Erro ao mover no Firebase:", error);
      fetchData();
    }
  };

  const todoTasks = tarefas.filter((t) => t.status === "todo");
  const doingTasks = tarefas.filter((t) => t.status === "doing");
  const doneTasks = tarefas.filter((t) => t.status === "done");

  // Cartão da Tarefa com botões de Ação
  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onDragEnd={handleDragEnd}
      className="group bg-surface border border-DEFAULT rounded-[10px] p-[14px] shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
            task.prioridade === "alta"
              ? "bg-[#FEE2E2] text-[#DC2626]"
              : task.prioridade === "media"
                ? "bg-[#FEF3C7] text-[#D97706]"
                : "bg-[#E0F2FE] text-[#0284C7]"
          }`}
        >
          {task.prioridade}
        </span>

        {/* Botões de Editar/Excluir aparecem no hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(task);
            }}
            className="text-muted hover:text-primary transition-colors p-1"
            title="Editar Tarefa"
          >
            <i className="ti ti-edit text-[14px]"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task.id, task.titulo);
            }}
            className="text-muted hover:text-red-500 transition-colors p-1"
            title="Excluir Tarefa"
          >
            <i className="ti ti-trash text-[14px]"></i>
          </button>
        </div>
      </div>

      <h4 className="text-[13px] font-semibold text-primary mb-2">
        {task.titulo}
      </h4>

      {task.clienteNome && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted mt-2 border-t border-DEFAULT pt-2 pointer-events-none">
          <i className="ti ti-building text-[14px]"></i>
          <span className="truncate">{task.clienteNome}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-bold text-primary">
          Quadro de Tarefas
        </h1>
        <button
          onClick={openNewModal}
          className="bg-navy-800 text-lime-400 font-semibold text-[13px] py-[9px] px-4 rounded-md hover:bg-navy-900 flex items-center gap-2"
        >
          <i className="ti ti-plus text-[16px]"></i> Nova Tarefa
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {/* Coluna: A FAZER */}
        <div
          className="flex-1 min-w-[300px] bg-page rounded-[14px] p-4 flex flex-col border border-transparent transition-colors hover:border-DEFAULT"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> A
              Fazer
            </h3>
            <span className="text-[11px] font-semibold text-muted bg-surface px-2 py-1 rounded-md">
              {todoTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-[12px] text-muted">Carregando...</p>
            ) : (
              todoTasks.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>

        {/* Coluna: EM ANDAMENTO */}
        <div
          className="flex-1 min-w-[300px] bg-page rounded-[14px] p-4 flex flex-col border border-transparent transition-colors hover:border-DEFAULT"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "doing")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Em
              Andamento
            </h3>
            <span className="text-[11px] font-semibold text-muted bg-surface px-2 py-1 rounded-md">
              {doingTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-[12px] text-muted">Carregando...</p>
            ) : (
              doingTasks.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>

        {/* Coluna: CONCLUÍDO */}
        <div
          className="flex-1 min-w-[300px] bg-page rounded-[14px] p-4 flex flex-col border border-transparent transition-colors hover:border-DEFAULT"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500"></span>{" "}
              Concluído
            </h3>
            <span className="text-[11px] font-semibold text-muted bg-surface px-2 py-1 rounded-md">
              {doneTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-[12px] text-muted">Carregando...</p>
            ) : (
              doneTasks.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>
      </div>

      {/* Modal Inteligente (Criação e Edição) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020F28]/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-DEFAULT rounded-[18px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-DEFAULT flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-primary">
                {editingId ? "Editar Tarefa" : "Nova Tarefa"}
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
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apurar Simples Nacional"
                  className="k-input w-full"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                  Cliente Vinculado
                </label>
                <select
                  className="k-input w-full cursor-pointer"
                  value={formData.clienteId}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteId: e.target.value })
                  }
                  disabled={isSubmitting || clientes.length === 0}
                >
                  <option value="" disabled>
                    Selecione uma empresa...
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                    Prioridade
                  </label>
                  <select
                    className="k-input w-full"
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData({ ...formData, prioridade: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-muted mb-1.5">
                    Coluna
                  </label>
                  <select
                    className="k-input w-full"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="todo">A Fazer</option>
                    <option value="doing">Em Andamento</option>
                    <option value="done">Concluído</option>
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
                  {isSubmitting
                    ? "Aguarde..."
                    : editingId
                      ? "Salvar Edição"
                      : "Criar Tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tarefas;
