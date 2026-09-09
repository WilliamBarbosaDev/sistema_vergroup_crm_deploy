// Types for Sistema Integrado de Gestão VERGROUP

export type UserRole = 
  | 'superadmin'
  | 'company_admin'
  | 'director'
  | 'manager'
  | 'sales'
  | 'operations'
  | 'operator'
  | 'financial'
  | 'collaborator'
  | 'auditor'
  | 'viewer';

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  cnpj?: string;
  color: string;
  isHolding?: boolean;
  segment?: string;
  tradeName?: string;
  address?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

export interface Department {
  id: string;
  businessUnitId: string;
  parentDepartmentId?: string;
  name: string;
  leaderId?: string;
  description?: string;
}

export interface Team {
  id: string;
  businessUnitId: string;
  departmentId: string;
  name: string;
  leaderId?: string;
}

export type InviteType = 'link' | 'email' | 'direct' | 'external';

export type InviteStatus = 
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'revoked'
  | 'failed'
  | 'invite_not_sent';

export interface CollaboratorInvite {
  id: string;
  type: InviteType;
  email?: string;
  phone?: string;
  name?: string;
  token: string;
  businessUnitId: string;
  departmentId: string;
  teamId?: string;
  jobTitle: string;
  role: UserRole;
  managerId?: string;
  status: InviteStatus;
  expiresAt: string;
  maxUses?: number;
  usedCount: number;
  isExternal?: boolean;
  externalAccessDays?: number;
  accessExpiresAt?: string;
  allowedResourceIds?: string[];
  invitedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingTask {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  departmentId: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
}

export interface JobExecutionLog {
  id: string;
  jobName: string;
  startedAt: string;
  completedAt?: string;
  tasksScanned: number;
  tasksFlagged: number;
  suggestionsCreated: number;
  notificationsCreated: number;
  status: 'running' | 'success' | 'failed';
  errorMessage?: string;
  durationMs?: number;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  personalEmail?: string;
  avatar?: string;
  avatarStoragePath?: string;
  role: UserRole;
  capabilities?: string[];
  permissionScopes?: Record<string, PermissionScope>;
  businessUnitIds: string[]; // multi-company link
  primaryBusinessUnitId: string;
  departmentId: string;
  secondaryDepartmentIds?: string[];
  teamId?: string;
  jobTitle: string;
  phone: string;
  whatsapp?: string;
  alternatePhone?: string;
  workPhone?: string;
  extensionPhone?: string;
  emergencyContactName?: string;
  emergencyContact?: string;
  website?: string;
  teamsAccount?: string;
  zoomAccount?: string;
  birthDate?: string;
  gender?: string;
  language?: string;
  timezone?: string;
  state?: string;
  country?: string;
  bio?: string;
  personalNotes?: string;
  managerId?: string;
  supervisorId?: string;
  subordinateIds?: string[];
  status: 'active' | 'inactive' | 'absent' | 'offline' | 'blocked' | 'invited' | 'suspended';
  isExternal?: boolean;
  accessExpiresAt?: string;
  allowedResourceIds?: string[];
  city?: string;
  hiredAt?: string;
  employeeCode?: string;
  lastPasswordChangedAt?: string;
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    taskDigest?: boolean;
    meetingReminders?: boolean;
  };
  createdAt: string;
}

// CRM
export type LeadStatus = 'new' | 'contacted' | 'qualifying' | 'qualified' | 'disqualified';

