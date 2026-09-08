import {
  BusinessUnit,
  Department,
  Team,
  CollaboratorInvite,
  OnboardingTask,
  User,
  Lead,
  Contact,
  Company,
  Pipeline,
  Deal,
  Activity,
  ClientAccount,
  Task,
  Project,
  CalendarEvent,
  ChatChannel,
  ChatMessage,
  EmailMessage,
  WhatsAppConversation,
  AutomationRule,
  AuditLog,
  CatalogItem,
  ImportJob,
} from '../types';

export const INITIAL_BUSINESS_UNITS: BusinessUnit[] = [];

export const INITIAL_DEPARTMENTS: Department[] = [];

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-william',
    name: 'William Barbosa',
    firstName: 'William',
    lastName: 'Barbosa',
    displayName: 'William',
    email: 'williambdesigner@gmail.com',
    personalEmail: '',
    avatar: '',
    role: 'superadmin',
    businessUnitIds: [],
    primaryBusinessUnitId: '',
    departmentId: '',
    jobTitle: 'Diretor de Produto & Tecnologia',
    phone: '+55 92 98282-4592',
    whatsapp: '+55 92 98282-4592',
    alternatePhone: '',
    emergencyContactName: '',
    emergencyContact: '',
    city: 'Manaus',
    state: 'AM',
    country: 'Brasil',
    language: 'Português (Brasil)',
    timezone: 'America/Manaus',
    status: 'active',
    employeeCode: 'VG-0001',
    notificationPreferences: {
      email: true,
      push: true,
      taskDigest: true,
      meetingReminders: true,
    },
    createdAt: '2026-01-01T08:00:00Z',
  }
];

export const INITIAL_INVITES: CollaboratorInvite[] = [];

export const INITIAL_ONBOARDING_TASKS: OnboardingTask[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_PIPELINES: Pipeline[] = [];

export const INITIAL_DEALS: Deal[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_EMAILS: EmailMessage[] = [];

export const INITIAL_WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [];

export const INITIAL_IMPORT_JOBS: ImportJob[] = [];
