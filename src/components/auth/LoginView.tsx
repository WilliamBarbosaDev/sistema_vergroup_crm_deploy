import React, { useState } from 'react';
import { Mail, Lock, Clock, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerGroupLogo } from '../common/VerGroupLogo';

export const LoginView: React.FC = () => {
  const { users, login, loginAsUser } = useApp();

  const [email, setEmail] = useState('william@vergroup.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (step === 'email') {
      setErrorMessage('');
      setStep('password');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setErrorMessage('E-mail ou senha incorretos.');
        setStep('email');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div
      id="vergroup-clean-login-portal"
      className="relative min-h-screen w-screen font-sans antialiased flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none bg-slate-950 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(10, 52, 41, 0.70), rgba(15, 73, 58, 0.55)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      {/* CENTER LAYOUT WITH CLEAN MINIMAL SIGN-IN STYLING */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 my-auto max-w-6xl w-full mx-auto py-8">
        
        {/* Left Side Official Branding */}
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

        {/* Right Side Clean Minimal Sign-In Card */}
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-emerald-100 text-slate-900 shrink-0">
          
          {/* Official Green Logo Header */}
          <div className="mb-6 flex justify-center">
            <VerGroupLogo variant="green" size="md" />
          </div>

          <h2 className="text-xl font-black text-[#0A1C16] mb-1 text-center font-display">
            Entrar no VERGROUP
          </h2>
          <p className="text-slate-500 text-xs mb-6 text-center font-bold">
            {step === 'email' ? 'Acesse com seu e-mail corporativo cadastrado' : `Senha de acesso para ${email}`}
          </p>

          {errorMessage && (
            <div className="w-full p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3.5 mb-2">
            
            {step === 'email' ? (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  placeholder="Seu e-mail corporativo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]/30 focus:border-[#0F8A4B] bg-slate-50/80 text-slate-900 font-bold text-xs transition"
                />
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  placeholder="••••••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]/30 focus:border-[#0F8A4B] bg-slate-50/80 text-slate-900 font-bold text-xs transition"
                />
              </div>
            )}

            <div className="w-full flex items-center justify-between pt-0.5">
              {step === 'password' && (
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs font-bold text-slate-500 hover:text-[#0F8A4B]"
                >
                  ← Alterar e-mail
                </button>
              )}
              <button
                type="button"
                onClick={() => alert('Instruções de recuperação de senha enviadas ao e-mail.')}
                className="text-xs hover:underline font-bold text-[#0F8A4B] ml-auto"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-extrabold py-3 rounded-xl shadow-md hover:brightness-105 cursor-pointer transition text-xs mt-2"
            >
              {isSubmitting ? 'Autenticando...' : step === 'email' ? 'Continuar' : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-dashed border-slate-200"></div>
            <span className="mx-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ou entrar com</span>
            <div className="flex-grow border-t border-dashed border-slate-200"></div>
          </div>

          {/* Social SSO Buttons */}
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={() => loginAsUser(users[0]?.id)}
              title="Entrar com Google"
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition grow shadow-xs cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
            </button>
            <button
              onClick={() => loginAsUser(users[0]?.id)}
              title="Entrar com Facebook"
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition grow shadow-xs cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/448224/facebook.svg"
                alt="Facebook"
                className="w-5 h-5"
              />
            </button>
            <button
              onClick={() => loginAsUser(users[0]?.id)}
              title="Entrar com Apple"
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition grow shadow-xs cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/511330/apple-173.svg"
                alt="Apple"
                className="w-5 h-5"
              />
            </button>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between pt-4 border-t border-white/20 text-xs font-bold text-white">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1 hover:text-emerald-300 cursor-pointer font-black">
            <span>Português (Brasil)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert('Política de Privacidade VERGROUP'); }}
            className="hover:text-emerald-300 font-extrabold"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

    </div>
  );
};