export interface Lead {
  id: string;
  businessUnitId: string;
  title: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  document?: string; // CPF ou CNPJ
  jobTitle?: string;
  city?: string;
  state?: string;
  companyName?: string;
  contactId?: string;
  companyId?: string;
  pipelineId?: string;
  stageId?: string;
  source: 'website' | 'whatsapp' | 'email' | 'referral' | 'outbound' | 'campaign' | 'instagram' | 'facebook' | 'event' | 'partner' | 'phone_call' | 'other';
  campaign?: string;
  serviceCategory?: string; // Serviço de interesse
  clientPlan?: string; // Plano de interesse
  mainNeed?: string; // Dor ou problema relatado
  status: LeadStatus;
  estimatedValue?: number;
  approximateRevenue?: number;
  employeeCount?: number;
  priority?: 'low' | 'medium' | 'high';
  expectedCloseDate?: string;
  assignedUserId?: string;
  disqualificationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactRoleType = 
  | 'decisor' 
  | 'socio' 
  | 'representante' 
  | 'financeiro' 
  | 'fiscal' 
  | 'rh' 
  | 'compras' 
  | 'operacional' 
  | 'influenciador' 
  | 'principal';

export interface ContactPhone {
  id: string;
  number: string;
  type: 'work' | 'personal' | 'whatsapp' | 'other';
  label?: string;
  isPrimary?: boolean;
}

export interface ContactEmail {
  id: string;
  email: string;
  type: 'corporate' | 'personal' | 'financial' | 'other';
  label?: string;
  isPrimary?: boolean;
}

export interface ContactDigitalChannels {
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  telegram?: string;
  website?: string;
  messenger?: string;
}

export interface ContactCompanyLink {
  companyId: string;
  companyName?: string;
  role: string;
  isPrimary?: boolean;
}

export interface ContactInternalInfo {
  businessUnitId?: string;
  commercialUserId?: string;
  accountManagerId?: string;
  operationalUserId?: string;
  source?: string; // ex: 'whatsapp', 'google_ads', 'outbound', 'referral'
  classification?: 'VIP' | 'Estratégico' | 'Padrão' | 'Risco';
  internalNotes?: string;
}

export interface Contact {
  id: string;
  businessUnitId: string;
  name: string;
  salutation?: string;
  email: string;
  phone: string;
  document?: string; // CPF ou RG
  birthDate?: string;
  city?: string;
  state?: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  companyId?: string;
  jobTitle?: string;
  tags: string[];
  assignedUserId: string;
  avatar?: string;
  notes?: string;
  
  // Ficha 360º Additions
  additionalPhones?: ContactPhone[];
  additionalEmails?: ContactEmail[];
  digitalChannels?: ContactDigitalChannels;
  companyLinks?: ContactCompanyLink[];
  roles?: ContactRoleType[];
  internalInfo?: ContactInternalInfo;
  customFields?: Record<string, string | number | boolean>;
  
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  businessUnitId: string;
  parentCompanyId?: string; // ID da Empresa Holding / Matriz / Empresa do Grupo pai
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  segment: string;
  size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  plan?: string; // Plano da Empresa (ex: Enterprise, Corp, BPO Premium, etc.)
  email: string;
  phone: string;
  website?: string;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  assignedUserId: string;
  status: 'active' | 'prospect' | 'churned' | 'paused';
  healthScore: 'green' | 'yellow' | 'red';
  npsScore?: number;
  tags: string[];

  // Ficha Cadastral Ampliada CRM 2.0
  stateRegistration?: string; // Inscrição Estadual
  municipalRegistration?: string; // Inscrição Municipal
  openingDate?: string; // Data de Abertura
  legalNature?: string; // Natureza Jurídica
  cnaePrimary?: string; // CNAE Principal
  cnaeSecondary?: string[]; // CNAEs Secundários
  approximateRevenue?: number; // Faturamento aproximado
  acquisitionChannel?: string; // Canal de aquisição
  leadSource?: string; // Origem do cliente
  commercialNotes?: string; // Observações comerciais

