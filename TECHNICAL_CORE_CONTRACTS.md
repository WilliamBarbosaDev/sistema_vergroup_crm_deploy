# 🏛️ CONTRATOS TÉCNICOS E DOCUMENTAÇÃO DE CONGELAMENTO DO CORE REDEFINIDO
## VERGROUP CRM — NÚCLEO ESTÁVEL E INFRAESTRUTURA CENTRAL (5 PILARES)

```text
==============================================================================
# VERGROUP CORE BASELINE LEVEL 2
# TASKS CORE = STABLE
# PROJECTS CORE = STABLE
# CRM CORE = STABLE
# CLIENT PIPELINE CORE = STABLE
# LEADS PIPELINE CORE = STABLE
# HUMAN GOVERNANCE CORE = STABLE
# VERGROUP DESIGN SYSTEM = STABLE
# CLIENT BU ISOLATION = STABLE
==============================================================================
```

Esta documentação define o **Baseline Estável Definitivo dos 5 Pilares de Infraestrutura Central**, da **Governança Humana** e do **Design System Único** da plataforma VERGROUP CRM.

Nenhum módulo futuro (Fiscal, Financeiro, Departamento Pessoal, Jurídico, Marketing, Atendimento) poderá modificar ou duplicar estes pilares. Novos módulos deverão obrigatoriamente se integrar a este núcleo através de **Eventos (Event Bus)**, **Políticas (Policies)**, **Serviços de Domínio**, **Capacidades (Capabilities)**, **Registros de Ferramentas (Tool Registry)**, **Tokens Visuais Globais** e **Chaves Estrangeiras Nativas**.

---

## 🔒 1. REGRAS GERAIS DE ARQUITETURA E NÃO DUPLICAÇÃO

1. **CRM É INFRAESTRUTURA CENTRAL ÚNICA:** É proibida a criação de cadastros paralelos de clientes (ex: `fiscal_clients`, `hr_clients`). Todos os módulos futuros deverão referenciar o cliente oficial (`public.companies` / `public.contacts`).
2. **DISTINÇÃO CONCEITUAL RÍGIDA ENTRE LEAD E CLIENTE:**
   * **Lead:** Potencial cliente ainda não convertido em prospecção comercial.
   * **Cliente:** Empresa/Pessoa convertida e ativa na base do CRM.
3. **DISTINÇÃO ENTRE PIPELINE DE LEADS E PIPELINE DE CLIENTES:**
   * **Pipeline de Leads (Comercial):** Aquisição, qualificação, proposta e conversão (`pipeline_type: 'sales'`).
   * **Pipeline de Clientes (Ciclo de Vida / CS):** Onboarding, implantação, operação recorrente e prevenção de churn (`pipeline_type: 'client_lifecycle'`).
4. **PROIBIDO ACOPLAMENTO ESPECÍFICO:** Proibido código condicional hardcoded de módulos futuros no core (`if (fiscal)` é proibido no Core). A extensão é realizada por assinantes de eventos (Event Bus), capabilities e registries.

---

## 📋 2. CONTRATOS DOS 5 PILARES DO CORE ESTÁVEL

### 2.1 PILAR 1: TASKS CORE (`tasks`)
- **Responsabilidade:** Execução operacional de demandas com protocolo imutável (`VRG-2026-NNNNNN`), timer único transacional em PostgreSQL (`public.time_entries`), governança de SLA por policy (`public.sla_policies`), dependências, subtarefas, anexos e trava de resumo obrigatório de conclusão.
- **Eventos:** `task.created`, `task.updated`, `task.assigned`, `task.status.changed`, `task.timer.started`, `task.timer.paused`, `task.timer.auto_paused`, `task.sla.breached`, `task.completed`.
- **Capabilities:** `tasks.read`, `tasks.create`, `tasks.update`, `tasks.assign`, `tasks.time.track`, `tasks.complete`, `tasks.sla.monitor`.

### 2.2 PILAR 2: PROJECTS CORE (`projects`)
- **Responsabilidade:** Agrupamento operacional de iniciativas com código (`PRJ-2026`), progresso real calculado por tarefas concluídas `(completedTasks / totalTasks) * 100`, tempo derivado de `time_entries`, marcos (milestones), anexos de projeto e diagnósticos VER AI.
- **Eventos:** `project.created`, `project.updated`, `project.member.added`, `project.task.linked`, `project.status.changed`, `project.completed`.
- **Capabilities:** `projects.read`, `projects.create`, `projects.update`, `projects.manage_members`, `projects.attachments.manage`, `projects.complete`.

