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

export const EMPTY_USER: User = {
  id: '',
  name: '',
  firstName: '',
  lastName: '',
  displayName: '',
  email: '',
  personalEmail: '',
  avatar: '',
  role: 'superadmin',
  businessUnitIds: [],
  primaryBusinessUnitId: '',
  departmentId: '',
  jobTitle: '',
  phone: '',
  whatsapp: '',
  alternatePhone: '',
  emergencyContactName: '',
  emergencyContact: '',
  city: '',
  state: '',
  country: '',
  language: '',
  timezone: '',
  status: 'inactive',
  employeeCode: '',
  notificationPreferences: {
    email: false,
    push: false,
    taskDigest: false,
    meetingReminders: false,
  },
  createdAt: '',
};

export const INITIAL_USERS: User[] = [];

export const INITIAL_INVITES: CollaboratorInvite[] = [];

export const INITIAL_ONBOARDING_TASKS: OnboardingTask[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-ver-clientes',
    businessUnitId: 'bu-tech',
    name: 'Captação & Vendas (Funil Comercial)',
    code: 'pipe_vendas_comercial',
    description: 'Pipeline principal de prospecção, qualificação e fechamento de novos contratos.',
    type: 'sales',
    status: 'active',
    isDefault: true,
    stages: [
      { id: 'stg-new-01', name: 'Novo Lead / Oportunidade', order: 1, color: '#3B82F6', probability: 10, stageType: 'initial' },
      { id: 'stg-qual-01', name: 'Qualificado / Contato Feito', order: 2, color: '#0F8A4B', probability: 30, stageType: 'intermediate' },
      { id: 'stg-diag-01', name: 'Diagnóstico & Reunião', order: 3, color: '#8B5CF6', probability: 50, stageType: 'intermediate' },
      { id: 'stg-prop-01', name: 'Proposta Enviada', order: 4, color: '#F59E0B', probability: 70, stageType: 'intermediate' },
      { id: 'stg-neg-01', name: 'Negociação Contratual', order: 5, color: '#EC4899', probability: 85, stageType: 'intermediate' },
      { id: 'stg-won-01', name: 'Ganhou / Contrato Fechado', order: 6, color: '#10B981', probability: 100, stageType: 'won' },
      { id: 'stg-lost-01', name: 'Perdeu / Cancelado', order: 7, color: '#EF4444', probability: 0, stageType: 'lost' },
    ],
  },
  {
    id: 'pipe-onboarding',
    businessUnitId: 'bu-tech',
    name: 'Onboarding & Implantação Pós-Venda',
    code: 'pipe_onboarding_posvenda',
    description: 'Pipeline de boas-vindas, coleta de certidões e ativação operacional do cliente.',
    type: 'onboarding',
    status: 'active',
    stages: [
      { id: 'stg-onb-01', name: 'Recepção & Boas-Vindas', order: 1, color: '#0EA5E9', probability: 20, stageType: 'initial' },
      { id: 'stg-onb-02', name: 'Coleta de Documentos & Certidões', order: 2, color: '#6366F1', probability: 40, stageType: 'intermediate' },
      { id: 'stg-onb-03', name: 'Configuração de Sistemas & Fiscais', order: 3, color: '#14B8A6', probability: 70, stageType: 'intermediate' },
      { id: 'stg-onb-04', name: 'Treinamento de Equipe & Setup', order: 4, color: '#F59E0B', probability: 90, stageType: 'intermediate' },
      { id: 'stg-onb-won', name: 'Onboarding Concluído com Sucesso', order: 5, color: '#10B981', probability: 100, stageType: 'won' },
    ],
  },
  {
    id: 'pipe-renovacao',
    businessUnitId: 'bu-tech',
    name: 'Renovação & Expansão (Upsell)',
    code: 'pipe_renovacao_upsell',
    description: 'Pipeline de acompanhamento de renovações anuais e vendas adicionais para a base.',
    type: 'client_success',
    status: 'active',
    stages: [
      { id: 'stg-ren-01', name: 'Mapeamento de Oportunidades', order: 1, color: '#3B82F6', probability: 20, stageType: 'initial' },
      { id: 'stg-ren-02', name: 'Proposta de Expansão / Reajuste', order: 2, color: '#8B5CF6', probability: 60, stageType: 'intermediate' },
      { id: 'stg-ren-won', name: 'Renovação / Upsell Confirmado', order: 3, color: '#10B981', probability: 100, stageType: 'won' },
    ],
  }
];

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
