import {
  User,
  Department,
  BusinessUnit,
  UserRole,
  PermissionScope,
  PermissionDecision,
  PermissionCapabilityRule,
  PermissionExplainResult,
  Task,
  Deal,
} from '../types';

export const CAPABILITIES_REGISTRY: PermissionCapabilityRule[] = [
  // CRM & Empresas
  {
    id: 'cap-comp-read',
    module: 'CRM & Empresas',
    capability: 'companies.read',
    actionName: 'Visualizar Empresas Cliente',
    defaultScope: 'department_and_below',
    allowedScopes: ['own', 'team', 'department', 'department_and_below', 'business_unit', 'all'],
    description: 'Acesso de leitura às fichas cadastrais e histórico de empresas clientes.',
  },
  {
    id: 'cap-comp-create',
    module: 'CRM & Empresas',
    capability: 'companies.create',
    actionName: 'Cadastrar Empresas Cliente',
    defaultScope: 'business_unit',
    allowedScopes: ['department', 'department_and_below', 'business_unit', 'all'],
    description: 'Permissão para criar novos registros corporativos com validação de duplicidade.',
  },
  {
    id: 'cap-comp-update',
    module: 'CRM & Empresas',
    capability: 'companies.update',
    actionName: 'Editar Ficha da Empresa',
    defaultScope: 'department',
    allowedScopes: ['own', 'department', 'department_and_below', 'business_unit', 'all'],
    description: 'Atualizar dados cadastrais, financeiros e contatos vinculados à empresa.',
  },
  {
    id: 'cap-cont-read',
    module: 'CRM & Empresas',
    capability: 'contacts.read',
    actionName: 'Visualizar Ficha 360° do Contato',
    defaultScope: 'department_and_below',
    allowedScopes: ['own', 'participating', 'team', 'department', 'department_and_below', 'business_unit', 'all'],
    description: 'Acesso aos dados de contato, telefones, e-mails e timeline de comunicação.',
  },

  // Leads & Prospecção
  {
    id: 'cap-lead-read',
    module: 'Leads & Prospecção',
    capability: 'leads.read',
    actionName: 'Visualizar Leads & Inbound',
    defaultScope: 'managed_users',
    allowedScopes: ['own', 'participating', 'team', 'department', 'managed_users', 'business_unit', 'all'],
    description: 'Acesso aos prospects recebidos via WhatsApp, formulários e prospecção outbound.',
  },
  {
    id: 'cap-lead-assign',
    module: 'Leads & Prospecção',
    capability: 'leads.assign',
    actionName: 'Distribuir Leads para Equipe',
    defaultScope: 'department_and_below',
    allowedScopes: ['team', 'department', 'department_and_below', 'business_unit', 'all'],
    description: 'Atribuir ou redirecionar a responsabilidade de prospects entre vendedores/SDRs.',
  },

  // Operação & Tarefas
  {
    id: 'cap-task-read',
    module: 'Operação & Tarefas',
    capability: 'tasks.read',
    actionName: 'Visualizar Tarefas & SLA',
    defaultScope: 'department_and_below',
    allowedScopes: ['own', 'participating', 'team', 'department', 'department_and_below', 'managed_users', 'business_unit', 'all'],
    description: 'Acesso às demandas operacionais, Kanban e monitoramento de SLA por equipe.',
  },
  {
    id: 'cap-task-create',
    module: 'Operação & Tarefas',
    capability: 'tasks.create',
    actionName: 'Criar Tarefas Canônicas',
    defaultScope: 'business_unit',
    allowedScopes: ['own', 'department', 'business_unit', 'all'],
    description: 'Abertura de novas demandas operacionais com checklist e time tracking.',
  },
  {
    id: 'cap-task-assign',
    module: 'Operação & Tarefas',
    capability: 'tasks.assign',
    actionName: 'Atribuir Responsável / Executor',
    defaultScope: 'managed_users',
    allowedScopes: ['team', 'department', 'department_and_below', 'managed_users', 'business_unit', 'all'],
    description: 'Redefinir executor (`assigned_user_id`) ou proprietário (`owner_user_id`) da tarefa.',
  },
  {
    id: 'cap-task-time-track',
    module: 'Operação & Tarefas',
    capability: 'tasks.time.track',
    actionName: 'Registrar Time Tracking (Horas)',
    defaultScope: 'own',
    allowedScopes: ['own', 'participating', 'business_unit', 'all'],
    description: 'Cronometrar tempo trabalhado e registrar horas em tarefas operacionais.',
  },

  // Projetos
  {
    id: 'cap-proj-read',
    module: 'Projetos',
    capability: 'projects.read',
    actionName: 'Visualizar Estrutura de Projetos',
    defaultScope: 'department_and_below',
    allowedScopes: ['participating', 'team', 'department', 'department_and_below', 'business_unit', 'all'],
    description: 'Visualizar cronograma, entregas, membros e progresso de projetos da BU.',
  },
  {
    id: 'cap-proj-manage',
    module: 'Projetos',
    capability: 'projects.manage',
    actionName: 'Gerenciar Projetos & Membros',
    defaultScope: 'department',
    allowedScopes: ['department', 'department_and_below', 'business_unit', 'all'],
    description: 'Criar projetos, definir governança, adicionar membros e alterar cronograma.',
  },

  // Administração & BUs
  {
    id: 'cap-admin-bu',
    module: 'Administração & BUs',
    capability: 'admin.business_units.manage',
    actionName: 'Criar e Gerenciar BUs',
    defaultScope: 'all',
    allowedScopes: ['business_unit', 'all'],
    description: 'Criar novas empresas no grupo e alterar configurações de segregação multi-BU.',
  },
  {
    id: 'cap-admin-priv-data',
    module: 'Administração & BUs',
    capability: 'users.private_data.read',
    actionName: 'Acessar Dados Privados de Colaboradores',
    defaultScope: 'all',
    allowedScopes: ['department', 'business_unit', 'all'],
    description: 'Acesso a CPF, contato de emergência e histórico salarial/contratual (LGPD Compliance).',
  },
];

