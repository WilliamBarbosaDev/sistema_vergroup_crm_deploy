import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Gauge,
  Plus,
  Sparkles,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AIAgentRecord,
  AIAgentStatus,
  canManageAIAgents,
  loadAIAgents,
  saveCustomAIAgents,
} from './aiAgentsRegistry';

const STATUS_OPTIONS: AIAgentStatus[] = ['active', 'inactive', 'paused', 'learning'];

const EMPTY_FORM = {
  name: '',
  description: '',
  type: '',
  provider: '',
  model: '',
  businessUnit: '',
  scope: '',
  function: '',
  instructions: '',
  capabilities: '',
  status: 'active' as AIAgentStatus,
};

export const AIAgentsManagementView: React.FC = () => {
  const { currentUser, businessUnits } = useApp();
  const [agents, setAgents] = useState<AIAgentRecord[]>(() => loadAIAgents());
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => loadAIAgents()[0]?.id ?? '');
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState<string | null>(null);

  const canManage = useMemo(() => canManageAIAgents(currentUser), [currentUser]);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];
  const customCount = agents.filter((agent) => agent.isCustom).length;

  const updateField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManage) return;
    if (!form.name.trim() || !form.description.trim() || !form.type.trim()) return;

    const newAgent: AIAgentRecord = {
      id: `agent-custom-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      status: form.status,
      provider: form.provider.trim() || undefined,
      model: form.model.trim() || undefined,
      businessUnit: form.businessUnit.trim() || undefined,
      scope: form.scope.trim() || undefined,
      function: form.function.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      capabilities: form.capabilities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      isCustom: true,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      executionCount: 0,
      lastExecutionAt: null,
    };

    const nextAgents = [...agents, newAgent];
    setAgents(nextAgents);
    setSelectedAgentId(newAgent.id);
    saveCustomAIAgents(nextAgents);
    setForm(EMPTY_FORM);
    setNotice(`Agente "${newAgent.name}" criado com sucesso.`);
  };

  const toggleCustomStatus = (agentId: string) => {
    const nextAgents = agents.map((agent) => {
      if (agent.id !== agentId || !agent.isCustom) return agent;
      const nextStatus: AIAgentStatus = agent.status === 'active' ? 'inactive' : 'active';
      return { ...agent, status: nextStatus };
    });
    setAgents(nextAgents);
    saveCustomAIAgents(nextAgents);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[#0B6B3A] font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              Gestão completa do módulo
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">Centro de IA & Agentes</h1>
            <p className="mt-2 text-sm text-slate-500">
              Página administrativa/operacional dos agentes reais já carregados no sistema. Sem métricas inventadas e com criação restrita por permissão.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Agentes</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{agents.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Custom</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{customCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Permissão</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{canManage ? 'Liberada' : 'Somente leitura'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Operacional</p>
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Agentes carregados</h2>
                <p className="text-xs text-slate-500">Registros nativos e personalizados</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{agents.length} itens</span>
            </div>

            <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
              {agents.map((agent) => {
                const active = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${active ? 'border-[#0F8A4B] bg-[#ECF8F1]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#0F8A4B]" />
                          <h3 className="font-semibold text-slate-900 truncate">{agent.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{agent.description}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-white text-[#0B6B3A]' : 'bg-slate-100 text-slate-600'}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <p className="uppercase tracking-wide font-semibold text-slate-400">Tipo</p>
                        <p className="text-slate-700">{agent.type}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide font-semibold text-slate-400">Escopo</p>
                        <p className="text-slate-700">{agent.scope ?? 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide font-semibold text-slate-400">Provider</p>
                        <p className="text-slate-700">{agent.provider ?? 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide font-semibold text-slate-400">Modelo</p>
                        <p className="text-slate-700">{agent.model ?? 'Não definido'}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{agent.executionCount ? `${agent.executionCount} execuções` : 'Sem histórico ainda'}</span>
                      {agent.isCustom ? (
                        <span className="inline-flex items-center gap-1 text-[#0B6B3A] font-semibold"><ShieldCheck className="w-3.5 h-3.5" />Custom</span>
                      ) : (
                        <span className="font-semibold text-slate-400">Nativo</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Detalhes do agente</h2>
              <p className="text-xs text-slate-500">Informações e ações</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice('Abrir histórico/configuração completa pode ser conectado ao fluxo real de gestão.')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Settings className="w-4 h-4" />
              Ações
            </button>
          </div>

          {selectedAgent ? (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#ECF8F1] text-[#0B6B3A]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedAgent.function ?? 'Função não definida'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoCard title="Business Unit" value={selectedAgent.businessUnit ?? 'Não definido'} />
                <InfoCard title="Provider" value={selectedAgent.provider ?? 'Não definido'} />
                <InfoCard title="Modelo" value={selectedAgent.model ?? 'Não definido'} />
                <InfoCard title="Última execução" value={selectedAgent.lastExecutionAt ?? 'Sem histórico ainda'} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Instruções</p>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{selectedAgent.instructions ?? 'Sem instruções registradas.'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Ver histórico</button>
                <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Configurar</button>
                <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Abrir agente</button>
              </div>

              {selectedAgent.isCustom && (
                <button
                  type="button"
                  onClick={() => toggleCustomStatus(selectedAgent.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F8A4B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B6B3A] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Alternar status do agente customizado
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 text-sm text-slate-500">Nenhum agente selecionado.</div>
          )}
        </div>

        <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Criar novo agente</h2>
            <p className="text-xs text-slate-500 mt-1">Permissão restrita para SUPERADMIN e COMPANY_ADMIN.</p>
          </div>

          <form onSubmit={handleCreate} className="p-5 space-y-3 max-h-[760px] overflow-y-auto">
            {!canManage && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Somente leitura para o usuário atual.
              </div>
            )}

            <Field label="Nome do agente" value={form.name} onChange={(value) => updateField('name', value)} disabled={!canManage} />
            <Field label="Descrição" value={form.description} onChange={(value) => updateField('description', value)} disabled={!canManage} textarea />
            <Field label="Business Unit" value={form.businessUnit} onChange={(value) => updateField('businessUnit', value)} disabled={!canManage} placeholder={businessUnits[0]?.name ?? 'Opcional'} />
            <Field label="Tipo" value={form.type} onChange={(value) => updateField('type', value)} disabled={!canManage} placeholder="Ex: Comercial, Financeiro, Atendimento" />
            <Field label="Provider" value={form.provider} onChange={(value) => updateField('provider', value)} disabled={!canManage} placeholder="OpenAI, Anthropic, etc." />
            <Field label="Modelo" value={form.model} onChange={(value) => updateField('model', value)} disabled={!canManage} placeholder="Ex: gpt-4.1" />
            <Field label="Função" value={form.function} onChange={(value) => updateField('function', value)} disabled={!canManage} placeholder="Papel operacional do agente" />
            <Field label="Escopo" value={form.scope} onChange={(value) => updateField('scope', value)} disabled={!canManage} placeholder="CRM, financeiro, suporte..." />
            <Field label="Instruções" value={form.instructions} onChange={(value) => updateField('instructions', value)} disabled={!canManage} textarea />
            <Field label="Capabilities" value={form.capabilities} onChange={(value) => updateField('capabilities', value)} disabled={!canManage} placeholder="monitoramento, follow-up, triagem" />

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                disabled={!canManage}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none disabled:bg-slate-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!canManage}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F8A4B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B6B3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Criar agente
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-slate-900 font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full min-h-[88px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none disabled:bg-slate-100"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none disabled:bg-slate-100"
        />
      )}
    </label>
  );
}
