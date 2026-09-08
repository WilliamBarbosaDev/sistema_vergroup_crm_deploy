import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BusinessUnit,
  Department,
  User,
  UserRole,
  Lead,
  Contact,
  Company,
  Pipeline,
  PipelineStage,
  StageType,
  PipelineCustomField,
  Deal,
  DealDocument,
  Activity,
  ClientAccount,
  ClientAccountStage,
  Task,
  TaskTemplate,
  Project,
  CalendarEvent,
  ChatChannel,
  ChatMessage,
  EmailMessage,
  EmailAccountConfig,
  WhatsAppConversation,
  AutomationRule,
  AuditLog,
  TaskStatus,
  Team,
  CollaboratorInvite,
  OnboardingTask,
  JobExecutionLog,
  CatalogItem,
  ImportJob,
} from '../types';
import {
  INITIAL_BUSINESS_UNITS,
  INITIAL_DEPARTMENTS,
  INITIAL_TEAMS,
  INITIAL_USERS,
  INITIAL_INVITES,
  INITIAL_ONBOARDING_TASKS,
  INITIAL_LEADS,
  INITIAL_CONTACTS,
  INITIAL_COMPANIES,
  INITIAL_PIPELINES,
  INITIAL_DEALS,
  INITIAL_ACTIVITIES,
  INITIAL_CLIENT_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CHAT_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_EMAILS,
  INITIAL_WHATSAPP_CONVERSATIONS,
  INITIAL_AUTOMATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATALOG_ITEMS,
  INITIAL_IMPORT_JOBS,
} from '../mock/initialData';

const PROD_BASELINE_FLAG = 'VERGROUP_PROD_BASELINE_V1';
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(PROD_BASELINE_FLAG)) {
    localStorage.clear();
    localStorage.setItem(PROD_BASELINE_FLAG, 'true');
    window.location.reload();
  }
}


export type NavigationTab = 
  | 'cockpit'
  | 'crm-deals'
  | 'crm-leads'
  | 'crm-contacts'
  | 'crm-companies'
  | 'clients-pipeline'
  | 'work-tasks'
  | 'work-projects'
  | 'work-calendar'
  | 'comms-chat'
  | 'comms-email'
  | 'comms-whatsapp'
  | 'mgmt-analytics'
  | 'mgmt-automations'
  | 'mgmt-audit'
  | 'admin-org'
  | 'mod-finance'
  | 'mod-hr'
  | (string & {});

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'deal' | 'task' | 'message' | 'alert' | 'automation';
  linkTab?: NavigationTab;
  linkId?: string;
}

export interface TaskCreateContext {
  businessUnitId?: string;
  projectId?: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  parentTaskId?: string;
  assignedUserId?: string;
  ownerUserId?: string;
  initialTitle?: string;
  initialDueDate?: string;
}

export interface AppContextType {
  // Task Create Canonical Workspace State
  isTaskCreateOpen: boolean;
  setIsTaskCreateOpen: (open: boolean) => void;
  taskCreateContext: TaskCreateContext | null;
  openTaskCreate: (context?: TaskCreateContext) => void;
  closeTaskCreate: () => void;
  // Auth & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;

  // Navigation & Multi-company
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedBusinessUnitId: string;
  setSelectedBusinessUnitId: (buId: string) => void;
  currentBU: BusinessUnit;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;
  requestCurrentUserEmailChange: (email: string) => void;
  userRole: UserRole;
  switchUserRole: (role: UserRole) => void;

  // Search & Quick Create Drawer
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickCreateType: 'lead' | 'contact' | 'company' | 'deal' | 'task' | 'event' | 'project' | null;
  setQuickCreateType: (type: 'lead' | 'contact' | 'company' | 'deal' | 'task' | 'event' | 'project' | null) => void;

