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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    companies,
    users,
    tasks,
    filterByBU,
    setQuickCreateType,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    setSelectedTaskId,
    setCurrentTab,
  } = useApp();

  const filteredProjects = filterByBU(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  const handleDeleteProject = () => {
    if (!activeProject) return;
    if (confirm(`Tem certeza que deseja excluir o projeto "${activeProject.name}"?`)) {
      deleteProject(activeProject.id);
      setSelectedProjectId(null);
    }
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
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">Planejamento</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">Em Execução</span>;
      case 'paused':
        return <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">Pausado</span>;
      case 'completed':
        return <span className="bg-[#ECF8F1] text-[#0F8A4B] px-2 py-0.5 rounded text-[10px] font-bold">Concluído</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">Cancelado</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  const getHealthBadge = (health: 'on_track' | 'at_risk' | 'delayed') => {
    switch (health) {
      case 'on_track':
        return <span className="bg-[#ECF8F1] text-[#0F8A4B] text-[10px] font-bold px-2 py-0.5 rounded">No Prazo</span>;
      case 'at_risk':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">Em Risco</span>;
      case 'delayed':
        return <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">Atrasado</span>;
    }
  };

  return (
    <div id="projects-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Gestão de Projetos & Entregáveis</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0F8A4B] rounded-md">
                {displayedProjects.length} projetos
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Acompanhamento de marcos estratégicos, cronogramas e entregas contratuais do time VERGROUP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCreateType('project')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
          <button
            onClick={() => setQuickCreateType('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDE3E8] hover:bg-[#F7F9FA] text-[#17212B] rounded-md text-xs font-bold shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0F8A4B]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#5F6B76]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar projeto por nome ou cliente..."
            className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5F6B76] font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer text-xs"
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

          return (
            <div
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="bg-white rounded-xl border border-[#DDE3E8] hover:border-[#0F8A4B] p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs text-[#17212B] line-clamp-1">{proj.name}</h3>
                    <p className="text-[11px] text-[#5F6B76] truncate">{comp?.tradeName || 'Projeto Interno'}</p>
                  </div>
                  {getHealthBadge(proj.health)}
                </div>

                {proj.description && (
                  <p className="text-[11px] text-[#5F6B76] line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5F6B76]">Progresso Global</span>
                    <span className="font-bold text-[#0F8A4B]">{proj.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#F7F9FA] rounded-full h-2 overflow-hidden border border-[#DDE3E8]">
                    <div
                      className="bg-[#0F8A4B] h-full transition-all"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Summary */}
                {proj.milestones && proj.milestones.length > 0 && (
                  <div className="bg-[#F7F9FA] p-2 rounded-lg border border-[#DDE3E8] space-y-1">
                    <span className="text-[10px] font-bold text-[#5F6B76] uppercase tracking-wider block">
                      Próximo Marco:
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#17212B] truncate">{proj.milestones[0].title}</span>
                      <span className="text-[#5F6B76] shrink-0">{proj.milestones[0].dueDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[#F0F4F7] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#5F6B76]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span>{completedTasks.length}/{projectTasks.length} tarefas</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {manager && (
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      title={`Gerente: ${manager.name}`}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-[11px] font-semibold text-[#17212B]">{getStatusBadge(proj.status)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 border border-[#DDE3E8] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F8A4B] uppercase tracking-wider">
                    {activeProject.code}
                  </span>
                  <h2 className="text-sm font-bold text-[#17212B]">{activeProject.name}</h2>
                </div>
                <p className="text-xs text-[#5F6B76]">
                  Cliente: {companies.find((c) => c.id === activeProject.companyId)?.tradeName || 'Projeto Interno'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs border border-[#DDE3E8] rounded-md text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span>{isEditing ? 'Cancelar Edição' : 'Editar'}</span>
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs border border-rose-200 text-rose-600 rounded-md hover:bg-rose-50"
                  title="Excluir Projeto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded text-base font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* EDIT FORM */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs bg-[#F7F9FA] p-4 rounded-xl border border-[#DDE3E8]">
                <h3 className="font-bold text-[#17212B]">Editar Dados do Projeto</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#17212B] font-semibold mb-1">Nome do Projeto</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#DDE3E8] rounded bg-white outline-none focus:border-[#0F8A4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17212B] font-semibold mb-1">Gerente do Projeto</label>
                    <select
                      value={editManagerId}
                      onChange={(e) => setEditManagerId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#DDE3E8] rounded bg-white outline-none focus:border-[#0F8A4B]"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#17212B] font-semibold mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                      className="w-full px-2.5 py-1.5 border border-[#DDE3E8] rounded bg-white outline-none focus:border-[#0F8A4B]"
                    >
                      <option value="planning">Planejamento</option>
                      <option value="in_progress">Em Execução</option>
                      <option value="paused">Pausado</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#17212B] font-semibold mb-1">Saúde do Projeto</label>
                    <select
                      value={editHealth}
                      onChange={(e) => setEditHealth(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-[#DDE3E8] rounded bg-white outline-none focus:border-[#0F8A4B]"
                    >
                      <option value="on_track">No Prazo</option>
                      <option value="at_risk">Em Risco</option>
                      <option value="delayed">Atrasado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#17212B] font-semibold mb-1">Data Término Alvo</label>
                    <input
                      type="date"
                      value={editTargetEndDate}
                      onChange={(e) => setEditTargetEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#DDE3E8] rounded bg-white outline-none focus:border-[#0F8A4B]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-[#DDE3E8] text-[#5F6B76] rounded font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded font-semibold"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Summary Info */}
                <div className="grid grid-cols-4 gap-3 bg-[#F7F9FA] p-3 rounded-lg border border-[#DDE3E8]">
                  <div>
                    <span className="text-[#5F6B76] block text-[11px]">Gerente do Projeto</span>
                    <span className="font-semibold text-[#17212B]">
                      {users.find((u) => u.id === activeProject.managerId)?.name || 'Não atribuído'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block text-[11px]">Início / Término</span>
                    <span className="font-semibold text-[#17212B]">
                      {activeProject.startDate} até {activeProject.targetEndDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block text-[11px]">Status & Saúde</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getStatusBadge(activeProject.status)}
                      {getHealthBadge(activeProject.health)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block text-[11px]">Progresso</span>
                    <span className="font-bold text-[#0F8A4B]">{activeProject.progressPercentage}%</span>
                  </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#17212B] uppercase tracking-wider">
                    Marcos Estratégicos & Entregas ({activeProject.milestones?.filter((m) => m.completed).length || 0}/{activeProject.milestones?.length || 0})
                  </h4>

                  <div className="space-y-1.5">
                    {activeProject.milestones?.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-[#F7F9FA] rounded-lg border border-[#DDE3E8] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => toggleMilestone(activeProject.id, m.id)}
                            className="w-4 h-4 text-[#0F8A4B] rounded accent-[#0F8A4B] cursor-pointer"
                          />
                          <span
                            className={`font-semibold ${
                              m.completed ? 'line-through text-[#5F6B76]' : 'text-[#17212B]'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#5F6B76] font-mono">{m.dueDate}</span>
                          <button
                            onClick={() => deleteMilestone(activeProject.id, m.id)}
                            className="text-neutral-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Remover Marco"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <form onSubmit={handleAddMilestone} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="Adicionar novo marco ao projeto..."
                        className="flex-1 px-3 py-1.5 border border-[#DDE3E8] rounded-md text-xs outline-none focus:border-[#0F8A4B]"
                      />
                      <input
                        type="date"
                        value={newMilestoneDueDate}
                        onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        className="w-32 px-2 py-1.5 border border-[#DDE3E8] rounded-md text-xs outline-none focus:border-[#0F8A4B]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0F8A4B] text-white rounded-md text-xs font-bold cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </form>
                  </div>
                </div>

                {/* Linked Tasks */}
                <div className="space-y-2 pt-2 border-t border-[#DDE3E8]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#17212B] uppercase tracking-wider">
                      Tarefas do Projeto ({tasks.filter((t) => t.projectId === activeProject.id).length})
                    </h4>
                    <button
                      onClick={() => {
                        setQuickCreateType('task');
                      }}
                      className="text-xs text-[#0F8A4B] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nova Tarefa</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {tasks
                      .filter((t) => t.projectId === activeProject.id)
                      .map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTaskId(t.id);
                            setCurrentTab('work-tasks');
                          }}
                          className="p-2.5 bg-white hover:bg-[#F7F9FA] rounded-lg border border-[#DDE3E8] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CheckSquare
                              className={`w-4 h-4 ${t.status === 'completed' ? 'text-[#0F8A4B]' : 'text-[#5F6B76]'}`}
                            />
                            <span
                              className={`font-semibold ${
                                t.status === 'completed' ? 'line-through text-neutral-400' : 'text-[#17212B]'
                              }`}
                            >
                              {t.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#5F6B76]">{t.dueDate}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-[#5F6B76]">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    {tasks.filter((t) => t.projectId === activeProject.id).length === 0 && (
                      <p className="text-xs text-[#5F6B76] italic py-1">Nenhuma tarefa vinculada a este projeto ainda.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Close */}
            <div className="flex justify-end pt-3 border-t border-[#DDE3E8]">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-md font-semibold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
