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
  Lock,
  Eye,
  ShieldCheck,
  Layers,
  FileText,
  DollarSign,
  Briefcase,
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
    businessUnits,
    filterByBU,
    setQuickCreateType,
    openTaskCreate,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    updateTask,
    setSelectedTaskId,
    setCurrentTab,
  } = useApp();

  const filteredProjects = filterByBU(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBuFilter, setSelectedBuFilter] = useState<string>('all');
  const [selectedPrivacyFilter, setSelectedPrivacyFilter] = useState<string>('all');
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
  const [editObjective, setEditObjective] = useState('');
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
    setEditObjective(proj.objective || '');
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
      objective: editObjective,
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
    if (selectedBuFilter !== 'all' && p.businessUnitId !== selectedBuFilter) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (selectedPrivacyFilter !== 'all' && (p.privacy || 'private') !== selectedPrivacyFilter) return false;

    // Strict Privacy & Project Membership Enforcement
    const isPrivate = p.privacy === 'private';
    const isMemberOrManager =
      p.managerId === currentUser.id ||
      p.moderatorIds?.includes(currentUser.id) ||
      p.memberIds.includes(currentUser.id) ||
      currentUser.role === 'superadmin' ||
      currentUser.role === 'admin';

    if (isPrivate && !isMemberOrManager) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const comp = companies.find((c) => c.id === p.companyId);
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.objective && p.objective.toLowerCase().includes(q)) ||
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
        return <span className="bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20 px-2 py-0.5 rounded text-[10px] font-bold">Em Execução</span>;
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
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
            <FolderKanban className="w-5 h-5 text-[#0F8A4B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Gestão de Projetos por Business Unit (CRM 2.0)</h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0B6B3A] rounded-full">
                {displayedProjects.length} projetos
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Organização operacional com governança (Proprietários, Moderadores, Membros), visibilidade restrita e controle de entregáveis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCreateType('project')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Projeto</span>
          </button>
          <button
            onClick={() => openTaskCreate()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-black shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0F8A4B]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar com Seletor por BU, Privacidade e Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar projeto por nome, código (PRJ-2026), objetivo ou cliente..."
            className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span className="text-slate-600 font-bold">Empresa do Grupo:</span>
            <select
              value={selectedBuFilter}
              onChange={(e) => setSelectedBuFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todas as BUs da Holding</option>
              {businessUnits.map((bu) => (
                <option key={bu.id} value={bu.id}>🏢 {bu.tradeName || bu.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-bold">Privacidade:</span>
            <select
              value={selectedPrivacyFilter}
              onChange={(e) => setSelectedPrivacyFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todas as Visibilidades</option>
              <option value="private">🔒 Projetos Privados</option>
              <option value="public">🌐 Projetos Públicos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="in_progress">Em Execução</option>
              <option value="planning">Planejamento</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedProjects.map((proj) => {
          const owner = users.find((u) => u.id === proj.managerId);
          const ownerBu = businessUnits.find((b) => b.id === proj.businessUnitId);
          const comp = companies.find((c) => c.id === proj.companyId);

          const projectTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedTasksCount = projectTasks.filter((t) => t.status === 'completed').length;
          const realProgress = projectTasks.length > 0 ? Math.round((completedTasksCount / projectTasks.length) * 100) : proj.progressPercentage || 0;

          return (
            <div
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8A4B] p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-black text-[#0F8A4B]">{proj.code}</span>
                      {proj.privacy === 'private' ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" /> Privado
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-600" /> Público
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1 mt-0.5">{proj.name}</h3>
                  </div>
                  {getStatusBadge(proj.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20">
                    🏢 {ownerBu?.tradeName || ownerBu?.name || proj.businessUnitId}
                  </span>
                  {getHealthBadge(proj.health)}
                </div>

                {proj.objective && (
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    🎯 <strong>Objetivo:</strong> {proj.objective}
                  </p>
                )}

                {comp && (
                  <p className="text-[11px] text-slate-600 font-medium truncate flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Cliente: <strong className="text-slate-900">{comp.tradeName}</strong></span>
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Progresso Operacional</span>
                    <span>{realProgress}% ({completedTasksCount}/{projectTasks.length} tarefas)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-[#0F8A4B] h-full transition-all duration-300"
                      style={{ width: `${realProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[120px]" title={`Proprietário: ${owner?.name}`}>
                    {owner?.name || 'Proprietário'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <strong className="text-slate-900">{proj.memberIds.length} membros</strong>
                </div>
              </div>
            </div>
          );
        })}

        {displayedProjects.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhum projeto encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* PROJECT DETAIL MODAL / 360 HUB */}
      {activeProject && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] font-black text-base flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
                  <FolderKanban className="w-5 h-5 text-[#0F8A4B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#0F8A4B]">{activeProject.code}</span>
                    <h2 className="text-sm font-black text-slate-900">{activeProject.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Unidade: {businessUnits.find(b => b.id === activeProject.businessUnitId)?.tradeName || activeProject.businessUnitId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 border-b-2 font-black transition-colors ${
                  activeTab === 'overview' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-2 border-b-2 font-black transition-colors ${
                  activeTab === 'tasks' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Tarefas ({tasks.filter(t => t.projectId === activeProject.id).length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-3 py-2 border-b-2 font-black transition-colors ${
                  activeTab === 'members' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Membros & Moderadores ({activeProject.memberIds.length})
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-3 py-2 border-b-2 font-black transition-colors ${
                  activeTab === 'milestones' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Marcos ({activeProject.milestones.length})
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-2 border-b-2 font-black transition-colors ${
                  activeTab === 'files' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Arquivos ({(activeProject.attachments || []).length})
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-2 border-b-2 font-black transition-colors flex items-center gap-1 ${
                  activeTab === 'ai' ? 'border-[#0F8A4B] text-[#0F8A4B]' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F8A4B]" /> VER AI Copilot
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 text-xs">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Proprietário Principal</span>
                      <span className="font-bold text-slate-900">{users.find(u => u.id === activeProject.managerId)?.name || activeProject.managerId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Privacidade</span>
                      <span className="font-bold text-slate-900">{activeProject.privacy === 'private' ? '🔒 Privado' : '🌐 Público'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Status</span>
                      {getStatusBadge(activeProject.status)}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Data de Início</span>
                      <span className="font-bold text-slate-900">{activeProject.startDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Previsão Término</span>
                      <span className="font-bold text-[#0F8A4B]">{activeProject.targetEndDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Orçamento</span>
                      <span className="font-mono font-bold text-slate-900">R$ {(activeProject.budget || 0).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {activeProject.objective && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <strong className="text-amber-900 font-bold block mb-1">🎯 Objetivo Principal do Projeto:</strong>
                      <p className="font-semibold text-slate-800">{activeProject.objective}</p>
                    </div>
                  )}

                  {activeProject.description && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <strong className="text-slate-900 font-bold block">Escopo & Descrição:</strong>
                      <p className="font-medium text-slate-700 leading-relaxed">{activeProject.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider">Tarefas Vinculadas ao Projeto</h4>
                    <button
                      onClick={() => openTaskCreate({ projectId: activeProject.id, businessUnitId: activeProject.businessUnitId })}
                      className="px-3 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Nova Tarefa no Projeto
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.filter(t => t.projectId === activeProject.id).map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">Protocolo: {t.protocol} • Responsável: {users.find(u => u.id === t.assigneeId)?.name}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">{t.status}</span>
                      </div>
                    ))}

                    {tasks.filter(t => t.projectId === activeProject.id).length === 0 && (
                      <p className="text-xs text-slate-400 italic">Nenhuma tarefa vinculada a este projeto ainda.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <button
                    onClick={handleRunAiProjectSummary}
                    className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" /> Executar Diagnóstico de Riscos & Gargalos
                  </button>

                  {aiProjectDiagnostic && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed text-slate-800 font-semibold">
                      {aiProjectDiagnostic}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-2 bg-[#0F8A4B] text-white rounded-xl font-bold text-xs cursor-pointer"
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
