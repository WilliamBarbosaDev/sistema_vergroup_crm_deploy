import React, { useState } from 'react';
import {
  CheckSquare,
  X,
  Clock,
  User,
  Building2,
  FolderKanban,
  MessageSquare,
  Sparkles,
  Play,
  Pause,
  Plus,
  FileText,
  Zap,
  Send,
  Check,
  Paperclip,
  CheckCircle2,
  Search,
  Copy,
  Link as LinkIcon,
  Crown,
  Users,
  Eye,
  AlertTriangle,
  Lock,
  Download,
  Trash2,
  ChevronRight,
  ShieldCheck,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskStatusReport, ChecklistItem } from '../../types';
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
    contacts,
    deals,
    currentUser,
    addTask,
    updateTask,
    toggleTaskStatus,
    toggleTaskTimer,
    toggleChecklistItem,
    addTaskComment,
    addAuditLog,
    onboardingTasks,
    setSelectedClientId,
    setSelectedContactId,
    setSelectedDealId,
    setSelectedTaskId,
    openTaskCreate,
  } = useApp();

  const task = tasks.find((t) => t.id === taskId);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'subtasks' | 'dependencies' | 'people' | 'files' | 'reports' | 'comments' | 'time' | 'timeline' | 'ai'>('overview');
  
  // Forms state
  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newStatusReportText, setNewStatusReportText] = useState('');
  const [completionSummaryText, setCompletionSummaryText] = useState('');
  
  // Attachment state
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  // Dependency state
  const [selectedDepTaskId, setSelectedDepTaskId] = useState('');
  const [depType, setDepType] = useState<'blocked_by' | 'blocks'>('blocked_by');

  // AI Preview Modal State (NUNCA SALVAR AÇÃO DA IA SEM CONFIRMAÇÃO DO USUÁRIO)
  const [aiPreviewModal, setAiPreviewModal] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  } | null>(null);

  // Subtask form state
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskAssigneeId, setSubtaskAssigneeId] = useState(users[0]?.id || '');
  const [subtaskDueDate, setSubtaskDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  if (!task) return null;

  const creator = users.find((u) => u.id === task.creatorId) || users.find((u) => u.id === task.assignedUserId);
  const owner = users.find((u) => u.id === task.ownerUserId) || creator;
  const assignee = users.find((u) => u.id === task.assignedUserId);
  const parentTask = task.parentTaskId ? tasks.find((t) => t.id === task.parentTaskId) : null;
  const project = projects.find((p) => p.id === task.projectId);
  const company = companies.find((c) => c.id === task.clientId);
  const contact = contacts.find((c) => c.id === task.contactId);
  const deal = deals.find((d) => d.id === task.dealId);

  // Subtasks linked to this task
  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);

  // SLA Calculation by Policy
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const hoursLeft = Math.round((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60));
  const totalSlaHours = task.estimatedHours || 48;
  const elapsedHours = Math.max(0, Math.round((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60)));
  const slaConsumedPct = Math.min(100, Math.round((elapsedHours / totalSlaHours) * 100));

  let slaStateLabel = '🟢 Normal (< 60%)';
  let slaStateBadgeColor = 'bg-emerald-100 text-[#0B6B3A] border-emerald-300';

  if (task.status === 'completed') {
    slaStateLabel = '✅ Concluído';
    slaStateBadgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
  } else if (isOverdue) {
    slaStateLabel = `🚨 SLA Estourado (${Math.abs(hoursLeft)}h de atraso)`;
    slaStateBadgeColor = 'bg-rose-600 text-white border-rose-700 font-black animate-pulse';
  } else if (slaConsumedPct >= 95) {
    slaStateLabel = `🔴 SLA Crítico (${slaConsumedPct}% consumido)`;
    slaStateBadgeColor = 'bg-rose-500 text-white border-rose-600 font-bold';
  } else if (slaConsumedPct >= 80) {
    slaStateLabel = `🟠 SLA Risco (${slaConsumedPct}% consumido)`;
    slaStateBadgeColor = 'bg-amber-500 text-white border-amber-600 font-bold';
  } else if (slaConsumedPct >= 60) {
    slaStateLabel = `🟡 SLA Atenção (${slaConsumedPct}% consumido)`;
    slaStateBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
  }

  // Handle Comment Creation with `@VER AI` Parser
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const rawText = commentText.trim();
    addTaskComment(task.id, rawText);
    addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.comment.created | details: Comentário adicionado`);
    setCommentText('');

    // Check if `@VER AI` was mentioned
    if (rawText.toLowerCase().includes('@ver ai') || rawText.toLowerCase().includes('@verai')) {
      setTimeout(() => {
        const aiResponse = `🤖 **VER AI Copilot**: Analisei sua solicitação sobre a tarefa [${task.protocolNumber || task.id}]. A demanda está no estado **${slaStateLabel}** com **${subtasks.length} subtarefas** e **${task.checklist.length} itens no checklist**. Recomendo concluir os itens pendentes e verificar retornos de clientes.`;
        addTaskComment(task.id, aiResponse);
        addAuditLog('create', 'task_comment', task.id, `actor_type: ai_agent | actor_id: ver-ai-copilot | action: task.comment.replied | details: VER AI respondeu à menção no comentário`);
      }, 800);
    }
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

    addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.status_report.created | details: Status report publicado`);
    setNewStatusReportText('');
  };

  const handleSaveCompletionSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionSummaryText.trim()) return;

    updateTask(task.id, {
      completionSummary: completionSummaryText.trim(),
      completionSummaryAuthorId: currentUser.id,
      completionSummaryAt: new Date().toISOString(),
      status: 'completed',
      isTimerRunning: false,
    });

    addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.completed | details: Resumo final de conclusão registrado: "${completionSummaryText.trim().slice(0, 40)}"`);
    alert(`✅ Tarefa [${task.protocolNumber || task.id}] concluída com sucesso com o Resumo Final registrado!`);
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

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;

    addTask({
      businessUnitId: task.businessUnitId,
      title: subtaskTitle.trim(),
      description: `Subtarefa vinculada à tarefa principal [${task.protocolNumber || task.id}]: ${task.title}`,
      status: 'pending',
      priority: task.priority,
      dueDate: subtaskDueDate,
      parentTaskId: task.id,
      creatorId: currentUser.id,
      ownerUserId: task.ownerUserId || currentUser.id,
      assignedUserId: subtaskAssigneeId || users[0]?.id || 'usr-william',
      clientId: task.clientId,
      contactId: task.contactId,
      projectId: task.projectId,
      participantIds: [],
      observerIds: [],
      checklist: [],
      tags: ['Subtarefa'],
    });

    addAuditLog('create', 'task', task.id, `actor_type: human_user | action: task.subtask.created | details: Subtarefa "${subtaskTitle.trim()}" criada vinculada a [${task.protocolNumber || task.id}]`);
    setSubtaskTitle('');
  };

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepTaskId) return;

    const depTarget = tasks.find((t) => t.id === selectedDepTaskId);
    if (!depTarget) return;

    const newDep = {
      id: `dep-${Date.now()}`,
      targetTaskId: depTarget.id,
      targetTaskProtocol: depTarget.protocolNumber || depTarget.id,
      targetTaskTitle: depTarget.title,
      type: depType,
    };

    const updatedDeps = [...(task.dependencies || []), newDep];
    updateTask(task.id, { dependencies: updatedDeps });
    addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.dependency.added | details: Dependência (${depType}) vinculada a [${depTarget.protocolNumber || depTarget.id}]`);
    setSelectedDepTaskId('');
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newAttach = {
      id: `att-${Date.now()}`,
      name: newFileName.trim(),
      sizeBytes: Math.floor(Math.random() * 5000000) + 100000,
      fileUrl: newFileUrl.trim() || 'https://vergroup.com.br/assets/docs/anexo-modelo.pdf',
      uploadedByUserId: currentUser.id,
      uploadedAt: new Date().toISOString(),
    };

    const updatedAttachs = [...(task.attachments || []), newAttach];
    updateTask(task.id, { attachments: updatedAttachs });
    addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.attachment.uploaded | details: Arquivo "${newFileName.trim()}" enviado`);
    setNewFileName('');
    setNewFileUrl('');
  };

  // AI ACTIONS WITH MANDATORY PREVIEW MODAL
  const triggerAiActionWithPreview = (actionType: string) => {
    let resTitle = '';
    let resContent = '';
    let onConfirmFn = () => {};

    if (actionType === 'summarize') {
      const res = AiToolRegistryService.executeTool('tasks.summarize', { taskId: task.id }, { currentUser, collaborator: currentUser, tasks, onboardingTasks });
      resTitle = '📊 Resumo Executivo da VER AI';
      resContent = res.success ? res.data.summary : 'A tarefa está em andamento normal.';
      onConfirmFn = () => {
        addTaskComment(task.id, `📊 **VER AI Resumo Executivo**: ${resContent}`);
      };
    } else if (actionType === 'generate_checklist') {
      resTitle = '📋 Sugestão de Checklist Inteligente VER AI';
      resContent = `1. Conferir documentação inicial do cliente\n2. Realizar análise de aderência legal\n3. Elaborar relatório preliminar\n4. Enviar minuta para validação do gestor\n5. Colher assinatura e arquivar`;
      onConfirmFn = () => {
        const newItems: ChecklistItem[] = [
          { id: `ai-1-${Date.now()}`, text: 'Conferir documentação inicial do cliente', completed: false },
          { id: `ai-2-${Date.now()}`, text: 'Realizar análise de aderência legal', completed: false },
          { id: `ai-3-${Date.now()}`, text: 'Elaborar relatório preliminar', completed: false },
          { id: `ai-4-${Date.now()}`, text: 'Enviar minuta para validação do gestor', completed: false },
          { id: `ai-5-${Date.now()}`, text: 'Colher assinatura e arquivar', completed: false },
        ];
        updateTask(task.id, { checklist: [...task.checklist, ...newItems] });
        addAuditLog('update', 'task', task.id, `actor_type: ai_agent | actor_id: ver-ai-copilot | action: task.checklist.generated | details: Checklist de 5 itens gerado pela IA e confirmado pelo usuário`);
      };
    } else if (actionType === 'suggest_action') {
      const res = AiToolRegistryService.executeTool('tasks.suggest_next_action', { taskId: task.id }, { currentUser, collaborator: currentUser, tasks, onboardingTasks });
      resTitle = '💡 Sugestão de Próxima Ação VER AI';
      resContent = res.success ? res.data.recommendedAction : 'Realizar alinhamento com a equipe responsável.';
      onConfirmFn = () => {
        updateTask(task.id, { pendingReasonText: `Próxima Ação recomendada: ${resContent}` });
      };
    }

    setAiPreviewModal({
      open: true,
      title: resTitle,
      content: resContent,
      onConfirm: onConfirmFn,
    });
  };

  const completedChecklistCount = task.checklist.filter((i) => i.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-3 md:p-6 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-6xl bg-white h-[92vh] max-h-[92vh] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER PRINCIPAL — PALETA OFICIAL VERGROUP (#0F493A / #13604C / #1F9879) */}
        <div className="p-4 bg-gradient-to-r from-[#0F493A] via-[#13604C] to-[#0F493A] text-white flex items-center justify-between border-b border-[#13604C] shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F9879] text-white flex items-center justify-center font-black text-sm shadow-md border border-[#197960]/40">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {task.protocolNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(task.protocolNumber || '');
                      alert(`Protocolo [${task.protocolNumber}] copiado com sucesso!`);
                    }}
                    title="Clique para copiar protocolo oficial da tarefa"
                    className="bg-[#1F9879]/30 text-[#FDFCE8] font-mono text-[11px] font-black px-2.5 py-0.5 rounded border border-[#1F9879]/50 cursor-pointer hover:bg-[#1F9879]/50 transition flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3 h-3 text-amber-300" />
                    <span>📋 {task.protocolNumber}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert(`Link direto da tarefa copiado com sucesso!`);
                  }}
                  className="text-white/80 hover:text-white text-[11px] font-bold flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Copiar Link</span>
                </button>

                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${slaStateBadgeColor}`}>
                  {slaStateLabel}
                </span>
              </div>

              <h2 className="text-base font-black tracking-tight text-white mt-1 flex items-center gap-2">
                <span>{task.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cronômetro com Atualização Real de 1s */}
            <button
              type="button"
              onClick={() => toggleTaskTimer(task.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
                task.isTimerRunning
                  ? 'bg-amber-400 text-slate-900 animate-pulse border border-amber-300'
                  : 'bg-[#1F9879] hover:bg-[#197960] text-white border border-[#197960]/50'
              }`}
            >
              {task.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{task.isTimerRunning ? 'Pausar Timer' : 'Iniciar Timer'}</span>
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-[11px]">
                {Math.floor((task.timerSeconds || 0) / 3600)}h {Math.floor(((task.timerSeconds || 0) % 3600) / 60)}m
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleTaskStatus(task.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all border ${
                task.status === 'completed'
                  ? 'bg-emerald-100 text-[#0B6B3A] border-emerald-300'
                  : 'bg-white text-slate-900 hover:bg-slate-100 border-slate-300'
              }`}
            >
              {task.status === 'completed' ? '✓ Concluída' : 'Marcar como Concluída'}
            </button>

            <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-xl cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO INTERNA — TABS COMPREENSIVAS (VISUAL CLEAN BITRIX24) */}
        <div className="bg-[#FDFCE8] border-b border-[#FDFBE2] px-5 flex items-center gap-1 overflow-x-auto shrink-0 font-sans">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'checklist', label: `Checklist (${completedChecklistCount}/${task.checklist.length})` },
            { id: 'subtasks', label: `Subtarefas (${subtasks.length})` },
            { id: 'dependencies', label: `Dependências (${(task.dependencies || []).length})` },
            { id: 'people', label: 'Participantes & Observadores' },
            { id: 'files', label: `Anexos (${(task.attachments || []).length})` },
            { id: 'reports', label: `Status Reports (${(task.statusReports || []).length})` },
            { id: 'comments', label: 'Comentários & @VER AI' },
            { id: 'time', label: 'Apontamento de Tempo' },
            { id: 'timeline', label: 'Timeline & Audit Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-3 text-xs font-black transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#0F493A] text-[#0F493A] bg-white rounded-t-xl shadow-2xs'
                  : 'border-transparent text-[#13604C] hover:text-[#0F493A] hover:bg-[#FDFBE2]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CORPO PRINCIPAL DIVIDIDO EM 2 COLUNAS OPERACIONAIS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* COLUNA ESQUERDA (8 COLS): CAMPOS E RELAÇÕES */}
              <div className="md:col-span-8 space-y-5">
                
                {/* BANNER SE FOR SUBTAREFA (LINK PARA TAREFA PRINCIPAL) */}
                {parentTask && (
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-xs flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-purple-700" />
                      <div>
                        <strong className="font-extrabold block">Subtarefa vinculada</strong>
                        <span className="text-[11px] font-semibold text-purple-800">
                          Tarefa Principal: [{parentTask.protocolNumber || parentTask.id}] — {parentTask.title}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTaskId(parentTask.id)}
                      className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Abrir Tarefa Principal →
                    </button>
                  </div>
                )}

                {/* PROPRIETÁRIO (OWNER) VS RESPONSÁVEL (ASSIGNEE) — SEPARADOS */}
                <div className="bg-[#FDFCE8]/80 p-4.5 rounded-2xl border border-[#FDFBE2] space-y-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-[#0F493A] uppercase tracking-wider block">
                    Responsabilidade & Governança de Equipe
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Proprietário da Tarefa (Quem coordena) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-black text-[#13604C] uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Proprietário (Coordena)</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <img src={owner?.avatar} alt={owner?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#13604C]" />
                        <select
                          value={task.ownerUserId || creator?.id}
                          onChange={(e) => {
                            const newOwnerId = e.target.value;
                            updateTask(task.id, { ownerUserId: newOwnerId });
                            addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.owner_changed | details: Proprietário alterado para ${users.find((u) => u.id === newOwnerId)?.name}`);
                          }}
                          className="w-full bg-transparent font-extrabold text-slate-900 outline-none cursor-pointer"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.jobTitle})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Responsável Executor (Quem executa) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-black text-[#1F9879] uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#1F9879]" />
                        <span>Responsável Executor</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <img src={assignee?.avatar} alt={assignee?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1F9879]" />
                        <select
                          value={task.assignedUserId}
                          onChange={(e) => {
                            const newAssigneeId = e.target.value;
                            updateTask(task.id, { assignedUserId: newAssigneeId });
                            addAuditLog('update', 'task', task.id, `actor_type: human_user | action: task.assigned | details: Executor alterado para ${users.find((u) => u.id === newAssigneeId)?.name}`);
                          }}
                          className="w-full bg-transparent font-extrabold text-[#1F9879] outline-none cursor-pointer"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.jobTitle})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* VÍNCULOS RELACIONAIS CLICÁVEIS DE CRM & PROJETO */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Vínculos Relacionais de CRM & Operações
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    
                    {/* Cliente / Empresa */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Empresa / Cliente CRM</span>
                      {company ? (
                        <button
                          onClick={() => setSelectedClientId(company.id)}
                          className="text-[#0F493A] font-extrabold flex items-center gap-1 hover:underline text-left truncate"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#0F8A4B] shrink-0" />
                          <span className="truncate">{company.name}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">Nenhum cliente vinculado</span>
                      )}
                    </div>

                    {/* Contato Relacionado */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Contato Relacionado</span>
                      {contact ? (
                        <button
                          onClick={() => setSelectedContactId(contact.id)}
                          className="text-[#0F493A] font-extrabold flex items-center gap-1 hover:underline text-left truncate"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{contact.name}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">Nenhum contato vinculado</span>
                      )}
                    </div>

                    {/* Negócio / Deal */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Negócio / Deal CRM</span>
                      {deal ? (
                        <button
                          onClick={() => setSelectedDealId(deal.id)}
                          className="text-[#0F493A] font-extrabold flex items-center gap-1 hover:underline text-left truncate"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{deal.title}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">Nenhum negócio vinculado</span>
                      )}
                    </div>

                  </div>
                </div>

                {/* MOTIVO DA PENDÊNCIA E GOVERNANÇA DE SLA */}
                <div className="bg-[#FDFCE8]/80 p-4 rounded-2xl border border-[#FDFBE2] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#0F493A] uppercase tracking-wider block">
                      VER AI — Motivo da Pendência & Governança de SLA
                    </span>
                    {task.pendingReasonCategory === 'waiting_client' && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded border border-amber-300">
                        Cobrança interna pausada (Aguardando Cliente)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <select
                      value={task.pendingReasonCategory || 'executing'}
                      onChange={(e) => updateTask(task.id, { pendingReasonCategory: e.target.value as any })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800 outline-none focus:border-[#1F9879]"
                    >
                      <option value="executing">⚙️ Executando normalmente</option>
                      <option value="waiting_client">⏳ Aguardando retorno do cliente</option>
                      <option value="waiting_third_party">🏢 Aguardando terceiro / parceiro</option>
                      <option value="internal_dependency">🔗 Dependência interna de outra área</option>
                      <option value="technical_issue">⚠️ Problema técnico / bloqueio</option>
                      <option value="needs_help">🆘 Preciso de ajuda da gestão</option>
                    </select>

                    <input
                      type="text"
                      value={task.pendingReasonText || ''}
                      onChange={(e) => updateTask(task.id, { pendingReasonText: e.target.value })}
                      placeholder="Detalhes da pendência ou bloqueio..."
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs outline-none focus:border-[#1F9879]"
                    />
                  </div>
                </div>

                {/* DESCRIÇÃO DO TRABALHO */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                  <h3 className="text-xs font-black text-[#0F493A] uppercase tracking-wider">Descrição Operacional do Trabalho</h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {task.description || 'Nenhuma descrição detalhada informada.'}
                  </p>
                </div>

              </div>

              {/* COLUNA DIREITA (4 COLS): PAINEL CONTEXTUAL VER AI & SLA GAUGE */}
              <div className="md:col-span-4 space-y-5">
                
                {/* MEDIDOR VISUAL DE CONSUMO DO SLA POR POLICY */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Governança de SLA Real</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Policy Active</span>
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>SLA Consumido:</span>
                      <span className="font-mono text-[#0F493A]">{slaConsumedPct}%</span>
                    </div>

                    {/* Barra Visual de Consumo */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 relative">
                      <div
                        className={`h-full transition-all duration-300 ${
                          slaConsumedPct >= 95 ? 'bg-rose-600' : slaConsumedPct >= 80 ? 'bg-amber-500' : 'bg-[#1F9879]'
                        }`}
                        style={{ width: `${slaConsumedPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-semibold text-slate-600">
                      <div>Vencimento: <strong className="text-slate-900 block">{task.dueDate}</strong></div>
                      <div>Estimativa: <strong className="text-slate-900 block">{totalSlaHours}h</strong></div>
                    </div>
                  </div>
                </div>

                {/* PAINEL CONTEXTUAL DISCRETO DA VER AI */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-4.5 rounded-2xl border border-emerald-500/40 space-y-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-amber-400 flex items-center justify-center font-black">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">VER AI — Painel Contextual Copilot</h4>
                      <span className="text-[10px] text-emerald-300 font-bold">Assistente Proativo Ativo</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/20 space-y-1.5 text-xs text-slate-200">
                    <p className="font-medium">
                      {isOverdue
                        ? '⚠️ A tarefa está com SLA estourado. Ação recomendada: Fazer follow-up imediato com a equipe ou gestor.'
                        : '🟢 A tarefa está no fluxo regular. Mantenha os registros de tempo atualizados.'}
                    </p>
                  </div>

                  {/* Ações Rápidas da VER AI (com Modal de Preview!) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Ferramentas de IA (Com Preview)</span>
                    <button
                      onClick={() => triggerAiActionWithPreview('summarize')}
                      className="w-full text-left px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>📊 Gerar Resumo Executivo</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => triggerAiActionWithPreview('generate_checklist')}
                      className="w-full text-left px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>📋 Gerar Checklist com IA</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => triggerAiActionWithPreview('suggest_action')}
                      className="w-full text-left px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>💡 Sugerir Próxima Ação</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Checklist da Tarefa ({completedChecklistCount} de {task.checklist.length} concluídos)</h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {task.checklist.length > 0 ? Math.round((completedChecklistCount / task.checklist.length) * 100) : 0}% concluído
                </span>
              </div>

              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Adicionar novo item ao checklist..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B]"
                />
                <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black hover:bg-[#0B6B3A] cursor-pointer">
                  + Adicionar Item
                </button>
              </form>

              <div className="space-y-2">
                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(task.id, item.id)}
                    className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#0F8A4B] rounded accent-[#0F8A4B]"
                      />
                      <span className={`text-xs font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.text}
                      </span>
                    </div>
                    {item.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SUBTAREFAS */}
          {activeTab === 'subtasks' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Subtarefas Vinculadas ({subtasks.length})</h3>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#0F493A] uppercase tracking-wider block">+ Criar Nova Subtarefa</span>
                  <p className="text-[11px] text-slate-500">Abre o Task Create Workspace com o vínculo de tarefa pai [${task.protocolNumber || task.id}]</p>
                </div>
                <button
                  type="button"
                  onClick={() => openTaskCreate({ parentTaskId: task.id, projectId: task.projectId, companyId: task.clientId, businessUnitId: task.businessUnitId })}
                  className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Subtarefa no Workspace</span>
                </button>
              </div>

              <div className="space-y-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedTaskId(st.id)}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition hover:border-[#0F8A4B]"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-black text-[#0F8A4B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📋 {st.protocolNumber || st.id}
                      </span>
                      <strong className="text-xs font-bold text-slate-900 block mt-1">{st.title}</strong>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{st.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEPENDÊNCIAS DE TAREFA */}
          {activeTab === 'dependencies' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Dependências de Tarefa ("Bloqueada por" / "Bloqueia")</h3>

              <form onSubmit={handleAddDependency} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-[#0F493A] uppercase tracking-wider block">+ Vincular Nova Dependência</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <select
                    value={depType}
                    onChange={(e) => setDepType(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none"
                  >
                    <option value="blocked_by">⛔ Bloqueada por (Esta tarefa depende de...)</option>
                    <option value="blocks">🔒 Bloqueia (Esta tarefa impede a execução de...)</option>
                  </select>

                  <select
                    value={selectedDepTaskId}
                    onChange={(e) => setSelectedDepTaskId(e.target.value)}
                    className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold outline-none"
                  >
                    <option value="">Selecione uma tarefa do sistema...</option>
                    {tasks.filter((t) => t.id !== task.id).map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.protocolNumber || t.id}] — {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                  Vincular Dependência
                </button>
              </form>

              <div className="space-y-2">
                {(task.dependencies || []).map((dep) => (
                  <div key={dep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${dep.type === 'blocked_by' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>
                        {dep.type === 'blocked_by' ? 'Bloqueada por' : 'Bloqueia'}
                      </span>
                      <strong className="text-slate-900 font-bold block mt-1">[{dep.targetTaskProtocol}] — {dep.targetTaskTitle}</strong>
                    </div>
                    <button onClick={() => setSelectedTaskId(dep.targetTaskId)} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F8A4B]">
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PARTICIPANTES & OBSERVADORES */}
          {activeTab === 'people' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Participantes */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Participantes da Execução ({task.participantIds.length})</span>
                </h3>
                <div className="space-y-2">
                  {task.participantIds.map((pId) => {
                    const u = users.find((usr) => usr.id === pId);
                    return (
                      <div key={pId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={u?.avatar} alt={u?.name} className="w-7 h-7 rounded-full object-cover" />
                          <strong className="text-xs font-bold text-slate-900">{u?.name}</strong>
                        </div>
                        <button
                          onClick={() => updateTask(task.id, { participantIds: task.participantIds.filter((id) => id !== pId) })}
                          className="text-rose-600 text-xs font-bold hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observadores */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Observadores Acompanhando ({task.observerIds.length})</span>
                </h3>
                <div className="space-y-2">
                  {task.observerIds.map((oId) => {
                    const u = users.find((usr) => usr.id === oId);
                    return (
                      <div key={oId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={u?.avatar} alt={u?.name} className="w-7 h-7 rounded-full object-cover" />
                          <strong className="text-xs font-bold text-slate-900">{u?.name}</strong>
                        </div>
                        <button
                          onClick={() => updateTask(task.id, { observerIds: task.observerIds.filter((id) => id !== oId) })}
                          className="text-rose-600 text-xs font-bold hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: ANEXOS */}
          {activeTab === 'files' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Anexos Operacionais (Supabase Storage)</h3>

              <form onSubmit={handleAddAttachment} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-[#0F493A] uppercase tracking-wider block">+ Anexar Documento</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Nome do arquivo (ex: Contrato_Social.pdf)..."
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:border-[#0F8A4B]"
                  />
                  <input
                    type="text"
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    placeholder="URL do arquivo ou link do storage..."
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:border-[#0F8A4B]"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                  Salvar Anexo
                </button>
              </form>

              <div className="space-y-2">
                {(task.attachments || []).map((att) => {
                  const author = users.find((u) => u.id === att.uploadedByUserId);
                  return (
                    <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-[#0F8A4B]" />
                        <div>
                          <strong className="text-slate-900 font-bold block">{att.name}</strong>
                          <span className="text-[10px] text-slate-500">{(att.sizeBytes / 1024 / 1024).toFixed(2)} MB • Enviado por {author?.name}</span>
                        </div>
                      </div>
                      <a href={att.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F8A4B] flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: STATUS REPORTS & TRAVA DE RESUMO DE CONCLUSÃO */}
          {activeTab === 'reports' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 shadow-2xs">
              
              {/* Opção de Governança: Exigir Resumo Final */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-black text-amber-900 block">Governança de Fechamento de Tarefa</strong>
                  <span className="text-[11px] text-amber-800 font-medium">Exigir resumo final obrigatório antes de permitir a conclusão desta tarefa</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(task.requireCompletionSummary)}
                  onChange={(e) => updateTask(task.id, { requireCompletionSummary: e.target.checked })}
                  className="w-5 h-5 accent-[#0F8A4B] rounded cursor-pointer"
                />
              </div>

              {/* Formulário de Resumo Final de Conclusão */}
              {task.requireCompletionSummary && (
                <form onSubmit={handleSaveCompletionSummary} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-3">
                  <strong className="text-xs font-black text-[#0F493A] block">Resumo Final de Conclusão da Execução</strong>
                  <textarea
                    rows={3}
                    value={completionSummaryText}
                    onChange={(e) => setCompletionSummaryText(e.target.value)}
                    placeholder="Descreva o resultado final da execução desta tarefa..."
                    className="w-full p-3 border border-emerald-200 rounded-xl bg-white text-xs text-slate-800 outline-none focus:border-[#0F8A4B]"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#0F493A] text-white font-black rounded-xl text-xs cursor-pointer">
                    💾 Registrar Resumo e Concluir Tarefa
                  </button>
                </form>
              )}

              {/* Status Reports Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase">Histórico de Status Reports</h4>
                <form onSubmit={handleAddStatusReport} className="flex gap-2">
                  <input
                    type="text"
                    value={newStatusReportText}
                    onChange={(e) => setNewStatusReportText(e.target.value)}
                    placeholder="Novo status report da demanda..."
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B]"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                    Publicar Report
                  </button>
                </form>

                <div className="space-y-2">
                  {(task.statusReports || []).map((rep) => {
                    const u = users.find((usr) => usr.id === rep.authorUserId);
                    return (
                      <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <strong className="text-slate-900">{u?.name}</strong>
                          <span>{new Date(rep.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 font-medium">{rep.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: COMENTÁRIOS COM MENÇÃO `@VER AI` */}
          {activeTab === 'comments' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Conversa Contextual da Tarefa (Suporte a @VER AI)</h3>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário ou marque @VER AI para ajuda inteligente..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B]"
                />
                <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {(task.comments || []).map((c) => {
                  const author = users.find((u) => u.id === c.authorUserId);
                  return (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <strong className="text-slate-900 font-bold">{author?.name || 'VER AI Copilot'}</strong>
                        <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800 font-medium whitespace-pre-wrap">{c.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: APONTAMENTO DE TEMPO (HISTÓRICO EM PUBLIC.TIME_ENTRIES) */}
          {activeTab === 'time' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Histórico Oficial de Apontamento de Tempo (`public.time_entries`)</h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Tempo Total Acumulado Nesta Tarefa:</span>
                  <strong className="text-xl font-black text-[#0F493A]">
                    {Math.floor((task.timerSeconds || 0) / 3600)}h {Math.floor(((task.timerSeconds || 0) % 3600) / 60)}m ({((task.timerSeconds || 0) / 3600).toFixed(2)} horas)
                  </strong>
                </div>
                <button onClick={() => toggleTaskTimer(task.id)} className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                  {task.isTimerRunning ? 'Pausar Cronômetro' : 'Iniciar Novo Apontamento'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: TIMELINE & AUDIT LOG */}
          {activeTab === 'timeline' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">Timeline Cronológica & Trilha de Auditoria (Audit Log)</h3>
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl space-y-2 max-h-[50vh] overflow-y-auto">
                <p>[{new Date(task.createdAt).toLocaleString()}] TASK_CREATED: Tarefa criada sob o protocolo [{task.protocolNumber}] por {creator?.name}</p>
                {task.lastCrmAuditAt && (
                  <p>[{new Date(task.lastCrmAuditAt).toLocaleString()}] CRM_AUDIT: VER AI Backend Worker auditou contexto da tarefa</p>
                )}
                {task.lastSlaNotificationAt && (
                  <p>[{new Date(task.lastSlaNotificationAt).toLocaleString()}] SLA_EVALUATED: Alerta de SLA avaliado para o estado {task.slaState}</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL DE PREVIEW DA VER AI (NUNCA SALVAR SEM CONFIRMAÇÃO DO USUÁRIO) */}
        {aiPreviewModal && aiPreviewModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-emerald-500 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-slate-900">{aiPreviewModal.title}</h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium whitespace-pre-wrap max-h-60 overflow-y-auto">
                {aiPreviewModal.content}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAiPreviewModal(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ✖ Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    aiPreviewModal.onConfirm();
                    setAiPreviewModal(null);
                  }}
                  className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  💾 Confirmar e Aplicar no Banco
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
