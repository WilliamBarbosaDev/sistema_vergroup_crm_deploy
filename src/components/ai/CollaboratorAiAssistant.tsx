import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  BookOpen,
  Calendar,
  Zap,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Task } from '../../types';
import { AiToolRegistryService, REGISTERED_AI_TOOLS } from '../../services/aiToolRegistry';

interface CollaboratorAiAssistantProps {
  collaborator: User;
  onQuickTaskCreate?: (taskData: Partial<Task>) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedAction?: {
    label: string;
    actionType: 'create_task' | 'view_tasks' | 'view_onboarding';
    payload?: any;
  };
}

export const CollaboratorAiAssistant: React.FC<CollaboratorAiAssistantProps> = ({
  collaborator,
  onQuickTaskCreate,
}) => {
  const { tasks, calendarEvents, onboardingTasks, currentUser } = useApp();

  const isSelf = collaborator.id === currentUser.id;

  const [input, setInput] = useState('');
  const [taskPreviewPayload, setTaskPreviewPayload] = useState<Partial<Task> | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: isSelf
        ? `Olá, ${collaborator.name.split(' ')[0]}! Sou o seu **Assistente VER AI (Copilot Individual)**. Opero diretamente via Tool Registry & Permission Engine.`
        : `Olá, ${currentUser.name.split(' ')[0]}! Estou analisando a rotina de **${collaborator.name}** respeitando as regras do RLS.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['Domain Event Bus', 'Audit Log Database'],
    },
  ]);

  const toolContext = {
    currentUser,
    collaborator,
    tasks,
    onboardingTasks,
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Route query through Tool Registry
    setTimeout(() => {
      let responseText = '';
      let sources: string[] | undefined;
      let suggestedAction: Message['suggestedAction'];

      const q = query.toLowerCase();

      if (q.includes('priorizar') || q.includes('hoje') || q.includes('prioridades')) {
        const res = AiToolRegistryService.executeTool('organize_my_day', {}, toolContext);
        if (!res.success) {
          responseText = `⚠️ **Permissão Negada**: ${res.error}`;
        } else {
          const prioritized = res.data.prioritizedTasks as Task[];
          responseText = `Com base na consulta via **Tool Registry (organize_my_day)**, mapeei a sequência otimizada:\n\n` +
            `${prioritized.slice(0, 3).map((t, i) => `${i + 1}. **${t.title}** (Prazo: ${new Date(t.dueDate).toLocaleDateString('pt-BR')} — Prioridade ${t.priority.toUpperCase()})`).join('\n')}\n\n` +
            `💡 *Recomendação VER AI*: Concentre-se nas tarefas prioritárias para manter o indicador de SLA.`;
          sources = ['Tasks Engine (RLS)', 'Domain Event Bus'];
        }
      } else if (q.includes('atrasad') || q.includes('sla') || q.includes('risco')) {
        const res = AiToolRegistryService.executeTool('tasks.get_sla_risks', {}, toolContext);
        if (!res.success) {
          responseText = `⚠️ **Permissão Negada**: ${res.error}`;
        } else {
          const overdue = res.data.overdueTasks as Task[];
          if (overdue.length > 0) {
            responseText = `⚠️ **Alerta de SLA (tasks.get_sla_risks)**: Identifiquei **${overdue.length} tarefa(s) em risco de descumprimento**:\n\n` +
              `${overdue.map((t) => `• **${t.title}** — Prazo: ${new Date(t.dueDate).toLocaleDateString('pt-BR')}`).join('\n')}`;
          } else {
            responseText = `✅ **Nenhuma infração de SLA**: Todas as tarefas ativas estão rigorosamente dentro do prazo pactuado.`;
          }
          sources = ['SLA Monitor Engine', 'Audit Log Database'];
        }
      } else if (q.includes('preencher') || q.includes('criar tarefa') || q.includes('demanda')) {
        const res = AiToolRegistryService.executeTool('form.ai_fill', { prompt: query }, toolContext);
        if (!res.success) {
          responseText = `⚠️ **Permissão Negada**: ${res.error}`;
        } else {
          const taskData = res.data.suggestedTask;
          responseText = `✨ **Sugestão de Preenchimento (form.ai_fill)**:\n\n` +
            `• **Título**: ${taskData.title}\n` +
            `• **Descrição**: ${taskData.description}\n` +
            `• **Prioridade**: ${taskData.priority.toUpperCase()}\n` +
            `• **Responsável**: ${collaborator.name}\n\n` +
            `*Clique no botão abaixo para conferir o Preview antes de salvar no banco.*`;
          sources = ['AI Tool Registry Service'];
          suggestedAction = {
            label: 'Ver Preview & Confirmar Gravamento',
            actionType: 'create_task',
            payload: taskData,
          };
        }
      } else if (q.includes('onboarding') || q.includes('configurar') || q.includes('primeiro')) {
        const res = AiToolRegistryService.executeTool('onboarding.get_checklist', {}, toolContext);
        if (!res.success) {
          responseText = `⚠️ **Permissão Negada**: ${res.error}`;
        } else {
          const items = res.data.onboardingItems as any[];
          responseText = `📋 **Checklist de Integração (onboarding.get_checklist)**:\n` +
            `Progresso atual: **${res.data.completionPercent}% concluído**.\n\n` +
            `${items.map((o) => `• ${o.completed ? '✅' : '⏳'} ${o.title}`).join('\n')}`;
          sources = ['Database ONBOARDING_TASKS'];
        }
      } else {
        responseText = `Entendido. Executei a análise das demandas de **${collaborator.name}** utilizando o Tool Registry sob o escopo RLS de **${currentUser.name}**.\n\n` +
          `Como posso ajudar? Você pode pedir:\n` +
          `1. Organizar minhas prioridades do dia\n` +
          `2. Verificar riscos de SLA\n` +
          `3. Preencher nova tarefa com IA`;
        sources = ['Domain Service Engine'];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[540px] overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">VER AI Copilot</h3>
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#0F8A4B]/30 text-emerald-300 rounded border border-emerald-500/30">
                Tool Registry
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold">
              Agente individual sob RLS ({collaborator.name.split(' ')[0]})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>RLS & Permission Engine</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-700">
        <button
          onClick={() => handleSend('O que preciso priorizar hoje?')}
          className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-[#0F8A4B] border border-slate-200 rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          🎯 Prioridades de Hoje
        </button>
        <button
          onClick={() => handleSend('Quais tarefas estão com risco de SLA?')}
          className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          ⚠️ Risco de SLA
        </button>
        <button
          onClick={() => handleSend('Me ajude a preencher uma nova tarefa')}
          className="px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          ✨ Preencher Tarefa
        </button>
        <button
          onClick={() => handleSend('O que preciso no onboarding?')}
          className="px-3 py-1.5 bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          📋 Onboarding
        </button>
      </div>

      {/* Stream Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs ${
              m.sender === 'ai' ? 'bg-slate-900 text-emerald-400 border border-slate-700' : 'bg-[#0F8A4B] text-white'
            }`}>
              {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>

            <div className={`max-w-md space-y-2 ${m.sender === 'user' ? 'items-end text-right' : ''}`}>
              <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs whitespace-pre-line ${
                m.sender === 'ai' ? 'bg-white text-slate-800 border border-slate-200' : 'bg-[#0F8A4B] text-white'
              }`}>
                {m.text}

                {/* Sources Badge */}
                {m.sources && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <BookOpen className="w-3 h-3 text-[#0F8A4B]" />
                    <span>Fontes reais:</span>
                    {m.sources.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button for AI Preview */}
              {m.suggestedAction && (
                <button
                  onClick={() => {
                    if (m.suggestedAction?.payload) {
                      setTaskPreviewPayload(m.suggestedAction.payload);
                    }
                  }}
                  className="px-3.5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-2xs cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{m.suggestedAction.label}</span>
                </button>
              )}

              <span className="text-[10px] text-slate-400 font-medium block px-1">{m.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Pergunte algo ao VER AI Copilot sobre ${collaborator.name.split(' ')[0]}...`}
          className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0F8A4B] bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl cursor-pointer shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* PREVIEW BEFORE SAVING MODAL FOR AI FILL (Item 14) */}
      {taskPreviewPayload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                <span>Preview da Sugestão da IA (form.ai_fill)</span>
              </h4>
              <button onClick={() => setTaskPreviewPayload(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p><strong>Título:</strong> {taskPreviewPayload.title}</p>
              <p><strong>Descrição:</strong> {taskPreviewPayload.description}</p>
              <p><strong>Prioridade:</strong> {taskPreviewPayload.priority?.toUpperCase()}</p>
              <p><strong>Responsável:</strong> {collaborator.name}</p>
            </div>

            <p className="text-[11px] text-slate-500 font-semibold">
              Revise as informações sugeridas pela IA antes de autorizar o gravamento definitivo no banco de dados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTaskPreviewPayload(null)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                Rejeitar
              </button>
              <button
                onClick={() => {
                  if (onQuickTaskCreate && taskPreviewPayload) {
                    onQuickTaskCreate(taskPreviewPayload);
                  }
                  setTaskPreviewPayload(null);
                }}
                className="px-4 py-2 bg-[#0F8A4B] text-white hover:bg-[#0B6B3A] font-black rounded-xl cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar & Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