### 2.3 PILAR 3: CRM CORE (`companies`, `contacts`, `deals`)
- **Responsabilidade:** Fonte única de verdade para Empresas, Contatos e Negócios. Exibição da Ficha 360º unificando dados cadastrais, tarefas, projetos, documentos, interações e diagnósticos VER AI.
- **Eventos:** `company.created`, `company.updated`, `contact.created`, `contact.updated`, `deal.created`, `deal.updated`.
- **Capabilities:** `crm.companies.read`, `crm.companies.create`, `crm.contacts.read`, `crm.contacts.create`, `crm.deals.manage`.

### 2.4 PILAR 4: LEADS PIPELINE CORE (`leads`, `deals`)
- **Responsabilidade:** Gestão do funil de prospecção comercial pré-cliente.
- **Fluxo de Conversão:** Lead Ganho -> Ação de Conversão -> Transforma em Empresa (`company`) + Contato (`contact`) + Oportunidade Ganha (`deal`) + Dispara automações para Onboarding / Projetos / Tarefas.
- **Eventos:** `lead.created`, `lead.updated`, `lead.stage.changed`, `lead.converted`, `deal.won`, `deal.lost`.
- **Capabilities:** `leads.read`, `leads.create`, `leads.convert`, `pipeline.leads.manage`.

### 2.5 PILAR 5: CLIENT PIPELINE CORE (`client_accounts`, `pipelines`)
- **Responsabilidade:** Gestão do ciclo de vida pós-conversão do cliente (Onboarding -> Implantação -> Ativo / Recorrência -> Atendimento -> Retenção / Churn).
- **Integração com Automações:** A transição de estágio do cliente dispara criação automática de projetos, tarefas, atribuição de responsáveis e definição de SLAs via `AutomationEngine`.
- **Eventos:** `client.created`, `client.updated`, `client.stage.changed`, `client.churn_risk.flagged`.
- **Capabilities:** `clients.pipeline.read`, `clients.pipeline.manage`, `clients.onboarding.manage`.

---

## 🧩 3. EXTENSION CONTRACT & CONVENÇÃO PARA NOVOS MÓDULOS

Para registrar um novo módulo de extensão (Fiscal, Financeiro, DP/RH, Jurídico, Marketing, Compliance), o desenvolvedor deve registrar um `ModuleDefinition` no `ModuleRegistryService`:

```typescript
export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  enabledByDefault: boolean;
  allowedBusinessUnitIds: string[]; // Ex: ['bu-tech'] ou ['*']
  requiredCapabilities: string[];
  navigation: ModuleNavigationItem[];
  eventsSubscribed: string[];
  eventsPublished: string[];
  aiTools?: string[];
}
```

---

## 🎨 4. CONGELAMENTO OFICIAL DO VERGROUP DESIGN SYSTEM

```text
# VERGROUP DESIGN SYSTEM = STABLE
```

Todo novo módulo ou funcionalidade deve obrigatoriamente:
1. Reutilizar os componentes compartilhados existentes (`Tabs`, `Table`, `Badge`, `Button`).
2. Consumir os tokens globais em `src/index.css` (`--color-surface`, `--color-page`, `--color-border-subtle`).
3. Utilizar a tipografia oficial: **Plus Jakarta Sans** (Corpo / Rótulos) e **Outfit** (Títulos / Display).
4. Utilizar a paleta oficial: **VERGROUP Green (`#0F8A4B`, `#0B6B3A`, `#ECF8F1`)** e neutros `slate-50` / `slate-200`.
5. Obedecer à **Regra Estrita de Contraste**: Superfície colorida/escura exige texto branco `#FFFFFF`. Superfície clara exige texto escuro `#17212B`.
6. Evitar CSS visual local quando já existir componente ou token equivalente no Design System.

---

## 🔒 5. PROTOCOLO DE GOVERNANÇA DE MUDANÇAS

Toda expansão futura (módulos adicionais) deverá se conectar a esta infraestrutura estável sem alterar o core. Mudanças neste núcleo exigirão:
1. **Análise de Impacto de Regressão nos 5 Pilares e na Governança Humana**.
2. **Execução de Smoke Test Ponta a Ponta de Conversão, Execução e Permissões**.
3. **Migration Incremental no PostgreSQL com Script Reversível**.

---
*Documentação oficial mantida e registrada no repositório VERGROUP CRM.*
