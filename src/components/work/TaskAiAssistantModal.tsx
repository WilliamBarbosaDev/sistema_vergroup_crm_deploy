import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Bot,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  CheckSquare,
  Tag,
  AlertTriangle,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseTaskPromptWithAi, AI_TASK_SUGGESTIONS, ParsedTaskAiResult } from '../../services/taskAiService';

interface TaskAiAssistantModalProps {
  onClose: () => void;
  onApplyToForm?: (result: ParsedTaskAiResult) => void;
}

export const TaskAiAssistantModal: React.FC<TaskAiAssistantModalProps> = ({
  onClose,
  onApplyToForm,
}) => {
  const { addTask, addTaskTemplate, selectedBusinessUnitId, users, currentUser } = useApp();
  const [promptText, setPromptText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedTaskAiResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = (textToProcess?: string) => {
    const text = textToProcess || promptText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const result = parseTaskPromptWithAi(text);
      setParsedResult(result);
      setIsProcessing(false);
    }, 300);
  };

  const handleSuggestionClick = (prompt: string) => {
    setPromptText(prompt);
    handleGenerate(prompt);
  };

  const handleCreateTask = () => {
    if (!parsedResult) return;

    addTask({
      title: parsedResult.title,
      description: parsedResult.description,
      businessUnitId: selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId,
      assignedUserId: users[0]?.id || currentUser.id,
      creatorId: currentUser.id,
      priority: parsedResult.priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      estimatedHours: parsedResult.estimatedHours,
      checklist: parsedResult.checklistItems.map((item, idx) => ({
        id: `chk-ai-${Date.now()}-${idx}`,
        text: item,
        completed: false,
      })),
      participantIds: [currentUser.id],
      observerIds: [currentUser.id],
      tags: parsedResult.tags,
      recurrenceRule: parsedResult.recurrenceRule,
      recurrence: parsedResult.isRecurrent ? (parsedResult.recurrenceRule?.frequency as any) : 'none',
      confirmedInternal: true,
    });

    onClose();
  };

  const handleSaveAsTemplate = () => {
    if (!parsedResult) return;

    addTaskTemplate({
      title: parsedResult.title,
      description: parsedResult.description,
      category: parsedResult.category,
      defaultPriority: parsedResult.priority,
      defaultSlaHours: parsedResult.slaHours,
      estimatedHours: parsedResult.estimatedHours,
      checklistItems: parsedResult.checklistItems,
      tags: parsedResult.tags,
      recurrenceRule: parsedResult.recurrenceRule,
      businessUnitId: selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId,
      icon: parsedResult.category === 'fiscal' ? '📊' : parsedResult.category === 'accounting' ? '📑' : '🚀',
      createdByUserId: currentUser.id,
    });

    alert(`✅ Modelo "${parsedResult.title}" salvo com sucesso na Galeria de Modelos!`);
    onClose();
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;
    if (onApplyToForm) {
      onApplyToForm(parsedResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#0F8A4B] to-emerald-600 rounded-xl text-white shadow-md">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">IA VerGroup — Gerador de Tarefas & Recorrências</h3>
                <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                  NLP Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">Digite seu comando em linguagem natural para gerar tarefas, modelos e regras de repetição</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          
          {/* Prompt Input Box */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 uppercase text-[10px] flex items-center justify-between">
              <span>Descreva o que deseja criar (Comando em Texto / Voz)</span>
              <span className="text-[#0F8A4B] font-bold">Português (Brasil)</span>
            </label>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ex: Criar tarefa recorrente mensal para o setor fiscal de apuração do Simples Nacional todo dia 10 com prioridade alta e checklist completo..."
                className="w-full h-24 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] focus:ring-2 focus:ring-[#0F8A4B]/20 text-xs font-semibold text-slate-900 bg-slate-50/50 resize-none transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isProcessing || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-50 text-white rounded-lg font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Interpretar com IA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Sugestões Rápidas em 1-Clique:</span>
            <div className="flex flex-wrap gap-2">
              {AI_TASK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item.prompt)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-[#0F8A4B] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result Preview Card */}
          {parsedResult && (
            <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md uppercase">
                    Confiança IA: {parsedResult.confidenceScore}%
                  </span>
                  <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-tight">
                    Categoria: {parsedResult.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    parsedResult.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                    parsedResult.priority === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    Prioridade {parsedResult.priority}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-sm font-black text-slate-900">{parsedResult.title}</h4>
                <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">{parsedResult.description}</p>
              </div>

              {/* Recurrence Rule Badge if Recurrent */}
              {parsedResult.isRecurrent && parsedResult.recurrenceRule && (
                <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Calendar className="w-4 h-4 text-[#0F8A4B]" />
                    <span>{parsedResult.recurrenceRule.summaryLabel}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-[#0F8A4B] font-extrabold text-[10px] rounded-md">
                    RECORRÊNCIA ATIVA
                  </span>
                </div>
              )}

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>SLA: <strong>{parsedResult.slaHours}h</strong></span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est.: <strong>{parsedResult.estimatedHours}h</strong></span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Checklist: <strong>{parsedResult.checklistItems.length} itens</strong></span>
                </div>
              </div>

              {/* Checklist Items Preview */}
              {parsedResult.checklistItems.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">Checklist Gerado pela IA:</span>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 max-h-32 overflow-y-auto">
                    {parsedResult.checklistItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B] shrink-0 mt-0.5" />
                        <span className="font-semibold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-emerald-800 italic font-medium">{parsedResult.explanation}</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>

          {parsedResult && (
            <div className="flex flex-wrap items-center gap-2">
              {onApplyToForm && (
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  Preencher no Formulário
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-[#0F8A4B] rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Salvar como Modelo
              </button>

              <button
                type="button"
                onClick={handleCreateTask}
                className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Criar Tarefa Agora
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
