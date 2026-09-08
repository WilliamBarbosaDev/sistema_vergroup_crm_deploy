import React, { useState } from 'react';
import {
  PhoneCall,
  Send,
  User,
  Clock,
  CheckCheck,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  Smile,
  Paperclip,
  Settings,
  ShieldCheck,
  Building,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppConversation } from '../../types';
import { WhatsAppConfigModal } from '../admin/WhatsAppConfigModal';

export const WhatsAppSupportView: React.FC = () => {
  const {
    whatsApps,
    users,
    currentUser,
    currentBU,
    selectedBusinessUnitId,
    filterByBU,
    sendWhatsAppMessage,
  } = useApp();

  const [showConfigModal, setShowConfigModal] = useState(false);

  // Multi-tenant filtering per selected Business Unit
  const filteredConversations = filterByBU(whatsApps);

  const [activeConvId, setActiveConvId] = useState<string>(
    filteredConversations[0]?.id || 'wpp-1'
  );
  const [msgInput, setMsgInput] = useState('');

  // Keep active conversation aligned with filter
  const activeConv =
    filteredConversations.find((c) => c.id === activeConvId) ||
    filteredConversations[0];

  const quickReplies = [
    'Olá! Como posso ajudar sua empresa hoje?',
    'Recebemos sua solicitação e já estou gerando a proposta técnica.',
    'Poderia nos confirmar o melhor horário para uma breve demonstração no Meet?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || msgInput;
    if (!text.trim() || !activeConv) return;

    sendWhatsAppMessage(activeConv.id, text.trim());
    if (!textToSend) setMsgInput('');
  };

  return (
    <div id="whatsapp-support-view" className="p-4 md:p-6 max-w-full h-[calc(100vh-100px)] flex flex-col font-sans select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 tracking-tight">Central WhatsApp</h2>
                <p className="text-[10px] text-slate-500 font-semibold">{currentBU.tradeName}</p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              title="Configurar Provedor de API e Números Meta"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <Settings className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* Active Company Filter Indicator */}
          <div className="px-3.5 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#0B6B3A]">
              <Building className="w-3.5 h-3.5" />
              <span className="truncate">{selectedBusinessUnitId === 'bu-all' ? 'Todas as Empresas' : currentBU.tradeName}</span>
            </div>
            <span className="text-[10px] font-black text-[#0F8A4B] bg-white px-2 py-0.5 rounded border border-emerald-200">
              {filteredConversations.length} conversas
            </span>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isSelected = activeConv && conv.id === activeConv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? 'bg-white border-l-4 border-[#0F8A4B] shadow-2xs'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{conv.contactName}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">{conv.phone}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{lastMsg?.text || 'Início do atendimento'}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-3 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Nenhuma conversa registrada para a empresa "{currentBU.tradeName}".</p>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-3 py-1.5 bg-[#0F8A4B] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Conectar Número de WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Chat Feed */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F8A4B] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                    {activeConv.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{activeConv.contactName}</h3>
                    <p className="text-[10px] text-[#0F8A4B] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#0F8A4B]" />
                      <span>{activeConv.phone} • WhatsApp Verificado ({currentBU.tradeName})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    Atendente: <strong className="text-slate-900 font-black">{currentUser.name.split(' ')[0]}</strong>
                  </span>

                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                    <span>Configurar Provedor / Meta</span>
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5]/15">
                {activeConv.messages.map((msg) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                          isUser
                            ? 'bg-[#ECF8F1] text-slate-900 rounded-tr-none border border-[#0F8A4B]/20'
                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        <p className="leading-relaxed font-medium">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isUser && <CheckCheck className="w-3 h-3 text-[#0F8A4B]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Replies Bar */}
              <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-slate-500 font-bold shrink-0">Respostas Rápidas:</span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1 bg-white hover:bg-[#ECF8F1] border border-slate-200 hover:border-[#0F8A4B] rounded-lg text-slate-800 shrink-0 truncate max-w-xs transition-colors cursor-pointer font-medium"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder={`Digite sua mensagem no WhatsApp corporativo (${currentBU.tradeName})...`}
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F8A4B] font-medium"
                />
                <button
                  type="submit"
                  disabled={!msgInput.trim()}
                  className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
              <p className="text-xs font-bold">Selecione uma conversa ao lado para iniciar o atendimento.</p>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Multi-Provider Configuration Modal */}
      {showConfigModal && (
        <WhatsAppConfigModal onClose={() => setShowConfigModal(false)} />
      )}
    </div>
  );
};
