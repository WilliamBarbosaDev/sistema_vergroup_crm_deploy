import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CollaboratorInvite } from '../../types';

interface AcceptInviteModalProps {
  invite: CollaboratorInvite;
  onClose: () => void;
}

export const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({ invite, onClose }) => {
  const { businessUnits, departments, teams, users, acceptInvite } = useApp();

  const [name, setName] = useState<string>(invite.name || '');
  const [email, setEmail] = useState<string>(invite.email || '');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const bu = businessUnits.find((b) => b.id === invite.businessUnitId);
  const dept = departments.find((d) => d.id === invite.departmentId);
  const team = teams.find((t) => t.id === invite.teamId);
  const inviter = users.find((u) => u.id === invite.invitedByUserId);

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);

    setTimeout(() => {
      acceptInvite(invite.token, name, password);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Corporate Branding */}
        <div className="bg-gradient-to-r from-[#17212B] via-[#0F8A4B]/90 to-[#17212B] text-white p-6 text-center relative space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 text-white font-black text-xl shadow-md">
            VG
          </div>
          <h2 className="text-lg font-black tracking-tight">Você foi convidado para o VERGROUP!</h2>
          <p className="text-xs text-emerald-100 font-medium max-w-xs mx-auto">
            {inviter ? `${inviter.name} convidou você para integrar a equipe.` : 'Convite oficial de entrada no sistema.'}
          </p>
        </div>

        {/* Invited Details Card */}
        <div className="p-6 space-y-5 text-xs">
          {!isSuccess ? (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Estrutura Atribuída ao Seu Perfil
                </span>

                <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Empresa</span>
                    <strong className="text-slate-900 font-extrabold">{bu?.name || 'VERGROUP Tech'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Departamento</span>
                    <strong className="text-slate-900 font-extrabold">{dept?.name || 'Geral'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Cargo Atribuído</span>
                    <strong className="text-slate-900 font-extrabold">{invite.jobTitle}</strong>
                  </div>
                  {team && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Equipe</span>
                      <strong className="text-slate-900 font-extrabold">{team.name}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAccept} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Seu E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@vergroup.com.br"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Defina sua Senha Pessoal *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    🔒 Por motivos de segurança, você mesmo define sua própria senha de acesso.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-extrabold shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Ativando Conta...' : 'Aceitar Convite e Entrar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 shadow-md animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Convite Aceito com Sucesso!</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Sua conta foi ativada. Checklist de Onboarding inicial gerado e vinculado ao departamento {dept?.name}.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-[#0F8A4B] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Redirecionando para o Cockpit VERGROUP...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
