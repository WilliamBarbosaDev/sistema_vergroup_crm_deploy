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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppConversation } from '../../types';

export const WhatsAppSupportView: React.FC = () => {
  const {
    whatsAppConversations,
    users,
    currentUser,
    sendWhatsAppMessage,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState(whatsAppConversations[0]?.id || 'wpp-1');
  const [msgInput, setMsgInput] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'waiting'>('all');

  const activeConv = whatsAppConversations.find((c) => c.id === activeConvId) || whatsAppConversations[0];

  const quickReplies = [
    'Olá! Como posso ajudar sua empresa hoje?',
    'Recebemos sua solicitação e já estou gerando a proposta técnica.',
    'Poderia nos confirmar o melhor horário para uma breve demonstração no Meet?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || msgInput;
    if (!text.trim()) return;

    sendWhatsAppMessage(activeConvId, text.trim());
    if (!textToSend) setMsgInput('');
  };

  return (
    <div id="whatsapp-support-view" className="p-4 md:p-6 max-w-full h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white rounded-xl border border-[#DDE3E8] shadow-xs flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-[#DDE3E8] bg-[#F7F9FA] flex flex-col shrink-0">
          <div className="p-3.5 border-b border-[#DDE3E8] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ECF8F1] text-[#0F8A4B] rounded">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-[#17212B]">Central WhatsApp (W-API)</h2>
            </div>
            <span className="text-[10px] font-bold bg-[#ECF8F1] text-[#0F8A4B] px-2 py-0.5 rounded-full">
              Online
            </span>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0F4F7]">
            {whatsAppConversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = conv.id === activeConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3 cursor-pointer transition-colors space-y-1 ${
                    isSelected ? 'bg-white border-l-4 border-[#0F8A4B]' : 'hover:bg-[#EAEFF3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#17212B] truncate">{conv.contactName}</span>
                    <span className="text-[10px] text-[#5F6B76] font-mono">{conv.phone}</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B76] truncate">{lastMsg?.content || 'Início do atendimento'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-3.5 border-b border-[#DDE3E8] bg-[#F7F9FA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ECF8F1] text-[#0F8A4B] font-bold text-xs flex items-center justify-center">
                {activeConv?.contactName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#17212B]">{activeConv?.contactName}</h3>
                <p className="text-[10px] text-[#0F8A4B] font-mono">{activeConv?.phone} • WhatsApp Verificado</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#5F6B76]">
                Atendente: <strong className="text-[#17212B]">{currentUser.name.split(' ')[0]}</strong>
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5]/10">
            {activeConv?.messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-xl text-xs space-y-1 shadow-2xs ${
                      isUser
                        ? 'bg-[#DCF8C6] text-[#17212B] rounded-tr-none'
                        : 'bg-white text-[#17212B] rounded-tl-none border border-[#DDE3E8]'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#5F6B76]">
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
          <div className="px-3 py-2 bg-[#F7F9FA] border-t border-[#DDE3E8] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <Zap className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="text-[#5F6B76] font-semibold shrink-0">Respostas Rápidas:</span>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSend(reply)}
                className="px-2.5 py-1 bg-white hover:bg-[#ECF8F1] border border-[#DDE3E8] hover:border-[#0F8A4B] rounded text-[#17212B] shrink-0 truncate max-w-xs transition-colors cursor-pointer"
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
            className="p-3 border-t border-[#DDE3E8] bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Digite sua mensagem no WhatsApp corporativo..."
              className="flex-1 px-3 py-2 border border-[#DDE3E8] rounded-md text-xs outline-none focus:border-[#0F8A4B]"
            />
            <button
              type="submit"
              disabled={!msgInput.trim()}
              className="px-4 py-2 bg-[#0F8A4B] disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
