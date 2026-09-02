import React, { useState } from 'react';
import { AlertTriangle, X, Calendar, Building2, User, CheckCircle2 } from 'lucide-react';
import { Deal } from '../../types';

export interface DealLossReasonModalProps {
  deal: Deal;
  onConfirm: (lossData: {
    reason: string;
    notes?: string;
    competitor?: string;
    followUpDate?: string;
  }) => void;
  onCancel: () => void;
}

export const DEFAULT_LOSS_REASONS = [
  'Preço / Orçamento fora',
  'Sem interesse no momento',
  'Sem retorno / Lead frio',
  'Optou por concorrente',
  'Momento inadequado',
  'Não possui perfil / Qualificação',
  'Retomar futuramente',
  'Outro motivo',
];

export const DealLossReasonModal: React.FC<DealLossReasonModalProps> = ({
  deal,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState<string>(DEFAULT_LOSS_REASONS[0]);
  const [notes, setNotes] = useState<string>('');
  const [competitor, setCompetitor] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('⚠️ Selecione o motivo da perda do negócio.');
      return;
    }

    onConfirm({
      reason,
      notes: notes.trim() || undefined,
      competitor: competitor.trim() || undefined,
      followUpDate: reason.includes('Retomar') || reason.includes('momento') ? followUpDate : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100 font-sans select-none">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4.5 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Por que o negócio foi perdido?</h2>
              <p className="text-xs text-rose-800 font-semibold">Registro de Motivo de Perda & Governance CRM</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Negócio Afetado</span>
            <strong className="text-slate-900 font-bold text-sm block">{deal.title}</strong>
            <p className="text-slate-600 font-semibold">
              Valor: <span className="font-mono text-[#0F8A4B]">R$ {deal.value.toLocaleString('pt-BR')}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-800 font-bold">Motivo Principal da Perda *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-rose-500 font-bold outline-none text-xs"
            >
              {DEFAULT_LOSS_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason.includes('concorrente') && (
            <div className="space-y-1.5">
              <label className="block text-slate-800 font-bold">Nome do Concorrente (Se conhecido):</label>
              <input
                type="text"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                placeholder="Ex: Empresa X / Solução Y"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-rose-500 font-semibold outline-none text-xs"
              />
            </div>
          )}

          {(reason.includes('Retomar') || reason.includes('momento') || reason.includes('frio')) && (
            <div className="space-y-1.5">
              <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F8A4B]" />
                <span>Sugerir Data de Reativação no Follow-up:</span>
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#0F8A4B] font-bold outline-none text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-slate-800 font-bold">Detalhes / Observações da Perda:</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o que ocorreu no processo comercial para orientar futuras abordagens..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-rose-500 font-semibold outline-none text-xs resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-md cursor-pointer transition-colors"
            >
              Confirmar Registro de Perda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