export class PermissionEngineService {
  /**
   * Resolves all subordinate user IDs under the actor's organizational hierarchy
   * (Direct & Indirect subordinates via managerId, supervisorId, and department leadership).
   */
  static getOrganizationalDescendants(
    actorUserId: string,
    users: User[],
    departments: Department[]
  ): string[] {
    const descendantIds = new Set<string>();

    // 1. Direct Manager & Supervisor links
    const findSubordinates = (managerId: string) => {
      const directs = users.filter((u) => u.managerId === managerId || u.supervisorId === managerId);
      for (const sub of directs) {
        if (!descendantIds.has(sub.id)) {
          descendantIds.add(sub.id);
          findSubordinates(sub.id); // Recursive tree walk
        }
      }
    };

    findSubordinates(actorUserId);

    // 2. Department Leadership
    const ledDepts = departments.filter((d) => d.leaderId === actorUserId);
    for (const dept of ledDepts) {
      const deptUsers = users.filter((u) => u.departmentId === dept.id && u.id !== actorUserId);
      deptUsers.forEach((u) => descendantIds.add(u.id));

      // Also check subdepartments below led department
      const subDepts = this.getSubdepartments(dept.id, departments);
      for (const subDept of subDepts) {
        const subUsers = users.filter((u) => u.departmentId === subDept.id && u.id !== actorUserId);
        subUsers.forEach((u) => descendantIds.add(u.id));
      }
    }

    return Array.from(descendantIds);
  }

  /**
   * Resolves all subdepartment IDs linked to a parent department.
   */
  static getSubdepartments(departmentId: string, departments: Department[]): Department[] {
    const subDeptList: Department[] = [];

    const walk = (parentId: string) => {
      const children = departments.filter((d) => d.parentDepartmentId === parentId);
      for (const child of children) {
        if (!subDeptList.some((s) => s.id === child.id)) {
          subDeptList.push(child);
          walk(child.id);
        }
      }
    };

    walk(departmentId);
    return subDeptList;
  }

  /**
   * Resolves the full breadcrumb path of a user in the organizational hierarchy.
   */
  static getResolvedHierarchyPath(
    user: User,
    users: User[],
    departments: Department[],
    businessUnits: BusinessUnit[]
  ): string {
    const bu = businessUnits.find((b) => b.id === user.primaryBusinessUnitId || b.id === user.businessUnitIds[0]);
    const dept = departments.find((d) => d.id === user.departmentId);
    const parentDept = dept?.parentDepartmentId ? departments.find((d) => d.id === dept.parentDepartmentId) : null;
    const manager = user.managerId ? users.find((u) => u.id === user.managerId) : null;

    const parts: string[] = ['Holding Grupo VERGROUP'];

    if (bu) parts.push(bu.tradeName || bu.name);
    if (parentDept) parts.push(`Dept. Pai: ${parentDept.name}`);
    if (dept) parts.push(dept.name);
    if (manager) parts.push(`Gestor: ${manager.name}`);
    parts.push(`${user.name} (${user.jobTitle})`);

    return parts.join(' ➔ ');
  }

