import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  Video,
  Bell,
  Paperclip,
  Smile,
  Hash,
  Clock,
  Sparkles,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, ChatChannel } from '../../types';

export const RightChatWidgetRail: React.FC = () => {
  const {
    users,
    currentUser,
    chatChannels,
    chatMessages,
    sendChatMessage,
    setCurrentTab,
    setActiveChatChannelId: setGlobalActiveChannelId,
  } = useApp();

  const [activeChatChannelId, setActiveChatChannelId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const handleAvatarClick = (channelId: string) => {
    setGlobalActiveChannelId(channelId);
    setCurrentTab('comms-chat');
  };

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Combine all registered users across all companies + group channels
  const allConversations: ChatChannel[] = [
    ...chatChannels.filter((c) => c.type === 'group'),
    ...users
      .filter((u) => u.id !== currentUser.id)
      .map((u) => {
        const existing = chatChannels.find((c) => c.type === 'direct' && c.memberIds.includes(u.id));
        if (existing) return existing;
        return {
          id: `chan-${u.id}`,
          name: u.name,
          type: 'direct' as const,
          memberIds: [currentUser.id, u.id],
          unreadCount: 0,
          lastMessage: u.jobTitle || 'Novo Colaborador',
          lastMessageAt: u.hiredAt || new Date().toISOString(),
        };
      }),
  ];

  const activeChannel = allConversations.find((c) => c.id === activeChatChannelId);
  const activeMessages = chatMessages.filter((m) => m.channelId === activeChatChannelId);

  const getDirectUser = (channel: ChatChannel) => {
    if (channel.type !== 'direct') return null;
    const otherId = channel.memberIds.find((id) => id !== currentUser.id) || channel.memberIds[0];
    return users.find((u) => u.id === otherId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatChannelId) return;

    sendChatMessage(activeChatChannelId, inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* BITRIX24 FLOATING RIGHT RAIL WIDGET (VERGROUP BRAND GREEN PALETTE) */}
      <aside
        id="bitrix-right-chat-rail"
        className="fixed right-0 top-16 bottom-0 w-16 bg-[#0A3429] text-emerald-100 flex flex-col items-center py-3 space-y-3 z-40 border-l border-[#13604C]/60 shadow-2xl font-sans overflow-y-auto custom-scrollbar select-none"
      >
        {/* Top Clock & Logged User Avatar */}
        <div className="flex flex-col items-center space-y-1 bg-[#0F493A] p-1.5 rounded-2xl border border-[#197960]/40 shadow-2xs">
          <span className="text-[10px] font-mono font-black text-emerald-300 tracking-tight">
            {currentTime || '16:28'}
          </span>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-emerald-400/80 shadow-2xs"
            title={currentUser.name}
          />
        </div>

        {/* Global Notifications Bell Action */}
        <button
          className="relative p-2 bg-[#0F493A] hover:bg-[#13604C] text-emerald-200 rounded-full cursor-pointer transition-colors"
          title="Notificações & Mensagens Frequentes"
        >
          <Bell className="w-4 h-4 text-emerald-300" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0A3429] animate-pulse" />
        </button>

        <div className="w-8 h-px bg-[#13604C]/60" />

        {/* Channels & Team Avatars List (Bitrix Style Vertical Bar) */}
        <div className="flex-1 flex flex-col items-center space-y-2.5 w-full px-2">
          {allConversations.map((channel) => {
            const directUser = getDirectUser(channel);
            const isActive = activeChatChannelId === channel.id;

            return (
              <div key={channel.id} className="relative group flex items-center justify-center">
                <button
                  onClick={() => handleAvatarClick(channel.id)}
                  className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0A3429] scale-110'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                >
                  {directUser ? (
                    <img
                      src={directUser.avatar}
                      alt={directUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#197960]/60 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1F9879] text-white flex items-center justify-center font-black text-xs border border-emerald-400/40 shadow-sm">
                      <Hash className="w-5 h-5" />
                    </div>
                  )}

                  {/* Online dot indicator */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0A3429]" />
                </button>

                {/* Floating Tooltip matching Bitrix style */}
                <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white text-xs font-extrabold rounded-xl shadow-xl whitespace-nowrap z-50 border border-slate-700 animate-in fade-in">
                  <span className="truncate">{channel.name}</span>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -right-1 top-1/2 -translate-y-1/2 border-r border-t border-slate-700" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Floating App Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setActiveChatChannelId(activeChatChannelId ? null : chatChannels[0]?.id)}
            className="w-9 h-9 rounded-full bg-[#1F9879] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#197960] transition-colors"
            title="Abrir Chat Flutuante"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* FLOATING INSTANT CHAT OVERLAY DRAWER (MATCHING REFERENCE SCREENSHOT 1 & 2) */}
      {activeChannel && (
        <div className="fixed right-20 bottom-4 w-96 h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden font-sans animate-in slide-in-from-right duration-200">
          
          {/* Header matching Screenshot 1 (Phone, Video, Bell, Close) */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {getDirectUser(activeChannel) ? (
                <div className="relative">
                  <img
                    src={getDirectUser(activeChannel)?.avatar}
                    alt={activeChannel.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#0F8A4B]"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0F8A4B] text-white flex items-center justify-center font-black">
                  <Hash className="w-5 h-5" />
                </div>
              )}

              <div>
                <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>{activeChannel.name}</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-semibold">
                  {getDirectUser(activeChannel)?.jobTitle || 'Canal de Equipe'}
                </p>
              </div>
            </div>

            {/* Header Action Icons matching Screenshot 1 */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                title="Ligar via Fale Fácil VoIP"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                title="Iniciar Vídeo Chamada"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveChatChannelId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 custom-scrollbar">
            {activeMessages.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold p-4 text-center">Nenhuma mensagem recente nesta conversa.</p>
            ) : (
              activeMessages.map((msg) => {
                const sender = users.find((u) => u.id === msg.senderId);
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 text-xs ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={sender?.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                    />
                    <div className={`space-y-1 max-w-[240px] ${isMe ? 'items-end text-right' : ''}`}>
                      <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs ${
                        isMe ? 'bg-[#0F8A4B] text-white rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Footer matching Screenshot 1 (Rounded Green Button with Send Icon) */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0F8A4B] bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-40 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
};
