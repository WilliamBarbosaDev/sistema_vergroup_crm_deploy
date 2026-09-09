# Documentação completa do sistema VERGROUP CRM

Data da documentação: 2026-09-09

## 1. Resumo do sistema

O VERGROUP CRM é uma aplicação web de gestão comercial, atendimento, operações e administração multiunidade. O sistema concentra:

- CRM de leads, contatos, empresas e negócios
- Pipelines comerciais com etapas configuráveis
- Gestão operacional de tarefas, projetos e agenda
- Comunicação por e-mail, WhatsApp e chat interno
- Admin multiempresa com usuários, convites e estrutura organizacional
- Módulo de integrações e auditoria
- Formulários públicos e importação de dados

A aplicação usa frontend React + TypeScript com Vite e TailwindCSS, e mantém parte do estado em armazenamento local do navegador para funcionalidades legadas e simulações de ambiente.

## 2. Stack técnica

- React 19
- TypeScript
- Vite
- TailwindCSS
- Lucide React para ícones
- Canvas Confetti para feedback visual
- Express e dotenv presentes nas dependências do projeto

## 3. Estrutura funcional do sistema

### 3.1 Autenticação e sessão

Funcionalidades presentes:

- Tela de login com validação de e-mail e senha
- Alternância entre usuários cadastrados
- Logout com limpeza da sessão atual
- Controle de acesso por estado `isAuthenticated`

Hardening aplicado recentemente:

- A sessão passou a usar `sessionStorage` para persistência do estado de autenticação
- A inicialização da autenticação foi ajustada para evitar depender de `localStorage`
- IDs internos de alguns registros passaram a usar geração segura com `crypto.randomUUID()` ou `crypto.getRandomValues()` quando disponível

Observação importante:

- Ainda existem partes legadas do sistema que usam `localStorage` para dados de interface e persistência local de algumas entidades. Isso precisa ser migrado para backend/banco para um ambiente estritamente produtivo.

### 3.2 Dashboard principal

O sistema possui navegação por abas e um layout principal que concentra os módulos:

- Cockpit / visão geral
- AI Agents
- CRM Deals
- CRM Leads
- CRM Contacts
- CRM Companies
- Clients Pipeline
- Work Tasks
- Work Projects
- Work Calendar
- Comms Chat
- Comms Email
- Comms WhatsApp
- Management Analytics
- Management Automations
- Management Audit
- Admin Org
- Admin Integrations
- Mod Finance
- Mod HR

### 3.3 Administração

O painel administrativo cobre:

- Usuários
- Convites de colaboradores
- Organograma por empresa/unidade, departamentos e times
- Configuração de empresas / unidades de negócio
- Pipelines comerciais
- Formulários web
- Catálogo de itens
- Importações
- Integrações

### 3.4 CRM comercial

Funcionalidades de CRM presentes:

- Cadastro e gestão de leads
- Conversão de lead em negócio
- Cadastro e atualização de contatos
- Cadastro e atualização de empresas
- Pipeline visual com etapas
- Mudança de estágio de negócio
- Marcação de negócio ganho ou perdido
- Documentos vinculados ao negócio
- Associação de contatos ao negócio
- Detecção de duplicidade em contatos

### 3.5 Operações e produtividade

Funcionalidades operacionais presentes:

- Gestão de tarefas
- Templates de tarefas
- Checklist de tarefas
- Controle de tempo gasto
- Comentários em tarefas
- Projetos com marcos e progresso
- Agenda / eventos
- Verificação de disponibilidade de participantes
- Status de presença em eventos
- Canais de chat e mensagens internas

### 3.6 Comunicação

#### E-mail

O sistema já contempla:

- Múltiplas contas de e-mail por usuário
- Configuração de SMTP e IMAP
- Seleção de conta ativa
- Envio de e-mail com vínculo a negócio, projeto ou tarefa
- Migração de contas legadas para a nova estrutura multi-conta

#### WhatsApp

O sistema já contempla:

- Configuração multi-provedor
- Suporte conceitual a Meta Cloud API oficial
- Suporte conceitual a gateways como Evolution API, Z-API, W-API, Baileys e webhook personalizado
- Controle de contas/canais por unidade de negócio

Observação de segurança:

- A tela de configuração ainda guarda parte da configuração em estado local do frontend. Credenciais sensíveis não devem ficar no browser em produção; o ideal é backend/API com armazenamento seguro.

