import { useState, useEffect } from "react";
import { updateProfile, updatePassword } from "firebase/auth";
import { auth } from "../firebase";

function Perfil() {
  const user = auth.currentUser;
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    if (user) {
      setNome(user.displayName || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      let atualizado = false;

      // 1. Atualiza o Nome
      if (nome !== user.displayName) {
        await updateProfile(user, { displayName: nome });
        atualizado = true;
      }

      // 2. Atualiza a Senha (se o usuário digitou alguma coisa)
      if (senha) {
        if (senha.length < 6) {
          setMensagem({
            tipo: "erro",
            texto: "A nova senha deve ter pelo menos 6 caracteres.",
          });
          setIsSubmitting(false);
          return;
        }
        await updatePassword(user, senha);
        setSenha(""); // Limpa o campo
        atualizado = true;
      }

      if (atualizado) {
        setMensagem({
          tipo: "sucesso",
          texto: "Perfil atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      // O Firebase exige que o usuário tenha feito login recentemente para mudar a senha
      if (error.code === "auth/requires-recent-login") {
        setMensagem({
          tipo: "erro",
          texto:
            "Por motivos de segurança, saia e faça login novamente para alterar a senha.",
        });
      } else {
        setMensagem({
          tipo: "erro",
          texto: "Ocorreu um erro ao atualizar os dados.",
        });
      }
    } finally {
      setIsSubmitting(false);
      // Apaga a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagem({ tipo: "", texto: "" }), 3000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold text-primary tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-[13px] text-muted mt-1">
          Gerencie as suas informações pessoais e credenciais de acesso.
        </p>
      </div>

      <div className="bg-surface border border-DEFAULT rounded-[24px] p-8 shadow-sm">
        {/* Avatar Visual (Apenas Demonstração) */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-DEFAULT">
          <div className="relative">
            <img
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${user?.displayName || user?.email || "A"}&background=041B47&color=AED93F&bold=true&size=128`
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-page shadow-md"
            />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-primary">
              {user?.displayName || "Usuário Kont Hub"}
            </h3>
            <p className="text-[13px] text-muted">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 bg-lime-500/10 text-lime-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
              Conta Ativa
            </span>
          </div>
        </div>

        {/* Formulário de Atualização */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mensagem.texto && (
            <div
              className={`p-4 rounded-xl text-[13px] font-medium flex items-center gap-2 ${mensagem.tipo === "sucesso" ? "bg-lime-500/10 text-lime-600" : "bg-red-500/10 text-red-600"}`}
            >
              <i
                className={`ti ${mensagem.tipo === "sucesso" ? "ti-check" : "ti-alert-triangle"} text-[18px]`}
              ></i>
              {mensagem.texto}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-muted mb-2 tracking-wider">
              E-mail de Acesso
            </label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full h-[42px] px-4 bg-page/50 text-muted text-[13px] rounded-xl border border-DEFAULT cursor-not-allowed"
            />
            <p className="text-[11px] text-muted mt-1.5 ml-1">
              O e-mail não pode ser alterado.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-muted mb-2 tracking-wider">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como quer ser chamado?"
              className="w-full h-[42px] px-4 bg-page text-primary text-[13px] rounded-xl border border-DEFAULT focus:outline-none focus:border-[#AED93F] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-muted mb-2 tracking-wider">
              Nova Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="w-full h-[42px] px-4 bg-page text-primary text-[13px] rounded-xl border border-DEFAULT focus:outline-none focus:border-[#AED93F] transition-colors"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full text-[13px] font-semibold transition-all duration-200 bg-navy-800 text-lime-400 hover:bg-navy-900 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                "A guardar..."
              ) : (
                <>
                  <i className="ti ti-device-floppy text-[16px]"></i>
                  Guardar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
