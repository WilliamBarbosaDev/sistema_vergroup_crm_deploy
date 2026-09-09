export type IntegrationContractSection = {
  key: string;
  title: string;
  description: string;
  tableName: string;
  fields: { name: string; required: boolean; note: string }[];
  rules: string[];
};

export const integrationContractSections: IntegrationContractSection[] = [
  {
    key: 'api-keys',
    title: 'API Keys',
    description: 'Chaves de acesso para integrações externas e internas, com segredo tratado apenas no backend.',
    tableName: 'api_keys',
    fields: [
      { name: 'id', required: true, note: 'UUID ou ID seguro da chave.' },
      { name: 'organization_id', required: true, note: 'Vínculo com a organização/tenant.' },
      { name: 'business_unit_id', required: false, note: 'Escopo opcional por BU.' },
      { name: 'user_id', required: true, note: 'Dono funcional da chave.' },
      { name: 'name', required: true, note: 'Nome humano da integração.' },
      { name: 'scopes', required: true, note: 'Lista de permissões permitidas.' },
      { name: 'environment', required: true, note: 'production | staging | development.' },
      { name: 'status', required: true, note: 'active | inactive | revoked.' },
      { name: 'key_prefix', required: true, note: 'Prefixo visível da chave.' },
      { name: 'secret_hash', required: true, note: 'Hash do segredo; nunca texto puro.' },
      { name: 'secret_last4', required: true, note: 'Apenas conferência visual.' },
      { name: 'created_by_user_id', required: false, note: 'Quem gerou a chave.' },
      { name: 'created_at', required: true, note: 'Timestamp de criação.' },
      { name: 'updated_at', required: true, note: 'Timestamp de atualização.' },
    ],
    rules: [
      'o segredo completo não pode ser salvo em localStorage',
      'o frontend só exibe prefixo e últimos 4 dígitos',
      'a listagem deve respeitar tenant, BU e dono',
      'revogação precisa ser auditable',
    ],
  },
  {
    key: 'webhooks-out',
    title: 'Webhooks de Saída',
    description: 'Eventos enviados pelo sistema para URLs externas com assinatura e retries.',
    tableName: 'outbound_webhooks',
    fields: [
      { name: 'id', required: true, note: 'Identificador do webhook.' },
      { name: 'organization_id', required: true, note: 'Tenant dono do webhook.' },
      { name: 'business_unit_id', required: false, note: 'Escopo por BU.' },
      { name: 'name', required: true, note: 'Nome da integração.' },
      { name: 'url', required: true, note: 'Destino do POST/PATCH/PUT.' },
      { name: 'method', required: true, note: 'Método HTTP permitido.' },
      { name: 'events', required: true, note: 'Eventos observados.' },
      { name: 'headers', required: false, note: 'Headers extras permitidos.' },
      { name: 'secret_hash', required: true, note: 'Segredo assinado no backend.' },
      { name: 'status', required: true, note: 'active | inactive.' },
      { name: 'retry_policy', required: true, note: 'Limite e backoff de retentativa.' },
      { name: 'created_at', required: true, note: 'Timestamp de criação.' },
      { name: 'updated_at', required: true, note: 'Timestamp de atualização.' },
    ],
    rules: [
      'assinatura precisa ser verificada no destino',
      'falhas precisam gerar log de entrega',
      'retries devem ser controlados no backend',
    ],
  },
  {
    key: 'webhooks-in',
    title: 'Webhooks de Entrada',
    description: 'Endpoints que recebem eventos externos com validação de assinatura e schema.',
    tableName: 'inbound_webhooks',
    fields: [
      { name: 'id', required: true, note: 'Identificador do endpoint.' },
      { name: 'organization_id', required: true, note: 'Tenant dono do endpoint.' },
      { name: 'business_unit_id', required: false, note: 'Escopo por BU.' },
      { name: 'name', required: true, note: 'Nome legível do endpoint.' },
      { name: 'slug', required: true, note: 'Path público do endpoint.' },
      { name: 'accepted_events', required: true, note: 'Eventos aceitos.' },
      { name: 'payload_schema', required: false, note: 'Schema do payload esperado.' },
      { name: 'status', required: true, note: 'active | inactive.' },
      { name: 'secret_hash', required: true, note: 'Segredo de validação.' },
      { name: 'created_at', required: true, note: 'Timestamp de criação.' },
      { name: 'updated_at', required: true, note: 'Timestamp de atualização.' },
    ],
    rules: [
      'o endpoint público deve validar assinatura',
      'payloads inválidos precisam ser rejeitados',
      'logs de erro e recebimento devem ser persistidos',
    ],
  },
  {
    key: 'delivery-logs',
    title: 'Logs de Integração',
    description: 'Registro imutável de entregas, tentativas e status de integrações.',
    tableName: 'integration_delivery_logs',
    fields: [
      { name: 'id', required: true, note: 'Identificador do log.' },
      { name: 'integration_type', required: true, note: 'api_key | webhook_outbound | webhook_inbound.' },
      { name: 'integration_id', required: true, note: 'ID da integração relacionada.' },
      { name: 'direction', required: true, note: 'outbound | inbound.' },
      { name: 'event_name', required: true, note: 'Evento registrado.' },
      { name: 'status_code', required: false, note: 'Código HTTP se houver.' },
      { name: 'response_body', required: false, note: 'Resposta resumida.' },
      { name: 'succeeded', required: true, note: 'Sucesso ou falha.' },
      { name: 'created_at', required: true, note: 'Timestamp do log.' },
    ],
    rules: [
      'logs devem ser append-only',
      'nunca gravar segredo puro nos logs',
      'usar para auditoria e reprocessamento',
    ],
  },
];

export const integrationAccessRules = [
  'somente backend escreve segredos e hashes',
  'frontend acessa apenas dados não sensíveis',
  'escopo sempre precisa respeitar tenant e permissões do usuário',
  'operações destrutivas exigem auditoria',
];
