import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Settings, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerGroupLogo } from '../common/VerGroupLogo';

export const LoginView: React.FC = () => {
  const { users, login, loginAsUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
    setIsSubmitting(false);
    setRememberMe(false);
  }, []);

  // Administrable Login Customization State (Stored in localStorage)
  const [bgImageUrl, setBgImageUrl] = useState(() => {
    return (
      localStorage.getItem('vergroup_login_bg_url') ||
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80'
    );
  });
  const [quoteText, setQuoteText] = useState(() => {
    return (
      localStorage.getItem('vergroup_login_quote_text') ||
      'Simplesmente todas as ferramentas de gestão, CRM e inteligência que a nossa equipe precisa.'
    );
  });
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('vergroup_login_author_name') || 'Silvestre Castro';
  });
  const [authorTitle, setAuthorTitle] = useState(() => {
    return localStorage.getItem('vergroup_login_author_title') || 'CEO & Founder | VERGROUP Holding';
  });

  const [tempBgUrl, setTempBgUrl] = useState(bgImageUrl);
  const [tempQuote, setTempQuote] = useState(quoteText);
  const [tempAuthorName, setTempAuthorName] = useState(authorName);
  const [tempAuthorTitle, setTempAuthorTitle] = useState(authorTitle);

  const validateEmail = (inputEmail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail corporativo.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Informe um e-mail válido (ex: usuario@vergroup.com.br).');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, informe sua senha de acesso.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setErrorMessage('E-mail ou senha incorretos.');
      }
      setIsSubmitting(false);
    }, 450);
  };

  const handleSaveConfig = () => {
    setBgImageUrl(tempBgUrl);
    setQuoteText(tempQuote);
    setAuthorName(tempAuthorName);
    setAuthorTitle(tempAuthorTitle);

    localStorage.setItem('vergroup_login_bg_url', tempBgUrl);
    localStorage.setItem('vergroup_login_quote_text', tempQuote);
    localStorage.setItem('vergroup_login_author_name', tempAuthorName);
    localStorage.setItem('vergroup_login_author_title', tempAuthorTitle);
  };

  return (
    <div
      id="vergroup-saas-login-view"
      className="min-h-screen w-screen flex flex-col lg:flex-row bg-slate-950 font-sans antialiased overflow-hidden select-none"
    >
      {/* LEFT COLUMN: BRANDING & DRAMATIC BACKGROUND IMAGE */}
      <div
        className="relative lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 bg-cover bg-center transition-all duration-700 shrink-0"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(10, 28, 22, 0.94) 0%, rgba(10, 28, 22, 0.50) 45%, rgba(10, 28, 22, 0.85) 100%), url('${bgImageUrl}')`,
        }}
      >
        {/* Top Header: Logo + Config Button */}
        <div className="relative z-10 flex items-center justify-between">
          <VerGroupLogo variant="white" size="lg" showSubtitle />
        </div>

        {/* Center/Bottom Overlay: Testimonial & Quote */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto lg:my-0 pt-10 lg:pt-0">
          <div className="space-y-4">
            <blockquote className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              “{quoteText}”
            </blockquote>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-11 h-11 rounded-full bg-emerald-600 border-2 border-emerald-300 text-white font-black flex items-center justify-center text-sm shadow-md">
              {authorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-snug">{authorName}</p>
              <p className="text-xs text-emerald-200/90 font-medium">{authorTitle}</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-emerald-200/70 font-semibold pt-6 border-t border-white/10">
          <span>© {new Date().getFullYear()} VERGROUP Participações & Holding</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ambiente RLS Seguro
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: CLEAN MINIMAL SIGN-IN FORM */}
      <div className="lg:w-1/2 flex-1 bg-white flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-4">
          
          {/* Mobile Logo Fallback */}
          <div className="lg:hidden flex justify-center mb-4">
            <VerGroupLogo variant="green" size="md" showSubtitle />
          </div>

          {/* Heading */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Bem-vindo de volta
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Digite seu e-mail e senha corporativos para acessar o painel de gestão integrada.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                E-mail corporativo
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="seu.nome@vergroup.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  name="login-email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]/30 focus:border-[#0F8A4B] transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={() => alert('Solicitação de redefinição de senha enviada para o administrador.')}
                  className="text-xs font-bold text-[#0F8A4B] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  name="login-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]/30 focus:border-[#0F8A4B] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Sign In Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <button
                  type="button"
                  role="switch"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    rememberMe ? 'bg-[#0F8A4B]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      rememberMe ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Lembrar dados neste dispositivo
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 active:scale-[0.99] transition duration-150 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social SSO Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-bold text-slate-400">Ou entrar com</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => loginAsUser(users[0]?.id || 'usr-william')}
              className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-xs"
              title="Entrar com Google"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            </button>
            <button
              onClick={() => loginAsUser(users[0]?.id || 'usr-william')}
              className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-xs"
              title="Entrar com Facebook"
            >
              <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5" />
            </button>
            <button
              onClick={() => loginAsUser(users[0]?.id || 'usr-william')}
              className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-xs"
              title="Entrar com Apple"
            >
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
