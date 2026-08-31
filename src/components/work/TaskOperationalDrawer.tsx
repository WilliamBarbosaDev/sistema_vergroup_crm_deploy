import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Calendar,
  Building2,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  Sparkles,
  ShieldAlert,
  Send,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Zap,
  ListTodo,
  FileText,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus, ChecklistItem, TaskStatusReport } from '../../types';
import { AiToolRegistryService } from '../../services/aiToolRegistry';

interface TaskOperationalDrawerProps {
  taskId: string;
  onClose: () => void;
}

export const TaskOperationalDrawer: React.FC<TaskOperationalDrawerProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    users,
    projects,
    companies,
    currentUser,
    updateTask,
    toggleTaskTimer,
    toggleChecklistItem,
    addTaskComment,
    addAuditLog,
    onboardingTasks,
  } = useApp();

  const task = tasks.find((t) => t.id === taskId);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'subtasks' | 'dependencies' | 'reports' | 'files' | 'timeline' | 'ai'>('overview');
  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newStatusReportText, setNewStatusReportText] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiNextAction, setAiNextAction] = useState<string | null>(null);

  if (!task) return null;

  const creator = users.find((u) => u.id === task.creatorId) || users.find((u) => u.id === task.assignedUserId);
  const assignee = users.find((u) => u.id === task.assignedUserId);
  const project = projects.find((p) => p.id === task.projectId);
  const company = companies.find((c) => c.id === task.clientId);

  const participants = users.filter((u) => task.participantIds?.includes(u.id));
  const observers = users.filter((u) => task.observerIds?.includes(u.id));

  // SLA Calculation
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const hoursLeft = Math.round((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60));
  const slaState = task.status === 'completed'
    ? 'Concluído'
    : isOverdue
    ? 'Violado'
    : hoursLeft < 12
    ? 'Em risco'
    : hoursLeft < 24
    ? 'Atenção'
    : 'Dentro do prazo';

  const slaStateColor = isOverdue
    ? 'bg-rose-500 text-white'
    : hoursLeft < 12
    ? 'bg-amber-500 text-white'
    : 'bg-[#0F8A4B] text-white';

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addTaskComment(task.id, commentText.trim());
    addAuditLog('update', 'Task', task.id, `actor_type: human_user | action: task.comment.created | comment: ${commentText.trim().slice(0, 30)}`);
    setCommentText('');
  };

  const handleAddStatusReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusReportText.trim()) return;

    const newReport: TaskStatusReport = {
      id: `rep-${Date.now()}`,
      taskId: task.id,
      authorUserId: currentUser.id,
      content: newStatusReportText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedReports = [...(task.statusReports || []), newReport];
    updateTask(task.id, {
      statusReports: updatedReports,
      lastStatusReportAt: new Date().toISOString(),
    });

    addAuditLog('update', 'Task', task.id, `actor_type: human_user | action: task.status_report.created`);
    setNewStatusReportText('');
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };

    updateTask(task.id, { checklist: [...task.checklist, newItem] });
    setNewChecklistText('');
  };

  const handleRunAiSummarize = () => {
    const res = AiToolRegistryService.executeTool('tasks.summarize', { taskId: task.id }, { currentUser, collaborator: currentUser, tasks, onboardingTasks });
    if (res.success) {
      setAiSummary(res.data.summary);
    }
  };

  const handleRunAiNextAction = () => {
    const res = AiToolRegistryService.executeTool('tasks.suggest_next_action', { taskId: task.id }, { currentUser, collaborator: currentUser, tasks, onboardingTasks });
    if (res.success) {
      setAiNextAction(`💡 **Ação Recomendada**: ${res.data.recommendedAction} (Motivo: ${res.data.reason})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex justify-end font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* HEADER DA FICHA DA TAREFA */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center font-black text-sm shadow-md">
              <CheckSquare className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${slaStateColor}`}>
                  SLA: {slaState}
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                  Prioridade: {task.priority.toUpperCase()}
                </span>
                {task.competenceMonth && task.competenceYear && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    Competência: {String(task.competenceMonth).padStart(2, '0')}/{task.competenceYear}
                  </span>
                )}
              </div>

              <h1 className="text-base font-black tracking-tight text-white mt-1 line-clamp-1">{task.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTaskTimer(task.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                task.isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                  : 'bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white'
              }`}
            >
              {task.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{task.isTimerRunning ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}</span>
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs font-bold text-slate-700 shrink-0">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'checklist', label: `Checklist (${task.checklist.filter((i) => i.completed).length}/${task.checklist.length})` },
            { id: 'reports', label: `Status Reports (${task.statusReports?.length || 0})` },
            { id: 'subtasks', label: 'Subtarefas' },
            { id: 'dependencies', label: 'Dependências' },
            { id: 'files', label: 'Arquivos' },
            { id: 'timeline', label: 'Timeline & Auditoria' },
            { id: 'ai', label: '✨ VER AI Copilot', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 font-black transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#0F8A4B] text-[#0F8A4B] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-500" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO PRINCIPAL ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Resumo da Ficha Operacional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Criador vs Responsável */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Criado por</span>
                  <div className="flex items-center gap-2.5">
                    <img src={creator?.avatar} alt={creator?.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{creator?.name}</strong>
                      <span className="text-[10px] text-slate-500 font-semibold">{creator?.jobTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Responsável Oficial</span>
                  <div className="flex items-center gap-2.5">
                    <img src={assignee?.avatar} alt={assignee?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0F8A4B]" />
                    <div>
                      <strong className="text-xs font-bold text-[#0F8A4B] block">{assignee?.name}</strong>
                      <span className="text-[10px] text-slate-500 font-semibold">{assignee?.jobTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Cliente & Projeto */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vínculo Operacional</span>
                  <div className="space-y-1 text-xs font-semibold">
                    <p className="flex items-center gap-1.5 text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{company?.name || task.companyName || 'VERGROUP S.A.'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-800">
                      <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                      <span>{project?.name || task.projectName || 'Operação Contínua'}</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Descrição Detalhada */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Descrição do Trabalho</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {task.description || 'Nenhuma descrição detalhada informada.'}
                </p>
              </div>

              {/* Rastreamento de Tempo Operacional (`time_entries`) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0F8A4B]" />
                    <span>Tempo Trabalhado & Apontamentos (`public.time_entries`)</span>
                  </h3>
                  <span className="text-xs font-black text-[#0F8A4B]">
                    Total: {Math.floor((task.timerSeconds || 0) / 3600)}h {Math.floor(((task.timerSeconds || 0) % 3600) / 60)}m
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-between">
                  <span>Sessão Atual em Andamento</span>
                  <span className="font-mono font-black text-slate-900">
                    {Math.floor((task.timerSeconds || 0) / 3600).toString().padStart(2, '0')}:
                    {Math.floor(((task.timerSeconds || 0) % 3600) / 60).toString().padStart(2, '0')}:
                    {((task.timerSeconds || 0) % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Participantes e Observadores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Participantes ({participants.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                      <span key={p.id} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full" />
                        <span>{p.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Observadores ({observers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {observers.map((o) => (
                      <span key={o.id} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <img src={o.avatar} alt={o.name} className="w-4 h-4 rounded-full" />
                        <span>{o.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed de Comentários */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Conversa Contextual da Tarefa</span>
                </h3>

                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicionar um comentário ou menção..."
                    className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B] bg-slate-50 text-slate-800"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-[#0F8A4B] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer">
                    Comentar
                  </button>
                </form>

                <div className="space-y-3">
                  {task.comments?.map((c) => {
                    const u = users.find((usr) => usr.id === c.userId);
                    return (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-bold">{u?.name || 'Colaborador'}</strong>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium">{c.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Itens de Execução (Checklist)</h3>
              
              <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Novo item do checklist..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B] bg-slate-50 text-slate-800"
                />
                <button type="submit" className="px-3.5 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer">
                  Adicionar
                </button>
              </form>

              <div className="space-y-2">
                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(task.id, item.id)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.text}
                    </span>
                    <input type="checkbox" checked={item.completed} readOnly className="rounded text-[#0F8A4B]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Atualização Rápida de Andamento (Status Reports)</span>
              </h3>

              <form onSubmit={handleAddStatusReport} className="space-y-2">
                <textarea
                  value={newStatusReportText}
                  onChange={(e) => setNewStatusReportText(e.target.value)}
                  placeholder="Ex: Aguardando retorno de documentos pelo cliente desde ontem..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B] bg-slate-50 text-slate-800"
                  rows={3}
                />
                <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer">
                  Publicar Status Report
                </button>
              </form>

              <div className="space-y-3">
                {task.statusReports?.map((rep) => {
                  const author = users.find((u) => u.id === rep.authorUserId);
                  return (
                    <div key={rep.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{author?.name}</strong>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(rep.createdAt).toLocaleDateString('pt-BR')} {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{rep.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F8A4B] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">VER AI Task Copilot</h3>
                  <p className="text-xs text-slate-500 font-semibold">Análise operacional human-in-the-loop sob a política RLS de {currentUser.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRunAiSummarize}
                  className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#0F8A4B] border border-[#0F8A4B]/40 rounded-xl text-xs font-black cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resumir Tarefa (tasks.summarize)</span>
                </button>

                <button
                  onClick={handleRunAiNextAction}
                  className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-black cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sugerir Próxima Ação (tasks.suggest_next_action)</span>
                </button>
              </div>

              {aiSummary && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                  <h4 className="font-black text-[#0F8A4B]">Resumo Executivo da IA</h4>
                  <p className="font-semibold leading-relaxed">{aiSummary}</p>
                </div>
              )}

              {aiNextAction && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-slate-800 space-y-1">
                  <h4 className="font-black text-blue-700">Recomendação Operacional da IA</h4>
                  <p className="font-semibold leading-relaxed">{aiNextAction}</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
