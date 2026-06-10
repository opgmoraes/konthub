import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase"; // Note o '../' aqui porque mudamos de pasta
import { useNavigate } from "react-router-dom";

function Login() {
  // Mudamos o nome da função para Login
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState({ email: "", cpf: "" });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const navigate = useNavigate(); // Hook de navegação

  const formatCPF = (value) => {
    let numericValue = value.replace(/\D/g, "");
    numericValue = numericValue.slice(0, 11);
    numericValue = numericValue.replace(/(\d{3})(\d)/, "$1.$2");
    numericValue = numericValue.replace(/(\d{3})(\d)/, "$1.$2");
    numericValue = numericValue.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return numericValue;
  };

  const handleCpfChange = (e) => {
    setCpf(formatCPF(e.target.value));
    if (errors.cpf) setErrors({ ...errors, cpf: "" });
    if (generalError) setGeneralError("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ ...errors, email: "" });
    if (generalError) setGeneralError("");
  };

  const isValidCPF = (cpfStr) => {
    const strCPF = cpfStr.replace(/\D/g, "");
    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11))) return false;
    return true;
  };

  const handleLogin = async () => {
    let newErrors = { email: "", cpf: "" };
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "O e-mail é obrigatório.";
      hasError = true;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Digite um formato de e-mail válido.";
      hasError = true;
    }

    if (!cpf) {
      newErrors.cpf = "O CPF é obrigatório.";
      hasError = true;
    } else if (!isValidCPF(cpf)) {
      newErrors.cpf = "CPF inválido. Verifique os números.";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      setGeneralError("");
      try {
        const plainCpf = cpf.replace(/\D/g, "");
        await signInWithEmailAndPassword(auth, email, plainCpf);
        navigate("/dashboard"); // <-- Redireciona para o Dashboard!
      } catch (error) {
        console.error("Erro no Firebase:", error.code);
        setGeneralError("Credenciais inválidas. Verifique seu e-mail e CPF.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard"); // <-- Redireciona para o Dashboard!
    } catch (error) {
      console.error("Erro no Google Sign-In:", error);
      setGeneralError("Falha ao autenticar com o Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="k-card w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-[18px] font-bold text-primary">
            Bem-vindo ao Kont Hub
          </h1>
          <p className="text-[13px] text-secondary mt-1">
            Faça login para acessar o sistema
          </p>
        </div>

        <form className="space-y-4">
          {generalError && (
            <div className="bg-[#FEE2E2] text-[#7F1D1D] text-[13px] font-medium p-3 rounded-md text-center border border-[#F87171]/30">
              {generalError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-1.5">
              E-mail corporativo
            </label>
            <input
              type="email"
              placeholder="exemplo@escritorio.com.br"
              className={`k-input w-full ${errors.email ? "border-status-red focus:border-status-red" : ""}`}
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-[12px] text-status-red mt-1.5">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-1.5">
              CPF (Acesso)
            </label>
            <input
              type="text"
              placeholder="000.000.000-00"
              className={`k-input w-full ${errors.cpf ? "border-status-red focus:border-status-red" : ""}`}
              value={cpf}
              onChange={handleCpfChange}
              disabled={loading}
            />
            {errors.cpf && (
              <p className="text-[12px] text-status-red mt-1.5">{errors.cpf}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className={`w-full bg-navy-800 text-lime-400 font-semibold text-[13px] py-[9px] px-4 rounded-md transition-colors duration-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-navy-900"}`}
            >
              {loading ? "Validando..." : "Acessar Sistema"}
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-DEFAULT"></div>
            <span className="flex-shrink-0 mx-4 text-muted text-[11px] font-semibold uppercase tracking-[0.06em]">
              ou
            </span>
            <div className="flex-grow border-t border-DEFAULT"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full bg-transparent border border-md text-primary font-semibold text-[13px] py-[9px] px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-subtle"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Aguarde..." : "Entrar com Google"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