  /**
   * Core Access Explainer & Evaluation Engine.
   * Answers the question: "Why does user X have ALLOW / DENY / CUSTOM access to capability Y?"
   */
  static explainPermission(
    actor: User,
    capabilityName: string,
    targetContext: {
      businessUnitId?: string;
      departmentId?: string;
      targetUserId?: string;
      isOwnResource?: boolean;
      isParticipating?: boolean;
    },
    users: User[],
    departments: Department[],
    businessUnits: BusinessUnit[],
    tasks: Task[] = [],
    deals: Deal[] = []
  ): PermissionExplainResult {
    const rule = CAPABILITIES_REGISTRY.find((r) => r.capability === capabilityName);
    const isSuperadmin = actor.role === 'superadmin';
    const isDirector = actor.role === 'director' || actor.role === 'company_admin';
    const isManager = actor.role === 'manager';

    const hierarchyPath = this.getResolvedHierarchyPath(actor, users, departments, businessUnits);
    const activeBU = targetContext.businessUnitId || actor.primaryBusinessUnitId;

    // Check Business Unit Scope Match
    const buMatch = isSuperadmin || actor.businessUnitIds.includes(activeBU);

    if (!buMatch) {
      return {
        decision: 'DENY',
        capability: capabilityName,
        scope: 'business_unit',
        source: 'bu_isolation_policy',
        resolvedHierarchyPath: hierarchyPath,
        organizationalMatch: false,
        businessUnitMatch: false,
        reason: `🔒 Acesso negado: O usuário "${actor.name}" não possui vinculo com a Business Unit "${activeBU}".`,
        targetCountEstimate: 0,
      };
    }

    // Default Scopes based on Role
    let resolvedScope: PermissionScope = rule?.defaultScope || 'own';

    if (isSuperadmin) resolvedScope = 'all';
    else if (isDirector) resolvedScope = 'business_unit';
    else if (isManager) resolvedScope = 'department_and_below';
    else if (targetContext.isOwnResource) resolvedScope = 'own';

    // Organizational Hierarchy Match
    const descendants = this.getOrganizationalDescendants(actor.id, users, departments);
    const isTargetSubordinate = targetContext.targetUserId ? descendants.includes(targetContext.targetUserId) : false;

    let decision: PermissionDecision = 'ALLOW';
    let source = `role:${actor.role}`;
    let reason = `✅ Acesso permitido pelo papel "${actor.role.toUpperCase()}" com escopo "${resolvedScope}".`;

    if (!isSuperadmin && capabilityName === 'admin.business_units.manage') {
      decision = 'DENY';
      reason = `🔒 Somente o SUPERADMIN pode criar ou alterar Empresas do Grupo.`;
    } else if (resolvedScope === 'managed_users' && targetContext.targetUserId && !isTargetSubordinate && targetContext.targetUserId !== actor.id) {
      decision = 'DENY';
      reason = `🔒 O colaborador consultado não pertence à cadeia de subordinados do usuário "${actor.name}".`;
    }

    // Calculate Estimated Record Count for Preview
    let targetCountEstimate = 0;
    if (capabilityName.startsWith('tasks.')) {
      targetCountEstimate = tasks.filter((t) => {
        if (resolvedScope === 'all' || resolvedScope === 'business_unit') return t.businessUnitId === activeBU;
        if (resolvedScope === 'department_and_below' || resolvedScope === 'department') return t.departmentId === actor.departmentId || descendants.includes(t.assignedUserId);
        if (resolvedScope === 'managed_users') return descendants.includes(t.assignedUserId);
        return t.assignedUserId === actor.id || t.participantIds?.includes(actor.id);
      }).length;
    } else if (capabilityName.startsWith('companies.') || capabilityName.startsWith('deals.')) {
      targetCountEstimate = deals.filter((d) => d.businessUnitId === activeBU).length;
    }

    return {
      decision,
      capability: capabilityName,
      scope: resolvedScope,
      source,
      resolvedHierarchyPath: hierarchyPath,
      organizationalMatch: isSuperadmin || isDirector || isManager || Boolean(targetContext.isOwnResource),
      businessUnitMatch: buMatch,
      reason,
      targetCountEstimate,
    };
  }

  /**
   * Privilege Ceiling Validator: Prevents managers from escalating permissions higher than their own scope.
   */
  static checkPrivilegeCeiling(
    granterUser: User,
    targetRole: UserRole,
    targetScope: PermissionScope
  ): { allowed: boolean; message: string } {
    if (granterUser.role === 'superadmin') {
      return { allowed: true, message: 'Superadmin possui governança irrestrita.' };
    }

    if (targetRole === 'superadmin') {
      return {
        allowed: false,
        message: '🔒 Privilege Ceiling: Somente um Superadmin existente pode promover outro usuário a Superadmin.',
      };
    }

    if (targetScope === 'all' || targetScope === 'multi_bu') {
      return {
        allowed: false,
        message: '🔒 Privilege Ceiling: Você não pode conceder escopo Global ou Multi-BU maior que o seu escopo de Unidade.',
      };
    }

    return { allowed: true, message: 'Atribuição permitida dentro da hierarquia.' };
  }
}
