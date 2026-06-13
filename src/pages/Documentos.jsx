import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// A URL OFICIAL DA SUA NUVEM CLOUDFLARE R2
const WORKER_URL = "https://api-konthub.konthub-gestao.workers.dev";

function Documentos() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Procura a lista de clientes reais no Firestore
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(lista);
        if (lista.length > 0) {
          setClienteSelecionado(lista[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoadingClientes(false);
      }
    };
    fetchClientes();
  }, []);

  // 2. Busca os documentos salvos no R2 assim que um cliente é selecionado
  const fetchDocumentos = async (clienteId) => {
    if (!clienteId) return;
    setLoadingDocs(true);
    try {
      // Faz o pedido para listar arquivos com o prefixo da ID do cliente
      const response = await fetch(
        `${WORKER_URL}?list=true&prefix=${clienteId}/`,
      );
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error("Erro ao procurar documentos no R2:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocumentos(clienteSelecionado);
  }, [clienteSelecionado]);

  // 3. Faz o Upload Real para o Cloudflare R2
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !clienteSelecionado) return;

    setUploading(true);
    // Cria um caminho organizado na nuvem: id_do_cliente/nome_do_arquivo.pdf
    const caminhoArquivo = `${clienteSelecionado}/${file.name}`;

    try {
      const response = await fetch(`${WORKER_URL}/${caminhoArquivo}`, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (response.ok) {
        fetchDocumentos(clienteSelecionado); // Atualiza a tabela na hora
      } else {
        alert("Falha ao enviar arquivo para o Cloudflare R2.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao conectar com a infraestrutura de arquivos.");
    } finally {
      setUploading(false);
      e.target.value = null; // Reseta o input para permitir enviar o mesmo arquivo de novo
    }
  };

  // 4. Exclui o arquivo permanentemente do R2
  const handleDelete = async (key) => {
    const confirmacao = window.confirm(
      "Tem a certeza que deseja excluir permanentemente este documento?",
    );
    if (!confirmacao) return;

    try {
      const response = await fetch(`${WORKER_URL}/${key}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDocumentos(clienteSelecionado);
      }
    } catch (error) {
      console.error("Erro ao apagar arquivo:", error);
    }
  };

  // Formata os bytes recebidos da nuvem para MB ou KB
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="w-full relative">
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-primary tracking-tight">
          Gestão de Documentos
        </h1>
        <p className="text-[13px] text-muted mt-1">
          Armazenamento na Nuvem ativado (Cloudflare R2).
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
                <option>A procurar empresas...</option>
              ) : clientes.length === 0 ? (
                <option>Nenhum cliente registado</option>
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleUpload}
              disabled={uploading || clientes.length === 0}
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-4 border-[#AED93F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[13px] font-semibold text-[#AED93F]">
                  A gravar no R2...
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
                  Envio direto e criptografado para a nuvem.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Lado Direito: Listagem da Nuvem */}
        <div className="lg:col-span-2">
          <div className="k-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-DEFAULT flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-[14px] font-bold text-primary">
                Arquivos do Cliente
              </h3>
              <i className="ti ti-folder text-muted text-lg"></i>
            </div>

            <div className="overflow-x-auto">
              {loadingDocs ? (
                <div className="p-12 text-center text-muted text-[13px]">
                  A procurar arquivos na nuvem...
                </div>
              ) : documentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="ti ti-file-text text-[44px] text-muted/40 mb-2"></i>
                  <h4 className="text-[13px] font-bold text-primary">
                    Nenhum arquivo para esta empresa
                  </h4>
                  <p className="text-[11px] text-muted max-w-xs mt-0.5">
                    Faça o upload de guias ou contratos na zona ao lado.
                  </p>
                </div>
              ) : (
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
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => {
                      // O R2 devolve o caminho completo (id/nome.pdf), removemos a ID para o utilizador ver apenas o nome.
                      const nomeLimpo = doc.key.split("/").slice(1).join("/");
                      return (
                        <tr
                          key={doc.key}
                          className="hover:bg-subtle border-b border-DEFAULT transition-colors"
                        >
                          <td className="px-5 py-3 text-[13px] font-medium text-primary flex items-center gap-2.5">
                            <i className="ti ti-file-type-pdf text-red-400 text-[20px]"></i>
                            <span
                              className="truncate max-w-[220px]"
                              title={nomeLimpo}
                            >
                              {nomeLimpo}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[12px] text-muted text-right">
                            {formatBytes(doc.size)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Link de Download Direto! */}
                              <a
                                href={`${WORKER_URL}/${doc.key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted hover:text-primary p-1 transition-colors"
                                title="Fazer Download"
                              >
                                <i className="ti ti-download text-[18px]"></i>
                              </a>
                              <button
                                onClick={() => handleDelete(doc.key)}
                                className="text-muted hover:text-red-500 p-1 transition-colors"
                                title="Excluir Permanentemente"
                              >
                                <i className="ti ti-trash text-[18px]"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentos;
