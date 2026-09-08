import { TaskPriority, TaskRecurrenceRule, TaskTemplate } from '../types';

export interface ParsedTaskAiResult {
  title: string;
  description: string;
  category: 'accounting' | 'fiscal' | 'hr' | 'sales' | 'legal' | 'general' | 'custom';
  priority: TaskPriority;
  estimatedHours: number;
  slaHours: number;
  checklistItems: string[];
  tags: string[];
  recurrenceRule?: TaskRecurrenceRule;
  isRecurrent: boolean;
  suggestedCompetenceRule?: 'same_month' | 'previous_month' | 'next_month';
  confidenceScore: number; // 0 - 100
  explanation: string;
}

/**
 * Intelligent Local AI Task Prompt Generator & Parser
 * Analyzes Portuguese natural language instructions to configure tasks, templates, and recurrence rules.
 */
export function parseTaskPromptWithAi(promptText: string): ParsedTaskAiResult {
  const text = promptText.trim().toLowerCase();

  // Determine Priority
  let priority: TaskPriority = 'medium';
  if (text.includes('urgente') || text.includes('crítico') || text.includes('alta prioridade') || text.includes('imediato')) {
    priority = 'urgent';
  } else if (text.includes('alta') || text.includes('importante') || text.includes('prioritário')) {
    priority = 'high';
  } else if (text.includes('baixa') || text.includes('tranquilo') || text.includes('opcional')) {
    priority = 'low';
  }

  // Determine Category
  let category: ParsedTaskAiResult['category'] = 'general';
  if (text.includes('simples nacional') || text.includes('pgdas') || text.includes('imposto') || text.includes('nota fiscal') || text.includes('fiscal') || text.includes('dam')) {
    category = 'fiscal';
  } else if (text.includes('balancete') || text.includes('conciliação') || text.includes('contábil') || text.includes('patrimônio') || text.includes('fechamento contábil')) {
    category = 'accounting';
  } else if (text.includes('folha') || text.includes('admissão') || text.includes('demissão') || text.includes('rh') || text.includes('esocial')) {
    category = 'hr';
  } else if (text.includes('venda') || text.includes('lead') || text.includes('proposta') || text.includes('comercial') || text.includes('crm')) {
    category = 'sales';
  } else if (text.includes('contrato') || text.includes('jurídico') || text.includes('procuração') || text.includes('alteração contratual')) {
    category = 'legal';
  }

  // Determine Recurrence
  let isRecurrent = false;
  let recurrenceRule: TaskRecurrenceRule | undefined = undefined;

  const isDaily = text.includes('diária') || text.includes('diariamente') || text.includes('todo dia');
  const isWeekly = text.includes('semanal') || text.includes('toda semana') || text.includes('todas as sextas') || text.includes('toda segunda');
  const isBiweekly = text.includes('quinzenal') || text.includes('a cada 15 dias') || text.includes('duas semanas');
  const isMonthly = text.includes('mensal') || text.includes('todo mês') || text.includes('mensalmente') || text.includes('dia 5') || text.includes('dia 10') || text.includes('dia 20');

  if (isDaily || isWeekly || isBiweekly || isMonthly || text.includes('recorrente') || text.includes('repetir')) {
    isRecurrent = true;
    let frequency: TaskRecurrenceRule['frequency'] = 'monthly';
    let monthDay = 10;
    let weekDays = [1]; // Monday default

    if (isDaily) {
      frequency = 'daily';
    } else if (isBiweekly) {
      frequency = 'biweekly';
    } else if (isWeekly) {
      frequency = 'weekly';
      if (text.includes('sexta')) weekDays = [5];
      else if (text.includes('terça')) weekDays = [2];
      else if (text.includes('quarta')) weekDays = [3];
      else if (text.includes('quinta')) weekDays = [4];
      else if (text.includes('segunda')) weekDays = [1];
    } else {
      frequency = 'monthly';
      const dayMatch = text.match(/dia\s*(\d{1,2})/);
      if (dayMatch && dayMatch[1]) {
        const d = parseInt(dayMatch[1], 10);
        if (d >= 1 && d <= 31) monthDay = d;
      }
    }

    let summaryLabel = `🔄 Repete mensalmente todo dia ${monthDay}`;
    if (frequency === 'daily') summaryLabel = '🔄 Repete diariamente';
    if (frequency === 'weekly') summaryLabel = '🔄 Repete semanalmente';
    if (frequency === 'biweekly') summaryLabel = '🔄 Repete a cada 15 dias';

    recurrenceRule = {
      frequency,
      interval: 1,
      monthDay,
      weekDays,
      dueTime: '17:00',
      generateDaysAhead: 5,
      competenceRule: 'same_month',
      endCondition: 'never',
      summaryLabel,
    };
  }

  // Generate Title
  let title = promptText.trim();
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  // Capitalize title first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Generate Checklist Items based on Intent
  const checklistItems: string[] = [];
  if (category === 'fiscal') {
    checklistItems.push('Solicitar e baixar extrato de notas fiscais emitidas/recebidas');
    checklistItems.push('Executar cálculo de apuração das alíquotas de imposto');
    checklistItems.push('Transmitir declaração no portal governamental e gerar guia DAM/PGDAS');
    checklistItems.push('Enviar comprovante e guia de arrecadação para o cliente');
  } else if (category === 'accounting') {
    checklistItems.push('Coletar extratos bancários e comprovantes de movimentação');
    checklistItems.push('Realizar conciliação bancária e lançamentos patrimoniais');
    checklistItems.push('Verificar divergências e emitir balancete de verificação');
    checklistItems.push('Arquivar cópia digital no prontuário do cliente');
  } else if (category === 'sales') {
    checklistItems.push('Analisar requisitos da proposta comercial e escopo técnico');
    checklistItems.push('Agendar reunião de alinhamento com a diretoria do cliente');
    checklistItems.push('Elaborar proposta personalizada e registrar no CRM');
  } else {
    checklistItems.push('Revisar premissas e requisitos da demanda');
    checklistItems.push('Executar a atividade em conformidade com as diretrizes do VERGROUP');
    checklistItems.push('Validar entrega final e registrar apontamento de horas');
  }

  // Tags
  const tags: string[] = ['VERGROUP IA', category.toUpperCase()];
  if (isRecurrent) tags.push('Recorrente');

  return {
    title: title || 'Nova Tarefa por IA',
    description: `Tarefa gerada automaticamente via Assistente de IA do VERGROUP com base na instrução: "${promptText}"`,
    category,
    priority,
    estimatedHours: category === 'accounting' ? 4 : 2,
    slaHours: priority === 'urgent' ? 24 : priority === 'high' ? 48 : 72,
    checklistItems,
    tags,
    recurrenceRule,
    isRecurrent,
    suggestedCompetenceRule: 'same_month',
    confidenceScore: 94,
    explanation: `IA identificou categoria [${category.toUpperCase()}], prioridade [${priority.toUpperCase()}] e ${isRecurrent ? `recorrência [${recurrenceRule?.summaryLabel}]` : 'execução pontual'}.`,
  };
}

/**
 * Quick prompt suggestions for common business/accounting workflows
 */
export const AI_TASK_SUGGESTIONS = [
  {
    label: '📊 Apuração Simples Nacional Recorrente',
    prompt: 'Criar tarefa recorrente mensal para o setor fiscal de apuração do Simples Nacional todo dia 10 com prioridade alta e checklist completo',
  },
  {
    label: '📑 Fechamento Contábil Mensal',
    prompt: 'Criar modelo de tarefa de fechamento contábil com conciliação bancária, emissão de balancete e SLA de 48 horas',
  },
  {
    label: '🚀 Onboarding de Novo Cliente',
    prompt: 'Criar tarefa de onboarding de novo cliente com coleta de documentos, certidões e abertura de prontuário em 24h',
  },
  {
    label: '📈 Relatório Semanal de Vendas/CRM',
    prompt: 'Criar tarefa recorrente semanal todas as sextas-feiras para o coordenador comercial enviar relatório de pipeline',
  },
];
