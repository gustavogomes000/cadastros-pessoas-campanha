import { useState, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import fernandaImg from '@/assets/fernanda-sarelli.jpg';
import logoSarelli from '@/assets/logo-sarelli.png';

const ConstellationBg = lazy(() => import('@/components/ConstellationBg'));

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState(() => localStorage.getItem("saved_user") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("saved_user"));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: 'Preencha nome e senha', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Erro ao entrar', description: 'Nome ou senha incorretos', variant: 'destructive' });
    }
    if (remember) {
      localStorage.setItem("saved_user", username);
    } else {
      localStorage.removeItem("saved_user");
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center overflow-y-auto overscroll-contain relative"
      style={{ background: 'linear-gradient(160deg, #fef2f2 0%, #fdf2f8 40%, #fce7f3 70%, #fbcfe8 100%)' }}
    >
      <Suspense fallback={null}>
        <ConstellationBg />
      </Suspense>

      {/* Decorative floating orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />
      <div className="fixed bottom-[-8%] left-[-5%] w-[250px] h-[250px] rounded-full opacity-15 blur-3xl pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #f9a8d4, transparent 70%)' }} />
      <div className="fixed top-[40%] left-[60%] w-[200px] h-[200px] rounded-full opacity-10 blur-3xl pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #c084fc, transparent 70%)' }} />

      <div className="w-full max-w-[380px] mx-auto px-5 pt-8 pb-6 sm:py-0 relative z-10">
        {/* Card with animated rotating gradient border */}
        <div className="relative group">
          {/* Rotating gradient border */}
          <div
            className="absolute -inset-[2px] rounded-[28px] overflow-hidden"
            style={{ padding: 0 }}
          >
            <div
              className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%]"
              style={{
                background: 'conic-gradient(from 0deg, #ec4899, #f9a8d4, #c084fc, #f472b6, #ec4899)',
                animation: 'spin 6s linear infinite',
              }}
            />
          </div>
          {/* Glow behind card */}
          <div
            className="absolute -inset-3 rounded-[32px] opacity-30 blur-xl pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, #ec4899, #f9a8d4, #c084fc, #f472b6, #ec4899)',
              animation: 'spin 6s linear infinite',
            }}
          />

          {/* Card content */}
          <div className="relative bg-white/85 backdrop-blur-xl rounded-[26px] shadow-2xl shadow-pink-200/30 overflow-hidden">
            {/* Subtle inner shine */}
            <div className="absolute inset-0 rounded-[26px] pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)' }} />

            <div className="relative px-6 pt-7 pb-6 sm:px-8 sm:pt-9 sm:pb-8">
              {/* Photo + Logo */}
              <div className="flex flex-col items-center">
                {/* Photo with glow ring */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-40"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', transform: 'scale(1.1)' }} />
                  <div className="relative w-[90px] h-[90px] sm:w-[108px] sm:h-[108px] rounded-full overflow-hidden shadow-lg"
                    style={{ border: '3.5px solid #ec4899' }}>
                    <img src={fernandaImg} alt="Dra. Fernanda Sarelli" className="w-full h-full object-cover" loading="eager" />
                  </div>
                  {/* Online dot */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-[2.5px] border-white shadow-sm" />
                </div>

                {/* Logo */}
                <img
                  src={logoSarelli}
                  alt="Sarelli"
                  className="h-32 sm:h-40 -mt-4 object-contain drop-shadow-sm"
                  loading="eager"
                />

                {/* Subtitle */}
                <div className="flex items-center gap-2 -mt-1 mb-5">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c8aa64]/50" />
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: '#c8aa64' }}>
                    Cadastro de Campanha
                  </p>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c8aa64]/50" />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block pl-1">Usuário</label>
                  <div className="relative group/input">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-pink-400">
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      data-testid="input-nome"
                      type="text"
                      placeholder="Seu nome de acesso"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="username"
                      className="w-full bg-white/70 border border-gray-200/80 text-gray-700 placeholder:text-gray-300 h-[46px] pl-10 pr-4 rounded-2xl text-[14px] outline-none transition-all duration-200 focus:border-pink-300 focus:ring-[3px] focus:ring-pink-100 focus:bg-white hover:border-gray-300"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block pl-1">Senha</label>
                  <div className="relative group/input">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-pink-400">
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      data-testid="input-senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full bg-white/70 border border-gray-200/80 text-gray-700 placeholder:text-gray-300 h-[46px] pl-10 pr-11 rounded-2xl text-[14px] outline-none transition-all duration-200 focus:border-pink-300 focus:ring-[3px] focus:ring-pink-100 focus:bg-white hover:border-gray-300"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink-400 transition-colors duration-200 p-0.5"
                      tabIndex={-1}
                    >
                      {showPassword
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center gap-2.5 pl-0.5">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-[15px] h-[15px] rounded-md border-gray-300 accent-pink-500 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-[11px] text-gray-400 cursor-pointer select-none">Lembrar meus dados</label>
                </div>

                {/* Submit */}
                <button
                  data-testid="btn-entrar"
                  type="submit"
                  disabled={loading}
                  className="w-full h-[48px] rounded-2xl font-semibold text-[14px] text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60 relative overflow-hidden group/btn"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #e879f9 100%)',
                    boxShadow: '0 6px 24px rgba(236, 72, 153, 0.35), 0 2px 8px rgba(236, 72, 153, 0.2)',
                  }}
                >
                  {/* Shine sweep animation */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
                      animation: 'shine 3s ease-in-out infinite',
                    }}
                  />
                  {loading
                    ? <span className="flex items-center justify-center gap-2 relative z-10">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        Entrando...
                      </span>
                    : <span className="flex items-center justify-center gap-2 relative z-10">
                        Entrar
                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 space-y-1.5">
          <p className="text-[10px] text-gray-400/80 tracking-wide">Pré-candidata a Deputada Estadual — GO 2026</p>
          <a
            href="https://drafernandasarelli.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-pink-400/80 hover:text-pink-500 transition-colors duration-200 tracking-wide"
          >
            drafernandasarelli.com.br
          </a>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
