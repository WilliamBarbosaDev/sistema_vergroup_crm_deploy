// ============================================================================
// VERGROUP MODULE EXTENSION FRAMEWORK
// Module: ModuleRegistryService
// Purpose: Registry and lifecycle manager for domain extension modules (Fiscal, HR, Finance, Legal, etc.)
// Protocol: STABLE CORE + EXTENSIBLE MODULES
// ============================================================================

export interface ModuleNavigationItem {
  id: string;
  label: string;
  iconName: string;
  tabId: string;
  requiredCapability: string;
  badgeCount?: number;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  enabledByDefault: boolean;
  allowedBusinessUnitIds: string[]; // ['bu-tech', 'bu-[#1]'] or ['*'] for all
  requiredCapabilities: string[];
  navigation: ModuleNavigationItem[];
  eventsSubscribed: string[];
  eventsPublished: string[];
  aiTools?: string[];
  featureFlags?: string[];
}

export const INITIAL_REGISTERED_MODULES: ModuleDefinition[] = [
  {
    id: 'finance',
    name: 'Módulo Financeiro & Faturamento',
    description: 'Gestão de contas a pagar/receber, conciliação bancária e fluxo de caixa.',
    version: '1.0.0',
    icon: 'DollarSign',
    enabledByDefault: true,
    allowedBusinessUnitIds: ['*'],
    requiredCapabilities: ['finance.read'],
    navigation: [
      {
        id: 'nav-finance-main',
        label: 'Gestão Financeira & Caixa',
        iconName: 'DollarSign',
        tabId: 'mod-finance',
        requiredCapability: 'finance.read',
      },
    ],
    eventsSubscribed: ['deal.won', 'client.created'],
    eventsPublished: ['finance.invoice.generated', 'finance.payment.received'],
  },
  {
    id: 'hr',
    name: 'Módulo DP & Recursos Humanos',
    description: 'Fechamento de folha de pagamento, eSocial, gestão de benefícios e férias.',
    version: '1.0.0',
    icon: 'Users',
    enabledByDefault: true,
    allowedBusinessUnitIds: ['*'],
    requiredCapabilities: ['hr.read'],
    navigation: [
      {
        id: 'nav-hr-main',
        label: 'Departamento Pessoal / RH',
        iconName: 'Users',
        tabId: 'mod-hr',
        requiredCapability: 'hr.read',
      },
    ],
    eventsSubscribed: ['user.created', 'client.stage.changed'],
    eventsPublished: ['hr.payroll.closed'],
  },
];

export class ModuleRegistryService {
  private static registeredModules: Map<string, ModuleDefinition> = new Map(
    INITIAL_REGISTERED_MODULES.map((m) => [m.id, m])
  );

  /**
   * Registers a new extension module into the framework
   */
  public static registerModule(moduleDef: ModuleDefinition): void {
    this.registeredModules.set(moduleDef.id, moduleDef);
  }

  /**
   * Returns all registered extension modules
   */
  public static getRegisteredModules(): ModuleDefinition[] {
    return Array.from(this.registeredModules.values());
  }

  /**
   * Checks if a module is enabled for a specific Business Unit
   */
  public static isModuleEnabledForBU(moduleId: string, businessUnitId: string): boolean {
    const mod = this.registeredModules.get(moduleId);
    if (!mod || !mod.enabledByDefault) return false;
    if (mod.allowedBusinessUnitIds.includes('*')) return true;
    return mod.allowedBusinessUnitIds.includes(businessUnitId);
  }

  /**
   * Gets navigation items for active modules enabled for the active Business Unit
   */
  public static getNavigationForBU(businessUnitId: string): ModuleNavigationItem[] {
    const items: ModuleNavigationItem[] = [];
    this.registeredModules.forEach((mod) => {
      if (this.isModuleEnabledForBU(mod.id, businessUnitId)) {
        items.push(...mod.navigation);
      }
    });
    return items;
  }
}