### 3.7 Automação e auditoria

O sistema possui:

- Regras de automação
- Simulação de execução de automação
- Registro de auditoria
- Logs de atividade
- Alertas e notificações do sistema

### 3.8 Webforms

O módulo de formulários inclui:

- Formulários configuráveis
- Campos com tipos diferentes
- Captura para lead, e-mail, telefone, empresa, cargo e mensagem
- Submissões registradas localmente no estado atual do frontend

### 3.9 Catálogo e importação

O sistema inclui:

- Catálogo de itens e serviços
- Jobs de importação
- Registro de status de importação

### 3.10 Integrações

O módulo de integrações inclui:

- Estrutura para API Keys
- Estrutura para webhooks de saída
- Estrutura para webhooks de entrada
- Painel de auditoria de integrações
- Especificação contratual de integrações

Estado atual do módulo:

- A base estrutural está preparada, mas parte da integração ainda está em fase de consolidação com backend real.

## 4. Mudanças feitas recentemente

### 4.1 Hardenização do AppContext

Alterações aplicadas:

- Removido o bloco de limpeza automática agressiva de dados locais que podia apagar o navegador em carregamento
- IDs internos passaram a usar `createSecureId()` com suporte a APIs criptográficas do browser
- O fallback inseguro com `Math.random()` foi removido dos caminhos principais de geração de ID
- A persistência de autenticação foi migrada de `localStorage` para `sessionStorage`
- O login e o logout passaram a ler e remover o estado de sessão no `sessionStorage`
- A criação de convites passou a usar IDs mais seguros

### 4.2 StayCloudConfigModal

Alterações aplicadas no estado atual do repositório:

- Os valores padrão hardcoded de configuração foram removidos do modal
- Os campos de configuração agora iniciam vazios
- Isso reduz o risco de expor valores sensíveis ou de produção no próprio frontend

### 4.3 Situação do código após as mudanças

Verificações executadas localmente:

- `npm run lint` passou
- `npm run build` passou
- O build produz aviso de chunk grande, mas não bloqueante

## 5. Persistência de dados

O sistema ainda mistura dois modelos:

### 5.1 Estado em memória do frontend

Parte considerável do app usa estado React para funcionamento imediato.

### 5.2 Persistência local legada

Vários módulos ainda leem ou gravam em `localStorage`, principalmente para:

- dados de demonstração
- preferências de interface
- estruturas de configuração legadas
- algumas listas de entidades do CRM

Isso funciona no estado atual do projeto, mas não é o padrão ideal para produção com multiusuário real.

## 6. Segurança e limitações conhecidas

### Pontos positivos atuais

- Geração de IDs mais segura nos fluxos alterados
- Sessão de autenticação menos persistente no navegador
- Remoção de limpeza agressiva que podia destruir o estado local
- Estrutura de integrações organizada para futura consolidação

### Limitações conhecidas

- Ainda há dependência de `localStorage` em várias áreas
- A autenticação continua sendo uma implementação de frontend, não um auth server completo
- Parte das integrações ainda é estrutural e não totalmente conectada a um backend seguro
- Credenciais sensíveis não devem permanecer no navegador em um deploy real
- O bundle principal ainda está acima do limite de 500 kB e gera aviso de tamanho

## 7. Como executar o projeto

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Verificação de tipos

```bash
npm run lint
```

## 8. Estado de validação

Última validação local registrada:

- TypeScript sem erros
- Build de produção concluído com sucesso
- Apenas aviso de tamanho de chunk no Vite

## 9. Arquivos mais impactados pelas mudanças recentes

- `src/context/AppContext.tsx`
- `src/components/admin/StayCloudConfigModal.tsx`

## 10. Recomendações para produção real

Para um deploy realmente fechado para produção, o próximo passo ideal é:

1. Migrar autenticação para backend com sessão/token real
2. Tirar dados sensíveis do frontend e do `localStorage`
3. Persistir entidades em banco com controle de tenant/unidade
4. Conectar integrações a endpoints seguros server-side
5. Implementar auditoria e revogação real para chaves e webhooks
6. Reduzir o bundle principal com code splitting

## 11. Observação final

Esta documentação descreve o estado funcional do sistema e as últimas correções aplicadas no código atual do repositório. Ela deve ser mantida atualizada sempre que novos módulos forem adicionados ou quando a camada de backend substituir os fluxos legados do frontend.
