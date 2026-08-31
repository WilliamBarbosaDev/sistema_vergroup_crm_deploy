import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, UserCheck, KeyRound, Globe, Server, Building2, ChevronRight } from 'lucide-react';
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
    <div id="vergroup-login-split-portal" className="min-h-screen w-screen bg-white text-[#17212B] font-sans antialiased flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* LADO ESQUERDO: BRANDING DA MARCA VERGROUP (#0F493A / #0A3429) */}
      <div className="w-full md:w-1/2 bg-[#0F493A] text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-[#13604C]/60">
        
        {/* Subtle Decorative Gradient Overlays */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1F9879]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#13604C]/40 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Logo VERGROUP */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#0F493A] flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-emerald-400/20">
              V
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>VERGROUP</span>
                <span className="text-[10px] font-mono bg-[#1F9879] px-2 py-0.5 rounded text-white font-extrabold uppercase">SISTEMA INTEGRADO</span>
              </h1>
              <p className="text-xs text-emerald-200/90 font-semibold tracking-wider uppercase">Tecnologia & Soluções Corporativas</p>
            </div>
          </div>
        </div>

        {/* 2. Middle Brand Statement & Features */}
        <div className="relative z-10 space-y-6 my-8 md:my-0">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-[#13604C]/80 border border-emerald-400/30 text-emerald-200 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Plataforma Gestão Multiempresa & VER AI</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Central Unificada de Execução Operacional, CRM e Inteligência Artificial.
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed font-medium">
              Conecte equipes, acompanhe funis comerciais, controle tarefas operacionais com SLA corporativo e tome decisões supervisionadas pela VER AI.
            </p>
          </div>

          <div className="space-y-3 text-xs font-semibold text-emerald-100/90 pt-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Isolamento Soberano Multiempresa (VERCONT, VerAds, Tech)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SLA Engine, Time Tracking e Workflow Auditoria RLS</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Prontidão de Deploy Corporativo StayCloud Enterprise</span>
            </div>
          </div>
        </div>

        {/* 3. Footer Security Banner */}
        <div className="relative z-10 pt-6 border-t border-[#13604C]/60 flex items-center justify-between text-xs text-emerald-200/80 font-bold">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Criptografado TLS 1.3</span>
          </div>
          <span className="font-mono text-[11px]">v2.5.0 Production</span>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO DE LOGIN E SELETOR DE TESTE (PREDOMINANTEMENTE BRANCO) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-14 flex flex-col justify-between overflow-y-auto">
        
        {/* Top StayCloud Status */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0F8A4B] animate-pulse" />
            <span>StayCloud Ready (Servidor Ativo)</span>
          </div>
        </div>

        {/* Center Login Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Acesse sua Conta</h3>
            <p className="text-xs text-slate-500 font-semibold">Informe suas credenciais corporativas VERGROUP para entrar no painel</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">
                E-mail Corporativo
              </label>
              <div className="flex items-center gap-2.5 bg-[#F7F9FA] px-3.5 py-3 rounded-xl border border-slate-200 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
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
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Instruções enviadas ao e-mail informado.'); }} className="text-[11px] font-bold text-[#0F8A4B] hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="flex items-center gap-2.5 bg-[#F7F9FA] px-3.5 py-3 rounded-xl border border-slate-200 focus-within:border-[#0F8A4B] focus-within:bg-white transition-all">
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

              <span className="text-[10px] font-mono font-extrabold text-slate-400">Autenticação Soberana</span>
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

          {/* Quick Access Profiles for Testing */}
          <div className="pt-5 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">
              Acesso Rápido — Selecione um perfil para testar
            </span>

            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => loginAsUser(u.id)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-[#0F8A4B] text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                >
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
                  <div className="min-w-0">
                    <strong className="block text-[11px] font-black text-slate-900 truncate group-hover:text-[#0F8A4B]">{u.name}</strong>
                    <span className="text-[9px] text-slate-500 font-bold block truncate capitalize">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-6 text-center text-[11px] font-semibold text-slate-400">
          © 2026 VERGROUP Tecnologia. Todos os direitos reservados.
        </div>

      </div>

    </div>
  );
};
