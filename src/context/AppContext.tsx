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
  Deal,
  DealDocument,
  Activity,
  ClientAccount,
  Task,
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
} from '../mock/initialData';

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
  | 'admin-org';

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

interface AppContextType {
  // Navigation & Multi-company
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedBusinessUnitId: string;
  setSelectedBusinessUnitId: (buId: string) => void;
  currentBU: BusinessUnit;
  currentUser: User;
  setCurrentUser: (user: User) => void;
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

  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; duplicateWarning?: string };
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  checkDuplicate: (email: string, phone: string, document?: string, excludeId?: string) => string | null;

  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;

  addDeal: (deal: Omit<Deal, 'id' | 'stageChangedAt' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  moveDealStage: (dealId: string, targetStageId: string) => void;
  markDealWon: (dealId: string) => void;
  markDealLost: (dealId: string, reason: string) => void;
  addDealDocument: (dealId: string, doc: Omit<DealDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  linkContactToDeal: (dealId: string, contactId: string, role: string) => void;
  unlinkContactFromDeal: (dealId: string, contactId: string) => void;

  addClientAccount: (client: Omit<ClientAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClientAccount: (id: string, updates: Partial<ClientAccount>) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (taskId: string, status?: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  toggleTaskTimer: (taskId: string) => void;
  addTimeSpent: (taskId: string, additionalHours: number) => void;
  addTaskComment: (taskId: string, content: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, title: string, dueDate: string) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;

  sendChatMessage: (channelId: string, text: string, attachments?: { name: string; size: string; url: string }[]) => void;
  addChatReaction: (messageId: string, emoji: string) => void;

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
  addAuditLog: (action: AuditLog['action'], entity: string, entityId: string, details: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'vergroup_sig_v3_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('cockpit');
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState<string>('bu-all');
  
  // Active User & RBAC
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // William (superadmin)
  
  // Drawers & Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickCreateType, setQuickCreateType] = useState<'lead' | 'contact' | 'company' | 'deal' | 'task' | 'event' | 'project' | null>(null);
  
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Core Data Collections with LocalStorage hydration
  const [businessUnits] = useState<BusinessUnit[]>(INITIAL_BUSINESS_UNITS);
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
  const [activeChatChannelId, setActiveChatChannelId] = useState<string>('chan-silvestre');
  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_emails`);
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });
  const [whatsApps, setWhatsApps] = useState<WhatsAppConversation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_whatsapps`);
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_CONVERSATIONS;
  });
  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_automations`);
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
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
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${STORAGE_KEY}_clientAccounts`, JSON.stringify(clientAccounts));
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${STORAGE_KEY}_emails`, JSON.stringify(emails));
    localStorage.setItem(`${STORAGE_KEY}_whatsApps`, JSON.stringify(whatsApps));
    localStorage.setItem(`${STORAGE_KEY}_chatMessages`, JSON.stringify(chatMessages));
  }, [users, departments, teams, invites, onboardingTasks, leads, contacts, companies, deals, tasks, projects, clientAccounts, activities, auditLogs, emails, whatsApps, chatMessages]);

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

  const currentBU = businessUnits.find((b) => b.id === selectedBusinessUnitId) || businessUnits[0];

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

  const addAuditLog = (action: AuditLog['action'], entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      businessUnitId: selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entity,
      entityId,
      details,
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
    return { success: true };
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
  const addDeal = (dealData: Omit<Deal, 'id' | 'stageChangedAt' | 'createdAt' | 'updatedAt'>) => {
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

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stageId: targetStageId,
              stageChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    addAuditLog('stage_change', 'deal', dealId, `Negócio "${deal.title}" movido para a etapa "${stageName}"`);
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

  // Tasks & Operations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addAuditLog('create', 'task', newTask.id, `Tarefa "${newTask.title}" criada`);
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
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newStatus: TaskStatus = targetStatus || (t.status === 'completed' ? 'pending' : 'completed');
        addAuditLog('update', 'task', taskId, `Status da tarefa "${t.title}" alterado para ${newStatus}`);
        return {
          ...t,
          status: newStatus,
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
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) {
          // If starting another task timer, pause other timers
          return { ...t, isTimerRunning: false };
        }
        const nextRunning = !t.isTimerRunning;
        addAuditLog('update', 'task_timer', taskId, nextRunning ? `Cronômetro iniciado para a tarefa "${t.title}"` : `Cronômetro pausado`);
        return {
          ...t,
          isTimerRunning: nextRunning,
          status: nextRunning && t.status === 'pending' ? 'in_progress' : t.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
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
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    addAuditLog('create', 'calendar_event', newEvent.id, `Evento "${newEvent.title}" adicionado à agenda`);
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
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
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
      avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80`,
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

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const value: AppContextType = {
    currentTab,
    setCurrentTab,
    selectedBusinessUnitId,
    setSelectedBusinessUnitId,
    currentBU,
    currentUser,
    setCurrentUser,
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
    notifications,
    filterByBU,
    createInvite,
    revokeInvite,
    resendInvite,
    acceptInvite,
    createUserDirectly,
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
    addClientAccount,
    updateClientAccount,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleChecklistItem,
    toggleTaskTimer,
    addTimeSpent,
    addTaskComment,
    addProject,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    addCalendarEvent,
    activeChatChannelId,
    setActiveChatChannelId,
    sendChatMessage,
    addChatReaction,
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
