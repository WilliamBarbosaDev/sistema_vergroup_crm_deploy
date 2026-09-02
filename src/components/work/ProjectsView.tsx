import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flag,
  ArrowRight,
  Trash2,
  Edit3,
  CheckSquare,
  X,
  Sparkles,
  Paperclip,
  History,
  Download,
  Building2,
  User,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import { AiToolRegistryService } from '../../services/aiToolRegistry';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    companies,
    users,
    tasks,
    currentUser,
    filterByBU,
    setQuickCreateType,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    updateTask,
    setSelectedTaskId,
    setCurrentTab,
    onboardingTasks,
  } = useApp();

  const filteredProjects = filterByBU(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Active Project Detail Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members' | 'milestones' | 'files' | 'time' | 'timeline' | 'ai'>('overview');

  // Link existing task state
  const [taskToLink, setTaskToLink] = useState('');

  // Project attachment state
  const [newProjectFileName, setNewProjectFileName] = useState('');
  const [newProjectFileUrl, setNewProjectFileUrl] = useState('');

  // New milestone state inside modal
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  // Edit mode inside modal
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('in_progress');
  const [editHealth, setEditHealth] = useState<'on_track' | 'at_risk' | 'delayed'>('on_track');
  const [editManagerId, setEditManagerId] = useState('');
  const [editTargetEndDate, setEditTargetEndDate] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // AI Summary State
  const [aiProjectDiagnostic, setAiProjectDiagnostic] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  const handleOpenProject = (proj: Project) => {
    setSelectedProjectId(proj.id);
    setEditName(proj.name);
    setEditStatus(proj.status);
    setEditHealth(proj.health);
    setEditManagerId(proj.managerId);
    setEditTargetEndDate(proj.targetEndDate);
    setEditBudget(proj.budget ? String(proj.budget) : '');
    setIsEditing(false);
    setActiveTab('overview');
    setAiProjectDiagnostic(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    updateProject(activeProject.id, {
      name: editName,
      status: editStatus,
      health: editHealth,
      managerId: editManagerId,
      targetEndDate: editTargetEndDate,
      budget: Number(editBudget) || 0,
    });
    setIsEditing(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProject) return;
    addMilestone(activeProject.id, newMilestoneTitle.trim(), newMilestoneDueDate);
    setNewMilestoneTitle('');
  };

  const handleLinkTaskToProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToLink || !activeProject) return;
    updateTask(taskToLink, { projectId: activeProject.id });
    setTaskToLink('');
  };

  const handleAddProjectFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectFileName.trim() || !activeProject) return;

    const newAtt = {
      id: `patt-${Date.now()}`,
      name: newProjectFileName.trim(),
      fileUrl: newProjectFileUrl.trim() || 'https://vergroup.com.br/assets/docs/projeto-escopo.pdf',
      uploadedAt: new Date().toISOString(),
    };

    const updatedAtts = [...(activeProject.attachments || []), newAtt];
    updateProject(activeProject.id, { attachments: updatedAtts });
    setNewProjectFileName('');
    setNewProjectFileUrl('');
  };

  const handleDeleteProject = () => {
    if (!activeProject) return;
    if (confirm(`Tem certeza que deseja excluir o projeto "${activeProject.name}"?`)) {
      deleteProject(activeProject.id);
      setSelectedProjectId(null);
    }
  };

  const handleRunAiProjectSummary = () => {
    if (!activeProject) return;
    const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);
    const completedTasks = projectTasks.filter((t) => t.status === 'completed');
    const overdueTasks = projectTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed');

    setAiProjectDiagnostic(
      `📊 **Diagnóstico do Projeto [${activeProject.name}]**:\n- **Progresso Global**: ${projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0}%\n- **Tarefas Concluídas**: ${completedTasks.length} de ${projectTasks.length}\n- **Tarefas Atrasadas**: ${overdueTasks.length}\n- **Saúde**: ${activeProject.health === 'on_track' ? '🟢 No Prazo' : activeProject.health === 'at_risk' ? '🟠 Em Risco' : '🔴 Atrasado'}\n\n💡 **Recomendação VER AI**: Concentrar a equipe nas ${overdueTasks.length} tarefas com vencimento imediato para manter o cronograma.`
    );
  };

  const displayedProjects = filteredProjects.filter((p) => {
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const comp = companies.find((c) => c.id === p.companyId);
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (comp && comp.tradeName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">Planejamento</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Em Execução</span>;
      case 'paused':
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">Pausado</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-[#0B6B3A] border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">Concluído</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">Cancelado</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  const getHealthBadge = (health: 'on_track' | 'at_risk' | 'delayed') => {
    switch (health) {
      case 'on_track':
        return <span className="bg-emerald-100 text-[#0B6B3A] text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">No Prazo</span>;
      case 'at_risk':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">Em Risco</span>;
      case 'delayed':
        return <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-rose-600">Atrasado</span>;
    }
  };

  return (
    <div id="projects-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F493A] text-white flex items-center justify-center font-black shadow-md">
            <FolderKanban className="w-5 h-5 text-[#FDFCE8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Gestão de Projetos & Entregáveis (PROJECTS CORE = STABLE)</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-[#0B6B3A] rounded-full">
                {displayedProjects.length} projetos ativos
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Acompanhamento de marcos estratégicos, cronogramas operacionais e apontamento de tempo real do time VERGROUP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCreateType('project')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
          <button
            onClick={() => setQuickCreateType('task')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-black shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0F8A4B]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar projeto por nome ou cliente..."
            className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold outline-none cursor-pointer text-xs"
          >
            <option value="all">Todos os Status</option>
            <option value="planning">Planejamento</option>
            <option value="in_progress">Em Execução</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedProjects.map((proj) => {
          const comp = companies.find((c) => c.id === proj.companyId);
          const manager = users.find((u) => u.id === proj.managerId);
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'completed');
          const realProgress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : proj.progressPercentage;

          return (
            <div
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8A4B] p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-black text-[#0F8A4B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block mb-1">
                      {proj.code || 'PRJ-2026'}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 line-clamp-1">{proj.name}</h3>
                    <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5">{comp?.tradeName || 'Projeto Interno (Sem CRM)'}</p>
                  </div>
                  {getHealthBadge(proj.health)}
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {proj.description}
                  </p>
                )}

                {/* Progress Bar Calculada via Tarefas Reais */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Progresso Global das Tarefas</span>
                    <span className="font-black text-[#0F8A4B]">{realProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className="bg-[#0F8A4B] h-full transition-all duration-300"
                      style={{ width: `${realProgress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Summary */}
                {proj.milestones && proj.milestones.length > 0 && (
                  <div className="bg-[#FDFCE8]/80 p-2.5 rounded-xl border border-[#FDFBE2] space-y-1">
                    <span className="text-[10px] font-black text-[#0F493A] uppercase tracking-wider block">
                      Próximo Marco do Projeto:
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">{proj.milestones[0].title}</span>
                      <span className="text-slate-600 font-mono text-[11px] shrink-0">{proj.milestones[0].dueDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#0F8A4B]" />
                  <span>{completedTasks.length}/{projectTasks.length} tarefas</span>
                </div>

                <div className="flex items-center gap-2">
                  {manager && (
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      title={`Gerente do Projeto: ${manager.name}`}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  )}
                  {getStatusBadge(proj.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROJECT DETAIL MODAL (DRAWER COMPLETO DO PROJETO) */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-3 md:p-6 font-sans animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-5xl bg-white h-[90vh] max-h-[90vh] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#0F493A] to-[#13604C] text-white flex items-center justify-between border-b border-[#13604C] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1F9879] text-white flex items-center justify-center font-black text-sm shadow-md">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1F9879]/30 text-[#FDFCE8] font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#1F9879]/40">
                      {activeProject.code || 'PRJ-2026'}
                    </span>
                    <h2 className="text-base font-black text-white">{activeProject.name}</h2>
                    {getStatusBadge(activeProject.status)}
                    {getHealthBadge(activeProject.health)}
                  </div>
                  <p className="text-xs text-emerald-200 font-semibold mt-0.5">
                    Cliente CRM: {companies.find((c) => c.id === activeProject.companyId)?.tradeName || 'Projeto Interno'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs border border-white/30 rounded-xl text-white hover:bg-white/10 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEditing ? 'Cancelar Edição' : 'Editar Projeto'}</span>
                </button>

                <button
                  onClick={handleDeleteProject}
                  className="p-2 text-rose-300 hover:text-white rounded-xl cursor-pointer"
                  title="Excluir Projeto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button onClick={() => setSelectedProjectId(null)} className="p-2 text-white/80 hover:text-white rounded-xl cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Sub-Header Tabs */}
            <div className="bg-[#FDFCE8] border-b border-[#FDFBE2] px-5 flex items-center gap-1 overflow-x-auto shrink-0 font-sans">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'tasks', label: `Tarefas do Projeto (${tasks.filter((t) => t.projectId === activeProject.id).length})` },
                { id: 'members', label: `Participantes (${(activeProject.memberIds || []).length})` },
                { id: 'milestones', label: `Marcos (${activeProject.milestones?.length || 0})` },
                { id: 'files', label: `Arquivos (${activeProject.attachments?.length || 0})` },
                { id: 'time', label: 'Tempo Acumulado' },
                { id: 'timeline', label: 'Timeline & Atividade' },
                { id: 'ai', label: 'VER AI Diagnóstico' },
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

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
              
              {/* EDIT FORM */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <h3 className="font-black text-slate-900 uppercase">Editar Dados do Projeto</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Nome do Projeto</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0F8A4B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Gerente do Projeto</label>
                      <select
                        value={editManagerId}
                        onChange={(e) => setEditManagerId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0F8A4B]"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.jobTitle})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0F8A4B]"
                      >
                        <option value="planning">Planejamento</option>
                        <option value="in_progress">Em Execução</option>
                        <option value="paused">Pausado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Saúde do Projeto</label>
                      <select
                        value={editHealth}
                        onChange={(e) => setEditHealth(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0F8A4B]"
                      >
                        <option value="on_track">No Prazo</option>
                        <option value="at_risk">Em Risco</option>
                        <option value="delayed">Atrasado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Data Término Alvo</label>
                      <input
                        type="date"
                        value={editTargetEndDate}
                        onChange={(e) => setEditTargetEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#0F8A4B]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* TAB 1: VISÃO GERAL */}
                  {activeTab === 'overview' && (
                    <div className="space-y-5">
                      
                      {/* BANNER AVISO DE PROJETO PRONTO PARA CONCLUIR */}
                      {tasks.filter((t) => t.projectId === activeProject.id).length > 0 &&
                        tasks.filter((t) => t.projectId === activeProject.id).every((t) => t.status === 'completed') &&
                        activeProject.status !== 'completed' && (
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <strong className="font-black text-xs block">🎉 Todas as tarefas do projeto foram concluídas!</strong>
                                <span className="text-[11px] font-medium text-emerald-800">Deseja alterar o status deste projeto para Concluído?</span>
                              </div>
                            </div>
                            <button
                              onClick={() => updateProject(activeProject.id, { status: 'completed' })}
                              className="px-4 py-2 bg-[#0F493A] hover:bg-[#13604C] text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
                            >
                              Concluir Projeto
                            </button>
                          </div>
                        )}

                      {/* Summary Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Gerente do Projeto</span>
                          <strong className="text-xs font-bold text-slate-900 block">
                            {users.find((u) => u.id === activeProject.managerId)?.name || 'Não atribuído'}
                          </strong>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Período Vigente</span>
                          <strong className="text-xs font-bold text-slate-900 block">
                            {activeProject.startDate} até {activeProject.targetEndDate}
                          </strong>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Empresa / Cliente CRM</span>
                          <strong className="text-xs font-bold text-slate-900 block truncate">
                            {companies.find((c) => c.id === activeProject.companyId)?.tradeName || 'Projeto Interno'}
                          </strong>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Progresso Real das Tarefas</span>
                          <strong className="text-base font-black text-[#0F8A4B] block">
                            {tasks.filter((t) => t.projectId === activeProject.id).length > 0
                              ? Math.round((tasks.filter((t) => t.projectId === activeProject.id && t.status === 'completed').length / tasks.filter((t) => t.projectId === activeProject.id).length) * 100)
                              : activeProject.progressPercentage}%
                          </strong>
                        </div>
                      </div>

                      {/* Descrição do Projeto */}
                      <div className="p-4.5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                        <h4 className="text-xs font-black text-[#0F493A] uppercase tracking-wider">Descrição do Escopo do Projeto</h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {activeProject.description || 'Nenhuma descrição detalhada informada.'}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: TAREFAS DO PROJETO */}
                  {activeTab === 'tasks' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-black text-slate-900">
                          Tarefas Vinculadas ao Projeto ({tasks.filter((t) => t.projectId === activeProject.id).length})
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setQuickCreateType('task');
                            }}
                            className="px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Nova Tarefa Neste Projeto</span>
                          </button>
                        </div>
                      </div>

                      {/* Form de Vinculação de Tarefa Existente */}
                      <form onSubmit={handleLinkTaskToProject} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-2 text-xs">
                        <select
                          value={taskToLink}
                          onChange={(e) => setTaskToLink(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none font-medium"
                        >
                          <option value="">Vincular uma tarefa existente sem projeto...</option>
                          {tasks.filter((t) => !t.projectId && t.id !== activeProject.id).map((t) => (
                            <option key={t.id} value={t.id}>
                              [{t.protocolNumber || t.id}] — {t.title}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-black cursor-pointer">
                          Vincular Tarefa
                        </button>
                      </form>

                      {/* Lista de Tarefas do Projeto */}
                      <div className="space-y-2">
                        {tasks
                          .filter((t) => t.projectId === activeProject.id)
                          .map((t) => {
                            const assignee = users.find((u) => u.id === t.assignedUserId);
                            return (
                              <div
                                key={t.id}
                                onClick={() => setSelectedTaskId(t.id)}
                                className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition hover:border-[#0F8A4B]"
                              >
                                <div className="flex items-center gap-3">
                                  <CheckSquare className={`w-4 h-4 ${t.status === 'completed' ? 'text-[#0F8A4B]' : 'text-slate-400'}`} />
                                  <div>
                                    {t.protocolNumber && (
                                      <span className="font-mono text-[10px] font-black text-[#0F8A4B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        📋 {t.protocolNumber}
                                      </span>
                                    )}
                                    <strong className={`text-xs font-bold block mt-0.5 ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                      {t.title}
                                    </strong>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                  <span>{assignee?.name}</span>
                                  <span className="font-mono">{t.dueDate}</span>
                                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-black uppercase">{t.status}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PARTICIPANTES DO PROJETO */}
                  {activeTab === 'members' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-black text-slate-900">
                          Participantes e Colaboradores do Projeto ({(activeProject.memberIds || []).length})
                        </h4>
                      </div>

                      {/* Add member form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const newMemberId = (e.target as any).memberSelect.value;
                          if (!newMemberId || activeProject.memberIds?.includes(newMemberId)) return;
                          updateProject(activeProject.id, { memberIds: [...(activeProject.memberIds || []), newMemberId] });
                        }}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-2 text-xs"
                      >
                        <select name="memberSelect" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none font-semibold">
                          <option value="">Adicionar novo colaborador ao projeto...</option>
                          {users.filter((u) => !activeProject.memberIds?.includes(u.id)).map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.jobTitle})
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-lg font-black cursor-pointer">
                          + Adicionar Participante
                        </button>
                      </form>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(activeProject.memberIds || []).map((mId) => {
                          const u = users.find((usr) => usr.id === mId);
                          return (
                            <div key={mId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <img src={u?.avatar} alt={u?.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                                <div>
                                  <strong className="text-slate-900 font-bold block">{u?.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{u?.jobTitle}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => updateProject(activeProject.id, { memberIds: activeProject.memberIds.filter((id) => id !== mId) })}
                                className="text-rose-600 font-bold hover:underline"
                              >
                                Remover
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MARCOS (MILESTONES) */}
                  {activeTab === 'milestones' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Marcos Estratégicos & Entregas ({activeProject.milestones?.filter((m) => m.completed).length || 0}/{activeProject.milestones?.length || 0})
                      </h4>

                      <div className="space-y-2">
                        {activeProject.milestones?.map((m) => (
                          <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={m.completed}
                                onChange={() => toggleMilestone(activeProject.id, m.id)}
                                className="w-4 h-4 text-[#0F8A4B] rounded accent-[#0F8A4B] cursor-pointer"
                              />
                              <span className={`font-bold ${m.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {m.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-slate-500">{m.dueDate}</span>
                              <button onClick={() => deleteMilestone(activeProject.id, m.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <form onSubmit={handleAddMilestone} className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={newMilestoneTitle}
                            onChange={(e) => setNewMilestoneTitle(e.target.value)}
                            placeholder="Adicionar novo marco ao projeto..."
                            className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B]"
                          />
                          <input
                            type="date"
                            value={newMilestoneDueDate}
                            onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                            className="w-36 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B]"
                          />
                          <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                            Adicionar Marco
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ARQUIVOS DO PROJETO */}
                  {activeTab === 'files' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <h4 className="text-sm font-black text-slate-900">Arquivos e Documentos do Projeto (Supabase Storage)</h4>

                      <form onSubmit={handleAddProjectFile} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                        <span className="font-black text-[#0F493A] uppercase block">+ Anexar Documento do Projeto</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={newProjectFileName}
                            onChange={(e) => setNewProjectFileName(e.target.value)}
                            placeholder="Nome do documento (ex: Escopo_Validado.pdf)..."
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:border-[#0F8A4B]"
                          />
                          <input
                            type="text"
                            value={newProjectFileUrl}
                            onChange={(e) => setNewProjectFileUrl(e.target.value)}
                            placeholder="URL do arquivo..."
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:border-[#0F8A4B]"
                          />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl text-xs font-black cursor-pointer">
                          Salvar Arquivo do Projeto
                        </button>
                      </form>

                      <div className="space-y-2">
                        {(activeProject.attachments || []).map((att) => (
                          <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-[#0F8A4B]" />
                              <div>
                                <strong className="text-slate-900 font-bold block">{att.name}</strong>
                                <span className="text-[10px] text-slate-500">Enviado em {new Date(att.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <a href={att.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F8A4B]">
                              Baixar
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TEMPO ACUMULADO POR COLABORADOR */}
                  {activeTab === 'time' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <h4 className="text-sm font-black text-slate-900">Tempo Total de Trabalho do Projeto (Derivado de `public.time_entries`)</h4>
                      
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-500 font-bold block">Horas Totais Trabalhadas pelas Tarefas do Projeto:</span>
                        <strong className="text-xl font-black text-[#0F493A] mt-1 block">
                          {(tasks.filter((t) => t.projectId === activeProject.id).reduce((acc, t) => acc + (t.timerSeconds || 0), 0) / 3600).toFixed(1)} horas acumuladas
                        </strong>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Detalhamento por Colaborador</h5>
                        {users.map((u) => {
                          const userTasks = tasks.filter((t) => t.projectId === activeProject.id && t.assignedUserId === u.id);
                          const userSeconds = userTasks.reduce((acc, t) => acc + (t.timerSeconds || 0), 0);
                          if (userSeconds === 0) return null;
                          return (
                            <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="font-bold text-slate-900">{u.name} ({u.jobTitle})</span>
                              </div>
                              <strong className="font-mono text-[#0F493A] font-black">
                                {(userSeconds / 3600).toFixed(1)}h ({(userSeconds / 60).toFixed(0)}m)
                              </strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: TIMELINE & ATIVIDADE DO PROJETO */}
                  {activeTab === 'timeline' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <h4 className="text-sm font-black text-slate-900">Timeline de Atividades do Projeto</h4>
                      <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl space-y-2">
                        <p>[{activeProject.startDate}] PROJECT_CREATED: Projeto [{activeProject.code || activeProject.id}] criado.</p>
                        <p>[{activeProject.targetEndDate}] TARGET_END_DATE: Data de término alvo configurada.</p>
                      </div>
                    </div>
                  )}

                  {/* TAB 8: VER AI DIAGNÓSTICO */}
                  {activeTab === 'ai' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <h4 className="text-sm font-black text-slate-900">VER AI Copilot — Diagnóstico de Projeto</h4>
                        </div>
                        <button
                          onClick={handleRunAiProjectSummary}
                          className="px-4 py-2 bg-[#0F493A] hover:bg-[#13604C] text-white rounded-xl text-xs font-black cursor-pointer"
                        >
                          ⚡ Executar Diagnóstico de Projeto
                        </button>
                      </div>

                      {aiProjectDiagnostic && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                          {aiProjectDiagnostic}
                        </div>
                      )}
                    </div>
                  )}

                </>
              )}

            </div>

            {/* Footer Close */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-5 py-2 bg-[#0F493A] hover:bg-[#13604C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Fechar Ficha do Projeto
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