  createdAt: string;
  updatedAt: string;
}

export type StageType = 'initial' | 'intermediate' | 'won' | 'lost' | 'completed' | 'cancelled';
export type PipelineType = 'sales' | 'client_success' | 'onboarding' | 'operations' | 'billing' | 'projects' | 'custom';
export type PipelineStatus = 'active' | 'inactive' | 'draft';
export type CustomFieldType = 
  | 'text' 
  | 'long_text' 
  | 'number' 
  | 'currency' 
  | 'percent' 
  | 'date' 
  | 'datetime' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'user' 
  | 'company' 
  | 'contact' 
  | 'phone' 
  | 'email' 
  | 'url';

export interface PipelineStageChecklistItem {
  id: string;
  label: string;
  completed?: boolean;
}

export interface PipelineCustomField {
  id: string;
  pipelineId: string;
  name: string;
  internalKey: string;
  fieldType: CustomFieldType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
  position: number;
  isVisible?: boolean;
  isEditable?: boolean;
  createdAt?: string;
}

export interface PipelineStage {
  id: string;
  pipelineId?: string;
  name: string;
  description?: string;
  order: number; // sort_order
  color: string;
  probability: number; // 0 - 100%
  stageType: StageType;
  slaHours?: number; // SLA limite por etapa
  maxDaysWarning?: number; // alerta de permanência
  requiredFields?: string[];
  checklistItems?: PipelineStageChecklistItem[];
  enterAutomation?: string;
  exitAutomation?: string;
  enterAutomationRuleId?: string;
  exitAutomationRuleId?: string;
}

export interface Pipeline {
  id: string;
  businessUnitId: string;
  departmentId?: string;
  teamId?: string;
  name: string;
  code?: string;
  description?: string;
  type: PipelineType;
  status: PipelineStatus;
  isDefault?: boolean;
  stages: PipelineStage[];
  customFields?: PipelineCustomField[];
  sortOrder?: number;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DealStatus = 'open' | 'won' | 'lost';

export type CrmMode = 'with_leads' | 'without_leads';

export interface SalesTunnel {
  id: string;
  businessUnitId: string;
  name: string;
  sourcePipelineId: string;
  sourceStageId: string;
  targetPipelineId: string;
  targetStageId: string;
  actionType: 'copy' | 'move';
  conditionType: 'on_enter_stage' | 'on_deal_won' | 'on_deal_lost';
  assigneeRule: 'keep_owner' | 'default_user' | 'unassigned';
  targetUserId?: string;
  active: boolean;
  createdAt: string;
}

export interface DealAdditionalContact {
  contactId: string;
  role: string; // ex: 'Decisor Financeiro', 'Patrocinador Técnico', 'Jurídico'
}

export type ImportStatus = 'preparing' | 'analyzing' | 'ready' | 'importing' | 'completed' | 'failed';

export interface ImportJob {
  id: string;
  sourceSystem: string;
  businessUnitId: string;
  uploadedByUserId: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  status: ImportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DealDocument {
  id: string;
  name: string;
  type: 'proposal' | 'contract' | 'briefing' | 'nda' | 'other';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export type CatalogBillingType = 'unique' | 'monthly' | 'yearly' | 'custom';

export interface CatalogItem {
  id: string;
  businessUnitId: string;
  type: 'product' | 'service';
  name: string;
  sku?: string;
  category: string;
  price: number;
  currency: string;
  billingType: CatalogBillingType;
  billingUnit?: string;
  shortDescription?: string;
  fullDescription?: string;
  internalNotes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DealItem {
  id: string;
  catalogItemId: string;
  name: string;
  basePrice: number;
  negotiatedPrice: number;
  quantity: number;
  discount: number;
  subtotal: number;
  billingType: CatalogBillingType;
  addedAt: string;
  addedByUserId: string;
  notes?: string;
}


export interface Deal {
  id: string;
  businessUnitId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  value: number;
  items?: DealItem[];
  contactId?: string;
  additionalContacts?: DealAdditionalContact[];
  companyId?: string;
  assignedUserId: string; // Responsável Comercial
  operationalUserId?: string; // Responsável Operacional / CS
  leadSource?: 'whatsapp' | 'website' | 'email' | 'referral' | 'outbound' | 'event';
  financialStatus?: 'draft' | 'pending_approval' | 'contract_sent' | 'contract_signed' | 'invoiced' | 'paid';
  clientPlan?: string; // ex: 'Mei', 'Econômico', 'Leve', 'Puro', 'Personal'
  clientPaymentStatus?: 'on_time' | 'late' | 'pending';
  expectedCloseDate: string;
  status: DealStatus;
  lossReason?: string;
  lossNotes?: string;
  lossFollowUpDate?: string;
  lossCompetitor?: string;
  serviceCategory: string;
  serviceTemplateId?: string;
  customFields?: Record<string, string | number | boolean>;
  tags: string[];
  documents?: DealDocument[];
  cardBadge?: 'Completed' | 'Deadline changed' | 'Overdue' | 'Viewed';
  stageChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

// VoIP Call details
export interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  callerCompany?: string;
  direction: 'incoming' | 'outgoing';
  status: 'missed' | 'completed' | 'busy' | 'no_answer';
  timestamp: string;
  durationSeconds: number; // e.g. 6 or 10
  carrier: string; // e.g. '[Ver - (92) 3042-0582] - Fale Fácil VoIP'
  audioUrl?: string;
  aiTranscription?: string;
  rating?: number;
}

// Timeline & Activities
export type ActivityType = 
  | 'note'
  | 'stage_change'
  | 'call'
  | 'meeting'
  | 'email'
  | 'whatsapp'
  | 'task'
  | 'status_change'
  | 'system_automation'
  | 'file_upload'
  | 'deal_created'
  | 'project_created';

export interface Activity {
  id: string;
  entityType: 'lead' | 'contact' | 'company' | 'deal' | 'project' | 'task' | 'client';
  entityId: string;
  businessUnitId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  callRecord?: CallRecord;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Client Pipeline (Pós-venda)
export type ClientStage = 
  | 'onboarding'
  | 'documentation'
  | 'documents'
  | 'implementation'
  | 'deployment'
  | 'active'
  | 'recurring_active'
  | 'pending'
  | 'suspended'
  | 'cancelled';

export type ClientAccountStage = ClientStage;

export interface ClientAccount {
  id: string;
  businessUnitId: string;
  companyId: string;
  dealIdOrigin?: string;
  stage: ClientStage;
  commercialManagerId: string;
  accountManagerId: string;
  operationalLeadId: string;
  activeServices: string[];
  contractedItems?: DealItem[];
  monthlyValue: number;
  healthScore: 'green' | 'yellow' | 'red';
  healthReason?: string;
  lastContactAt: string;
  onboardingProgress: number; // 0 - 100%
  createdAt: string;
  updatedAt: string;
}

// Work: Tasks & Projects
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TaskStatusReport {
  id: string;
  taskId: string;
  authorUserId: string;
  content: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: 'running' | 'paused' | 'completed';
  createdAt: string;
}

export interface TaskDependencyDetail {
  id: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
}

export interface TaskRecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'monthly_custom' | 'yearly';
  interval?: number; // e.g. a cada X dias/semanas/meses
  weekDays?: number[]; // e.g. [1, 5] (segunda e sexta)
  monthDay?: number; // e.g. dia 10 do mês
  dueTime?: string; // e.g. "17:00"
  generateDaysAhead?: number; // dias de antecedência para geração
  competenceRule?: 'same_month' | 'previous_month' | 'next_month';
  endCondition?: 'never' | 'after_occurrences' | 'on_date';
  maxOccurrences?: number;
  endDate?: string;
  nextExecutionDate?: string;
  summaryLabel?: string; // e.g. "🔄 Repete mensalmente todo dia 10"
}

export interface TaskTemplate {
  id: string;
  businessUnitId?: string;
  departmentId?: string;
  category?: 'accounting' | 'fiscal' | 'hr' | 'sales' | 'legal' | 'general' | 'custom';
  title: string;
  description?: string;
  defaultPriority: TaskPriority;
  defaultSlaHours: number;
  estimatedHours?: number;
  checklistItems: string[];
  tags: string[];
  recurrenceRule?: TaskRecurrenceRule;
  requireCompletionSummary?: boolean;
  assignedUserId?: string;
  ownerUserId?: string;
  participantIds?: string[];
  observerIds?: string[];
  taskContext?: 'client' | 'internal';
  icon?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface SavedFilter {
  id: string;
  userId: string;
  filterName: string;
  filterConfig: Record<string, any>;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  storagePath?: string;
  url?: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByUserId: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  protocolNumber?: string; // ex: 'VRG-2026-000001' (Unique Immutable Task Protocol)
  businessUnitId: string;
  departmentId?: string;
  title: string;
  description?: string;
  creatorId?: string;
  ownerUserId?: string; // Proprietário da Tarefa (coordena a demanda)
  assignedUserId: string; // Responsável pela Execução
  parentTaskId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate: string;
  deadlineLabel?: string; // ex: 'Hoje, 17:00', 'Amanhã, 8:00'
  timerSeconds?: number; // stopwatch counter in seconds
  isTimerRunning?: boolean;
  estimatedHours?: number;
  spentHours?: number;
  participantIds: string[];
  observerIds: string[];
  projectId?: string;
  projectName?: string; // ex: '[Vads] - VerAds'
  dealId?: string;
  clientId?: string; // Empresa / Cliente ID
  contactId?: string; // Contato ID
  taskContext?: 'client' | 'internal'; // Contexto oficial (Cliente vs Interna)
  confirmedInternal?: boolean; // Usuário confirmou explicitamente que é tarefa interna
  crmAuditStatus?: 'pending' | 'reviewed_internal' | 'crm_suggested' | 'linked'; // Status do Backend Audit Worker
  crmSuggestionEntityType?: 'company' | 'contact' | 'deal';
  crmSuggestionEntityId?: string;
  crmSuggestionEntityName?: string;
  crmSuggestionConfidence?: number;
  crmSuggestionReason?: string;
  lastCrmAuditAt?: string;
  slaState?: 'normal' | 'attention' | 'risk' | 'critical' | 'breached'; // Estado oficial do SLA Supervisor
  slaPercentageConsumed?: number; // 0-100+%
  lastSlaCheckAt?: string;
  lastSlaNotificationAt?: string;
  lastEscalationLevel?: 'none' | 'assignee' | 'supervisor' | 'manager' | 'director';
  nextEscalationAt?: string;
  pendingReasonCategory?: 'executing' | 'waiting_client' | 'waiting_third_party' | 'internal_dependency' | 'technical_issue' | 'needs_help';
  pendingReasonText?: string;
  statusRequestedAt?: string;
  requireCompletionSummary?: boolean; // Requer resumo obrigatorio para fechar tarefa
  completionSummary?: string; // Resumo final de conclusao
  completionSummaryAuthorId?: string;
  completionSummaryAt?: string;
  companyName?: string;
  competenceMonth?: number; // ex: 8
  competenceYear?: number; // ex: 2026
  templateId?: string;
  isStatusReportRequired?: boolean;
  lastStatusReportAt?: string;
  checklist: ChecklistItem[];
  comments?: TaskComment[];
  statusReports?: TaskStatusReport[];
  attachments?: {
    id: string;
    name: string;
    sizeBytes: number;
    fileUrl: string;
    uploadedByUserId: string;
    uploadedAt: string;
  }[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  recurrenceRule?: TaskRecurrenceRule;
  dependencies?: {
    id: string;
    targetTaskId: string;
    targetTaskProtocol?: string;
    targetTaskTitle: string;
    type: 'blocked_by' | 'blocks';
  }[];
  dependenciesDetails?: TaskDependencyDetail[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'blocked' | 'completed' | 'cancelled';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  businessUnitId: string;
  name: string;
  code: string;
  objective?: string; // Objetivo específico do projeto
  description?: string;
  clientId?: string;
  companyId?: string;
  dealId?: string;
  serviceCategory: string;
  managerId: string; // Proprietário Principal (Governança)
  moderatorIds?: string[]; // Moderadores que auxiliam na gestão
  memberIds: string[]; // Membros operacionais participantes
  privacy?: 'public' | 'private'; // Visibilidade do projeto e de suas tarefas
  toolsConfig?: Record<string, boolean>; // Ferramentas disponíveis (tarefas, arquivos, etc)
  defaultTab?: string;
  notificationsConfig?: Record<string, boolean>;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  health: 'on_track' | 'at_risk' | 'delayed';
  progressPercentage: number;
  milestones: ProjectMilestone[];
  attachments?: {
    id: string;
    name: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
  budget?: number;
  budgetedHours?: number;
  spentHours?: number;
  createdAt: string;
  updatedAt: string;
}

// Calendar
export type MeetingModality = 'presential' | 'online';
export type AttendeeStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface CalendarEvent {
  id: string;
  businessUnitId: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  type: 'meeting' | 'event' | 'task' | 'reminder';
  modality: MeetingModality;
  location?: string;
  meetingLink?: string;
  organizerId: string;
  attendees: { userId: string; status: AttendeeStatus }[];
  reminders: number[]; // Array of minutes before the event to send a notification
  status: 'scheduled' | 'cancelled';
  relatedEntityType?: 'deal' | 'client' | 'task' | 'project';
  relatedEntityId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Communication: Internal Chat
export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  attachments?: { name: string; size: string; url: string }[];
  reactions?: { emoji: string; count: number; userIds: string[] }[];
  replyToId?: string;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  businessUnitId?: string; // or global 'bu-all'
  name: string;
  type: 'channel' | 'direct' | 'contextual' | 'group';
  description?: string;
  isPrivate?: boolean;
  privacy?: 'private' | 'business_unit';
  memberIds: string[];
  adminIds?: string[]; // IDs dos Administradores do Grupo (gestão de membros/configurações do grupo)
  avatarUrl?: string;
  status?: 'active' | 'archived';
  createdById?: string;
  createdAt?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  contextEntityType?: 'deal' | 'task' | 'project';
  contextEntityId?: string;
}

// Communication: Email
export interface EmailAccountConfig {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  imapServer: string;
  imapPort: number;
  imapSsl: boolean;
  smtpServer: string;
  smtpPort: number;
  smtpSsl: boolean;
  syncIntervalMinutes: number;
  signature: string;
  isEncrypted: boolean;
}

export interface EmailMessage {
  id: string;
  businessUnitId: string;
  emailAccountId?: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  subject: string;
  body: string;
  snippet: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive';
  isRead: boolean;
  starred: boolean;
  hasAttachments: boolean;
  relatedContactId?: string;
  relatedCompanyId?: string;
  relatedDealId?: string;
  relatedProjectId?: string;
  relatedTaskId?: string;
  receivedAt: string;
}

export type WhatsAppProviderType = 'meta_official' | 'evolution_api' | 'z_api' | 'w_api' | 'baileys' | 'custom_webhook';

export interface WhatsAppChannelConfig {
  id: string;
  businessUnitId: string;
  phoneNumber: string;
  channelName: string;
  providerType: WhatsAppProviderType;
  status: 'connected' | 'qr_code_pending' | 'disconnected';
  qrCodeUrl?: string;
  // Meta Official Cloud API
  metaPhoneNumberId?: string;
  metaWabaId?: string;
  metaAccessToken?: string;
  metaVerifyToken?: string;
  // Third-party Gateway API (Z-API, Evolution API, W-API, Baileys, Custom)
  apiUrl?: string;
  apiKey?: string;
  instanceId?: string;
  webhookSecret?: string;
  updatedAt: string;
}

export interface WhatsAppConversation {
  id: string;
  businessUnitId: string;
  contactName: string;
  phone: string;
  contactId?: string;
  dealId?: string;
  assignedUserId?: string;
  status: 'waiting' | 'in_progress' | 'closed';
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  messages: {
    id: string;
    sender: 'user' | 'contact' | 'bot';
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
  }[];
}

// Automations & Management
export interface AutomationRule {
  id: string;
  businessUnitId: string;
  name: string;
  description: string;
  trigger: 'deal_won' | 'lead_created' | 'task_overdue' | 'stage_changed' | 'whatsapp_received';
  conditions: { field: string; operator: 'equals' | 'greater_than' | 'contains'; value: string }[];
  actions: { type: string; details: string }[];
  active: boolean;
  runsCount: number;
  lastRunAt?: string;
  lastStatus?: 'success' | 'failed';
}

export interface AuditLog {
  id: string;
  businessUnitId?: string;
  userId: string;
  userName: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'export'
    | 'login'
    | 'stage_change'
    | 'won_deal'
    | 'archive'
    | 'leave'
    | 'permission.changed'
    | 'role.changed'
    | 'user.updated'
    | 'pipeline.updated'
    | 'catalog.updated'
    | 'integration.updated'
    | 'automation.updated'
    | 'organization.updated';
  entity: string;
  entityId: string;
  details: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  correlationId?: string;
  ipAddress: string;
  timestamp: string;
}

export type IntegrationEnvironment = 'production' | 'sandbox';

export interface ApiKeyRecord {
  id: string;
  organizationId?: string;
  businessUnitId?: string;
  userId?: string;
  applicationName?: string;
  name: string;
  scopes: string[];
  environment: IntegrationEnvironment;
  status: 'active' | 'inactive' | 'revoked';
  keyPrefix: string;
  secretLast4: string;
  lastUsedAt?: string;
  createdByUserId?: string;
  createdByName?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundWebhookConfig {
  id: string;
  organizationId?: string;
  businessUnitId?: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  headers: Record<string, string>;
  secretLast4: string;
  status: 'active' | 'inactive';
  maxRetries: number;
  retryBackoffSeconds: number;
  createdByUserId?: string;
  createdByName?: string;
  lastAttemptAt?: string;
  lastStatusCode?: number;
  failureCount: number;
  deliveryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InboundWebhookEndpoint {
  id: string;
  organizationId?: string;
  businessUnitId?: string;
  name: string;
  slug: string;
  acceptedEvents: string[];
  payloadSchema?: Record<string, unknown>;
  status: 'active' | 'inactive';
  secretLast4: string;
  createdByUserId?: string;
  createdByName?: string;
  lastReceivedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationDeliveryLog {
  id: string;
  integrationType: 'api_key' | 'webhook_outbound' | 'webhook_inbound';
  integrationId: string;
  businessUnitId?: string;
  direction: 'outbound' | 'inbound';
  eventName: string;
  endpointUrl?: string;
  method?: string;
  statusCode?: number;
  responseBody?: string;
  payload?: Record<string, unknown>;
  attemptNumber: number;
  totalAttempts: number;
  succeeded: boolean;
  maskedSecret?: string;
  actorName?: string;
  createdAt: string;
}

// Permission Engine & Hierarchy Types (VERGROUP Core)
export type PermissionScope = 
  | 'own' 
  | 'participating' 
  | 'team' 
  | 'department' 
  | 'department_and_below' 
  | 'managed_users' 
  | 'business_unit' 
  | 'multi_bu' 
  | 'all';

export type PermissionDecision = 'ALLOW' | 'DENY' | 'CUSTOM';

export interface PermissionCapabilityRule {
  id: string;
  module: string;
  capability: string;
  actionName: string;
  defaultScope: PermissionScope;
  allowedScopes: PermissionScope[];
  description: string;
}

export interface PermissionExplainResult {
  decision: PermissionDecision;
  capability: string;
  scope: PermissionScope;
  source: string;
  resolvedHierarchyPath: string;
  organizationalMatch: boolean;
  businessUnitMatch: boolean;
  reason: string;
  targetCountEstimate?: number;
}