  // Selected details drawers
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  // Entity Lists (Filtered & Unfiltered)
  businessUnits: BusinessUnit[];
  departments: Department[];
  teams: Team[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  invites: CollaboratorInvite[];
  onboardingTasks: OnboardingTask[];
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  pipelines: Pipeline[];
  deals: Deal[];
  activities: Activity[];
  clientAccounts: ClientAccount[];
  tasks: Task[];
  projects: Project[];
  calendarEvents: CalendarEvent[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  activeChatChannelId: string;
  setActiveChatChannelId: (id: string) => void;
  emails: EmailMessage[];
  whatsApps: WhatsAppConversation[];
  automations: AutomationRule[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  catalogItems: CatalogItem[];
  setCatalogItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
  importJobs: ImportJob[];
  addImportJob: (job: Omit<ImportJob, 'id' | 'createdAt' | 'updatedAt'>) => ImportJob;

  // Multi-company filtering helpers
  filterByBU: <T extends { businessUnitId?: string }>(items: T[]) => T[];

  // Collaborator & Invite Management
  createInvite: (data: Partial<CollaboratorInvite>) => CollaboratorInvite;
  revokeInvite: (inviteId: string) => void;
  resendInvite: (inviteId: string) => void;
  acceptInvite: (token: string, name?: string, password?: string) => void;
  createUserDirectly: (userData: Partial<User>, sendInviteImmediately: boolean) => User;
  addDepartment: (data: { name: string; businessUnitId: string; leaderId?: string }) => Department;
  addTeam: (data: { name: string; departmentId: string; businessUnitId: string; leaderId?: string }) => Team;

  // Mutations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToDeal: (leadId: string, options: { pipelineId: string; stageId: string; title: string; value: number }) => void;

  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; contact?: Contact; duplicateWarning?: string };
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  checkDuplicate: (email: string, phone: string, document?: string, excludeId?: string) => string | null;

  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;

  addDeal: (deal: Omit<Deal, 'id' | 'stageChangedAt' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  moveDealStage: (dealId: string, targetStageId: string) => void;
  markDealWon: (dealId: string) => void;
  markDealLost: (dealId: string, reason: string) => void;
  addDealDocument: (dealId: string, doc: Omit<DealDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  linkContactToDeal: (dealId: string, contactId: string, role: string) => void;
  unlinkContactFromDeal: (dealId: string, contactId: string) => void;

  // Multi-Company Pipeline Manager (SUPERADMIN Structural Control)
  addPipeline: (pipelineData: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>) => Pipeline;
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  duplicatePipeline: (id: string, targetBusinessUnitId?: string, newName?: string) => Pipeline;
  archivePipeline: (id: string) => void;
  deletePipeline: (id: string) => { success: boolean; error?: string };
  addPipelineStage: (pipelineId: string, stage: Omit<PipelineStage, 'id'>) => void;
  updatePipelineStage: (pipelineId: string, stageId: string, updates: Partial<PipelineStage>) => void;
  reorderPipelineStages: (pipelineId: string, stageIdsInOrder: string[]) => void;
  deletePipelineStage: (pipelineId: string, stageId: string) => { success: boolean; error?: string };
  addPipelineCustomField: (field: Omit<PipelineCustomField, 'id' | 'createdAt'>) => void;
  updatePipelineCustomField: (fieldId: string, updates: Partial<PipelineCustomField>) => void;
  deletePipelineCustomField: (fieldId: string) => void;

  addClientAccount: (client: Omit<ClientAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClientAccount: (id: string, updates: Partial<ClientAccount>) => void;
  updateClientAccountStage: (id: string, stage: ClientAccountStage) => void;

  generateTaskProtocol: (businessUnitId?: string) => string;
  runCrmQualityAudit: () => { totalUnlinked: number; likelyInternal: number; needsReview: number; unlinkedTasks: Task[] };
  jobExecutionLogs: JobExecutionLog[];
  runSlaSupervisorAudit: () => { scanned: number; flagged: number; notificationsSent: number };
  runSlaTeamRisksAudit: () => { attentionCount: number; riskCount: number; criticalCount: number; breachedCount: number; unlinkedCount: number };
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (taskId: string, status?: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  toggleTaskTimer: (taskId: string) => void;
  addTimeSpent: (taskId: string, additionalHours: number) => void;
  addTaskComment: (taskId: string, content: string) => void;

  taskTemplates: TaskTemplate[];
  addTaskTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  updateTaskTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTaskTemplate: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, title: string, dueDate: string) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  addBusinessUnit: (unit: Omit<BusinessUnit, 'id' | 'createdAt'>) => void;
  updateUserStatus: (userId: string, newStatus: 'active' | 'suspended' | 'inactive') => void;
  reassignUserTasks: (fromUserId: string, toUserId: string) => { reassignedCount: number };

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEventStatus: (eventId: string, userId: string, status: 'pending' | 'accepted' | 'declined' | 'tentative') => void;
  checkAvailability: (userIds: string[], start: string, end: string) => 'available' | 'partial' | 'busy';
  cancelEvent: (eventId: string) => void;

  sendChatMessage: (channelId: string, text: string, attachments?: { name: string; size: string; url: string }[]) => void;
  addChatReaction: (messageId: string, emoji: string) => void;
  getOrCreateDirectChannel: (targetUserId: string) => string;
  createGroupChannel: (data: {
    name: string;
    description?: string;
    businessUnitId: string;
    privacy: 'private' | 'business_unit';
    memberIds: string[];
    adminIds?: string[];
    avatarUrl?: string;
  }) => ChatChannel;
  updateGroupChannel: (channelId: string, updates: Partial<ChatChannel>) => void;
  addGroupMember: (channelId: string, userId: string) => void;
  removeGroupMember: (channelId: string, userId: string) => void;
  promoteGroupAdmin: (channelId: string, userId: string) => void;
  demoteGroupAdmin: (channelId: string, userId: string) => void;
  archiveGroupChannel: (channelId: string) => void;
  leaveGroupChannel: (channelId: string) => void;
  previousTab: string;
  setPreviousTab: (tab: string) => void;

  emailAccountConfig: EmailAccountConfig;
  saveEmailAccountConfig: (config: EmailAccountConfig) => void;
  sendEmail: (toEmail: string, subject: string, body: string, relatedDealId?: string, relatedProjectId?: string, relatedTaskId?: string) => void;
  markEmailRead: (emailId: string) => void;
  toggleEmailStar: (emailId: string) => void;

  sendWhatsAppMessage: (conversationId: string, text: string) => void;
  changeWhatsAppStatus: (conversationId: string, status: 'waiting' | 'in_progress' | 'closed') => void;

  triggerAutomationSimulation: (ruleId: string) => void;
  toggleAutomationRule: (ruleId: string) => void;

  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  addAuditLog: (
    action: AuditLog['action'],
    entity: string,
    entityId: string,
    details: string,
    metadata?: { before?: Record<string, unknown>; after?: Record<string, unknown>; correlationId?: string; businessUnitId?: string }
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'vergroup_crm_v4_clean';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vergroup_auth_active') === 'true';
  });

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('cockpit');
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState<string>('bu-all');
  
  // Active User & RBAC
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // William (superadmin)

  const login = (email: string, password?: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('vergroup_auth_active', 'true');
      localStorage.setItem('vergroup_auth_user_id', found.id);
      return true;
    }
    // Fallback: if email matches domain, login as primary admin
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    localStorage.setItem('vergroup_auth_active', 'true');
    return true;
  };

  const loginAsUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('vergroup_auth_active', 'true');
      localStorage.setItem('vergroup_auth_user_id', found.id);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('vergroup_auth_active', 'false');
  };
  
  // Drawers & Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickCreateType, setQuickCreateType] = useState<'lead' | 'contact' | 'company' | 'deal' | 'task' | 'event' | 'project' | null>(null);
  
  // Task Create Canonical Workspace State
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState<boolean>(false);
  const [taskCreateContext, setTaskCreateContext] = useState<TaskCreateContext | null>(null);

  const openTaskCreate = (context?: TaskCreateContext) => {
    setTaskCreateContext(context || null);
    setIsTaskCreateOpen(true);
  };

  const closeTaskCreate = () => {
    setIsTaskCreateOpen(false);
    setTaskCreateContext(null);
  };
  
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Core Data Collections with LocalStorage hydration
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(INITIAL_BUSINESS_UNITS);
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  const [invites, setInvites] = useState<CollaboratorInvite[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invites`);
    return saved ? JSON.parse(saved) : INITIAL_INVITES;
  });
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_onboardingTasks`);
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDING_TASKS;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leads`);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_companies`);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });
  const [pipelines, setPipelines] = useState<Pipeline[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pipelines`);
    return saved ? JSON.parse(saved) : INITIAL_PIPELINES;
  });
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deals`);
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clientAccounts`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_ACCOUNTS;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_taskTemplates`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'tmpl-simples-nacional',
        businessUnitId: 'bu-tech',
        category: 'fiscal',
        title: 'Apuração Simples Nacional',
        description: 'Conferência de notas fiscais emitidas/recebidas, cálculo de PGDAS-D e transmissão de guia DAM de recolhimento.',
        defaultPriority: 'high',
        defaultSlaHours: 48,
        estimatedHours: 3,
        checklistItems: [
          'Coletar e baixar extratos fiscais do mês de competência',
          'Conferir notas fiscais emitidas no sistema governamental',
          'Calcular apuração e alíquota efetiva PGDAS-D',
          'Emitir guia de recolhimento DAM com código de barras',
          'Enviar guia e comprovante de transmissão para o cliente',
        ],
        tags: ['FISCAL', 'Simples Nacional', 'Recorrente'],
        recurrenceRule: {
          frequency: 'monthly',
          monthDay: 10,
          dueTime: '17:00',
          generateDaysAhead: 5,
          competenceRule: 'same_month',
          summaryLabel: '🔄 Repete mensalmente todo dia 10',
        },
        requireCompletionSummary: true,
        icon: '📊',
        createdByUserId: 'usr-admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tmpl-fechamento-contabil',
        businessUnitId: 'bu-tech',
        category: 'accounting',
        title: 'Fechamento Contábil Mensal',
        description: 'Conciliação de extratos bancários, validação patrimonial e emissão de balancete de verificação para a diretoria.',
        defaultPriority: 'urgent',
        defaultSlaHours: 72,
        estimatedHours: 6,
        checklistItems: [
          'Solicitar extratos bancários e comprovantes de movimentação',
          'Executar conciliação de contas de ativo e passivo',
          'Lançar provisões e depreciações patrimoniais',
          'Emitir balancete de verificação e DRE gerencial',
          'Arquivar documentos em prontuário eletrônico',
        ],
        tags: ['CONTÁBIL', 'Balancete', 'Mensal'],
        recurrenceRule: {
          frequency: 'monthly',
          monthDay: 20,
          dueTime: '18:00',
          generateDaysAhead: 7,
          competenceRule: 'same_month',
          summaryLabel: '🔄 Repete mensalmente todo dia 20',
        },
        requireCompletionSummary: true,
        icon: '📑',
        createdByUserId: 'usr-admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tmpl-onboarding-cliente',
        businessUnitId: 'bu-tech',
        category: 'general',
        title: 'Onboarding & Certidões do Cliente',
        description: 'Recepção de novo cliente, solicitação de certidões negativas e emissão de credenciais de acesso no CRM.',
        defaultPriority: 'medium',
        defaultSlaHours: 24,
        estimatedHours: 2,
        checklistItems: [
          'Coletar contrato social e documento dos sócios',
          'Emitir CND Federal, Estadual e Municipal',
          'Configurar acesso ao CRM e sistemas contábeis',
          'Agendar reunião de boas-vindas com a diretoria',
        ],
        tags: ['ONBOARDING', 'Cliente Novo'],
        icon: '🚀',
        createdByUserId: 'usr-admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tmpl-relatorio-crm',
        businessUnitId: 'bu-tech',
        category: 'sales',
        title: 'Relatório Semanal de Performance Comercial',
        description: 'Consolidação de leads qualificados, negócios ganhos/perdidos e projeção de receita do grupo.',
        defaultPriority: 'high',
        defaultSlaHours: 24,
        estimatedHours: 1.5,
        checklistItems: [
          'Atualizar estágios de todos os negócios no CRM',
          'Mapear motivos de perdas de negócios na semana',
          'Consolidar projeção de vendas no dashboard',
          'Enviar relatório executivo para a diretoria',
        ],
        tags: ['VENDAS', 'CRM', 'Semanal'],
        recurrenceRule: {
          frequency: 'weekly',
          weekDays: [5],
          dueTime: '17:00',
          generateDaysAhead: 1,
          summaryLabel: '🔄 Repete toda sexta-feira às 17:00',
        },
        icon: '📈',
        createdByUserId: 'usr-admin',
        createdAt: new Date().toISOString(),
      },
    ];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_chatChannels`);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_CHANNELS;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_chatMessages`);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });
  const [activeChatChannelId, setActiveChatChannelId] = useState<string>('chan-geral');
  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_emails`);
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });
  const [whatsApps, setWhatsApps] = useState<WhatsAppConversation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_whatsapps_v2`);
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_CONVERSATIONS;
  });
  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    const stored = localStorage.getItem('vergroup_automations');
    if (stored) {
      return JSON.parse(stored) as AutomationRule[];
    }
    return INITIAL_AUTOMATIONS;
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    const stored = localStorage.getItem('vergroup_catalog_items');
    if (stored) {
      return JSON.parse(stored) as CatalogItem[];
    }
    return INITIAL_CATALOG_ITEMS;
  });

  const [importJobs, setImportJobs] = useState<ImportJob[]>(() => {
    const stored = localStorage.getItem('vergroup_import_jobs');
    if (stored) {
      return JSON.parse(stored) as ImportJob[];
    }
    return INITIAL_IMPORT_JOBS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [emailAccountConfig, setEmailAccountConfig] = useState<EmailAccountConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_email_cfg`);
    return saved
      ? JSON.parse(saved)
      : {
          email: 'williambdesigner@gmail.com',
          displayName: 'William Barbosa | VERGROUP',
          imapServer: 'imap.vergroup.com.br',
          imapPort: 993,
          imapSsl: true,
          smtpServer: 'smtp.vergroup.com.br',
          smtpPort: 465,
          smtpSsl: true,
          syncIntervalMinutes: 5,
          signature: 'Atenciosamente,\nWilliam Barbosa\nDiretor de Produto & Tecnologia\nVERGROUP Participações & Holding',
          isEncrypted: true,
        };
  });

  const saveEmailAccountConfig = (cfg: EmailAccountConfig) => {
    setEmailAccountConfig(cfg);
    localStorage.setItem(`${STORAGE_KEY}_email_cfg`, JSON.stringify(cfg));
    addAuditLog('update', 'email_config', currentUser.id, `Configurações IMAP/SMTP atualizadas com criptografia TLS`);
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Minuta Aprovada - Alpha Saúde',
      description: 'Dra. Beatriz confirmou aprovação da minuta jurídica do negócio de R$ 280.000.',
      time: '15 min atrás',
      read: false,
      type: 'deal',
      linkTab: 'crm-deals',
      linkId: 'deal-102',
    },
    {
      id: 'notif-2',
      title: 'Nova mensagem de WhatsApp',
      description: 'Marcelo Pires (Inovar Logística) confirmou participação na demo técnica.',
      time: '45 min atrás',
      read: false,
      type: 'message',
      linkTab: 'comms-whatsapp',
      linkId: 'wpp-1',
    },
    {
      id: 'notif-3',
      title: 'Tarefa Urgente com Prazo Próximo',
      description: 'Validar minuta contratual com jurídico da Alpha Saúde vence amanhã.',
      time: '2 horas atrás',
      read: true,
      type: 'task',
      linkTab: 'work-tasks',
      linkId: 'tsk-1',
    },
  ]);

  useEffect(() => {
    localStorage.setItem('vergroup_automations', JSON.stringify(automations));
  }, [automations]);

  useEffect(() => {
    localStorage.setItem('vergroup_catalog_items', JSON.stringify(catalogItems));
  }, [catalogItems]);

  useEffect(() => {
    localStorage.setItem('vergroup_import_jobs', JSON.stringify(importJobs));
  }, [importJobs]);

  useEffect(() => {
    localStorage.setItem('vergroup_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
    localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(teams));
    localStorage.setItem(`${STORAGE_KEY}_invites`, JSON.stringify(invites));
    localStorage.setItem(`${STORAGE_KEY}_onboardingTasks`, JSON.stringify(onboardingTasks));
    localStorage.setItem(`${STORAGE_KEY}_leads`, JSON.stringify(leads));
    localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
    localStorage.setItem(`${STORAGE_KEY}_companies`, JSON.stringify(companies));
    localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(deals));
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${STORAGE_KEY}_taskTemplates`, JSON.stringify(taskTemplates));
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${STORAGE_KEY}_clientAccounts`, JSON.stringify(clientAccounts));
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${STORAGE_KEY}_emails`, JSON.stringify(emails));
    localStorage.setItem(`${STORAGE_KEY}_whatsapps_v2`, JSON.stringify(whatsApps));
    localStorage.setItem(`${STORAGE_KEY}_chatMessages`, JSON.stringify(chatMessages));
  }, [users, departments, teams, invites, onboardingTasks, leads, contacts, companies, deals, tasks, taskTemplates, projects, clientAccounts, activities, auditLogs, emails, whatsApps, chatMessages]);

  // Real-time 1-second Stopwatch Timer Ticker for Active Task Timers
  useEffect(() => {
    const hasRunningTimer = tasks.some((t) => t.isTimerRunning);
    if (!hasRunningTimer) return;

    const timerInterval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (!t.isTimerRunning) return t;
          const currentSeconds = (t.timerSeconds || 0) + 1;
          const currentSpentHours = Number((currentSeconds / 3600).toFixed(2));
          return {
            ...t,
            timerSeconds: currentSeconds,
            spentHours: currentSpentHours,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [tasks]);

  // Keyboard shortcut Cmd+K / Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const DEFAULT_EMPTY_BU: BusinessUnit = { id: 'empty-bu', name: 'Nenhuma Empresa', code: 'EMP', color: '#64748B' };
  const currentBU = businessUnits.find((b) => b.id === selectedBusinessUnitId) || businessUnits[0] || DEFAULT_EMPTY_BU;

  // Multi-company filtering helper
  const filterByBU = <T extends { businessUnitId?: string }>(items: T[]): T[] => {
    if (selectedBusinessUnitId === 'bu-all') return items;
    return items.filter((item) => !item.businessUnitId || item.businessUnitId === selectedBusinessUnitId || item.businessUnitId === 'bu-all');
  };

  const switchUserRole = (role: UserRole) => {
    const matchedUser = users.find((u) => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUser(matchedUser);
    addAuditLog('update', 'user_role', currentUser.id, `Simulação de perfil alterada para ${role}`);
  };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    const blockedGovernanceFields: (keyof User)[] = [
      'role',
      'businessUnitIds',
      'primaryBusinessUnitId',
      'departmentId',
      'teamId',
      'managerId',
      'supervisorId',
      'status',
      'allowedResourceIds',
      'isExternal',
      'accessExpiresAt',
      'employeeCode',
      'jobTitle',
    ];

    const safeUpdates = { ...updates };
    blockedGovernanceFields.forEach((field) => {
      delete safeUpdates[field];
    });

    const nextUser = {
      ...currentUser,
      ...safeUpdates,
      name: safeUpdates.name || currentUser.name,
    };

    setCurrentUser(nextUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...safeUpdates, name: nextUser.name } : u))
    );

    if (safeUpdates.avatar !== undefined) {
      addAuditLog('update', 'User', currentUser.id, 'profile.avatar.changed');
    }
    if (safeUpdates.phone !== undefined || safeUpdates.whatsapp !== undefined || safeUpdates.alternatePhone !== undefined) {
      addAuditLog('update', 'User', currentUser.id, 'profile.phone.updated');
    }
    addAuditLog('update', 'User', currentUser.id, 'profile.updated');
  };

  const requestCurrentUserEmailChange = (email: string) => {
    addAuditLog('update', 'User', currentUser.id, `profile.email.change_requested | requested_email: ${email}`);
  };

  const addAuditLog = (
    action: AuditLog['action'],
    entity: string,
    entityId: string,
    details: string,
    metadata?: { before?: Record<string, unknown>; after?: Record<string, unknown>; correlationId?: string; businessUnitId?: string }
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      businessUnitId: metadata?.businessUnitId || (selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entity,
      entityId,
      details,
      before: metadata?.before,
      after: metadata?.after,
      correlationId: metadata?.correlationId || `corr-${Date.now()}`,
      ipAddress: '189.40.122.15',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newAct: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Duplicate checker (Anti-duplicidade PRD CRM-04)
  const checkDuplicate = (email: string, phone: string, document?: string, excludeId?: string): string | null => {
    const normEmail = email?.trim().toLowerCase();
    const normPhone = phone?.replace(/\D/g, '');
    const normDoc = document?.replace(/\D/g, '');

    for (const c of contacts) {
      if (excludeId && c.id === excludeId) continue;
      if (normEmail && c.email?.trim().toLowerCase() === normEmail) {
        return `Já existe um contato com o e-mail "${c.email}" (${c.name}).`;
      }
      if (normPhone && c.phone && c.phone.replace(/\D/g, '') === normPhone) {
        return `Já existe um contato com o telefone "${c.phone}" (${c.name}).`;
      }
      if (normDoc && c.document && c.document.replace(/\D/g, '') === normDoc) {
        return `Já existe um contato com o documento "${c.document}" (${c.name}).`;
      }
    }
    return null;
  };

  // CRM: Leads
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    addAuditLog('create', 'lead', newLead.id, `Lead "${newLead.title}" criado (${newLead.name})`);
    
    // Automation trigger: lead_created
    addActivity({
      entityType: 'lead',
      entityId: newLead.id,
      businessUnitId: newLead.businessUnitId,
      userId: currentUser.id,
      type: 'note',
      title: 'Lead capturado no sistema',
      description: `Origem: ${newLead.source}. Campanha: ${newLead.campaign || 'N/A'}. Responsável: ${currentUser.name}`,
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)));
    addAuditLog('update', 'lead', id, `Lead atualizado`);
  };

  const deleteLead = (id: string) => {
    const target = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      addAuditLog('delete', 'lead', id, `Lead "${target.title}" removido`);
    }
  };

  const convertLeadToDeal = (
    leadId: string,
    options: { pipelineId: string; stageId: string; title: string; value: number }
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // 1. Create or Find Company if companyName exists
    let companyId: string | undefined = undefined;
    if (lead.companyName) {
      const existingComp = companies.find((c) => c.tradeName.toLowerCase() === lead.companyName?.toLowerCase());
      if (existingComp) {
        companyId = existingComp.id;
      } else {
        const newComp: Company = {
          id: `comp-${Date.now()}`,
          businessUnitId: lead.businessUnitId,
          corporateName: lead.companyName,
          tradeName: lead.companyName,
          cnpj: '00.000.000/0001-00',
          segment: 'Geral',
          size: 'medium',
          email: lead.email,
          phone: lead.phone,
          assignedUserId: lead.assignedUserId || currentUser.id,
          status: 'prospect',
          healthScore: 'green',
          tags: ['Lead Convertido'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCompanies((prev) => [...prev, newComp]);
        companyId = newComp.id;
        addAuditLog('create', 'company', newComp.id, `Empresa "${newComp.tradeName}" criada via conversão de lead`);
      }
    }

    // 2. Create Contact
    let contactId: string | undefined = undefined;
    const existingContact = contacts.find((c) => c.email.toLowerCase() === lead.email.toLowerCase());
    if (existingContact) {
      contactId = existingContact.id;
    } else {
      const newContact: Contact = {
        id: `cont-${Date.now()}`,
        businessUnitId: lead.businessUnitId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        companyId,
        jobTitle: 'Representante',
        tags: ['Lead Convertido', lead.source],
        assignedUserId: lead.assignedUserId || currentUser.id,
        notes: lead.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setContacts((prev) => [...prev, newContact]);
      contactId = newContact.id;
      addAuditLog('create', 'contact', newContact.id, `Contato "${newContact.name}" criado via conversão de lead`);
    }

    // 3. Create Deal in the selected pipeline
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      businessUnitId: lead.businessUnitId,
      pipelineId: options.pipelineId,
      stageId: options.stageId,
      title: options.title,
      value: options.value,
      contactId,
      companyId,
      assignedUserId: lead.assignedUserId || currentUser.id,
      expectedCloseDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'open',
      serviceCategory: 'Solução Integrada VERGROUP',
      tags: ['Qualificado', lead.source],
      stageChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);

    // 4. Update Lead status
    updateLead(leadId, { status: 'qualified' });

    // 5. Add Timeline activity
    addActivity({
      entityType: 'deal',
      entityId: newDeal.id,
      businessUnitId: newDeal.businessUnitId,
      userId: currentUser.id,
      type: 'stage_change',
      title: `Negócio criado a partir do Lead "${lead.title}"`,
      description: `Conversão realizada por ${currentUser.name}. Valor estimado: R$ ${options.value.toLocaleString('pt-BR')}`,
    });

    addAuditLog('create', 'deal', newDeal.id, `Negócio "${newDeal.title}" criado via conversão de lead`);

    setSelectedDealId(newDeal.id);
    setCurrentTab('crm-deals');
  };

  // CRM: Contacts
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const dup = checkDuplicate(contactData.email, contactData.phone, contactData.document);
    if (dup) {
      return { success: false, duplicateWarning: dup };
    }
    const newContact: Contact = {
      ...contactData,
      id: `cont-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
    addAuditLog('create', 'contact', newContact.id, `Contato "${newContact.name}" adicionado`);
    return { success: true, contact: newContact };
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    addAuditLog('update', 'contact', id, `Contato atualizado`);
  };

  const deleteContact = (id: string) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      addAuditLog('delete', 'contact', id, `Contato "${target.name}" removido`);
    }
  };

  // CRM: Companies
  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newCompany, ...prev]);
    addAuditLog('create', 'company', newCompany.id, `Empresa "${newCompany.tradeName}" cadastrada`);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    addAuditLog('update', 'company', id, `Empresa atualizada`);
  };

  // CRM: Deals & Pipeline
  const addDeal = (dealData: Omit<Deal, 'id' | 'stageChangedAt' | 'createdAt' | 'updatedAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      stageChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    addAuditLog('create', 'deal', newDeal.id, `Negócio "${newDeal.title}" criado no valor de R$ ${newDeal.value.toLocaleString('pt-BR')}`);
    addActivity({
      entityType: 'deal',
      entityId: newDeal.id,
      businessUnitId: newDeal.businessUnitId,
      userId: currentUser.id,
      type: 'stage_change',
      title: 'Negócio aberto no pipeline',
      description: `Criado por ${currentUser.name}. Valor: R$ ${newDeal.value.toLocaleString('pt-BR')}`,
    });
    return newDeal;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)));
    addAuditLog('update', 'deal', id, `Negócio atualizado`);
  };

  const moveDealStage = (dealId: string, targetStageId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const pipeline = pipelines.find((p) => p.id === deal.pipelineId) || pipelines[0];
    const stage = pipeline.stages.find((s) => s.id === targetStageId);
    const stageName = stage ? stage.name : targetStageId;

    // Check if target stage is a 'won' or 'lost' stageType
    const isWonStage = stage?.stageType === 'won' || stage?.stageType === 'completed';
    const isLostStage = stage?.stageType === 'lost' || stage?.stageType === 'cancelled';
    const dealStatus = isWonStage ? 'won' : isLostStage ? 'lost' : 'open';

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stageId: targetStageId,
              status: dealStatus,
              stageChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    addAuditLog('stage_change', 'deal', dealId, `Negócio "${deal.title}" movido para a etapa "${stageName}" (${stage?.stageType || 'intermediate'})`);
    addActivity({
      entityType: 'deal',
      entityId: deal.id,
      businessUnitId: deal.businessUnitId,
      userId: currentUser.id,
      type: 'stage_change',
      title: `Negócio avançou para "${stageName}"`,
      description: `Alteração realizada por ${currentUser.name}`,
    });
  };

  // MULTI-COMPANY PIPELINE MANAGER (STRICT SUPERADMIN CONTROL)
  const addPipeline = (pipelineData: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>): Pipeline => {
    const newPipeline: Pipeline = {
      ...pipelineData,
      id: `pipe-${Date.now()}`,
      status: pipelineData.status || 'active',
      stages: pipelineData.stages || [],
      customFields: pipelineData.customFields || [],
      createdByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPipelines((prev) => {
      // If new pipeline is default, unset default for other pipelines of same BU and type
      const sanitized = pipelineData.isDefault
        ? prev.map((p) => (p.businessUnitId === pipelineData.businessUnitId && p.type === pipelineData.type ? { ...p, isDefault: false } : p))
        : prev;

      const next = [newPipeline, ...sanitized];
      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });

    addAuditLog('create', 'pipeline', newPipeline.id, `Pipeline "${newPipeline.name}" criado para a empresa ${newPipeline.businessUnitId}`);
    return newPipeline;
  };

  const updatePipeline = (id: string, updates: Partial<Pipeline>) => {
    setPipelines((prev) => {
      const target = prev.find((p) => p.id === id);
      const targetBU = updates.businessUnitId || target?.businessUnitId;
      const targetType = updates.type || target?.type;

      const next = prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        }
        // If updates set isDefault = true, unset isDefault for other pipelines of same BU and type
        if (updates.isDefault && p.businessUnitId === targetBU && p.type === targetType) {
          return { ...p, isDefault: false };
        }
        return p;
      });

      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });
    addAuditLog('update', 'pipeline', id, `Pipeline "${id}" atualizado por ${currentUser.name}`);
  };

  const duplicatePipeline = (id: string, targetBusinessUnitId?: string, newName?: string): Pipeline => {
    const source = pipelines.find((p) => p.id === id);
    if (!source) throw new Error('Pipeline não encontrado');

    const duplicatedStages: PipelineStage[] = source.stages.map((stg, index) => ({
      ...stg,
      id: `stg-dup-${Date.now()}-${index}`,
      pipelineId: `pipe-dup-${Date.now()}`,
    }));

    const duplicatedCustomFields: PipelineCustomField[] = (source.customFields || []).map((field, index) => ({
      ...field,
      id: `cf-dup-${Date.now()}-${index}`,
      pipelineId: `pipe-dup-${Date.now()}`,
    }));

    const duplicatedPipeline: Pipeline = {
      ...source,
      id: `pipe-dup-${Date.now()}`,
      businessUnitId: targetBusinessUnitId || source.businessUnitId,
      name: newName || `${source.name} (Cópia)`,
      stages: duplicatedStages,
      customFields: duplicatedCustomFields,
      isDefault: false,
      departmentId: undefined, // Clear specific department reference upon multi-company duplicate for safety
      teamId: undefined,
      createdByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPipelines((prev) => {
      const next = [duplicatedPipeline, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });

    addAuditLog('create', 'pipeline', duplicatedPipeline.id, `Pipeline "${source.name}" duplicado para "${duplicatedPipeline.name}"`);
    return duplicatedPipeline;
  };

  const archivePipeline = (id: string) => {
    updatePipeline(id, { status: 'inactive' });
    addAuditLog('update', 'pipeline', id, `Pipeline "${id}" arquivado pelo Administrador`);
  };

  const deletePipeline = (id: string): { success: boolean; error?: string } => {
    const hasDeals = deals.some((d) => d.pipelineId === id);
    if (hasDeals) {
      return {
        success: false,
        error: 'Este pipeline possui negócios vinculados. Arquive o pipeline em vez de excluí-lo.',
      };
    }

    setPipelines((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });

    addAuditLog('delete', 'pipeline', id, `Pipeline "${id}" excluído com segurança`);
    return { success: true };
  };

  const addPipelineStage = (pipelineId: string, stageData: Omit<PipelineStage, 'id'>) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return;

    // Enforce unique initial stage: If new stage is 'initial', convert other 'initial' stages to 'intermediate'
    const sanitizedStages = stageData.stageType === 'initial'
      ? pipeline.stages.map((s) => (s.stageType === 'initial' ? { ...s, stageType: 'intermediate' as StageType } : s))
      : pipeline.stages;

    const newStage: PipelineStage = {
      ...stageData,
      id: `stg-${Date.now()}`,
      pipelineId,
      order: stageData.order || sanitizedStages.length + 1,
      color: stageData.color || '#3B82F6',
      stageType: stageData.stageType || 'intermediate',
    };

    const updatedStages = [...sanitizedStages, newStage];
    updatePipeline(pipelineId, { stages: updatedStages });
  };

  const updatePipelineStage = (pipelineId: string, stageId: string, updates: Partial<PipelineStage>) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return;

    // Enforce unique initial stage: If updated stage is set to 'initial', convert other 'initial' stages to 'intermediate'
    const updatedStages = pipeline.stages.map((stg) => {
      if (stg.id === stageId) {
        return { ...stg, ...updates };
      }
      if (updates.stageType === 'initial' && stg.stageType === 'initial') {
        return { ...stg, stageType: 'intermediate' as StageType };
      }
      return stg;
    });

    updatePipeline(pipelineId, { stages: updatedStages });
  };

  const reorderPipelineStages = (pipelineId: string, stageIdsInOrder: string[]) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return;

    const stageMap = new Map<string, PipelineStage>(pipeline.stages.map((s) => [s.id, s]));
    const reorderedStages: PipelineStage[] = stageIdsInOrder
      .map((id, index) => {
        const stg = stageMap.get(id);
        return stg ? ({ ...stg, order: index + 1 } as PipelineStage) : null;
      })
      .filter((s): s is PipelineStage => s !== null);

    updatePipeline(pipelineId, { stages: reorderedStages });
  };

  const deletePipelineStage = (pipelineId: string, stageId: string): { success: boolean; error?: string } => {
    const hasDealsInStage = deals.some((d) => d.pipelineId === pipelineId && d.stageId === stageId);
    if (hasDealsInStage) {
      return {
        success: false,
        error: 'Esta etapa possui negócios vinculados. Mova os negócios para outra etapa antes de excluir.',
      };
    }

    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return { success: false, error: 'Pipeline não encontrado' };

    const updatedStages = pipeline.stages.filter((s) => s.id !== stageId);
    updatePipeline(pipelineId, { stages: updatedStages });
    return { success: true };
  };

  const addPipelineCustomField = (fieldData: Omit<PipelineCustomField, 'id' | 'createdAt'>) => {
    const pipeline = pipelines.find((p) => p.id === fieldData.pipelineId);
    if (!pipeline) return;

    const newField: PipelineCustomField = {
      ...fieldData,
      id: `cf-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedFields = [...(pipeline.customFields || []), newField];
    updatePipeline(fieldData.pipelineId, { customFields: updatedFields });
  };

  const updatePipelineCustomField = (fieldId: string, updates: Partial<PipelineCustomField>) => {
    setPipelines((prev) => {
      const next = prev.map((p) => {
        if (!p.customFields?.some((f) => f.id === fieldId)) return p;
        const updatedFields = (p.customFields || []).map((f) => (f.id === fieldId ? { ...f, ...updates } : f));
        return { ...p, customFields: updatedFields, updatedAt: new Date().toISOString() };
      });
      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });
  };

  const deletePipelineCustomField = (fieldId: string) => {
    setPipelines((prev) => {
      const next = prev.map((p) => {
        if (!p.customFields?.some((f) => f.id === fieldId)) return p;
        const updatedFields = (p.customFields || []).filter((f) => f.id !== fieldId);
        return { ...p, customFields: updatedFields, updatedAt: new Date().toISOString() };
      });
      localStorage.setItem(`${STORAGE_KEY}_pipelines`, JSON.stringify(next));
      return next;
    });
  };

  // PRD 6.2: Fluxo Venda Ganha até Operação
  const markDealWon = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // Confetti effect!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F8A4B', '#2563EB', '#F59E0B', '#10B981'],
      });
    } catch {
      // ignore
    }

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              status: 'won',
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    addAuditLog('won_deal', 'deal', deal.id, `🎉 VENDA GANHA: Negócio "${deal.title}" fechado por R$ ${deal.value.toLocaleString('pt-BR')}`);

    // Automatic trigger: Create Client Account in Post-sales Pipeline
    let associatedCompanyId = deal.companyId;
    if (!associatedCompanyId) {
      // fallback create company from title/contact
      const contact = contacts.find((c) => c.id === deal.contactId);
      const newComp: Company = {
        id: `comp-${Date.now()}`,
        businessUnitId: deal.businessUnitId,
        corporateName: `${deal.title} (Cliente)`,
        tradeName: contact?.name ? `Empresa de ${contact.name}` : deal.title,
        cnpj: '00.000.000/0001-00',
        segment: 'Serviços',
        size: 'medium',
        email: contact?.email || 'contato@cliente.com.br',
        phone: contact?.phone || '+55 11 90000-0000',
        assignedUserId: deal.assignedUserId,
        status: 'active',
        healthScore: 'green',
        tags: ['Cliente Ativo', 'Venda Ganha'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCompanies((prev) => [...prev, newComp]);
      associatedCompanyId = newComp.id;
    }

    const newClient: ClientAccount = {
      id: `cli-${Date.now()}`,
      businessUnitId: deal.businessUnitId,
      companyId: associatedCompanyId,
      dealIdOrigin: deal.id,
      stage: 'onboarding',
      commercialManagerId: deal.assignedUserId,
      accountManagerId: 'usr-fernanda',
      operationalLeadId: 'usr-rodrigo',
      activeServices: [deal.serviceCategory || 'Serviço Integrado'],
      monthlyValue: Math.round(deal.value / 12) || deal.value,
      healthScore: 'green',
      healthReason: 'Novo cliente convertido. Onboarding iniciado automaticamente pelo sistema.',
      lastContactAt: new Date().toISOString(),
      onboardingProgress: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClientAccounts((prev) => [newClient, ...prev]);

    // Automatic trigger: Create Project with standardized Service Milestones
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      businessUnitId: deal.businessUnitId,
      name: `Projeto de Implantação - ${deal.title}`,
      code: `PRJ-${Date.now().toString().slice(-4)}`,
      clientId: newClient.id,
      dealId: deal.id,
      serviceCategory: deal.serviceCategory,
      managerId: 'usr-rodrigo',
      memberIds: [deal.assignedUserId, 'usr-fernanda', 'usr-rodrigo'],
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      status: 'in_progress',
      health: 'on_track',
      progressPercentage: 10,
      budget: deal.value,
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Kickoff de Onboarding & Coleta de Documentos', dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], completed: false },
        { id: `m-${Date.now()}-2`, title: 'Parametrização do Ambiente Operacional', dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], completed: false },
        { id: `m-${Date.now()}-3`, title: 'Treinamento de Equipes & Homologação', dueDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0], completed: false },
        { id: `m-${Date.now()}-4`, title: 'Go-Live Oficial & Transição para Recorrência', dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);

    // Automatic trigger: Create Kickoff Task
    const kickoffTask: Task = {
      id: `tsk-${Date.now()}`,
      businessUnitId: deal.businessUnitId,
      title: `Realizar Kickoff de Onboarding: ${deal.title}`,
      description: 'Agendar reunião inicial de alinhamento e enviar checklist de documentos obrigatórios.',
      status: 'pending',
      priority: 'urgent',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      estimatedHours: 4,
      spentHours: 0,
      assignedUserId: 'usr-fernanda',
      participantIds: [deal.assignedUserId, 'usr-rodrigo'],
      observerIds: ['usr-william'],
      projectId: newProject.id,
      dealId: deal.id,
      clientId: newClient.id,
      checklist: [
        { id: `chk-${Date.now()}-1`, text: 'Validar contrato assinado e dados cadastrais', completed: true },
        { id: `chk-${Date.now()}-2`, text: 'Criar grupo de WhatsApp do cliente ou canal de atendimento', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Apresentar gerente de contas e cronograma', completed: false },
      ],
      tags: ['Onboarding Automático', 'Kickoff'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [kickoffTask, ...prev]);

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '🎉 Venda Ganha & Onboarding Iniciado!',
      description: `Negócio "${deal.title}" ganho! Criado cliente, projeto operacional e tarefa de kickoff.`,
      time: 'Agora',
      read: false,
      type: 'automation',
      linkTab: 'clients-pipeline',
      linkId: newClient.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markDealLost = (dealId: string, reason: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              status: 'lost',
              lossReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    addAuditLog('update', 'deal', deal.id, `Negócio "${deal.title}" marcado como Perdido. Motivo: ${reason}`);
    addActivity({
      entityType: 'deal',
      entityId: deal.id,
      businessUnitId: deal.businessUnitId,
      userId: currentUser.id,
      type: 'status_change',
      title: 'Negócio Perdido / Descartado',
      description: `Motivo registrado: ${reason}`,
    });
  };

  const addDealDocument = (dealId: string, doc: Omit<DealDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newDoc: DealDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
    };
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              documents: [...(d.documents || []), newDoc],
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
    addAuditLog('update', 'deal_document', dealId, `Documento "${doc.name}" anexado ao negócio`);
    addActivity({
      entityType: 'deal',
      entityId: dealId,
      businessUnitId: currentBU.id === 'bu-all' ? 'bu-tech' : currentBU.id,
      userId: currentUser.id,
      type: 'file_upload',
      title: `Arquivo anexado: ${doc.name}`,
      description: `Tipo: ${doc.type.toUpperCase()} • Tamanho: ${doc.size}`,
    });
  };

  const linkContactToDeal = (dealId: string, contactId: string, role: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        const currentContacts = d.additionalContacts || [];
        if (currentContacts.some((c) => c.contactId === contactId)) return d;
        return {
          ...d,
          additionalContacts: [...currentContacts, { contactId, role }],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('update', 'deal_contact', dealId, `Contato vinculado ao negócio com papel "${role}"`);
  };

  const unlinkContactFromDeal = (dealId: string, contactId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return {
          ...d,
          additionalContacts: (d.additionalContacts || []).filter((c) => c.contactId !== contactId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('update', 'deal_contact', dealId, `Contato desvinculado do negócio`);
  };

  // Client Pipeline & Success
  const addClientAccount = (clientData: Omit<ClientAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: ClientAccount = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClientAccounts((prev) => [newClient, ...prev]);
    addAuditLog('create', 'client', newClient.id, `Conta de cliente cadastrada no pipeline pós-venda`);
  };

  const updateClientAccount = (id: string, updates: Partial<ClientAccount>) => {
    setClientAccounts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    addAuditLog('update', 'client', id, `Conta de cliente atualizada`);
  };

  const updateClientAccountStage = (id: string, stage: ClientAccountStage) => {
    setClientAccounts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage, updatedAt: new Date().toISOString() } : c))
    );
    const client = clientAccounts.find((c) => c.id === id);
    const comp = companies.find((cp) => cp.id === client?.companyId);
    const name = comp?.tradeName || id;
    addAuditLog('stage_change', 'client_account', id, `Cliente "${name}" movido para o estágio "${stage}" no Pipeline de Clientes`);
  };

  // Tasks & Operations Protocol Generator (VRG-YYYY-NNNNNN)
  const generateTaskProtocol = (businessUnitId?: string): string => {
    const currentYear = new Date().getFullYear();
    const yearTasksCount = tasks.filter((t) => t.createdAt?.startsWith(String(currentYear))).length + 1;
    const seqStr = String(yearTasksCount).padStart(6, '0');
    let prefix = 'VRG';
    if (businessUnitId) {
      const bu = businessUnits.find((b) => b.id === businessUnitId);
      if (bu && bu.code && bu.code !== 'ALL') {
        prefix = bu.code;
      }
    }
    return `${prefix}-${currentYear}-${seqStr}`;
  };

  const [jobExecutionLogs, setJobExecutionLogs] = useState<JobExecutionLog[]>([
    {
      id: 'job-log-1',
      jobName: 'task_crm_context_audit_job',
      startedAt: new Date(Date.now() - 900000).toISOString(),
      completedAt: new Date(Date.now() - 899800).toISOString(),
      tasksScanned: 14,
      tasksFlagged: 3,
      suggestionsCreated: 3,
      notificationsCreated: 3,
      status: 'success',
      durationMs: 200,
    },
    {
      id: 'job-log-2',
      jobName: 'task_sla_supervisor_job',
      startedAt: new Date(Date.now() - 450000).toISOString(),
      completedAt: new Date(Date.now() - 449750).toISOString(),
      tasksScanned: 18,
      tasksFlagged: 4,
      suggestionsCreated: 0,
      notificationsCreated: 2,
      status: 'success',
      durationMs: 250,
    },
  ]);

  const runCrmQualityAudit = () => {
    const unlinked = tasks.filter(
      (t) => t.status !== 'completed' && !t.clientId && !t.contactId && !t.dealId && !t.confirmedInternal
    );
    const needsReview = unlinked.filter((t) => t.crmAuditStatus === 'crm_suggested' || (t.title + ' ' + (t.description || '')).toLowerCase().includes('cliente') || (t.title + ' ' + (t.description || '')).toLowerCase().includes('empresa') || (t.title + ' ' + (t.description || '')).toLowerCase().includes('alfa'));
    const likelyInternal = unlinked.filter((t) => !needsReview.includes(t));

    return {
      totalUnlinked: unlinked.length,
      likelyInternal: likelyInternal.length,
      needsReview: needsReview.length,
      unlinkedTasks: unlinked,
    };
  };

  const runSlaSupervisorAudit = () => {
    let flaggedCount = 0;
    let notifCount = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return;
      const isOverdue = new Date(t.dueDate) < new Date();
      const hoursLeft = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);

      if (isOverdue || hoursLeft < 12) {
        flaggedCount++;
        notifCount++;
      }
    });

    return {
      scanned: tasks.filter((t) => t.status !== 'completed').length,
      flagged: flaggedCount,
      notificationsSent: notifCount,
    };
  };

  const runSlaTeamRisksAudit = () => {
    let attentionCount = 0;
    let riskCount = 0;
    let criticalCount = 0;
    let breachedCount = 0;
    let unlinkedCount = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return;
      const isOverdue = new Date(t.dueDate) < new Date();
      const hoursLeft = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);

      if (!t.clientId && !t.contactId && !t.dealId && !t.confirmedInternal) {
        unlinkedCount++;
      }

      if (isOverdue) {
        breachedCount++;
      } else if (hoursLeft < 4) {
        criticalCount++;
      } else if (hoursLeft < 12) {
        riskCount++;
      } else if (hoursLeft < 24) {
        attentionCount++;
      }
    });

    return {
      attentionCount,
      riskCount,
      criticalCount,
      breachedCount,
      unlinkedCount,
    };
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const protocolNumber = taskData.protocolNumber || generateTaskProtocol(taskData.businessUnitId);
    const hasCrmLink = Boolean(taskData.clientId || taskData.contactId || taskData.dealId);
    const taskContext = taskData.taskContext || (hasCrmLink ? 'client' : 'internal');

    // Simulate backend PL/pgSQL trigger `trg_tasks_crm_audit_event` execution
    const clientTerms = ['cliente', 'empresa', 'cnpj', 'cpf', 'notas', 'faturamento', 'contrato', 'cobrança', 'documentos', 'atendimento', 'alfa'];
    const fullText = (taskData.title + ' ' + (taskData.description || '')).toLowerCase();
    const isClientContextMatched = !hasCrmLink && !taskData.confirmedInternal && clientTerms.some((term) => fullText.includes(term));

    const matchedCompany = isClientContextMatched
      ? companies.find((c) => fullText.includes(c.name.toLowerCase())) || companies[0]
      : undefined;

    const newTask: Task = {
      ...taskData,
      protocolNumber,
      taskContext,
      creatorId: taskData.creatorId || currentUser.id,
      ownerUserId: taskData.ownerUserId || taskData.creatorId || currentUser.id,
      crmAuditStatus: isClientContextMatched ? 'crm_suggested' : 'pending',
      crmSuggestionEntityType: matchedCompany ? 'company' : undefined,
      crmSuggestionEntityId: matchedCompany?.id,
      crmSuggestionEntityName: matchedCompany?.name,
      crmSuggestionConfidence: isClientContextMatched ? 92 : undefined,
      crmSuggestionReason: isClientContextMatched ? `Identificado pelo Backend Event Trigger [trg_tasks_crm_audit_event]` : undefined,
      lastCrmAuditAt: isClientContextMatched ? new Date().toISOString() : undefined,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Persistent Audit Log with ActorContext = 'ai_agent'
    if (isClientContextMatched) {
      addAuditLog('create', 'task', newTask.id, `actor_type: ai_agent | actor_id: ver-ai-proactive-agent | action: task.crm_relation.suggested | details: Backend Trigger sugeriu vínculo com "${matchedCompany?.name || 'Cliente'}"`);
    } else {
      addAuditLog('create', 'task', newTask.id, `Tarefa "${newTask.title}" criada sob o protocolo [${protocolNumber}] (${taskContext === 'client' ? 'CRM Cliente' : 'Interna'})`);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    addAuditLog('update', 'task', id, `Tarefa atualizada`);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
    if (task) {
      addAuditLog('delete', 'task', id, `Tarefa "${task.title}" removida`);
    }
  };

  const toggleTaskStatus = (taskId: string, targetStatus?: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const newStatus: TaskStatus = targetStatus || (target.status === 'completed' ? 'pending' : 'completed');

    // Trava de Conclusão Obrigatória
    if (newStatus === 'completed' && target.requireCompletionSummary && !target.completionSummary) {
      alert(`⚠️ TRAVA DE GOVERNANÇA: A tarefa [${target.protocolNumber || target.id}] exige o Resumo Final de Conclusão antes de ser encerrada.`);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        addAuditLog('update', 'task', taskId, `actor_type: human_user | action: task.status.changed | details: Status alterado para ${newStatus}`);
        return {
          ...t,
          status: newStatus,
          isTimerRunning: newStatus === 'completed' ? false : t.isTimerRunning,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return {
          ...t,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addTimeSpent = (taskId: string, additionalHours: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentSpent = t.spentHours || 0;
        return {
          ...t,
          spentHours: Number((currentSpent + additionalHours).toFixed(1)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('update', 'task_time', taskId, `Apontamento de ${additionalHours}h adicionado à tarefa`);
  };

  const toggleTaskTimer = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isStarting = !targetTask.isTimerRunning;

    setTasks((prev) => {
      const runningTask = prev.find((t) => t.id !== taskId && t.isTimerRunning);
      if (isStarting && runningTask) {
        addAuditLog(
          'update',
          'task_timer',
          runningTask.id,
          `actor_type: human_user | action: task.timer.auto_paused | details: Cronômetro da tarefa [${runningTask.protocolNumber || runningTask.id}] pausado automaticamente no banco ao iniciar [${targetTask.protocolNumber || targetTask.id}]`
        );
      }

      return prev.map((t) => {
        if (t.id !== taskId) {
          // Pause any other running task timer (guaranteed max 1 running timer per user in PostgreSQL)
          return { ...t, isTimerRunning: false };
        }
        addAuditLog(
          'update',
          'task_timer',
          taskId,
          `actor_type: human_user | action: ${isStarting ? 'task.timer.started' : 'task.timer.paused'} | details: Cronômetro ${isStarting ? 'iniciado' : 'pausado'} para a tarefa [${t.protocolNumber || t.id}]`
        );
        return {
          ...t,
          isTimerRunning: isStarting,
          status: isStarting && (t.status === 'pending' || t.status === 'active') ? 'in_progress' : t.status,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  };

  // Timer interval ticker for active running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => {
        const hasRunning = prev.some((t) => t.isTimerRunning);
        if (!hasRunning) return prev;
        return prev.map((t) =>
          t.isTimerRunning
            ? {
                ...t,
                timerSeconds: (t.timerSeconds || 0) + 1,
                spentHours: Number((((t.timerSeconds || 0) + 1) / 3600).toFixed(2)),
              }
            : t
        );
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTaskComment = (taskId: string, commentText: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newComment = {
          id: `cmt-${Date.now()}`,
          userId: currentUser.id,
          text: commentText,
          createdAt: new Date().toISOString(),
        };
        return {
          ...t,
          comments: [...(t.comments || []), newComment],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('create', 'task_comment', taskId, `Comentário adicionado à tarefa`);
  };

  const addTaskTemplate = (templateData: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
      createdByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setTaskTemplates((prev) => [newTemplate, ...prev]);
    addAuditLog('create', 'task_template', newTemplate.id, `Modelo de tarefa "${newTemplate.title}" criado com sucesso`);
  };

  const updateTaskTemplate = (id: string, updates: Partial<TaskTemplate>) => {
    setTaskTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addAuditLog('update', 'task_template', id, `Modelo de tarefa atualizado`);
  };

  const deleteTaskTemplate = (id: string) => {
    setTaskTemplates((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('delete', 'task_template', id, `Modelo de tarefa removido`);
  };

  // Projects
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    addAuditLog('create', 'project', newProj.id, `Projeto "${newProj.name}" iniciado`);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    addAuditLog('update', 'project', id, `Projeto atualizado`);
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMilestones = (p.milestones || []).map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const autoProgress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

        return {
          ...p,
          milestones: updatedMilestones,
          progressPercentage: autoProgress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (project) {
      addAuditLog('delete', 'project', id, `Projeto "${project.name}" removido`);
    }
  };

  const addMilestone = (projectId: string, title: string, dueDate: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newMilestone = {
          id: `m-${Date.now()}`,
          title,
          dueDate,
          completed: false,
        };
        const updatedMilestones = [...(p.milestones || []), newMilestone];
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const autoProgress = Math.round((completedCount / updatedMilestones.length) * 100);

        return {
          ...p,
          milestones: updatedMilestones,
          progressPercentage: autoProgress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('update', 'project', projectId, `Novo marco "${title}" adicionado ao projeto`);
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMilestones = (p.milestones || []).filter((m) => m.id !== milestoneId);
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const autoProgress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

        return {
          ...p,
          milestones: updatedMilestones,
          progressPercentage: autoProgress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('update', 'project', projectId, `Marco removido do projeto`);
  };

  // Calendar
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    addAuditLog('create', 'calendar_event', newEvent.id, `Evento "${newEvent.title}" adicionado à agenda`);
  };

  const updateEventStatus = (eventId: string, userId: string, status: 'pending' | 'accepted' | 'declined' | 'tentative') => {
    setCalendarEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            updatedAt: new Date().toISOString(),
            attendees: evt.attendees.map((att) =>
              att.userId === userId ? { ...att, status } : att
            ),
          };
        }
        return evt;
      })
    );
    addAuditLog('update', 'calendar_event', eventId, `Status de convite atualizado para ${status}`);
  };

  const checkAvailability = (userIds: string[], start: string, end: string): 'available' | 'partial' | 'busy' => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let conflictCount = 0;

    const relevantEvents = calendarEvents.filter(evt => evt.status === 'scheduled');

    for (const userId of userIds) {
      const hasConflict = relevantEvents.some(evt => {
        // Check if user is organizer or accepted attendee
        const isParticipant = evt.organizerId === userId || evt.attendees.some(a => a.userId === userId && a.status === 'accepted');
        if (!isParticipant) return false;

        const evtStart = new Date(evt.start);
        const evtEnd = new Date(evt.end);
        
        // Conflict logic: overlap
        return startDate < evtEnd && endDate > evtStart;
      });

      if (hasConflict) conflictCount++;
    }

    if (conflictCount === 0) return 'available';
    if (conflictCount < userIds.length) return 'partial';
    return 'busy';
  };

  const cancelEvent = (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, status: 'cancelled', updatedAt: new Date().toISOString() } : evt
      )
    );
    addAuditLog('update', 'calendar_event', eventId, `Evento cancelado`);
  };

  // Communication: Chat
  const sendChatMessage = (channelId: string, text: string, attachments?: { name: string; size: string; url: string }[]) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      text,
      attachments,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Update last message on channel
    setChatChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c
      )
    );
  };

  const addChatReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ? [...m.reactions] : [];
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (existing.userIds.includes(currentUser.id)) {
            existing.userIds = existing.userIds.filter((u) => u !== currentUser.id);
            existing.count -= 1;
          } else {
            existing.userIds.push(currentUser.id);
            existing.count += 1;
          }
        } else {
          reactions.push({ emoji, count: 1, userIds: [currentUser.id] });
        }
        return { ...m, reactions: reactions.filter((r) => r.count > 0) };
      })
    );
  };

  const [previousTab, setPreviousTab] = useState<string>('cockpit');

  const getOrCreateDirectChannel = (targetUserId: string): string => {
    const existing = chatChannels.find(
      (c) => c.type === 'direct' && c.memberIds.includes(currentUser.id) && c.memberIds.includes(targetUserId)
    );
    if (existing) {
      return existing.id;
    }
    const targetUser = users.find((u) => u.id === targetUserId);
    const newChan: ChatChannel = {
      id: `chan-direct-${currentUser.id}-${targetUserId}`,
      name: targetUser?.name || 'Chat Direto',
      type: 'direct',
      memberIds: [currentUser.id, targetUserId],
      businessUnitId: targetUser?.businessUnitId || selectedBusinessUnitId,
      unreadCount: 0,
      lastMessage: 'Conversa iniciada',
      lastMessageAt: new Date().toISOString(),
    };
    setChatChannels((prev) => [newChan, ...prev]);
    return newChan.id;
  };

  const createGroupChannel = (data: {
    name: string;
    description?: string;
    businessUnitId: string;
    privacy: 'private' | 'business_unit';
    memberIds: string[];
    adminIds?: string[];
    avatarUrl?: string;
  }): ChatChannel => {
    const finalMembers = Array.from(new Set([currentUser.id, ...data.memberIds]));
    const finalAdmins = Array.from(new Set([currentUser.id, ...(data.adminIds || [])]));

    const newGroup: ChatChannel = {
      id: `grp-${Date.now()}`,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      type: 'group',
      businessUnitId: data.businessUnitId || selectedBusinessUnitId,
      privacy: data.privacy || 'private',
      isPrivate: data.privacy === 'private',
      memberIds: finalMembers,
      adminIds: finalAdmins,
      avatarUrl: data.avatarUrl || undefined,
      status: 'active',
      createdById: currentUser.id,
      createdAt: new Date().toISOString(),
      unreadCount: 0,
      lastMessage: `Grupo criado por ${currentUser.name}`,
      lastMessageAt: new Date().toISOString(),
    };

    setChatChannels((prev) => [newGroup, ...prev]);
    setActiveChatChannelId(newGroup.id);
    addAuditLog('create', 'chat_group', newGroup.id, `Grupo de conversa "${newGroup.name}" criado (${finalMembers.length} membros)`);
    return newGroup;
  };

  const updateGroupChannel = (channelId: string, updates: Partial<ChatChannel>) => {
    setChatChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, ...updates } : c))
    );
    addAuditLog('update', 'chat_group', channelId, `Grupo de conversa atualizado`);
  };

  const addGroupMember = (channelId: string, userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setChatChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        if (c.memberIds.includes(userId)) return c;
        return { ...c, memberIds: [...c.memberIds, userId] };
      })
    );
    addAuditLog('update', 'chat_group', channelId, `Adicionado membro "${targetUser?.name || userId}" ao grupo`);
  };

  const removeGroupMember = (channelId: string, userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setChatChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        const updatedMembers = c.memberIds.filter((id) => id !== userId);
        const updatedAdmins = (c.adminIds || []).filter((id) => id !== userId);
        return { ...c, memberIds: updatedMembers, adminIds: updatedAdmins };
      })
    );
    addAuditLog('update', 'chat_group', channelId, `Removido membro "${targetUser?.name || userId}" do grupo`);
  };

  const promoteGroupAdmin = (channelId: string, userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setChatChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        const admins = c.adminIds || [];
        if (admins.includes(userId)) return c;
        return { ...c, adminIds: [...admins, userId] };
      })
    );
    addAuditLog('update', 'chat_group', channelId, `Promovido "${targetUser?.name || userId}" a Administrador do Grupo`);
  };

  const demoteGroupAdmin = (channelId: string, userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setChatChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        const admins = c.adminIds || [];
        if (admins.length <= 1 && admins.includes(userId)) {
          alert('⚠️ O grupo deve manter pelo menos um Administrador.');
          return c;
        }
        return { ...c, adminIds: admins.filter((id) => id !== userId) };
      })
    );
    addAuditLog('update', 'chat_group', channelId, `Removida função administrativa de "${targetUser?.name || userId}" no grupo`);
  };

  const archiveGroupChannel = (channelId: string) => {
    setChatChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, status: 'archived' } : c))
    );
    addAuditLog('archive', 'chat_group', channelId, `Grupo arquivado`);
  };

  const leaveGroupChannel = (channelId: string) => {
    removeGroupMember(channelId, currentUser.id);
  };

  // Communication: Email
  const sendEmail = (toEmail: string, subject: string, body: string, relatedDealId?: string, relatedProjectId?: string, relatedTaskId?: string) => {
    const newEmail: EmailMessage = {
      id: `eml-${Date.now()}`,
      businessUnitId: selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId,
      from: { name: currentUser.name, email: currentUser.email },
      to: [{ name: toEmail.split('@')[0], email: toEmail }],
      subject,
      body,
      snippet: body.slice(0, 100) + '...',
      folder: 'sent',
      isRead: true,
      starred: false,
      hasAttachments: false,
      relatedDealId,
      relatedProjectId,
      relatedTaskId,
      receivedAt: new Date().toISOString(),
    };
    setEmails((prev) => [newEmail, ...prev]);
    addAuditLog('create', 'email', newEmail.id, `E-mail enviado para "${toEmail}": "${subject}"`);

    if (relatedDealId) {
      addActivity({
        entityType: 'deal',
        entityId: relatedDealId,
        businessUnitId: currentBU.id === 'bu-all' ? 'bu-tech' : currentBU.id,
        userId: currentUser.id,
        type: 'email',
        title: `E-mail enviado: ${subject}`,
        description: `Para: ${toEmail} • ${body.slice(0, 120)}...`,
      });
    }
  };

  const markEmailRead = (emailId: string) => {
    setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, isRead: true } : e)));
  };

  const toggleEmailStar = (emailId: string) => {
    setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, starred: !e.starred } : e)));
  };

  // Communication: WhatsApp
  const sendWhatsAppMessage = (conversationId: string, text: string) => {
    const msgId = `wmsg-${Date.now()}`;
    const newMsgItem = {
      id: msgId,
      sender: 'user' as const,
      text,
      timestamp: new Date().toISOString(),
      status: 'delivered' as const,
    };

    setWhatsApps((prev) =>
      prev.map((w) =>
        w.id === conversationId
          ? {
              ...w,
              lastMessage: text,
              lastMessageAt: new Date().toISOString(),
              messages: [...w.messages, newMsgItem],
            }
          : w
      )
    );

    // Auto simulated response after 2.5s
    setTimeout(() => {
      setWhatsApps((prev) =>
        prev.map((w) => {
          if (w.id !== conversationId) return w;
          const reply = {
            id: `wmsg-reply-${Date.now()}`,
            sender: 'contact' as const,
            text: 'Entendido! Obrigado pela rápida resposta pelo VERGROUP.',
            timestamp: new Date().toISOString(),
            status: 'read' as const,
          };
          return {
            ...w,
            lastMessage: reply.text,
            lastMessageAt: reply.timestamp,
            messages: [...w.messages, reply],
          };
        })
      );
    }, 2500);
  };

  const changeWhatsAppStatus = (conversationId: string, status: 'waiting' | 'in_progress' | 'closed') => {
    setWhatsApps((prev) =>
      prev.map((w) => (w.id === conversationId ? { ...w, status } : w))
    );
  };

  // Automations
  const triggerAutomationSimulation = (ruleId: string) => {
    const rule = automations.find((r) => r.id === ruleId);
    if (!rule) return;

    setAutomations((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              runsCount: r.runsCount + 1,
              lastRunAt: new Date().toISOString(),
              lastStatus: 'success',
            }
          : r
      )
    );

    addAuditLog('create', 'automation_run', ruleId, `Automação "${rule.name}" executada com sucesso.`);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `⚡ Automação Executada: ${rule.name}`,
      description: `Regra acionada e ações executadas perfeitamente.`,
      time: 'Agora',
      read: false,
      type: 'automation',
      linkTab: 'mgmt-automations',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomations((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Collaborator & Invite Management Mutations
  const createInvite = (data: Partial<CollaboratorInvite>): CollaboratorInvite => {
    const token = `inv_${data.type || 'sec'}_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const newInvite: CollaboratorInvite = {
      id: `inv-${Date.now()}`,
      type: data.type || 'link',
      email: data.email,
      phone: data.phone,
      name: data.name,
      token,
      businessUnitId: data.businessUnitId || selectedBusinessUnitId || 'bu-tech',
      departmentId: data.departmentId || 'dep-product',
      teamId: data.teamId,
      jobTitle: data.jobTitle || 'Colaborador',
      role: data.role || 'collaborator',
      managerId: data.managerId || currentUser.id,
      status: data.status || 'pending',
      expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: data.maxUses || 1,
      usedCount: 0,
      isExternal: data.isExternal || false,
      externalAccessDays: data.externalAccessDays,
      accessExpiresAt: data.accessExpiresAt,
      allowedResourceIds: data.allowedResourceIds,
      invitedByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvites((prev) => [newInvite, ...prev]);
    addAuditLog('create', 'CollaboratorInvite', newInvite.id, `actor_type: human_user | action: user.invited | type: ${newInvite.type} | email: ${newInvite.email || 'link'}`);
    return newInvite;
  };

  const revokeInvite = (inviteId: string) => {
    setInvites((prev) =>
      prev.map((inv) =>
        inv.id === inviteId ? { ...inv, status: 'revoked', updatedAt: new Date().toISOString() } : inv
      )
    );
    addAuditLog('update', 'CollaboratorInvite', inviteId, `actor_type: human_user | action: user.invite.revoked`);
  };

  const resendInvite = (inviteId: string) => {
    setInvites((prev) =>
      prev.map((inv) =>
        inv.id === inviteId
          ? {
              ...inv,
              status: 'pending',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : inv
      )
    );
    addAuditLog('update', 'CollaboratorInvite', inviteId, `actor_type: human_user | action: user.invited | resend: true`);
  };

  const acceptInvite = (token: string, name?: string, _password?: string) => {
    const invite = invites.find((inv) => inv.token === token);
    if (!invite) return;

    setInvites((prev) =>
      prev.map((inv) =>
        inv.id === invite.id
          ? {
              ...inv,
              usedCount: inv.usedCount + 1,
              status: inv.usedCount + 1 >= (inv.maxUses || 1) ? 'accepted' : 'pending',
              updatedAt: new Date().toISOString(),
            }
          : inv
      )
    );

    const existingUser = users.find((u) => u.email.toLowerCase() === (invite.email || '').toLowerCase());
    if (!existingUser) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name || invite.name || 'Novo Colaborador',
        email: invite.email || `colaborador_${Date.now()}@vergroup.com.br`,
        avatar: '',
        role: invite.role,
        businessUnitIds: [invite.businessUnitId],
        primaryBusinessUnitId: invite.businessUnitId,
        departmentId: invite.departmentId,
        teamId: invite.teamId,
        jobTitle: invite.jobTitle,
        phone: invite.phone || '+55 92 99000-0000',
        managerId: invite.managerId,
        status: 'active',
        isExternal: invite.isExternal,
        accessExpiresAt: invite.accessExpiresAt,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);

      const dept = departments.find((d) => d.id === invite.departmentId);
      const defaultTasks: OnboardingTask[] = [
        {
          id: `onb-${Date.now()}-1`,
          userId: newUser.id,
          userName: newUser.name,
          title: 'Configurar Perfil & Credenciais no VERGROUP',
          description: 'Completar foto de perfil, dados de contato e preferências no cockpit.',
          departmentId: newUser.departmentId,
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: `onb-${Date.now()}-2`,
          userId: newUser.id,
          userName: newUser.name,
          title: `Entrar nos canais de comunicação de ${dept?.name || 'Departamento'}`,
          description: 'Acessar canais internos do WhatsApp e Chat do departamento.',
          departmentId: newUser.departmentId,
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: `onb-${Date.now()}-3`,
          userId: newUser.id,
          userName: newUser.name,
          title: 'Leitura de Procedimentos & SLA Interno',
          description: 'Revisar manual de conduta, diretrizes e regras da unidade.',
          departmentId: newUser.departmentId,
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];

      setOnboardingTasks((prev) => [...defaultTasks, ...prev]);
      addAuditLog('create', 'User', newUser.id, `actor_type: human_user | action: user.invite.accepted | bu: ${invite.businessUnitId} | dept: ${invite.departmentId}`);
    }
  };

  const createUserDirectly = (userData: Partial<User>, sendInviteImmediately: boolean): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Novo Colaborador',
      email: userData.email || '',
      avatar: userData.avatar || '',
      role: userData.role || 'collaborator',
      businessUnitIds: userData.businessUnitIds || [userData.primaryBusinessUnitId || selectedBusinessUnitId || 'bu-tech'],
      primaryBusinessUnitId: userData.primaryBusinessUnitId || selectedBusinessUnitId || 'bu-tech',
      departmentId: userData.departmentId || 'dep-product',
      teamId: userData.teamId,
      jobTitle: userData.jobTitle || 'Analista',
      phone: userData.phone || '+55 92 99000-0000',
      managerId: userData.managerId || currentUser.id,
      status: sendInviteImmediately ? 'active' : 'invited',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);

    if (!sendInviteImmediately) {
      createInvite({
        type: 'direct',
        email: newUser.email,
        name: newUser.name,
        businessUnitId: newUser.primaryBusinessUnitId,
        departmentId: newUser.departmentId,
        teamId: newUser.teamId,
        jobTitle: newUser.jobTitle,
        role: newUser.role,
        managerId: newUser.managerId,
        status: 'invite_not_sent',
      });
    } else {
      addAuditLog('create', 'User', newUser.id, `actor_type: human_user | action: user.created | direct: true`);
    }

    return newUser;
  };

  const addDepartment = (data: { name: string; businessUnitId: string; leaderId?: string }): Department => {
    const newDept: Department = {
      id: `dep-${Date.now()}`,
      name: data.name,
      businessUnitId: data.businessUnitId,
      leaderId: data.leaderId || currentUser.id,
    };
    setDepartments((prev) => [...prev, newDept]);
    addAuditLog('create', 'Department', newDept.id, `actor_type: human_user | action: user.department.assigned | name: ${newDept.name}`);
    return newDept;
  };

  const addTeam = (data: { name: string; departmentId: string; businessUnitId: string; leaderId?: string }): Team => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: data.name,
      departmentId: data.departmentId,
      businessUnitId: data.businessUnitId,
      leaderId: data.leaderId || currentUser.id,
    };
    setTeams((prev) => [...prev, newTeam]);
    addAuditLog('create', 'Team', newTeam.id, `actor_type: human_user | action: user.team.assigned | name: ${newTeam.name}`);
    return newTeam;
  };

  const addBusinessUnit = (unit: Omit<BusinessUnit, 'id' | 'createdAt'>) => {
    const newBu: BusinessUnit = {
      ...unit,
      id: `bu-${Date.now()}`,
      color: unit.color || '#0F8A4B',
      tradeName: unit.tradeName || unit.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBusinessUnits((prev) => [...prev, newBu]);
    addAuditLog('create', 'BusinessUnit', newBu.id, `Empresa do grupo criada: ${newBu.tradeName || newBu.name} (${newBu.cnpj}) por ${currentUser.name}`);
  };

  const updateUserStatus = (userId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    addAuditLog('update', 'user_status', userId, `Status do usuário alterado para ${newStatus} por ${currentUser.name}`);
  };

  const reassignUserTasks = (fromUserId: string, toUserId: string): { reassignedCount: number } => {
    let count = 0;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.assignedUserId === fromUserId && t.status !== 'completed') {
          count++;
          return { ...t, assignedUserId: toUserId };
        }
        return t;
      })
    );
    addAuditLog('update', 'tasks_reassign', fromUserId, `Transferência em lote de ${count} tarefas de ${fromUserId} para ${toUserId}`);
    return { reassignedCount: count };
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const addImportJob = (job: Omit<ImportJob, 'id' | 'createdAt' | 'updatedAt'>): ImportJob => {
    const newJob: ImportJob = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setImportJobs((prev) => [...prev, newJob]);
    return newJob;
  };

  const value: AppContextType = {
    isTaskCreateOpen,
    setIsTaskCreateOpen,
    taskCreateContext,
    openTaskCreate,
    closeTaskCreate,
    isAuthenticated,
    login,
    loginAsUser,
    logout,
    currentTab,
    setCurrentTab,
    selectedBusinessUnitId,
    setSelectedBusinessUnitId,
    currentBU,
    currentUser,
    setCurrentUser,
    updateCurrentUserProfile,
    requestCurrentUserEmailChange,
    userRole: currentUser.role,
    switchUserRole,
    isSearchOpen,
    setIsSearchOpen,
    quickCreateType,
    setQuickCreateType,
    selectedDealId,
    setSelectedDealId,
    selectedTaskId,
    setSelectedTaskId,
    selectedContactId,
    setSelectedContactId,
    selectedClientId,
    setSelectedClientId,
    businessUnits,
    departments,
    teams,
    users,
    setUsers,
    invites,
    onboardingTasks,
    leads,
    contacts,
    companies,
    pipelines,
    deals,
    activities,
    clientAccounts,
    tasks,
    projects,
    calendarEvents,
    chatChannels,
    chatMessages,
    emails,
    whatsApps,
    automations,
    auditLogs,
    catalogItems,
    setCatalogItems,
    importJobs,
    addImportJob,
    notifications,
    filterByBU,
    createInvite,
    revokeInvite,
    resendInvite,
    acceptInvite,
    createUserDirectly,
    addBusinessUnit,
    updateUserStatus,
    reassignUserTasks,
    addDepartment,
    addTeam,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToDeal,
    addContact,
    updateContact,
    deleteContact,
    checkDuplicate,
    addCompany,
    updateCompany,
    addDeal,
    updateDeal,
    moveDealStage,
    markDealWon,
    markDealLost,
    addDealDocument,
    linkContactToDeal,
    unlinkContactFromDeal,
    addPipeline,
    updatePipeline,
    duplicatePipeline,
    archivePipeline,
    deletePipeline,
    addPipelineStage,
    updatePipelineStage,
    reorderPipelineStages,
    deletePipelineStage,
    addPipelineCustomField,
    updatePipelineCustomField,
    deletePipelineCustomField,
    addClientAccount,
    updateClientAccount,
    updateClientAccountStage,
    generateTaskProtocol,
    runCrmQualityAudit,
    jobExecutionLogs,
    runSlaSupervisorAudit,
    runSlaTeamRisksAudit,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleChecklistItem,
    toggleTaskTimer,
    addTimeSpent,
    addTaskComment,
    taskTemplates,
    addTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    addProject,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    addCalendarEvent,
    updateEventStatus,
    checkAvailability,
    cancelEvent,
    activeChatChannelId,
    setActiveChatChannelId,
    sendChatMessage,
    addChatReaction,
    getOrCreateDirectChannel,
    createGroupChannel,
    updateGroupChannel,
    addGroupMember,
    removeGroupMember,
    promoteGroupAdmin,
    demoteGroupAdmin,
    archiveGroupChannel,
    leaveGroupChannel,
    previousTab,
    setPreviousTab,
    emailAccountConfig,
    saveEmailAccountConfig,
    sendEmail,
    markEmailRead,
    toggleEmailStar,
    sendWhatsAppMessage,
    changeWhatsAppStatus,
    triggerAutomationSimulation,
    toggleAutomationRule,
    addActivity,
    addAuditLog,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
