import type { User } from '../../types';

export type AIAgentStatus = 'active' | 'inactive' | 'paused' | 'learning';

export interface AIAgentRecord {
  id: string;
  name: string;
  description: string;
  type: string;
  status: AIAgentStatus;
  provider?: string;
  model?: string;
  businessUnit?: string;
  scope?: string;
  function?: string;
  instructions?: string;
  capabilities?: string[];
  access?: string;
  lastExecutionAt?: string | null;
  executionCount?: number | null;
  accuracy?: string | null;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export const AI_AGENTS_STORAGE_KEY = 'vergroup_ai_custom_agents_v1';

export const DEFAULT_AI_AGENTS: AIAgentRecord[] = [
  {
    id: 'agent-copilot',
    name: 'Agente Executivo VER Copilot',
    description: 'Varre eventos de domínio, prioriza riscos operacionais e sugere reatribuições preventivas de tarefas críticas.',
    type: 'Operacional',
    status: 'active',
    scope: 'Plataforma',
    function: 'Auditoria de SLA & Priorização Operacional',
    capabilities: ['monitoramento', 'priorização', 'alertas'],
  },
  {
    id: 'agent-commercial',
    name: 'Agente Comercial & Prospecção',
    description: 'Analisa o comportamento dos leads no funil comercial e apoia follow-up de oportunidades.',
    type: 'Comercial',
    status: 'active',
    scope: 'CRM',
    function: 'Qualificação de Leads & Follow-up de Funil',
    capabilities: ['qualificação', 'follow-up', 'funil'],
  },
  {
    id: 'agent-finance',
    name: 'Agente Financeiro & Contratos',
    description: 'Monitora contratos e vencimentos para apoiar gestão financeira e recorrência.',
    type: 'Financeiro',
    status: 'active',
    scope: 'Financeiro',
    function: 'Monitoramento de Contratos & Recorrência',
    capabilities: ['contratos', 'vencimentos', 'mrr'],
  },
  {
    id: 'agent-support',
    name: 'Agente de Atendimento W-API',
    description: 'Realiza pré-atendimento automático de mensagens no WhatsApp e e-mails corporativos.',
    type: 'Atendimento',
    status: 'active',
    scope: 'Comunicação',
    function: 'Triagem Inteligente WhatsApp & E-mail',
    capabilities: ['triagem', 'whatsapp', 'email'],
  },
];

export function canManageAIAgents(user: Pick<User, 'role' | 'capabilities'>): boolean {
  return user.role === 'superadmin' || user.role === 'company_admin' || Boolean(user.capabilities?.includes('ai.agents.manage'));
}

export function loadCustomAIAgents(): AIAgentRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(AI_AGENTS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as AIAgentRecord[];
    return Array.isArray(parsed) ? parsed.filter((agent) => Boolean(agent?.id && agent?.name)) : [];
  } catch {
    return [];
  }
}

export function loadAIAgents(): AIAgentRecord[] {
  return [...DEFAULT_AI_AGENTS, ...loadCustomAIAgents()];
}

export function saveCustomAIAgents(agents: AIAgentRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AI_AGENTS_STORAGE_KEY, JSON.stringify(agents.filter((agent) => agent.isCustom)));
}
