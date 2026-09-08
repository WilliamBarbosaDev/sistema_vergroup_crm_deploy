import React, { useState } from 'react';
import { X, CheckSquare, Sparkles, Calendar, Layers, Clock, Building2, Plus, Bot, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskTemplate } from '../../types';
import { TaskAiAssistantModal } from './TaskAiAssistantModal';
import { ParsedTaskAiResult } from '../../services/taskAiService';

interface TaskTemplateModalProps {
  onClose: () => void;
}

export const TaskTemplateModal: React.FC<TaskTemplateModalProps> = ({ onClose }) => {
  const { taskTemplates, addTask, addTaskTemplate, users, currentUser, selectedBusinessUnitId } = useApp();

  const [mode, setMode] = useState<'template' | 'recurrent'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(taskTemplates[0]?.id || '');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Form Fields
  const selectedTemplate = taskTemplates.find((t) => t.id === selectedTemplateId) || taskTemplates[0] || null;

  const [title, setTitle] = useState(selectedTemplate?.title || 'Apuração Simples Nacional');
  const [description, setDescription] = useState(selectedTemplate?.description || 'Conferência de notas fiscais, cálculo de PGDAS-D e emissão de guia de recolhimento.');
  const [priority, setPriority] = useState<TaskPriority>(selectedTemplate?.defaultPriority || 'high');
  const [competenceMonth, setCompetenceMonth] = useState<number>(new Date().getMonth() + 1);
  const [competenceYear, setCompetenceYear] = useState<number>(2026);
  const [assignedUserId, setAssignedUserId] = useState<string>(users[0]?.id || currentUser.id);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('monthly');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = taskTemplates.find((t) => t.id === templateId);
    if (tmpl) {
      setTitle(tmpl.title);
      if (tmpl.description) setDescription(tmpl.description);
      setPriority(tmpl.defaultPriority);
      if (tmpl.recurrenceRule?.frequency) {
        setRecurrence(tmpl.recurrenceRule.frequency as any);
      }
    }
  };

  const handleApplyAiResult = (result: ParsedTaskAiResult) => {
    setTitle(result.title);
    setDescription(result.description);
    setPriority(result.priority);
    if (result.isRecurrent && result.recurrenceRule) {
      setRecurrence(result.recurrenceRule.frequency as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTask({
      title: `${title} — Competência ${String(competenceMonth).padStart(2, '0')}/${competenceYear}`,
      description,
      businessUnitId: selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId,
      assignedUserId: assignedUserId || users[0]?.id || currentUser.id,
      creatorId: currentUser.id,
      priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      competenceMonth,
      competenceYear,
      recurrence: mode === 'recurrent' ? recurrence : 'none',
      checklist: (selectedTemplate?.checklistItems || [
        'Conferir extratos e documentos fiscais',
        'Executar apuração e alíquota efetiva',
        'Emitir relatório e guia de recolhimento',
      ]).map((text, idx) => ({
        id: `c-tmpl-${Date.now()}-${idx}`,
        text,
        completed: false,
      })),
      participantIds: [currentUser.id],
      observerIds: [currentUser.id],
      tags: selectedTemplate?.tags || ['VERGROUP', 'Modelo'],
      confirmedInternal: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0F8A4B] rounded-xl text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Galeria de Modelos & Recorrência de Tarefas</h3>
              <p className="text-xs text-slate-300 font-semibold">Gere demandas padronizadas com competência e agendamento automático</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & AI Action */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'template' ? 'bg-white text-[#0F8A4B] shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 Por Modelo de Tarefa
            </button>
            <button
              type="button"
              onClick={() => setMode('recurrent')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'recurrent' ? 'bg-white text-[#0F8A4B] shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔄 Por Recorrência & Competência
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>🤖 Gerar com IA</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          
          {/* Template Gallery Picker */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 uppercase text-[10px]">Selecione um Modelo Salvo no Sistema</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {taskTemplates.map((tmp) => (
                <button
                  key={tmp.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmp.id)}
                  className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    selectedTemplateId === tmp.id
                      ? 'bg-emerald-50 border-[#0F8A4B] text-[#0F8A4B] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{tmp.icon || '📋'}</span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{tmp.title}</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5 line-clamp-1">{tmp.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
              <label className="font-extrabold text-slate-900 uppercase text-[10px]">Responsável Executor</label>
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

          {mode === 'recurrent' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-950 text-[10px] uppercase">Recorrência do Agendamento</span>
                <span className="text-[10px] font-black text-[#0F8A4B]">ATIVADO</span>
              </div>

              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-900 bg-white"
              >
                <option value="daily">Diária (Todo dia de trabalho)</option>
                <option value="weekly">Semanal (Toda semana)</option>
                <option value="biweekly">Quinzenal (A cada 15 dias)</option>
                <option value="monthly">Mensal (Todo dia 10 do mês)</option>
              </select>
            </div>
          )}

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
              className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Tarefa por Modelo</span>
            </button>
          </div>
        </form>

      </div>

      {isAiModalOpen && (
        <TaskAiAssistantModal
          onClose={() => setIsAiModalOpen(false)}
          onApplyToForm={handleApplyAiResult}
        />
      )}
    </div>
  );
};
