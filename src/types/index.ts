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
}

export interface Department {
  id: string;
  businessUnitId: string;
  name: string;
  leaderId?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  businessUnitIds: string[]; // multi-company link
  primaryBusinessUnitId: string;
  departmentId: string;
  secondaryDepartmentIds?: string[];
  teamId?: string;
  jobTitle: string;
  phone: string;
  extensionPhone?: string;
  emergencyContact?: string;
  birthDate?: string;
  language?: string;
  managerId?: string;
  supervisorId?: string;
  subordinateIds?: string[];
  status: 'active' | 'blocked' | 'invited';
  isExternal?: boolean;
  accessExpiresAt?: string;
  allowedResourceIds?: string[];
  city?: string;
  hiredAt?: string;
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
  companyName?: string;
  source: 'website' | 'whatsapp' | 'email' | 'referral' | 'outbound' | 'campaign';
  campaign?: string;
  status: LeadStatus;
  estimatedValue?: number;
  assignedUserId?: string;
  disqualificationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  businessUnitId: string;
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF
  companyId?: string;
  jobTitle?: string;
  tags: string[];
  assignedUserId: string;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  businessUnitId: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  segment: string;
  size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
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

export interface DealAdditionalContact {
  contactId: string;
  role: string; // ex: 'Decisor Financeiro', 'Patrocinador Técnico', 'Jurídico'
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

export interface Deal {
  id: string;
  businessUnitId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  value: number;
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

export interface TaskDependencyDetail {
  id: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
}

export interface TaskTemplate {
  id: string;
  businessUnitId?: string;
  departmentId?: string;
  title: string;
  description?: string;
  defaultPriority: TaskPriority;
  defaultSlaHours: number;
  checklistItems: string[];
  tags: string[];
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

export interface Task {
  id: string;
  businessUnitId: string;
  departmentId?: string;
  title: string;
  description?: string;
  creatorId?: string;
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
  assignedUserId: string;
  participantIds: string[];
  observerIds: string[];
  projectId?: string;
  projectName?: string; // ex: '[Vads] - VerAds'
  dealId?: string;
  clientId?: string;
  companyName?: string;
  competenceMonth?: number; // ex: 8
  competenceYear?: number; // ex: 2026
  templateId?: string;
  isStatusReportRequired?: boolean;
  lastStatusReportAt?: string;
  checklist: ChecklistItem[];
  comments?: TaskComment[];
  statusReports?: TaskStatusReport[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  dependencies?: string[];
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
  clientId?: string;
  dealId?: string;
  serviceCategory: string;
  managerId: string;
  memberIds: string[];
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  health: 'on_track' | 'at_risk' | 'delayed';
  progressPercentage: number;
  milestones: ProjectMilestone[];
  budget?: number;
  budgetedHours?: number;
  spentHours?: number;
  createdAt: string;
  updatedAt: string;
}

// Calendar
export interface CalendarEvent {
  id: string;
  businessUnitId: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  type: 'meeting' | 'call' | 'deadline' | 'review';
  location?: string;
  meetingLink?: string;
  organizerId: string;
  attendeeIds: string[];
  relatedEntityType?: 'deal' | 'client' | 'task' | 'project';
  relatedEntityId?: string;
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
  businessUnitId?: string; // or global
  name: string;
  type: 'channel' | 'direct' | 'contextual';
  description?: string;
  isPrivate?: boolean;
  memberIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  contextEntityType?: 'deal' | 'task' | 'project';
  contextEntityId?: string;
}

// Communication: Email
export interface EmailAccountConfig {
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

// Communication: WhatsApp
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
  action: 'create' | 'update' | 'delete' | 'export' | 'login' | 'stage_change' | 'won_deal';
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
