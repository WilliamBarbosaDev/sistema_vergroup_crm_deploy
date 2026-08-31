import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  QrCode,
  Globe,
  Clock,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
        setErrorMessage('E-mail ou senha inválidos. Tente selecionar um perfil de teste abaixo.');
        setStep('email');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div
      id="vergroup-login-portal"
      className="relative min-h-screen w-screen font-sans antialiased flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none bg-slate-900 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(15, 73, 58, 0.45), rgba(10, 52, 41, 0.35)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      {/* 1. TOP BRANDING / NAVIGATION */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F8A4B] text-white flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-white/30">
            V
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight drop-shadow-md">VERGROUP</span>
            <span className="text-[10px] text-emerald-200 font-bold block uppercase tracking-wider">Sistema Integrado ERP & CRM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-extrabold text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>StayCloud Ready (v2.5)</span>
        </div>
      </header>

      {/* 2. MAIN CENTER BODY (MATCHING REFERENCE BITRIX SCREENSHOT EXACTLY) */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 my-auto max-w-7xl w-full mx-auto py-8">
        
        {/* Left Side Big Title matching screenshot */}
        <div className="space-y-4 text-white max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg text-white">VERGROUP</span>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-bold text-emerald-100/90 drop-shadow-md">
            Sua central integrada de trabalho ideal
          </p>
          <p className="text-xs text-white/80 font-medium leading-relaxed max-w-md">
            Gestão operacional, CRM comercial, automação fiscal, cronômetros de tempo e inteligência VER AI sob permissões RLS.
          </p>
        </div>

        {/* Right Side Floating Cards (Main Login Card + QR Code Card) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-5 shrink-0">
          
          {/* CARD 1: MAIN WHITE LOGIN CARD (MATCHING REFERENCE SCREENSHOT EXACTLY) */}
          <div className="w-84 md:w-92 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 flex flex-col justify-between space-y-6">
            
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Fazer login no VERGROUP</h2>
              <p className="text-xs text-slate-500 font-semibold">
                {step === 'email' ? 'Digite seu e-mail corporativo para continuar' : `Digitar senha de acesso para ${email}`}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleContinue} className="space-y-4 text-xs">
              
              {step === 'email' ? (
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider block">
                    E-mail ou telefone
                  </label>
                  <div className="flex items-center gap-2 bg-[#F7F9FA] px-3.5 py-3 rounded-xl border border-slate-300 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.br"
                      className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider block">
                      Senha de acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] font-bold text-[#0F8A4B] hover:underline"
                    >
                      Alterar e-mail
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F7F9FA] px-3.5 py-3 rounded-xl border border-slate-300 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer transition-all text-xs"
              >
                {isSubmitting ? 'Autenticando...' : step === 'email' ? 'Continuar' : 'Entrar no VERGROUP'}
              </button>
            </form>

            <div className="text-center">
              <a
                href="#sso"
                onClick={(e) => { e.preventDefault(); alert('Modo SSO ativado. Use a conta do Microsoft 365 ou Google Workspace.'); }}
                className="text-xs font-bold text-[#0F8A4B] hover:underline"
              >
                Digite o endereço do VERGROUP
              </a>
            </div>

            {/* Outras opções de login (Social / SSO Buttons matching Bitrix screenshot) */}
            <div className="pt-3 border-t border-slate-200/80 space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 block text-center">Outras opções de login</span>
              
              <div className="flex items-center justify-center gap-2">
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
                    className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center font-bold text-xs shadow-xs hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span>{item.icon}</span>
                  </button>
                ))}
                <button
                  type="button"
                  title="Mais opções"
                  onClick={() => alert('Opções adicionais de login SSO corporativo')}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs hover:bg-slate-200 cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* CARD 2: QR CODE LOGIN CARD (MATCHING REFERENCE BITRIX SCREENSHOT EXACTLY) */}
          <div className="w-72 bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xl shrink-0">
            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-tight text-white">Login por código QR</h3>
              <p className="text-[11px] text-white/70 font-semibold leading-snug">
                Escaneie o código QR e siga o link para fazer login no VERGROUP.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-40 h-40 bg-slate-100 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1">VERGROUP QR Auth</span>
              </div>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="px-3 py-1 bg-black/60 border border-white/20 rounded-lg text-[10px] font-bold text-white/90 cursor-pointer hover:bg-black">
                App Store
              </span>
              <span className="px-3 py-1 bg-black/60 border border-white/20 rounded-lg text-[10px] font-bold text-white/90 cursor-pointer hover:bg-black">
                Google Play
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* 3. BOTTOM FOOTER & HOMOLOGATION QUICK TEST ACCESS BAR */}
      <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/20 text-xs font-semibold text-white/80">
        
        <div className="flex items-center gap-4 text-xs">
          <button className="flex items-center gap-1 hover:text-white cursor-pointer font-extrabold">
            <span>Português (Brasil)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Política de Privacidade VERGROUP em conformidade com LGPD'); }} className="hover:text-white">
            Privacy Policy
          </a>
        </div>

        {/* Quick Access Test Profiles for Homologation */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider shrink-0">Testar como:</span>
          {users.slice(0, 4).map((u) => (
            <button
              key={u.id}
              onClick={() => loginAsUser(u.id)}
              className="px-2.5 py-1 bg-black/40 hover:bg-emerald-600/80 border border-white/20 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{u.name}</span>
            </button>
          ))}
        </div>

      </footer>

    </div>
  );
};
