import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Briefcase,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  BarChart3,
  Sparkles,
  Calendar,
  Plus,
  Mail,
  Edit,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Download,
  FolderOpen,
  Filter,
  Check,
  UserPlus,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Task } from '../../types';
import { CollaboratorAiAssistant } from '../ai/CollaboratorAiAssistant';
import { UserEditModal } from './UserEditModal';

interface CollaboratorCockpitModalProps {
  collaborator: User;
  onClose: () => void;
}

export const CollaboratorCockpitModal: React.FC<CollaboratorCockpitModalProps> = ({
  collaborator,
  onClose,
}) => {
  const {
    businessUnits,
    departments,
    teams,
    users,
    tasks,
    calendarEvents,
    auditLogs,
    onboardingTasks,
    currentUser,
    addTask,
    setSelectedTaskId,
    openTaskCreate,
    setCurrentTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'calendar' | 'docs' | 'activity' | 'hours' | 'performance' | 'ai'
  >('overview');

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');
  const [showQuickTaskForm, setShowQuickTaskForm] = useState<boolean>(false);

  // New Quick Task Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Domain Queries
  const dept = departments.find((d) => d.id === collaborator.departmentId);
  const team = teams.find((t) => t.id === collaborator.teamId);
  const bu = businessUnits.find((b) => b.id === collaborator.primaryBusinessUnitId);
  const manager = users.find((u) => u.id === collaborator.managerId);
  const supervisor = users.find((u) => u.id === collaborator.supervisorId);
  const subordinates = users.filter((u) => u.managerId === collaborator.id || (collaborator.subordinateIds || []).includes(u.id));

  // Secondary Departments
  const secondaryDepts = (collaborator.secondaryDepartmentIds || [])
    .map((id) => departments.find((d) => d.id === id))
    .filter(Boolean);

  // Tasks
  const myTasks = tasks.filter((t) => t.assignedUserId === collaborator.id);
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const overdueTasks = myTasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date());
  const totalTimeMinutes = myTasks.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);

  // SLA Calculation
  const totalEnded = completedTasks.length + overdueTasks.length;
  const slaPercentage = totalEnded > 0 ? Math.round((completedTasks.length / totalEnded) * 100) : 100;

  // Audit Logs timeline
  const userActivities = auditLogs.filter((a) => a.userId === collaborator.id).slice(0, 15);

  // Filtered Tasks
  const filteredTasks = myTasks.filter((t) => {
    if (taskFilterStatus === 'completed') return t.status === 'completed';
    if (taskFilterStatus === 'in_progress') return t.status === 'in_progress';
    if (taskFilterStatus === 'overdue') return t.status !== 'completed' && new Date(t.dueDate) < new Date();
    if (taskFilterStatus === 'high_priority') return t.priority === 'high' || t.priority === 'urgent';
    return true;
  });

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      description: `Criada via Painel do Colaborador para ${collaborator.name}`,
      businessUnitId: collaborator.primaryBusinessUnitId,
      departmentId: collaborator.departmentId,
      assignedUserId: collaborator.id,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    });

    setNewTaskTitle('');
    setShowQuickTaskForm(false);
  };

  // Completion calculation for profile
  const profileFields = [
    collaborator.avatar,
    collaborator.phone,
    collaborator.extensionPhone,
    collaborator.emergencyContact,
    collaborator.city,
    collaborator.birthDate,
    collaborator.language,
  ];
  const filledFieldsCount = profileFields.filter(Boolean).length;
  const profileCompletionPercent = Math.round((filledFieldsCount / profileFields.length) * 100);

  // Permission Engine Check for Private Data Capabilities (PRD 44)
  const canReadPrivateData =
    currentUser.id === collaborator.id ||
    currentUser.role === 'superadmin' ||
    currentUser.role === 'company_admin' ||
    currentUser.role === 'director' ||
    currentUser.role === 'manager';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* TOP HEADER DO COLABORADOR */}
        <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={collaborator.avatar}
                alt={collaborator.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#0F8A4B] shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-slate-900 ${
                  collaborator.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
                title={`Status: ${collaborator.status === 'active' ? 'Ativo' : 'Inativo'}`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black tracking-tight">{collaborator.name}</h1>
                <span className="bg-[#0F8A4B] text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                  {collaborator.role}
                </span>
                <span className="bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                  Status: {collaborator.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                {collaborator.isExternal && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    PARCEIRO EXTERNO
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold mt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span>{collaborator.jobTitle}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{bu?.name || 'VERGROUP'} ({dept?.name || 'Geral'})</span>
                </span>
                {manager && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span>Gestor:</span>
                      <strong className="text-white">{manager.name.split(' ')[0]}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-[#0F8A4B]" />
              <span>Editar Perfil</span>
            </button>

            <button
              onClick={() => openTaskCreate({ assignedUserId: collaborator.id, businessUnitId: collaborator.primaryBusinessUnitId })}
              className="px-3 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova Tarefa</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VER AI Copilot</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS INTERNAS (8 ABAS) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'overview' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'tasks' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tarefas ({myTasks.length})</span>
            {overdueTasks.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full">
                {overdueTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'calendar' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'docs' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documentos</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'activity' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Atividade / Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'hours' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horas Apontadas</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'performance' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Desempenho Objetivo</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'ai' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black bg-emerald-50 text-[#0F8A4B]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assistente VER AI</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Profile Completion Indicator */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F8A4B] font-black flex items-center justify-center border border-emerald-200">
                    {profileCompletionPercent}%
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Preenchimento de Perfil & Dados Cadastrais</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {filledFieldsCount} de {profileFields.length} dados cadastrais preenchidos no cadastro central.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-[#0F8A4B] rounded-full" style={{ width: `${profileCompletionPercent}%` }} />
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl cursor-pointer"
                  >
                    Completar Dados
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#0F8A4B]" />
                      <span>Identidade & Contato</span>
                    </h3>
                    <button onClick={() => setShowEditModal(true)} className="text-xs text-[#0F8A4B] font-bold hover:underline">
                      Editar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Nome Completo</span>
                      <strong className="text-slate-900">{collaborator.name}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">E-mail Corporativo</span>
                      <strong className="text-slate-900 truncate block">{collaborator.email}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Telefone / WhatsApp</span>
                      <strong className="text-slate-900">{collaborator.phone || '—'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Ramal Telefônico</span>
                      <strong className="text-slate-900">{collaborator.extensionPhone || '—'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Cidade / Estado</span>
                      <strong className="text-slate-900">{collaborator.city || 'Manaus, AM'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Data de Nascimento</span>
                      {canReadPrivateData ? (
                        <strong className="text-slate-900">{collaborator.birthDate ? new Date(collaborator.birthDate).toLocaleDateString('pt-BR') : '—'}</strong>
                      ) : (
                        <span className="text-slate-400 italic font-semibold">🔒 Dado Reservado (Privado)</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Data de Contratação</span>
                      <strong className="text-slate-900">{collaborator.hiredAt ? new Date(collaborator.hiredAt).toLocaleDateString('pt-BR') : '—'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Contato Emergência</span>
                      {canReadPrivateData ? (
                        <strong className="text-slate-900">{collaborator.emergencyContact || '—'}</strong>
                      ) : (
                        <span className="text-slate-400 italic font-semibold">🔒 Dado Reservado (Privado)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional & Multi-Department Structure */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Estrutura Profissional Multi-BU</span>
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Empresa Principal (BU)</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bu?.color || '#0F8A4B' }} />
                        <strong className="text-slate-900 font-black">{bu?.name || 'VERGROUP Tech'}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Departamento Principal</span>
                      <p className="text-slate-800 font-bold mt-0.5">{dept?.name || 'Geral'}</p>
                    </div>

                    {secondaryDepts.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Departamentos Secundários</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {secondaryDepts.map((d) => (
                            <span key={d?.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded border border-blue-200">
                              {d?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Equipe de Trabalho</span>
                      <p className="text-slate-800 font-bold mt-0.5">{team?.name || 'Não atribuída'}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Papel de Acesso RBAC</span>
                      <span className="bg-[#ECF8F1] text-[#0F8A4B] uppercase font-black text-[10px] px-2.5 py-0.5 rounded-md border border-[#0F8A4B]/20 inline-block mt-1">
                        {collaborator.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizational Hierarchy Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Estrutura Organizacional & Hierarquia</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Manager */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Gestor Direto</span>
                    {manager ? (
                      <div className="flex items-center gap-2.5">
                        <img src={manager.avatar} alt={manager.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-extrabold text-slate-900">{manager.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{manager.jobTitle}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-semibold">Sem gestor direto atribuído</p>
                    )}
                  </div>

                  {/* Supervisor */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Supervisor</span>
                    {supervisor ? (
                      <div className="flex items-center gap-2.5">
                        <img src={supervisor.avatar} alt={supervisor.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-extrabold text-slate-900">{supervisor.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{supervisor.jobTitle}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-semibold">Diretoria Executiva</p>
                    )}
                  </div>

                  {/* Subordinates */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Subordinados Diretos ({subordinates.length})</span>
                    {subordinates.length > 0 ? (
                      <div className="space-y-1.5">
                        {subordinates.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <img src={sub.avatar} alt={sub.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-bold text-slate-900">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 font-semibold">Sem subordinados diretos</p>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              
              {/* Task Header & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-600">Status:</span>
                  <select
                    value={taskFilterStatus}
                    onChange={(e) => setTaskFilterStatus(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white outline-none cursor-pointer text-slate-800 font-semibold"
                  >
                    <option value="all">Todas as Tarefas ({myTasks.length})</option>
                    <option value="in_progress">Em Andamento ({inProgressTasks.length})</option>
                    <option value="overdue">Atrasadas ({overdueTasks.length})</option>
                    <option value="high_priority">Prioridade Alta</option>
                    <option value="completed">Concluídas ({completedTasks.length})</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 font-bold">
                    <button
                      onClick={() => setTaskViewMode('list')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        taskViewMode === 'list' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-600'
                      }`}
                    >
                      Lista
                    </button>
                    <button
                      onClick={() => setTaskViewMode('kanban')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        taskViewMode === 'kanban' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-600'
                      }`}
                    >
                      Kanban
                    </button>
                  </div>

                  <button
                    onClick={() => openTaskCreate({ assignedUserId: collaborator.id, businessUnitId: collaborator.primaryBusinessUnitId })}
                    className="px-3 py-1.5 bg-[#0F8A4B] text-white hover:bg-[#0B6B3A] font-extrabold rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Criar Tarefa</span>
                  </button>
                </div>
              </div>

              {/* Quick Task Creation Drawer/Form Inline */}
              {showQuickTaskForm && (
                <form onSubmit={handleCreateTaskSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0F8A4B]" />
                      <span>Nova Tarefa para {collaborator.name}</span>
                    </h4>
                    <button type="button" onClick={() => setShowQuickTaskForm(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Título da tarefa..."
                      className="px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
                      required
                    />

                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800 bg-white"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>

                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQuickTaskForm(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer"
                    >
                      Salvar Tarefa
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Título da Tarefa</th>
                        <th className="p-3.5">Prioridade</th>
                        <th className="p-3.5">Prazo / SLA</th>
                        <th className="p-3.5">Tempo Apontado</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                            Nenhuma tarefa encontrada com este filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((t) => {
                          const isOverdue = t.status !== 'completed' && new Date(t.dueDate) < new Date();

                          return (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5">
                                <p className="font-extrabold text-slate-900">{t.title}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{t.description}</p>
                              </td>
                              <td className="p-3.5">
                                <span className={`uppercase font-black text-[10px] px-2 py-0.5 rounded border ${
                                  t.priority === 'urgent' || t.priority === 'high'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {t.priority}
                                </span>
                              </td>
                              <td className="p-3.5 font-semibold">
                                <p className={isOverdue ? 'text-rose-600 font-black' : 'text-slate-800'}>
                                  {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                                </p>
                                {isOverdue && <span className="text-[10px] text-rose-600 font-black">⚠️ SLA Violado</span>}
                              </td>
                              <td className="p-3.5 text-slate-700 font-mono font-bold">
                                {Math.floor((t.timeSpentMinutes || 0) / 60)}h {(t.timeSpentMinutes || 0) % 60}m
                              </td>
                              <td className="p-3.5">
                                <span className={`font-black text-[10px] px-2 py-0.5 rounded ${
                                  t.status === 'completed' ? 'bg-emerald-50 text-[#0F8A4B]' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {t.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AGENDA */}
          {activeTab === 'calendar' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0F8A4B]" />
                  <span>Agenda Corporativa de {collaborator.name}</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {calendarEvents.length === 0 ? (
                  <p className="text-slate-500 font-semibold p-4 text-center">Nenhum compromisso agendado para o período.</p>
                ) : (
                  calendarEvents.map((evt) => (
                    <div key={evt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F8A4B] font-black flex items-center justify-center border border-emerald-200">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">{evt.description}</p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTOS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Documentos & Manuais Internos</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-extrabold text-slate-900">Manual do Colaborador VERGROUP.pdf</p>
                        <span className="text-[10px] text-slate-400">Onboarding & SLAs</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-extrabold text-slate-900">Procedimentos do Setor ({dept?.name}).pdf</p>
                        <span className="text-[10px] text-slate-400">SOP Operacional v4</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATIVIDADE / FEED */}
          {activeTab === 'activity' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-4 h-4 text-[#0F8A4B]" />
                <span>Timeline de Atividades Executadas (Audit Log)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {userActivities.length === 0 ? (
                  <p className="text-slate-500 font-semibold p-4 text-center">Nenhuma atividade registrada para este colaborador.</p>
                ) : (
                  userActivities.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-slate-900">{act.details}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Ação: {act.action} | IP: {act.ipAddress || 'Interno'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HORAS APONTADAS */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Apontado</span>
                  <span className="text-2xl font-black text-[#0F8A4B]">
                    {Math.floor(totalTimeMinutes / 60)}h {totalTimeMinutes % 60}m
                  </span>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Tarefas com Apontamento</span>
                  <span className="text-2xl font-black text-blue-600">
                    {myTasks.filter((t) => (t.timeSpentMinutes || 0) > 0).length}
                  </span>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Média por Tarefa</span>
                  <span className="text-2xl font-black text-purple-600">
                    {myTasks.length > 0 ? Math.round(totalTimeMinutes / myTasks.length) : 0} min
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DESEMPENHO OBJETIVO */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Cumprimento de SLA</span>
                  <span className="text-2xl font-black text-[#0F8A4B]">{slaPercentage}%</span>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Tarefas Concluídas</span>
                  <span className="text-2xl font-black text-slate-900">{completedTasks.length}</span>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Tarefas Atrasadas</span>
                  <span className="text-2xl font-black text-rose-600">{overdueTasks.length}</span>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Carga Operacional</span>
                  <span className="text-2xl font-black text-amber-600">
                    {inProgressTasks.length > 5 ? 'Elevada' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ASSISTENTE VER AI */}
          {activeTab === 'ai' && (
            <CollaboratorAiAssistant
              collaborator={collaborator}
              onQuickTaskCreate={(taskData) => {
                addTask({
                  title: taskData.title || 'Nova Tarefa via IA',
                  description: taskData.description,
                  assignedUserId: collaborator.id,
                  businessUnitId: collaborator.primaryBusinessUnitId,
                  departmentId: collaborator.departmentId,
                  priority: taskData.priority || 'high',
                  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                  status: 'pending',
                });
                setActiveTab('tasks');
              }}
            />
          )}

        </div>
      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <UserEditModal
          user={collaborator}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
