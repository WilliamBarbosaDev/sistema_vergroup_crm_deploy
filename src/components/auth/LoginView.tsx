import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Clock,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerGroupLogo } from '../common/VerGroupLogo';

export const LoginView: React.FC = () => {
  const { users, login, loginAsUser } = useApp();

  const [email, setEmail] = useState('william@vergroup.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (step === 'email') {
      setStep('password');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setErrorMessage('E-mail ou senha inválidos. Tente novamente.');
        setStep('email');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div
      id="vergroup-login-portal"
      className="relative min-h-screen w-screen font-sans antialiased flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none bg-slate-950 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(10, 52, 41, 0.65), rgba(15, 73, 58, 0.55)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      {/* MAIN CENTER BODY (OFFICIAL LOGO + SINGLE CARD BITRIX MODEL MATCH) */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 my-auto max-w-6xl w-full mx-auto py-8">
        
        {/* Left Side Official White Logo & Branding matching reference screenshot */}
        <div className="space-y-6 text-white max-w-lg">
          <VerGroupLogo variant="white" size="xl" showSubtitle />

          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-extrabold text-emerald-100 drop-shadow-md leading-tight">
              Sua central integrada de trabalho ideal
            </p>
            <p className="text-xs md:text-sm text-white/90 font-semibold leading-relaxed max-w-md drop-shadow-xs">
              Gestão operacional, CRM comercial, automação fiscal, cronômetros de tempo e inteligência VER AI sob permissões RLS.
            </p>
          </div>
        </div>

        {/* Right Side Single White Login Card with Official Green Logo */}
        <div className="w-84 md:w-96 bg-white/98 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-200 shrink-0">
          
          <div className="space-y-3 text-center mb-6 flex flex-col items-center">
            <VerGroupLogo variant="green" size="md" />
            <h2 className="text-lg font-black text-[#0A1C16] tracking-tight font-display">Fazer login no VERGROUP</h2>
            <p className="text-xs text-slate-600 font-bold">
              {step === 'email' ? 'Digite seu e-mail corporativo para continuar' : `Digitar senha de acesso para ${email}`}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black rounded-xl text-center shadow-2xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-4 text-xs">
            
            {step === 'email' ? (
              <div className="space-y-1.5">
                <label className="font-black text-[#0A1C16] uppercase text-[11px] tracking-wider block">
                  E-mail ou telefone
                </label>
                <div className="flex items-center gap-2.5 bg-[#F8FAF9] px-4 py-3.5 rounded-xl border border-slate-300 focus-within:border-[#0F8A4B] focus-within:ring-2 focus-within:ring-[#0F8A4B]/20 focus-within:bg-white transition-all">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.br"
                    className="w-full bg-transparent outline-none text-[#0A1C16] font-extrabold text-xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-black text-[#0A1C16] uppercase text-[11px] tracking-wider block">
                    Senha de acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] font-black text-[#0F8A4B] hover:underline"
                  >
                    Alterar e-mail
                  </button>
                </div>
                <div className="flex items-center gap-2.5 bg-[#F8FAF9] px-4 py-3.5 rounded-xl border border-slate-300 focus-within:border-[#0F8A4B] focus-within:ring-2 focus-within:ring-[#0F8A4B]/20 focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent outline-none text-[#0A1C16] font-extrabold text-xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer transition-all text-xs tracking-wide"
            >
              {isSubmitting ? 'Autenticando...' : step === 'email' ? 'Continuar' : 'Entrar no VERGROUP'}
            </button>
          </form>

          <div className="text-center my-4">
            <a
              href="#sso"
              onClick={(e) => { e.preventDefault(); alert('Modo SSO ativado.'); }}
              className="text-xs font-black text-[#0F8A4B] hover:underline"
            >
              Digite o endereço do VERGROUP
            </a>
          </div>

          {/* Outras opções de login */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <span className="text-[11px] font-extrabold text-slate-600 block text-center uppercase tracking-wider">
              Outras opções de login
            </span>
            
            <div className="flex items-center justify-center gap-2.5">
              {[
                { name: 'Facebook', icon: 'f', bg: 'bg-blue-600 text-white' },
                { name: 'Google', icon: 'G', bg: 'bg-red-500 text-white' },
                { name: 'Apple', icon: '', bg: 'bg-slate-900 text-white' },
                { name: 'Microsoft', icon: '田', bg: 'bg-amber-600 text-white' },
                { name: 'Office365', icon: 'O', bg: 'bg-sky-600 text-white' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  title={`Login com ${item.name}`}
                  onClick={() => loginAsUser(users[0]?.id)}
                  className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center font-black text-xs shadow-sm hover:scale-105 transition-transform cursor-pointer`}
                >
                  <span>{item.icon}</span>
                </button>
              ))}
              <button
                type="button"
                title="Mais opções"
                onClick={() => alert('Opções adicionais de login SSO corporativo')}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs shadow-sm hover:bg-slate-200 cursor-pointer border border-slate-200"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* BOTTOM FOOTER NAVIGATION */}
      <footer className="relative z-10 flex items-center justify-between pt-4 border-t border-white/20 text-xs font-bold text-white">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1 hover:text-emerald-300 cursor-pointer font-black">
            <span>Português (Brasil)</span>
          </button>
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert('Política de Privacidade VERGROUP em conformidade com LGPD'); }}
            className="hover:text-emerald-300 font-extrabold"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

    </div>
  );
};
