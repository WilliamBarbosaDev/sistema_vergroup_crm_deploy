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
} from '../types';

export const INITIAL_BUSINESS_UNITS: BusinessUnit[] = [
  {
    id: 'bu-all',
    name: 'Todas as Empresas (Consolidado)',
    code: 'ALL',
    color: '#0F8A4B',
    isHolding: true,
  },
  {
    id: 'bu-holding',
    name: 'VERGROUP Participações & Holding',
    code: 'VGP',
    color: '#0F8A4B',
    isHolding: true,
  },
  {
    id: 'bu-tech',
    name: 'VERGROUP Tech & Software',
    code: 'VGT',
    color: '#0F8A4B',
  },
  {
    id: 'bu-verads',
    name: 'VerAds Marketing & Performance',
    code: 'VADS',
    color: '#2563EB',
  },
  {
    id: 'bu-vercont',
    name: 'VERCONT Gestão Contábil & BPO',
    code: 'VCNT',
    color: '#0D9488',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dep-exec', businessUnitId: 'bu-holding', name: 'Diretoria Executiva & CEO', leaderId: 'usr-silvestre' },
  { id: 'dep-product', businessUnitId: 'bu-tech', name: 'Produto & Tecnologia', leaderId: 'usr-william' },
  { id: 'dep-mkt', businessUnitId: 'bu-verads', name: 'Design & Marketing', leaderId: 'usr-william' },
  { id: 'dep-sales', businessUnitId: 'bu-tech', name: 'Comercial & Vendas', leaderId: 'usr-[#0F8A4B]' },
  { id: 'dep-ops', businessUnitId: 'bu-tech', name: 'Operações & Implantação', leaderId: 'usr-william' },
  { id: 'dep-fin', businessUnitId: 'bu-vercont', name: 'Controladoria & Financeiro', leaderId: 'usr-silvestre' },
];

export const INITIAL_TEAMS: Team[] = [
  { id: 'team-exec', name: 'Diretoria Executiva', departmentId: 'dep-exec', businessUnitId: 'bu-holding', leaderId: 'usr-silvestre' },
  { id: 'team-dev-front', name: 'Desenvolvimento Frontend & UI', departmentId: 'dep-product', businessUnitId: 'bu-tech', leaderId: 'usr-william' },
  { id: 'team-sales-outbound', name: 'Vendas Outbound B2B', departmentId: 'dep-sales', businessUnitId: 'bu-tech', leaderId: 'usr-william' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-william',
    name: 'William Barbosa',
    email: 'williambdesigner@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'superadmin',
    businessUnitIds: ['bu-holding', 'bu-tech', 'bu-verads', 'bu-vercont'],
    primaryBusinessUnitId: 'bu-holding',
    departmentId: 'dep-product',
    jobTitle: 'Diretor de Produto & Tecnologia',
    phone: '+55 92 98282-4592',
    city: 'Manaus, AM',
    language: 'Português (Brasil)',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr-silvestre',
    name: 'Silvestre Castro',
    email: 'silvestre.castro@vergroup.com.br',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'superadmin',
    businessUnitIds: ['bu-holding', 'bu-tech', 'bu-verads', 'bu-vercont'],
    primaryBusinessUnitId: 'bu-holding',
    departmentId: 'dep-exec',
    jobTitle: 'CEO Founder',
    phone: '+55 92 98111-2233',
    city: 'Manaus, AM',
    language: 'Português (Brasil)',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

export const INITIAL_INVITES: CollaboratorInvite[] = [];

export const INITIAL_ONBOARDING_TASKS: OnboardingTask[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-ver-clientes',
    businessUnitId: 'bu-tech',
    name: '[Ver] - Clientes',
    description: 'Pipeline principal de vendas e gestão de clientes VERGROUP Tech',
    type: 'sales',
    status: 'active',
    isDefault: true,
    stages: [
      { id: 'stg-cli', name: 'Clientes', order: 1, color: '#2563EB', probability: 10, stageType: 'initial', slaHours: 24 },
      { id: 'stg-cortesia', name: 'Cortesia', order: 2, color: '#84CC16', probability: 20, stageType: 'intermediate', slaHours: 48 },
      { id: 'stg-uber', name: 'Uber', order: 3, color: '#06B6D4', probability: 35, stageType: 'intermediate', slaHours: 48 },
      { id: 'stg-mei', name: 'Mei', order: 4, color: '#10B981', probability: 50, stageType: 'intermediate', slaHours: 72 },
      { id: 'stg-economico', name: 'Econômico', order: 5, color: '#1E3A8A', probability: 65, stageType: 'intermediate', slaHours: 72 },
      { id: 'stg-leve', name: 'Leve', order: 6, color: '#F59E0B', probability: 80, stageType: 'intermediate', slaHours: 48 },
      { id: 'stg-puro', name: 'Puro', order: 7, color: '#3B82F6', probability: 90, stageType: 'intermediate', slaHours: 24 },
      { id: 'stg-personal', name: 'Personal', order: 8, color: '#0D9488', probability: 95, stageType: 'intermediate', slaHours: 24 },
      { id: 'stg-inadimplente', name: 'Inadimplente', order: 9, color: '#EF4444', probability: 0, stageType: 'lost' },
      { id: 'stg-fechado', name: 'Fechar negócio', order: 10, color: '#0F8A4B', probability: 100, stageType: 'won' },
    ],
  },
  {
    id: 'pipe-vads-sales',
    businessUnitId: 'bu-verads',
    name: '[Vads] - Vendas & Marketing',
    description: 'Funil comercial para agência VerAds Marketing & Performance',
    type: 'sales',
    status: 'active',
    isDefault: true,
    stages: [
      { id: 'stg-vads-1', name: 'Lead Inbound', order: 1, color: '#3B82F6', probability: 20, stageType: 'initial', slaHours: 12 },
      { id: 'stg-vads-2', name: 'Briefing & Diagnóstico', order: 2, color: '#8B5CF6', probability: 50, stageType: 'intermediate', slaHours: 48 },
      { id: 'stg-vads-3', name: 'Proposta Comercial', order: 3, color: '#F59E0B', probability: 75, stageType: 'intermediate', slaHours: 48 },
      { id: 'stg-vads-4', name: 'Contrato Assinado', order: 4, color: '#0F8A4B', probability: 100, stageType: 'won' },
    ],
  },
  {
    id: 'pipe-vercont',
    businessUnitId: 'bu-vercont',
    name: '[VERCONT] - Contabilidade & BPO',
    description: 'Funil de implantação e onboarding contábil VERCONT',
    type: 'onboarding',
    status: 'active',
    isDefault: true,
    stages: [
      { id: 'stg-vc-1', name: 'Coleta de Documentos', order: 1, color: '#3B82F6', probability: 30, stageType: 'initial', slaHours: 48 },
      { id: 'stg-vc-2', name: 'Análise Tributária', order: 2, color: '#8B5CF6', probability: 60, stageType: 'intermediate', slaHours: 72 },
      { id: 'stg-vc-3', name: 'Setup Fiscal', order: 3, color: '#0F8A4B', probability: 100, stageType: 'completed' },
    ],
  },
];

export const INITIAL_DEALS: Deal[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-geral',
    name: 'geral',
    description: 'Comunicação geral da equipe VERGROUP',
    type: 'channel',
    businessUnitId: 'bu-holding',
    memberIds: ['usr-william', 'usr-silvestre'],
  },
  {
    id: 'chan-tech',
    name: 'desenvolvimento-tech',
    description: 'Projetos de software e produto',
    type: 'channel',
    businessUnitId: 'bu-tech',
    memberIds: ['usr-william', 'usr-silvestre'],
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_EMAILS: EmailMessage[] = [];

export const INITIAL_WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: 'wpp-1',
    businessUnitId: 'bu-tech',
    contactName: 'Marcelo Pires (Inovar Logística)',
    phone: '+55 (11) 98765-4321',
    contactId: 'cont-101',
    dealId: 'deal-101',
    assignedUserId: 'usr-william',
    status: 'in_progress',
    unreadCount: 1,
    lastMessage: 'Confirmado! Estaremos presentes no alinhamento técnico amanhã às 14h.',
    lastMessageAt: '2026-09-08T10:15:00Z',
    messages: [
      { id: 'm1', sender: 'contact', text: 'Olá William, tudo bem? Recebi a proposta comercial da VERGROUP.', timestamp: '2026-09-08T09:30:00Z', status: 'read' },
      { id: 'm2', sender: 'user', text: 'Olá Marcelo! Tudo ótimo por aqui. Conseguiram analisar o escopo de implantação?', timestamp: '2026-09-08T09:35:00Z', status: 'read' },
      { id: 'm3', sender: 'contact', text: 'Confirmado! Estaremos presentes no alinhamento técnico amanhã às 14h.', timestamp: '2026-09-08T10:15:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'wpp-2',
    businessUnitId: 'bu-tech',
    contactName: 'Dra. Beatriz Santos (Alpha Saúde)',
    phone: '+55 (11) 91234-5678',
    contactId: 'cont-102',
    dealId: 'deal-102',
    assignedUserId: 'usr-silvestre',
    status: 'waiting',
    unreadCount: 2,
    lastMessage: 'Poderiam enviar a minuta ajustada com a cláusula de SLA?',
    lastMessageAt: '2026-09-08T08:45:00Z',
    messages: [
      { id: 'm4', sender: 'contact', text: 'Bom dia time VERGROUP! Tivemos reunião com o jurídico.', timestamp: '2026-09-08T08:40:00Z', status: 'read' },
      { id: 'm5', sender: 'contact', text: 'Poderiam enviar a minuta ajustada com a cláusula de SLA?', timestamp: '2026-09-08T08:45:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'wpp-3',
    businessUnitId: 'bu-[#1]',
    contactName: 'Carlos Eduardo (Starlux Comercial)',
    phone: '+55 (21) 99876-5432',
    contactId: 'cont-103',
    assignedUserId: 'usr-william',
    status: 'closed',
    unreadCount: 0,
    lastMessage: 'Atendimento concluído com sucesso. Obrigado!',
    lastMessageAt: '2026-09-07T16:20:00Z',
    messages: [
      { id: 'm6', sender: 'contact', text: 'Preciso tirar dúvidas sobre a fatura da BU Rio de Janeiro.', timestamp: '2026-09-07T16:00:00Z', status: 'read' },
      { id: 'm7', sender: 'user', text: 'Claro Carlos, enviei o detalhamento para o seu e-mail cadastrado.', timestamp: '2026-09-07T16:15:00Z', status: 'read' },
      { id: 'm8', sender: 'contact', text: 'Atendimento concluído com sucesso. Obrigado!', timestamp: '2026-09-07T16:20:00Z', status: 'read' },
    ],
  },
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
