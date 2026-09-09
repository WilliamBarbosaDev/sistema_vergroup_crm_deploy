import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  ChevronRight,
  Clock3,
  Eye,
  Gauge,
  MessageSquare,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIAgentRecord, canManageAIAgents, loadAIAgents } from './aiAgentsRegistry';

interface AIAgentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatAgentValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return 'Não definido';
  return String(value);
}

function metricText(agent: AIAgentRecord) {
  if (!agent.executionCount && !agent.lastExecutionAt && !agent.accuracy) return 'Sem histórico ainda';

  const parts: string[] = [];
  if (agent.executionCount !== undefined && agent.executionCount !== null) parts.push(`${agent.executionCount} execuções`);
  if (agent.lastExecutionAt) parts.push(`última execução ${agent.lastExecutionAt}`);
  if (agent.accuracy) parts.push(`acurácia ${agent.accuracy}`);
  return parts.join(' • ');
}

export const AIAgentCenterModal: React.FC<AIAgentCenterModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentTab } = useApp();
  const [agents] = useState<AIAgentRecord[]>(() => loadAIAgents());
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => loadAIAgents()[0]?.id ?? '');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; time: string }>>([]);

  const canManage = useMemo(() => canManageAIAgents(currentUser), [currentUser]);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgent]);

  if (!isOpen) return null;

  const sendPrompt = () => {
    if (!prompt.trim() || !selectedAgent) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText, time: now },
      {
        role: 'agent',
        text: `Comando recebido por ${selectedAgent.name}. Posso apoiar com execução, configuração ou leitura do histórico em ${selectedAgent.scope ?? 'sua área'}.`,
        time: now,
      },
    ]);
  };

  const panel = (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Centro de IA & Agentes"
          className="relative w-[94vw] h-[88vh] max-w-[1600px] rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#F7FBF8] to-white flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-[#ECF8F1] text-[#0B6B3A] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">Centro de IA & Agentes</h2>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-[#0F8A4B] text-white px-2 py-0.5 rounded-full">
                    {agents.length} agentes
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                  Visão operacional dos agentes existentes no sistema, com acesso rápido, status e comandos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('ai-agents');
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F8A4B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#0B6B3A] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Abrir Gestão Completa</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-50">
            <aside className="lg:col-span-4 border-r border-slate-200 bg-white min-h-0 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Agentes existentes</h3>
                <span className="text-xs text-slate-400">Registros reais carregados</span>
              </div>

              {agents.map((agent) => {
                const active = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      active
                        ? 'border-[#0F8A4B] bg-[#ECF8F1] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{agent.id === 'agent-support' ? '💬' : agent.id === 'agent-finance' ? '💲' : agent.id === 'agent-commercial' ? '📈' : '✨'}</span>
                          <p className="font-semibold text-slate-900 truncate">{agent.name}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{agent.description}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-white text-[#0B6B3A]' : 'bg-slate-100 text-slate-600'}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        <p className="font-medium text-slate-400 uppercase tracking-wide">Tipo</p>
                        <p className="text-slate-700">{agent.type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-400 uppercase tracking-wide">Função</p>
                        <p className="text-slate-700 line-clamp-1">{agent.function ?? 'Não definido'}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>{metricText(agent)}</span>
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="lg:col-span-8 min-h-0 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 xl:grid-cols-5 min-h-0 flex-1">
                <div className="xl:col-span-3 p-5 min-h-0 overflow-y-auto bg-white border-b xl:border-b-0 xl:border-r border-slate-200">
                  {selectedAgent ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{selectedAgent.name}</h3>
                            <span className="inline-flex items-center rounded-full bg-[#ECF8F1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0B6B3A]">
                              {selectedAgent.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{selectedAgent.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Eye className="w-4 h-4" />
                            Abrir agente
                          </button>
                          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Settings className="w-4 h-4" />
                            Configurar
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tipo</p>
                          <p className="mt-1 text-slate-900 font-medium">{selectedAgent.type}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business Unit</p>
                          <p className="mt-1 text-slate-900 font-medium">{formatAgentValue(selectedAgent.businessUnit)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Provider</p>
                          <p className="mt-1 text-slate-900 font-medium">{formatAgentValue(selectedAgent.provider)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Modelo</p>
                          <p className="mt-1 text-slate-900 font-medium">{formatAgentValue(selectedAgent.model)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Escopo</p>
                          <p className="mt-1 text-slate-900 font-medium">{formatAgentValue(selectedAgent.scope)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Última execução</p>
                          <p className="mt-1 text-slate-900 font-medium">{formatAgentValue(selectedAgent.lastExecutionAt)}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-3 text-slate-700">
                          <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                          <h4 className="font-semibold">Atalhos de interação</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Ver histórico</button>
                          <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Ativar / Desativar</button>
                          <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Duplicar</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">Nenhum agente selecionado.</div>
                  )}
                </div>

                <div className="xl:col-span-2 min-h-0 bg-slate-50 p-5 flex flex-col gap-4 overflow-y-auto">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <MessageSquare className="w-4 h-4 text-[#0F8A4B]" />
                      Interação rápida
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Envie instruções rápidas para o agente selecionado.</p>
                    <div className="mt-3 space-y-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={`Instruir ${selectedAgent?.name ?? 'agente'}...`}
                        className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#0F8A4B]/20 focus:border-[#0F8A4B]"
                      />
                      <button
                        type="button"
                        onClick={sendPrompt}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F8A4B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B6B3A] transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Enviar instrução
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 flex-1 min-h-[220px]">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <Clock3 className="w-4 h-4 text-[#0F8A4B]" />
                      Respostas recentes
                    </div>
                    <div className="mt-3 space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {messages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                          Sem interações ainda.
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`rounded-2xl p-3 text-sm ${message.role === 'user' ? 'bg-[#ECF8F1] text-slate-900' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                              <span>{message.role === 'user' ? 'Você' : 'Agente'}</span>
                              <span>{message.time}</span>
                            </div>
                            <p className="whitespace-pre-line">{message.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
};
