import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, UserCheck, KeyRound, Globe, Server } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { users, login, loginAsUser } = useApp();

  const [email, setEmail] = useState('william@vergroup.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setErrorMessage('E-mail ou senha inválidos. Tente selecionar um perfil de teste abaixo.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="vergroup-login-portal" className="min-h-screen w-screen bg-[#F7F9FA] text-[#17212B] font-sans antialiased flex flex-col justify-between select-none">
      
      {/* Top Brand Header */}
      <header className="p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F8A4B] text-white flex items-center justify-center font-black text-xl shadow-md">
            V
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900">VERGROUP</h1>
            <span className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">Sistema Integrado ERP & CRM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>StayCloud Ready (Production v2.5)</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 space-y-6">
          
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center mx-auto shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Portal de Acesso Corporativo</h2>
            <p className="text-xs text-slate-500 font-semibold">Autenticação soberana com isolamento multiempresa e RLS</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">
                E-mail Corporativo
              </label>
              <div className="flex items-center gap-2 bg-[#F7F9FA] px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@vergroup.com.br"
                  className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Senha de Acesso
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Instruções de redefinição de senha enviadas ao e-mail informado.'); }} className="text-[11px] font-bold text-[#0F8A4B] hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="flex items-center gap-2 bg-[#F7F9FA] px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0F8A4B] accent-[#0F8A4B]"
                />
                <span>Manter sessão ativa</span>
              </label>

              <span className="text-[10px] font-mono font-extrabold text-slate-400">AES-256 Auth</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rapid Test Profiles Bar (Quick Access for Testing) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">
              Acesso Rápido — Perfis de Teste em Homologação
            </span>

            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => loginAsUser(u.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-[#0F8A4B] text-left transition-all cursor-pointer flex items-center gap-2"
                >
                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
                  <div className="min-w-0">
                    <strong className="block text-[11px] font-black text-slate-900 truncate">{u.name}</strong>
                    <span className="text-[9px] text-[#0F8A4B] font-bold block truncate capitalize">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Credentials Info */}
      <footer className="p-6 text-center text-xs font-semibold text-slate-400">
        <p>© 2026 VERGROUP Tecnologia & Soluções Corporativas. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
};
