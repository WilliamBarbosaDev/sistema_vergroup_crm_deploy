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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AIAgentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'learning' | 'paused';
  icon: string;
  color: string;
  description: string;
  triggers: string[];
  stats: { executions: number; accuracy: string; lastRun: string };
}

export const AIAgentCenterModal: React.FC<AIAgentCenterModalProps> = ({ isOpen, onClose }) => {
  const { tasks, deals, leads, currentUser } = useApp();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-copilot');
  const [promptInput, setPromptInput] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    {
      sender: 'agent',
      text: `Olá ${currentUser.name.split(' ')[0]}! Sou o **Agente Executivo VER Copilot**. Realizei a varredura contínua de ${tasks.length} tarefas e ${deals.length} negócios no funil. Como posso ajudar agora?`,
      time: 'Agora mesmo',
    },
  ]);

  if (!isOpen) return null;

  const agents: AgentInfo[] = [
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
      id: 'agent-[#0F8A4B]',
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

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

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
          text: `[${activeAgent.name}]: Analisei o comando "${userText}". Execução em conformidade com as regras RLS do seu papel de ${currentUser.role.toUpperCase()}. ${tasks.length} demandas validadas com sucesso.`,
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
                  4 Agentes Ativos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Orquestração de agentes autônomos via MCP & Tool Registry Engine (PRD AI-First 4.0)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#E2E6EA]">
          
          {/* Left Column: Agent Selector List */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-2.5 bg-[#F8FAFB]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Agentes Especiais em Execução
            </p>

            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
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
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${agent.color}`}>
                      Ativo
                    </span>
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
                  className="btn-primary text-xs flex items-center gap-1.5 shrink-0 px-3 py-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
