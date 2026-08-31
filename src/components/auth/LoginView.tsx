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
      className="relative min-h-screen w-screen font-sans antialiased flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none bg-slate-950 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(10, 52, 41, 0.75), rgba(15, 73, 58, 0.65)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      {/* 1. TOP BRANDING / NAVIGATION */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0F8A4B] text-white flex items-center justify-center font-black text-2xl shadow-xl ring-2 ring-white/40">
            V
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight drop-shadow-md font-display">VERGROUP</span>
            <span className="text-[10px] text-emerald-300 font-extrabold block uppercase tracking-wider">Sistema Integrado ERP & CRM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>StayCloud Ready (Production v2.5)</span>
        </div>
      </header>

      {/* 2. MAIN CENTER BODY (MAXIMUM CONTRAST & READABILITY) */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 my-auto max-w-7xl w-full mx-auto py-8">
        
        {/* Left Side Big Title matching reference screenshot */}
        <div className="space-y-4 text-white max-w-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-xl text-white font-display">VERGROUP</span>
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white shadow-md">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-emerald-100 drop-shadow-md leading-tight">
            Sua central integrada de trabalho ideal
          </p>
          <p className="text-xs md:text-sm text-white font-semibold leading-relaxed max-w-md drop-shadow-xs">
            Gestão operacional, CRM comercial, automação fiscal, cronômetros de tempo e inteligência VER AI sob permissões RLS.
          </p>
        </div>

        {/* Right Side Floating Cards (Main Login Card + QR Code Card) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-6 shrink-0">
          
          {/* CARD 1: MAIN WHITE LOGIN CARD (HIGH CONTRAST & CRISP READABILITY) */}
          <div className="w-84 md:w-96 bg-white/98 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col justify-between space-y-6">
            
            <div className="space-y-1.5 text-center">
              <h2 className="text-xl font-black text-[#0A1C16] tracking-tight font-display">Fazer login no VERGROUP</h2>
              <p className="text-xs text-slate-600 font-bold">
                {step === 'email' ? 'Digite seu e-mail corporativo para continuar' : `Digitar senha de acesso para ${email}`}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black rounded-xl text-center shadow-2xs">
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

            <div className="text-center">
              <a
                href="#sso"
                onClick={(e) => { e.preventDefault(); alert('Modo SSO ativado. Use a conta do Microsoft 365 ou Google Workspace.'); }}
                className="text-xs font-black text-[#0F8A4B] hover:underline"
              >
                Digite o endereço do VERGROUP
              </a>
            </div>

            {/* Outras opções de login */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-600 block text-center uppercase tracking-wider">Outras opções de login</span>
              
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

          {/* CARD 2: QR CODE LOGIN CARD */}
          <div className="w-76 bg-slate-900/80 backdrop-blur-2xl border border-white/30 text-white rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xl shrink-0">
            <div className="space-y-1.5">
              <h3 className="text-sm font-black tracking-tight text-white font-display">Login por código QR</h3>
              <p className="text-[11px] text-white font-bold leading-snug">
                Escaneie o código QR e siga o link para fazer login no VERGROUP.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <div className="w-44 h-44 bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-200">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[9px] font-mono font-black text-slate-700 uppercase mt-1">VERGROUP QR Auth</span>
              </div>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="px-3.5 py-1.5 bg-black/80 border border-white/30 rounded-xl text-[10px] font-black text-white cursor-pointer hover:bg-black">
                App Store
              </span>
              <span className="px-3.5 py-1.5 bg-black/80 border border-white/30 rounded-xl text-[10px] font-black text-white cursor-pointer hover:bg-black">
                Google Play
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* 3. BOTTOM FOOTER & HOMOLOGATION QUICK TEST ACCESS BAR */}
      <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/30 text-xs font-bold text-white">
        
        <div className="flex items-center gap-5 text-xs">
          <button className="flex items-center gap-1 hover:text-emerald-300 cursor-pointer font-black">
            <span>Português (Brasil)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Política de Privacidade VERGROUP em conformidade com LGPD'); }} className="hover:text-emerald-300 font-extrabold">
            Privacy Policy
          </a>
        </div>

        {/* Quick Access Test Profiles for Homologation */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider shrink-0">Testar como:</span>
          {users.slice(0, 4).map((u) => (
            <button
              key={u.id}
              onClick={() => loginAsUser(u.id)}
              className="px-3 py-1 bg-black/60 hover:bg-emerald-600/90 border border-white/30 rounded-xl text-[11px] font-black text-white transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
            >
              <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white/40" />
              <span>{u.name}</span>
            </button>
          ))}
        </div>

      </footer>

    </div>
  );
};
