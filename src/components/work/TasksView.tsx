import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  PlusCircle,
  MessageSquare,
  Tag,
  Calendar,
  Layers,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Timer,
  AlertCircle,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';

export const TasksView: React.FC = () => {
  const {
    tasks,
    projects,
    deals,
    users,
    currentUser,
    filterByBU,
    setQuickCreateType,
    selectedTaskId,
    setSelectedTaskId,
    toggleTaskStatus,
    toggleChecklistItem,
    toggleTaskTimer,
    addTimeSpent,
    addTaskComment,
    updateTask,
    setSelectedDealId,
    setCurrentTab,
  } = useApp();

  const filteredTasks = filterByBU(tasks);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTabFilter, setActiveTabFilter] = useState<'in_progress' | 'created_by_me' | 'watching' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Active task detail
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Time logger input
  const [addHoursInput, setAddHoursInput] = useState('1');
  const [newCommentText, setNewCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const inProgressCount = filteredTasks.filter((t) => t.status === 'in_progress' || t.isTimerRunning).length;
  const createdByMeCount = filteredTasks.filter((t) => t.creatorId === currentUser.id).length;
  const watchingCount = filteredTasks.filter((t) => (t.observerIds || []).includes(currentUser.id)).length;
  const allCount = filteredTasks.length;

  const displayedTasks = filteredTasks.filter((t) => {
    if (activeTabFilter === 'in_progress' && t.status !== 'in_progress' && !t.isTimerRunning) return false;
    if (activeTabFilter === 'created_by_me' && t.creatorId !== currentUser.id) return false;
    if (activeTabFilter === 'watching' && !(t.observerIds || []).includes(currentUser.id)) return false;

    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && t.assignedUserId !== selectedAssignee) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const formatTimer = (seconds?: number) => {
    const total = seconds || 0;
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-200">Urgente</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-300">Alta</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-200">Média</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">Baixa</span>;
    }
  };

  const kanbanColumns: { id: TaskStatus; name: string }[] = [
    { id: 'pending', name: 'Pendentes' },
    { id: 'in_progress', name: 'Em Andamento' },
    { id: 'review', name: 'Em Revisão' },
    { id: 'completed', name: 'Concluídas' },
  ];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTask) return;
    addTaskComment(activeTask.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !activeTask) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    updateTask(activeTask.id, {
      checklist: [...(activeTask.checklist || []), newItem],
    });
    setNewChecklistText('');
  };

  return (
    <div id="tasks-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Bitrix Navigation Sub-header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Tarefas e Projetos (Work)</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0F8A4B] rounded-md">
                {displayedTasks.length} ativas
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Acompanhamento de prazos, cronômetro de horas e execução do time VERGROUP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F7F9FA] border border-[#DDE3E8] rounded-md p-0.5 text-xs">
            <button
              id="tasks-view-list-btn"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76] hover:text-[#17212B]'
              }`}
            >
              Lista
            </button>
            <button
              id="tasks-view-kanban-btn"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76] hover:text-[#17212B]'
              }`}
            >
              Kanban
            </button>
          </div>

          <button
            id="new-task-btn"
            onClick={() => setQuickCreateType('task')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Bitrix Style Horizontal Filter Tabs */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1">
          <button
            id="tab-in-progress-btn"
            onClick={() => setActiveTabFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'in_progress'
                ? 'bg-[#0F8A4B] text-white shadow-2xs'
                : 'text-[#5F6B76] hover:bg-[#F7F9FA]'
            }`}
          >
            <span>EM ANDAMENTO</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {inProgressCount}
            </span>
          </button>

          <button
            id="tab-created-by-me-btn"
            onClick={() => setActiveTabFilter('created_by_me')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'created_by_me'
                ? 'bg-[#0F8A4B] text-white shadow-2xs'
                : 'text-[#5F6B76] hover:bg-[#F7F9FA]'
            }`}
          >
            <span>CRIADAS POR MIM</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-[#17212B]">
              {createdByMeCount}
            </span>
          </button>

          <button
            id="tab-watching-btn"
            onClick={() => setActiveTabFilter('watching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'watching'
                ? 'bg-[#0F8A4B] text-white shadow-2xs'
                : 'text-[#5F6B76] hover:bg-[#F7F9FA]'
            }`}
          >
            <span>ACOMPANHANDO</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-[#17212B]">
              {watchingCount}
            </span>
          </button>

          <button
            id="tab-all-tasks-btn"
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'all'
                ? 'bg-[#0F8A4B] text-white shadow-2xs'
                : 'text-[#5F6B76] hover:bg-[#F7F9FA]'
            }`}
          >
            <span>TODAS</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-[#17212B]">
              {allCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F7F9FA] px-3 py-1.5 rounded-lg border border-[#DDE3E8] min-w-[280px]">
          <Search className="w-4 h-4 text-[#5F6B76] shrink-0" />
          <input
            id="search-tasks-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar tarefas por título ou projeto..."
            className="w-full bg-transparent outline-none text-xs text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>
      </div>

      {/* VIEW: LIST (Bitrix Table Layout) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Nome da Tarefa</th>
                  <th className="p-3">Prazo / Atividade</th>
                  <th className="p-3">Criador</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Cronômetro / Tempo</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F7]">
                {displayedTasks.map((task) => {
                  const creator = users.find((u) => u.id === task.creatorId);
                  const assignee = users.find((u) => u.id === task.assignedUserId);
                  const isDone = task.status === 'completed';

                  return (
                    <tr
                      key={task.id}
                      id={`task-row-${task.id}`}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`hover:bg-[#F7F9FA] cursor-pointer transition-colors ${
                        task.isTimerRunning ? 'bg-[#ECF8F1]/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTaskStatus(task.id)}
                          className="w-4 h-4 text-[#0F8A4B] rounded border-[#DDE3E8] cursor-pointer accent-[#0F8A4B]"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {task.projectName && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-[#5F6B76]">
                              {task.projectName}
                            </span>
                          )}
                          <p className={`font-bold text-xs ${isDone ? 'line-through text-neutral-400' : 'text-[#17212B]'}`}>
                            {task.title}
                          </p>
                        </div>
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5F6B76]">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-[#0F8A4B]" />
                              <span>{task.checklist.filter((c) => c.completed).length}/{task.checklist.length} itens</span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-[#17212B]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#5F6B76]" />
                          <span className="font-semibold">{task.deadlineLabel || task.dueDate}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {creator && (
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                            />
                          )}
                          <span className="text-[#17212B] font-medium">{creator?.name || 'Silvestre Castro'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                            />
                          )}
                          <span className="text-[#17212B] font-medium">{assignee?.name || 'William Barbosa'}</span>
                        </div>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            id={`toggle-timer-${task.id}`}
                            onClick={() => toggleTaskTimer(task.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer ${
                              task.isTimerRunning
                                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                                : 'bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white'
                            }`}
                            title={task.isTimerRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                          >
                            {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            <span>{formatTimer(task.timerSeconds)}</span>
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button className="flex items-center gap-1 text-[11px] font-bold text-[#0F8A4B] hover:underline ml-auto">
                          <span>Detalhes</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: KANBAN */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-280px)]">
          {kanbanColumns.map((col) => {
            const colTasks = displayedTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="w-76 shrink-0 bg-[#F2F4F7] rounded-xl border border-[#DDE3E8] flex flex-col max-h-[75vh]"
              >
                <div className="p-3 border-b border-[#DDE3E8] bg-white rounded-t-xl flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">{col.name}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F7F9FA] border border-[#DDE3E8] text-[#5F6B76]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {colTasks.map((t) => {
                    const assignee = users.find((u) => u.id === t.assignedUserId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className="bg-white p-3 rounded-lg border border-[#DDE3E8] hover:border-[#0F8A4B] shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
                      >
                        <h4 className="text-xs font-bold text-[#17212B] leading-snug">{t.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-[#5F6B76] pt-1 border-t border-[#F0F4F7]">
                          <span>{t.deadlineLabel || t.dueDate}</span>
                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TASK DETAIL DRAWER */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-2xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-[#DDE3E8] flex items-center justify-between bg-[#F7F9FA]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F8A4B] uppercase tracking-wider">
                  Detalhes da Tarefa
                </span>
                <span className="text-xs text-[#5F6B76]">• {activeTask.id}</span>
              </div>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-2">
                <h2 className="text-base font-extrabold text-[#17212B]">{activeTask.title}</h2>
                <p className="text-xs text-[#5F6B76] leading-relaxed">{activeTask.description}</p>
              </div>

              {/* Stopwatch widget */}
              <div className="bg-[#ECF8F1] p-4 rounded-xl border border-[#0F8A4B]/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F8A4B] block">
                    Cronômetro Ativo
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-[#0F8A4B]">
                    {formatTimer(activeTask.timerSeconds)}
                  </span>
                </div>

                <button
                  onClick={() => toggleTaskTimer(activeTask.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                    activeTask.isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0F8A4B] hover:bg-[#0B6B3A]'
                  }`}
                >
                  {activeTask.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{activeTask.isTimerRunning ? 'Pausar Tempo' : 'Iniciar Cronômetro'}</span>
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                    Checklist de Atividades
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {(activeTask.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2 bg-[#F7F9FA] rounded-lg border border-[#DDE3E8]"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(activeTask.id, item.id)}
                        className="w-4 h-4 text-[#0F8A4B] rounded accent-[#0F8A4B] cursor-pointer"
                      />
                      <span className={`text-xs ${item.completed ? 'line-through text-neutral-400' : 'text-[#17212B]'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}

                  <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Adicionar novo item ao checklist..."
                      className="flex-1 px-3 py-1.5 border border-[#DDE3E8] rounded-md text-xs outline-none focus:border-[#0F8A4B]"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
