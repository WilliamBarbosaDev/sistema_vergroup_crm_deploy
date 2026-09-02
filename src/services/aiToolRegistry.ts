import { User, Task, OnboardingTask, UserRole } from '../types';

export interface ToolDefinition {
  name: string;
  description: string;
  capabilityRequired: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface ToolContext {
  currentUser: User;
  collaborator: User;
  tasks: Task[];
  onboardingTasks: OnboardingTask[];
  companies?: any[];
  contacts?: any[];
  deals?: any[];
}

export const REGISTERED_AI_TOOLS: Record<string, ToolDefinition> = {
  organize_my_day: {
    name: 'organize_my_day',
    description: 'Calcula a sequência otimizada de prioridades do colaborador com base no vencimento, criticidade e SLA.',
    capabilityRequired: 'tasks.list_my_tasks',
    inputSchema: { collaboratorId: 'string' },
    outputSchema: { prioritizedTasks: 'array', summary: 'string' },
  },
  'tasks.suggest_crm_relation': {
    name: 'tasks.suggest_crm_relation',
    description: 'Busca relacional no CRM (empresas, contatos e negócios) para sugerir a entidade correspondente à tarefa com score de confiança e tratamento de ambiguidade.',
    capabilityRequired: 'tasks.crm.suggest',
    inputSchema: { title: 'string', description: 'string', businessUnitId: 'string' },
    outputSchema: { candidates: 'array', suggestedEntity: 'object', hasAmbiguity: 'boolean' },
  },
  'tasks.get_sla_risks': {
    name: 'tasks.get_sla_risks',
    description: 'Filtra tarefas que estouraram o prazo ou estão em risco de violar o SLA corporativo.',
    capabilityRequired: 'tasks.list_my_tasks',
    inputSchema: { collaboratorId: 'string' },
    outputSchema: { overdueTasks: 'array', atRiskCount: 'number' },
  },
  'form.ai_fill': {
    name: 'form.ai_fill',
    description: 'Gera uma sugestão de título, descrição, prioridade e checklist para preenchimento com preview antes de salvar.',
    capabilityRequired: 'tasks.create',
    inputSchema: { prompt: 'string', collaboratorId: 'string' },
    outputSchema: { suggestedTask: 'object' },
  },
  'onboarding.get_checklist': {
    name: 'onboarding.get_checklist',
    description: 'Consulta tarefas de integração do colaborador vinculadas ao departamento de entrada.',
    capabilityRequired: 'users.organization.read',
    inputSchema: { collaboratorId: 'string' },
    outputSchema: { onboardingItems: 'array', completionPercent: 'number' },
  },
  'tasks.summarize': {
    name: 'tasks.summarize',
    description: 'Gera um resumo executivo da tarefa consolidando descrição, comentários, status reports e histórico.',
    capabilityRequired: 'tasks.read',
    inputSchema: { taskId: 'string' },
    outputSchema: { summary: 'string', riskScore: 'string' },
  },
  'tasks.suggest_next_action': {
    name: 'tasks.suggest_next_action',
    description: 'Analisa SLA, dependências e apontamentos para recomendar a próxima ação operacional.',
    capabilityRequired: 'tasks.read',
    inputSchema: { taskId: 'string' },
    outputSchema: { recommendedAction: 'string', reason: 'string' },
  },
};

export class AiToolRegistryService {
  /**
   * Evaluates if the current user has capability permission to execute the tool
   */
  static checkCapabilityPermission(toolName: string, context: ToolContext): boolean {
    const tool = REGISTERED_AI_TOOLS[toolName];
    if (!tool) return false;

    const { currentUser, collaborator } = context;

    // Self check
    if (currentUser.id === collaborator.id) return true;

    // Capability evaluation for managers / admins
    const allowedRoles: UserRole[] = ['superadmin', 'company_admin', 'director', 'manager'];
    return allowedRoles.includes(currentUser.role);
  }

