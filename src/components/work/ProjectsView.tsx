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
  } = useApp();

  const filteredProjects = filterByBU(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
          <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Gestão de Projetos & Entregáveis</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {displayedProjects.length} projetos
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Acompanhamento de marcos estratégicos, cronogramas e entregas contratuais (PRD 5.8)
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickCreateType('task')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Vincular Nova Demanda</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs">
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
            className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="planning">Planejamento</option>
            <option value="in_progress">Em Execução</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
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
              onClick={() => setSelectedProject(proj)}
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
      {selectedProject && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 border border-[#DDE3E8] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div>
                <h2 className="text-sm font-bold text-[#17212B]">{selectedProject.name}</h2>
                <p className="text-xs text-[#5F6B76]">
                  Cliente: {companies.find(c => c.id === selectedProject.companyId)?.tradeName || 'Interno'}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-[#F7F9FA] p-3 rounded-lg border border-[#DDE3E8]">
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Gerente do Projeto</span>
                  <span className="font-semibold text-[#17212B]">
                    {users.find(u => u.id === selectedProject.managerId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Início / Término</span>
                  <span className="font-semibold text-[#17212B]">
                    {selectedProject.startDate} até {selectedProject.targetEndDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Status & Saúde</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {getStatusBadge(selectedProject.status)}
                    {getHealthBadge(selectedProject.health)}
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div>
                <h4 className="font-bold text-xs text-[#17212B] mb-2 uppercase tracking-wider">
                  Marcos Estratégicos & Entregas
                </h4>
                <div className="space-y-1.5">
                  {selectedProject.milestones?.map((m) => (
                    <div key={m.id} className="p-2.5 bg-[#F7F9FA] rounded border border-[#DDE3E8] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag className={`w-3.5 h-3.5 ${m.completed ? 'text-[#0F8A4B]' : 'text-[#5F6B76]'}`} />
                        <span className={`font-semibold ${m.completed ? 'line-through text-[#5F6B76]' : 'text-[#17212B]'}`}>
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5F6B76] font-mono">{m.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#DDE3E8]">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-md font-semibold text-xs"
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
