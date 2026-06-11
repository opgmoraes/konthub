import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Documentos() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Lista simulada de documentos para a interface não ficar vazia
  const [documentos, setDocumentos] = useState([
    {
      id: 1,
      nome: "Guia_DAS_Junho_2026.pdf",
      tamanho: "142 KB",
      data: new Date().toLocaleDateString("pt-BR"),
    },
    {
      id: 2,
      nome: "Contrato_Social_Assinado.pdf",
      tamanho: "2.4 MB",
      data: new Date().toLocaleDateString("pt-BR"),
    },
  ]);

  // Busca apenas os clientes do Firebase
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(lista);
        if (lista.length > 0) setClienteSelecionado(lista[0].id);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoadingClientes(false);
      }
    };
    fetchClientes();
  }, []);

  // Simula um upload visual de 2 segundos
  const handleSimulatedUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !clienteSelecionado) return;

    setUploading(true);

    setTimeout(() => {
      const novoDoc = {
        id: Date.now(),
        nome: file.name,
        tamanho: "PDF Simulado",
        data: new Date().toLocaleDateString("pt-BR"),
      };
      setDocumentos([novoDoc, ...documentos]);
      setUploading(false);
    }, 2000);
  };

  // Simula a exclusão
  const handleDelete = (id) => {
    const confirmacao = window.confirm("Excluir este documento simulado?");
    if (confirmacao) {
      setDocumentos(documentos.filter((doc) => doc.id !== id));
    }
  };

  return (
    <div className="w-full relative">
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-primary tracking-tight">
          Gestão de Documentos
        </h1>
        <p className="text-[13px] text-muted mt-1">
          Simulação de interface. A conexão com o Cloudflare R2 será feita na
          próxima etapa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div className="k-card p-5">
            <label className="block text-[11px] font-bold uppercase text-muted mb-2 tracking-wider">
              Selecionar Empresa
            </label>
            <select
              className="k-input w-full cursor-pointer text-[13px]"
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              disabled={loadingClientes}
            >
              {loadingClientes ? (
                <option>Carregando empresas...</option>
              ) : clientes.length === 0 ? (
                <option>Nenhum cliente cadastrado</option>
              ) : (
                clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="k-card p-6 border-dashed border-2 border-DEFAULT hover:border-[#AED93F]/40 transition-colors relative flex flex-col items-center justify-center text-center group min-h-[200px]">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleSimulatedUpload}
              disabled={uploading || clientes.length === 0}
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-4 border-[#AED93F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[13px] font-semibold text-[#AED93F]">
                  Simulando Upload...
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/05 text-muted group-hover:text-[#AED93F] flex items-center justify-center mb-3 transition-colors">
                  <i className="ti ti-cloud-upload text-[26px]"></i>
                </div>
                <h4 className="text-[13px] font-bold text-primary mb-1">
                  Clique ou Arraste o arquivo
                </h4>
                <p className="text-[11px] text-muted px-4">
                  Modo de simulação ativado.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Lado Direito: Arquivos Simulados */}
        <div className="lg:col-span-2">
          <div className="k-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-DEFAULT flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-[14px] font-bold text-primary">
                Arquivos do Cliente (Simulação)
              </h3>
              <i className="ti ti-folder text-muted text-lg"></i>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT">
                      Nome do Arquivo
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                      Tamanho
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                      Data
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-muted border-b border-DEFAULT text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-subtle border-b border-DEFAULT transition-colors"
                    >
                      <td className="px-5 py-3 text-[13px] font-medium text-primary flex items-center gap-2.5">
                        <i className="ti ti-file-type-pdf text-red-400 text-[20px]"></i>
                        <span
                          className="truncate max-w-[220px]"
                          title={doc.nome}
                        >
                          {doc.nome}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-muted text-right">
                        {doc.tamanho}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-secondary text-right">
                        {doc.data}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-muted hover:text-primary p-1 transition-colors"
                            title="Download Indisponível (Simulação)"
                          >
                            <i className="ti ti-download text-[18px]"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-muted hover:text-red-500 p-1 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentos;