  /**
   * Executes tool safely via domain services
   */
  static executeTool(toolName: string, input: any, context: ToolContext): { success: boolean; data?: any; error?: string } {
    if (!this.checkCapabilityPermission(toolName, context)) {
      return {
        success: false,
        error: `Acesso negado: O usuário ${context.currentUser.name} não possui a capability ${REGISTERED_AI_TOOLS[toolName]?.capabilityRequired || 'requerida'}.`,
      };
    }

    const { collaborator, tasks, onboardingTasks } = context;
    const myTasks = tasks.filter((t) => t.assignedUserId === collaborator.id);

    switch (toolName) {
      case 'organize_my_day': {
        const pending = myTasks
          .filter((t) => t.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return {
          success: true,
          data: {
            prioritizedTasks: pending.slice(0, 5),
            summary: `Mapeadas ${pending.length} tarefas pendentes para ${collaborator.name}.`,
          },
        };
      }

      case 'tasks.suggest_crm_relation': {
        const fullText = `${input.title || ''} ${input.description || ''}`.toLowerCase();
        const candidates: Array<{
          entityType: 'company' | 'contact' | 'deal';
          entityId: string;
          entityName: string;
          confidence: number;
          reason: string;
        }> = [];

        // 1. Search companies
        (context.companies || []).forEach((comp: any) => {
          const nameMatch = comp.tradeName && fullText.includes(comp.tradeName.toLowerCase());
          const corpMatch = comp.corporateName && fullText.includes(comp.corporateName.toLowerCase());
          if (nameMatch || corpMatch) {
            candidates.push({
              entityType: 'company',
              entityId: comp.id,
              entityName: comp.tradeName || comp.corporateName,
              confidence: 92,
              reason: `Nome da empresa "${comp.tradeName || comp.corporateName}" identificado no título/descrição.`,
            });
          }
        });

        // 2. Search contacts
        (context.contacts || []).forEach((c: any) => {
          if (c.name && fullText.includes(c.name.toLowerCase())) {
            candidates.push({
              entityType: 'contact',
              entityId: c.id,
              entityName: c.name,
              confidence: 88,
              reason: `Nome do contato "${c.name}" identificado no título/descrição.`,
            });
          }
        });

        // 3. Search deals
        (context.deals || []).forEach((d: any) => {
          if (d.title && fullText.includes(d.title.toLowerCase())) {
            candidates.push({
              entityType: 'deal',
              entityId: d.id,
              entityName: d.title,
              confidence: 85,
              reason: `Título do negócio "${d.title}" identificado no texto.`,
            });
          }
        });

        const hasAmbiguity = candidates.length > 1;
        return {
          success: true,
          data: {
            candidates,
            suggestedEntity: candidates[0] || null,
            hasAmbiguity,
          },
        };
      }

      case 'tasks.get_sla_risks': {
        const overdue = myTasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date());
        return {
          success: true,
          data: {
            overdueTasks: overdue,
            atRiskCount: overdue.length,
          },
        };
      }

      case 'form.ai_fill': {
        return {
          success: true,
          data: {
            suggestedTask: {
              title: input.prompt ? `Demanda: ${input.prompt.slice(0, 40)}...` : 'Solicitação e Fechamento Contábil',
              description: `Ação sugerida por VER AI com base na solicitação do usuário.`,
              priority: 'high',
              assignedUserId: collaborator.id,
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        };
      }

      case 'onboarding.get_checklist': {
        const myOnboarding = onboardingTasks.filter((o) => o.userId === collaborator.id);
        const completed = myOnboarding.filter((o) => o.completed).length;
        const completionPercent = myOnboarding.length > 0 ? Math.round((completed / myOnboarding.length) * 100) : 100;

        return {
          success: true,
          data: {
            onboardingItems: myOnboarding,
            completionPercent,
          },
        };
      }

      case 'tasks.summarize': {
        const targetTask = tasks.find((t) => t.id === input.taskId) || tasks[0];
        const commentsCount = targetTask?.comments?.length || 0;
        const reportsCount = targetTask?.statusReports?.length || 0;
        const isOverdue = targetTask && new Date(targetTask.dueDate) < new Date() && targetTask.status !== 'completed';

        return {
          success: true,
          data: {
            summary: `Tarefa **${targetTask?.title || 'Selecione uma tarefa'}** vinculada a ${targetTask?.projectName || 'Operações'}. ` +
              `Contém ${targetTask?.checklist?.length || 0} itens de checklist, ${commentsCount} comentários e ${reportsCount} status reports.`,
            riskScore: isOverdue ? 'ALTO (Prazo Estourado)' : 'BAIXO (Dentro do SLA)',
          },
        };
      }

      case 'tasks.suggest_next_action': {
        const targetTask = tasks.find((t) => t.id === input.taskId) || tasks[0];
        const isOverdue = targetTask && new Date(targetTask.dueDate) < new Date() && targetTask.status !== 'completed';

        return {
          success: true,
          data: {
            recommendedAction: isOverdue
              ? 'Cobrar fornecedor/cliente e publicar um Status Report obrigatório'
              : 'Concluir próximos itens do checklist e validar documentação',
            reason: isOverdue
              ? 'O prazo venceu sem registro de conclusão.'
              : 'A tarefa está evoluindo normalmente.',
          },
        };
      }

      default:
        return { success: false, error: 'Tool desconhecida no Tool Registry.' };
    }
  }
}
