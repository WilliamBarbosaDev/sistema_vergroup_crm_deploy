import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Play,
  Settings,
  Brain,
  Send,
  User,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AIAgentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'learning' | 'paused';
  icon: string;
  color: string;
  description: string;
  triggers: string[];
  systemPrompt?: string;
  isCustom?: boolean;
  createdBy?: string;
  stats: { executions: number; accuracy: string; lastRun: string };
}

const DEFAULT_AGENTS: AgentInfo[] = [
  {
    id: 'agent-copilot',
    name: 'Agente Executivo VER Copilot',
    role: 'Auditoria de SLA & Priorização Operacional',
    status: 'active',
    icon: '✨',
    color: 'bg-emerald-50 text-[#0B6B3A] border-emerald-200',
    description: 'Varre eventos de domínio, calcula pontuações de risco e sugere reatribuição preventiva de tarefas com prazo crítico.',
    triggers: ['Evento de Domínio: TaskOverdueEvent', 'SLA Clock Ticker (5m)', 'Manual Trigger'],
    stats: { executions: 1420, accuracy: '99.4%', lastRun: 'há 2 minutos' },
  },
  {
    id: 'agent-commercial',
    name: 'Agente Comercial & Prospecção',
    role: 'Qualificação de Leads & Follow-up de Funil',
    status: 'active',
    icon: '📈',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Analisa o comportamento dos leads no funil comercial e agenda reuniões de follow-up automaticamente.',
    triggers: ['DealStageChangedEvent', 'NewLeadCapturedEvent', 'WhatsApp Message Received'],
    stats: { executions: 890, accuracy: '98.8%', lastRun: 'há 5 minutos' },
  },
  {
    id: 'agent-finance',
    name: 'Agente Financeiro & Contratos',
    role: 'Monitoramento de Recorrência & MRR',
    status: 'active',
    icon: '💲',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Monitora contratos com clientes, prevê inadimplência e notifica gestores sobre vencimentos próximos.',
    triggers: ['ContractRenewalEvent', 'MonthlyBillingCycleTicker', 'ClientStatusCheck'],
    stats: { executions: 530, accuracy: '99.9%', lastRun: 'há 12 minutos' },
  },
  {
    id: 'agent-support',
    name: 'Agente de Atendimento W-API',
    role: 'Triagem Inteligente WhatsApp & E-mail',
    status: 'active',
    icon: '💬',
    color: 'bg-[#ECF8F1] text-[#0B6B3A] border-emerald-200',
    description: 'Realiza pré-atendimento automático de mensagens no WhatsApp W-API e e-mails corporativos.',
    triggers: ['WhatsAppInboundWebhook', 'EmailReceivedWebhook', 'ClientRequestTrigger'],
    stats: { executions: 2150, accuracy: '97.6%', lastRun: 'há 1 minuto' },
  },
];

const LOCAL_STORAGE_KEY = 'vergroup_ai_custom_agents_v1';

