import React, { useState } from 'react';
import { X, CheckSquare, Sparkles, Calendar, Layers, Clock, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority } from '../../types';

interface TaskTemplateModalProps {
  onClose: () => void;
}

export const TaskTemplateModal: React.FC<TaskTemplateModalProps> = ({ onClose }) => {
  const { businessUnits, departments, users, addTask, selectedBusinessUnitId } = useApp();

  const [mode, setMode] = useState<'template' | 'recurrent'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('simples_nacional');

  const [title, setTitle] = useState('Apuração Simples Nacional');
  const [description, setDescription] = useState('Conferência de notas fiscais, cálculo de PGDAS-D e emissão de guia de recolhimento.');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [competenceMonth, setCompetenceMonth] = useState<number>(8);
  const [competenceYear, setCompetenceYear] = useState<number>(2026);
  const [assignedUserId, setAssignedUserId] = useState<string>(users[0]?.id || '');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('monthly');

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey === 'simples_nacional') {
      setTitle('Apuração Simples Nacional');
      setDescription('Conferência de notas fiscais, cálculo de PGDAS-D e emissão de guia de recolhimento.');
      setPriority('high');
    } else if (templateKey === 'fechamento_contabil') {
      setTitle('Fechamento Contábil Mensal');
      setDescription('Validação de balancete, conciliação bancária e lançamentos patrimoniais.');
      setPriority('urgent');
    } else if (templateKey === 'onboarding_cliente') {
      setTitle('Onboarding & Solicitação de Documentos');
      setDescription('Checklist inicial de entrada de cliente, coleta de acessos e certidões.');
      setPriority('medium');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTask({
      title: `${title} — ${String(competenceMonth).padStart(2, '0')}/${competenceYear}`,
      description,
      businessUnitId: selectedBusinessUnitId || 'bu-tech',
      assignedUserId: assignedUserId || users[0]?.id || '',
      priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      competenceMonth,
      competenceYear,
      recurrence: mode === 'recurrent' ? recurrence : 'none',
      checklist: [
        { id: `c-1`, text: 'Coletar documentos e extratos', completed: false },
        { id: `c-2`, text: 'Conferir apuração e alíquota', completed: false },
        { id: `c-3`, text: 'Emitir relatório de fechamento', completed: false },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0F8A4B] rounded-xl text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Criar Tarefa por Modelo / Recorrência</h3>
              <p className="text-xs text-slate-300 font-semibold">Gere demandas operacionais padronizadas com competência</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setMode('template')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'template' ? 'bg-white text-[#0F8A4B] shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Por Modelo de Tarefa
          </button>
          <button
            onClick={() => setMode('recurrent')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'recurrent' ? 'bg-white text-[#0F8A4B] shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔄 Por Recorrência & Competência
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          
          {mode === 'template' && (
            <div className="space-y-2">
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Selecione um Modelo Modelo Padrão</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { id: 'simples_nacional', label: 'Simples Nacional' },
                  { id: 'fechamento_contabil', label: 'Fechamento Contábil' },
                  { id: 'onboarding_cliente', label: 'Onboarding Cliente' },
                ].map((tmp) => (
                  <button
                    key={tmp.id}
                    type="button"
                    onClick={() => handleTemplateSelect(tmp.id)}
                    className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                      selectedTemplate === tmp.id
                        ? 'bg-emerald-50 border-[#0F8A4B] text-[#0F8A4B]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tmp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-slate-900 uppercase text-[10px]">Título da Tarefa</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-slate-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Mês de Competência</label>
              <select
                value={competenceMonth}
                onChange={(e) => setCompetenceMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-slate-50"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 1).padStart(2, '0')} - {new Date(2026, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Ano de Competência</label>
              <select
                value={competenceYear}
                onChange={(e) => setCompetenceYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-slate-50"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Responsável</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-slate-50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-slate-50"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer"
            >
              Criar Tarefa por Modelo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
