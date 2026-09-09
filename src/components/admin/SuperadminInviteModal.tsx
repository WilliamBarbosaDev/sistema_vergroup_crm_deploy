import React, { useMemo, useState } from 'react';
import { Copy, Shield, Sparkles, X, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SuperadminInviteModalProps {
  onClose: () => void;
}

export const SuperadminInviteModal: React.FC<SuperadminInviteModalProps> = ({ onClose }) => {
  const { businessUnits, currentUser, createInvite } = useApp();

  const defaultBusinessUnitId = useMemo(() => {
    return currentUser.primaryBusinessUnitId || businessUnits[0]?.id || '';
  }, [businessUnits, currentUser.primaryBusinessUnitId]);

  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState(defaultBusinessUnitId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');

    if (!selectedBusinessUnitId) {
      setError('Selecione uma empresa para continuar.');
      return;
    }

    if (!name.trim()) {
      setError('Informe o nome completo.');
      return;
    }

    if (!email.trim()) {
      setError('Informe o e-mail corporativo.');
      return;
    }

    try {
      const invite = createInvite({
        type: 'email',
        email: email.trim(),
        name: name.trim(),
        role: 'superadmin',
        jobTitle: 'Superadministrador',
        businessUnitId: selectedBusinessUnitId,
        departmentId: 'sem-departamento',
        status: 'pending',
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: 1,
        allowSuperadminCreation: true,
      });

      setGeneratedLink(`${window.location.origin}/invite/${invite.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o convite.');
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generatedLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F8A4B]/20 border border-[#0F8A4B]/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Fluxo restrito</p>
              <h2 className="text-lg font-black tracking-tight mt-1">Criar superadministrador</h2>
              <p className="text-xs text-slate-300 font-medium mt-1 max-w-md">
                O acesso é criado por convite seguro. A pessoa ativa a conta pelo link recebido.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 leading-relaxed">
            <div className="flex items-center gap-2 font-black text-emerald-800 uppercase tracking-[0.18em] text-[10px] mb-1">
              <Sparkles className="w-4 h-4" />
              Conta privilegiada
            </div>
            Superadministradores só podem ser criados por usuários já superadministradores. O fluxo abaixo gera um convite com acesso total e expiração segura.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Empresa</span>
              <select
                value={selectedBusinessUnitId}
                onChange={(e) => setSelectedBusinessUnitId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
              >
                <option value="">Selecione a empresa</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.tradeName || bu.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Validade do convite</span>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
              >
                <option value={1}>1 dia</option>
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">Nome completo</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da pessoa"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">E-mail corporativo</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8A4B]"
                />
              </div>
            </label>
          </div>

          {!generatedLink ? (
            <button
              onClick={handleGenerate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F8A4B] px-4 py-3 text-xs font-black text-white shadow-md hover:bg-[#0B6B3A] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Gerar convite de superadministrador
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-[11px] text-emerald-900">{generatedLink}</span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#0F8A4B] px-3 py-2 text-[11px] font-black text-white hover:bg-[#0B6B3A]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Convite gerado com acesso privilegiado e expiração definida.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