export const AIAgentCenterModal: React.FC<AIAgentCenterModalProps> = ({ isOpen, onClose }) => {
  const { tasks, deals, currentUser, addAuditLog } = useApp();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-copilot');
  const [promptInput, setPromptInput] = useState<string>('');
  
  // Dynamic Agents list combining defaults and stored custom agents
  const [agents, setAgents] = useState<AgentInfo[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const custom: AgentInfo[] = JSON.parse(saved);
        return [...DEFAULT_AGENTS, ...custom];
      }
    } catch (e) {
      console.error('Erro ao carregar agentes customizados:', e);
    }
    return DEFAULT_AGENTS;
  });

  // Modal for Admin Create New Agent
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentRole, setNewAgentRole] = useState<string>('');
  const [newAgentIcon, setNewAgentIcon] = useState<string>('🤖');
  const [newAgentColor, setNewAgentColor] = useState<string>('bg-purple-50 text-purple-700 border-purple-200');
  const [newAgentDescription, setNewAgentDescription] = useState<string>('');
  const [newAgentSystemPrompt, setNewAgentSystemPrompt] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Manual Trigger']);

  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    {
      sender: 'agent',
      text: `Olá ${currentUser.name.split(' ')[0]}! Sou o **Agente Executivo VER Copilot**. Realizei a varredura contínua de ${tasks.length} tarefas e ${deals.length} negócios no funil. Como posso ajudar agora?`,
      time: 'Agora mesmo',
    },
  ]);

  if (!isOpen) return null;

  // Check if current user is Administrator
  const isAdmin = ['superadmin', 'company_admin', 'director', 'manager'].includes(currentUser.role);

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const availableIcons = ['🤖', '⚡', '🎯', '🛡️', '📊', '🧠', '💼', '💬', '📈', '✨', '🔍', '⚖️'];
  const availableTriggers = [
    'Evento de Domínio: TaskOverdueEvent',
    'DealStageChangedEvent',
    'NewLeadCapturedEvent',
    'WhatsAppInboundWebhook',
    'EmailReceivedWebhook',
    'ContractRenewalEvent',
    'SLA Clock Ticker (5m)',
    'Manual Trigger',
  ];

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;

    const newAgent: AgentInfo = {
      id: `agent-custom-${Date.now()}`,
      name: newAgentName.trim(),
      role: newAgentRole.trim(),
      status: 'active',
      icon: newAgentIcon,
      color: newAgentColor,
      description: newAgentDescription.trim() || 'Agente orquestrador personalizado criado pelo Administrador.',
      triggers: selectedTriggers,
      systemPrompt: newAgentSystemPrompt.trim(),
      isCustom: true,
      createdBy: currentUser.name,
      stats: { executions: 0, accuracy: '100%', lastRun: 'Agora mesmo' },
    };

    const updated = [...agents, newAgent];
    setAgents(updated);
    
    // Persist custom agents in localStorage
    const customOnly = updated.filter((a) => a.isCustom);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));

    // Audit log entry
    if (addAuditLog) {
      addAuditLog('create', 'AIAgent', newAgent.id, `Criou novo agente IA autônomo: "${newAgent.name}"`);
    }

    setSelectedAgentId(newAgent.id);
    setIsCreateModalOpen(false);

    // Reset form
    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentDescription('');
    setNewAgentSystemPrompt('');
    setSelectedTriggers(['Manual Trigger']);

    // Log welcome message from new agent
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'agent',
        text: `🤖 **Agente [${newAgent.name}] Inicializado!** Fui cadastrado por ${currentUser.name} com os gatilhos: ${newAgent.triggers.join(', ')}. Estou operando em conformidade com as diretrizes do sistema.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (!isAdmin) return;
    const target = agents.find((a) => a.id === agentId);
    if (!target || !target.isCustom) return;

    if (confirm(`Tem certeza que deseja remover o agente "${target.name}"?`)) {
      const updated = agents.filter((a) => a.id !== agentId);
      setAgents(updated);
      const customOnly = updated.filter((a) => a.isCustom);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
      
      if (addAuditLog) {
        addAuditLog('delete', 'AIAgent', agentId, `Removeu o agente IA: "${target.name}"`);
      }

      if (selectedAgentId === agentId) {
        setSelectedAgentId('agent-copilot');
      }
    }
  };

  const handleSendMessage = () => {
    if (!promptInput.trim()) return;
    const userText = promptInput;
    setPromptInput('');
    
    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `[${activeAgent.name}]: Analisei o comando "${userText}". Execução em conformidade com as regras do seu papel de ${currentUser.role.toUpperCase()}. Domínio operado com sucesso.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E2E6EA] shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F8FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 font-display">Centro de Inteligência & Agentes VER AI</h2>
                <span className="text-[10px] font-mono bg-[#0F8A4B] text-white px-2 py-0.5 rounded-full font-bold uppercase">
                  {agents.length} Agentes Ativos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Orquestração de agentes autônomos via MCP & Tool Registry Engine (PRD AI-First 4.0)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Agent Action Button */}
            {isAdmin ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary text-xs flex items-center gap-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Agente</span>
              </button>
            ) : (
              <div title="Criação de novos agentes restrita aos Administradores" className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <Lock className="w-3 h-3" />
                <span>Criação Restrita a Admins</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#E2E6EA]">
          
          {/* Left Column: Agent Selector List */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-2.5 bg-[#F8FAFB]">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Agentes Especiais ({agents.length})
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[11px] text-[#0F8A4B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo Agente</span>
                </button>
              )}
            </div>

            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3 rounded-lg border text-xs transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'bg-white border-[#0F8A4B] shadow-2xs'
                      : 'bg-white/60 border-[#E2E6EA] hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{agent.icon}</span>
                      <strong className="text-slate-900 font-semibold">{agent.name}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${agent.color}`}>
                        {agent.isCustom ? 'Personalizado' : 'Nativo'}
                      </span>
                      {agent.isCustom && isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Remover Agente Personalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{agent.description}</p>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{agent.stats.executions} execuções</span>
                    <span>Precisão: {agent.stats.accuracy}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive AI Agent Terminal / Chat */}
          <div className="md:col-span-7 flex flex-col bg-white p-4 overflow-hidden">
            
            {/* Agent Header Details */}
            <div className="pb-3 border-b border-[#E2E6EA] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeAgent.icon}</span>
                  <h3 className="text-sm font-semibold text-slate-900 font-display">{activeAgent.name}</h3>
                </div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{activeAgent.role}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#0B6B3A] font-semibold bg-[#ECF8F1] px-2.5 py-1 rounded-md border border-[#0F8A4B]/20">
                <Brain className="w-3.5 h-3.5" />
                <span>MCP Connected</span>
              </div>
            </div>

            {/* Chat History Container */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-xs">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="p-1.5 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg shrink-0 h-fit">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0F8A4B] text-white font-medium'
                        : 'bg-[#F5F7F8] text-slate-800 border border-[#E2E6EA]'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`block text-[10px] mt-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Command Input Bar */}
            <div className="pt-3 border-t border-[#E2E6EA]">
              <div className="flex items-center gap-2 bg-[#F5F7F8] p-1.5 rounded-lg border border-[#E2E6EA]">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Instruir ${activeAgent.name}...`}
                  className="bg-transparent text-xs text-slate-900 focus:outline-none w-full px-2 font-medium"
                />
                <button
                  onClick={handleSendMessage}
                  className="btn-primary text-xs flex items-center gap-1.5 shrink-0 px-3 py-1.5 bg-[#0F8A4B]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CREATE NEW AGENT WORKSPACE MODAL (ADMIN ONLY) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E6EA] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F8FAFB]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 font-display">Cadastrar Novo Agente IA Autônomo</h3>
                  <p className="text-xs text-slate-500 font-normal">Exclusivo para Administradores do VERGROUP</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs">
              
              {/* Name & Role */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome do Agente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Ex: Agente de Cobrança & Notificação de Inadimplência"
                    className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg focus:outline-none focus:border-[#0F8A4B] text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Função Operacional / Especialidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentRole}
                    onChange={(e) => setNewAgentRole(e.target.value)}
                    placeholder="Ex: Monitoramento de faturas vencidas e disparo de régua de WhatsApp"
                    className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg focus:outline-none focus:border-[#0F8A4B] text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ícone Emoji</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 border border-[#E2E6EA] rounded-lg custom-scrollbar">
                    {availableIcons.map((ico) => (
                      <button
                        type="button"
                        key={ico}
                        onClick={() => setNewAgentIcon(ico)}
                        className={`p-1.5 rounded text-sm transition-all cursor-pointer ${
                          newAgentIcon === ico ? 'bg-[#ECF8F1] border border-[#0F8A4B] scale-110' : 'hover:bg-slate-100'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge de Estilo</label>
                  <select
                    value={newAgentColor}
                    onChange={(e) => setNewAgentColor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg focus:outline-none focus:border-[#0F8A4B] bg-white font-medium"
                  >
                    <option value="bg-purple-50 text-purple-700 border-purple-200">Roxo (Especialista)</option>
                    <option value="bg-emerald-50 text-[#0B6B3A] border-emerald-200">Verde (Operacional)</option>
                    <option value="bg-blue-50 text-blue-700 border-blue-200">Azul (Comercial)</option>
                    <option value="bg-amber-50 text-amber-700 border-amber-200">Âmbar (Financeiro)</option>
                  </select>
                </div>
              </div>

              {/* Triggers */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gatilhos de Disparo Automático (Triggers)
                </label>
                <div className="space-y-1.5 p-2.5 border border-[#E2E6EA] rounded-lg bg-[#F8FAFB] max-h-36 overflow-y-auto">
                  {availableTriggers.map((trig) => (
                    <label key={trig} className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedTriggers.includes(trig)}
                        onChange={() => toggleTrigger(trig)}
                        className="rounded text-[#0F8A4B] focus:ring-[#0F8A4B]"
                      />
                      <span>{trig}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Curta</label>
                <textarea
                  rows={2}
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  placeholder="Resumo do comportamento autônomo deste agente..."
                  className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg focus:outline-none focus:border-[#0F8A4B] text-slate-900 font-medium resize-none"
                />
              </div>

              {/* System Prompt Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruções do Agente (System Prompt)</label>
                <textarea
                  rows={3}
                  value={newAgentSystemPrompt}
                  onChange={(e) => setNewAgentSystemPrompt(e.target.value)}
                  placeholder="Você é o agente responsável por... Siga as regras RLS do grupo VERGROUP..."
                  className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg focus:outline-none focus:border-[#0F8A4B] text-slate-900 font-medium resize-none"
                />
              </div>

              {/* Submit / Actions */}
              <div className="pt-3 border-t border-[#E2E6EA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-[#0F8A4B] text-white px-4 py-2 font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Salvar e Ativar Agente</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
