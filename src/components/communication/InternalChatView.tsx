import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Hash,
  User,
  Smile,
  Paperclip,
  Search,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Bell,
  Mic,
  Image,
  ExternalLink,
  ThumbsUp,
  Flame,
  Clock,
  Filter,
  Edit3,
  UserPlus,
  Maximize2,
  FileText,
  Download,
  Check,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InternalChatView: React.FC = () => {
  const {
    chatChannels,
    chatMessages,
    users,
    currentUser,
    activeChatChannelId,
    setActiveChatChannelId,
    sendChatMessage,
    addChatReaction,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<string>('bate-papos');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine all registered users across all companies + group channels
  const allConversations = [
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

  const currentChannelId = activeChatChannelId || allConversations[0]?.id || 'chan-silvestre';
  const activeChannel = allConversations.find((c) => c.id === currentChannelId) || allConversations[0];
  const channelMessages = chatMessages.filter((m) => m.channelId === currentChannelId);

  const filteredChannels = allConversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(currentChannelId, inputText.trim());
    setInputText('');
  };

  const getDirectUser = (channel: typeof chatChannels[0]) => {
    if (channel.type !== 'direct') return null;
    const otherId = channel.memberIds.find((id) => id !== currentUser.id) || channel.memberIds[0];
    return users.find((u) => u.id === otherId);
  };

  const directUser = getDirectUser(activeChannel);

  return (
    <div id="internal-chat-full-workspace" className="flex flex-col h-[calc(100vh-64px)] w-full bg-white font-sans antialiased overflow-hidden select-none">
      
      {/* 1. TOP SUB-HEADER NAVIGATION TABS (MATCHING REFERENCE BITRIX SCREENSHOT) */}
      <div className="bg-[#121A28] border-b border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto text-xs font-bold text-slate-300 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'bate-papos', label: 'Bate papos' },
            { id: 'bate-papos-tarefas', label: 'Bate papos de tarefas' },
            { id: 'copilot', label: 'CoPilot', icon: Sparkles },
            { id: 'projetos', label: 'Projetos' },
            { id: 'canais', label: 'Canais' },
            { id: 'canais-abertos', label: 'Canais Abertos' },
            { id: 'notificacoes', label: 'Notificações' },
            { id: 'telefonia', label: 'Telefonia' },
            { id: 'market', label: 'Market' },
            { id: 'configuracoes', label: 'Configurações' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
                  isActive
                    ? 'bg-[#0F8A4B] text-white shadow-xs'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-300" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button className="text-xs text-slate-400 hover:text-white font-extrabold px-2 py-1 flex items-center gap-1 shrink-0 cursor-pointer">
          <span>Mais</span>
          <span>▾</span>
        </button>
      </div>

      {/* 2. FULL SCREEN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden bg-white">
        
        {/* LEFT CONVERSATIONS PANEL (PREDOMINANTLY WHITE MATCHING SCREENSHOT) */}
        <div className="w-80 md:w-88 border-r border-[#DDE3E8] bg-white flex flex-col shrink-0">
          
          {/* Search Bar & Quick Tools */}
          <div className="p-3 border-b border-[#DDE3E8] bg-white flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#F7F9FA] px-3 py-1.5 rounded-xl border border-[#DDE3E8] text-xs">
              <Search className="w-4 h-4 text-[#5F6B76] shrink-0" />
              <input
                type="text"
                placeholder="Encontrar colaborador ou bate-papo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76] text-xs font-semibold"
              />
            </div>
            <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-xl cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-xl cursor-pointer">
              <Edit3 className="w-4 h-4 text-[#0F8A4B]" />
            </button>
          </div>

          {/* Conversations Item List (Clean White Items) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1 bg-white">
            {filteredChannels.map((chn) => {
              const channelUser = getDirectUser(chn);
              const isActive = activeChannel.id === chn.id;

              return (
                <button
                  key={chn.id}
                  onClick={() => setActiveChatChannelId(chn.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#ECF8F1] border-l-4 border-[#0F8A4B] border-y border-r border-[#0F8A4B]/20 shadow-2xs'
                      : 'hover:bg-[#F7F9FA] border border-transparent text-[#17212B]'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    {channelUser ? (
                      <img
                        src={channelUser.avatar}
                        alt={channelUser.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#DDE3E8]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#0F8A4B] text-white flex items-center justify-center font-black text-xs border border-[#0F8A4B]">
                        <Hash className="w-5 h-5" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold truncate ${isActive ? 'text-[#0F8A4B]' : 'text-[#17212B]'}`}>
                        {chn.name}
                      </span>
                      {chn.lastMessageAt && (
                        <span className="text-[10px] text-[#5F6B76] shrink-0 ml-1 font-semibold">
                          {new Date(chn.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {channelUser && (
                      <span className="text-[10px] text-[#0F8A4B] font-bold block truncate">
                        {channelUser.jobTitle}
                      </span>
                    )}

                    <p className="text-[11px] text-[#5F6B76] truncate mt-0.5 font-medium flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-[#0F8A4B] shrink-0" />
                      <span className="truncate">{chn.lastMessage || chn.description}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT MAIN CHAT WORKSPACE (PREDOMINANTLY WHITE & SOFT SAGE WALLPAPER) */}
        <div className="flex-1 flex flex-col bg-[#EAF5F0] relative">
          
          {/* Active Conversation Header (Clean White Bar) */}
          <div className="p-3.5 bg-white border-b border-[#DDE3E8] flex items-center justify-between shadow-2xs z-10 text-[#17212B]">
            <div className="flex items-center gap-3">
              {directUser ? (
                <div className="relative">
                  <img
                    src={directUser.avatar}
                    alt={directUser.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#DDE3E8]"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-black">
                  <Hash className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-[#17212B] tracking-tight">{activeChannel.name}</h2>
                  <span className="text-[11px] text-[#0F8A4B] italic font-bold">On-line</span>
                </div>
                <p className="text-[11px] text-[#5F6B76] font-semibold">
                  {directUser?.jobTitle || activeChannel.description}
                </p>
              </div>
            </div>

            {/* Top Right Action Icons */}
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
                title="Iniciar Chamada de Vídeo"
              >
                <Video className="w-4 h-4 fill-current" />
                <span>Chamada de Vídeo</span>
              </button>

              <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-xl cursor-pointer">
                <UserPlus className="w-4 h-4" />
              </button>
              <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-xl cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-xl cursor-pointer">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES CANVAS (SOFT MINT WALLPAPER #EAF5F0 WITH CRISP WHITE & MINT BUBBLES) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#EAF5F0] relative">
            
            {/* Date Separator Pill */}
            <div className="flex justify-center my-2">
              <span className="px-3.5 py-1 bg-white/90 border border-slate-200/80 text-[#5F6B76] text-[11px] font-bold rounded-full shadow-2xs">
                hoje
              </span>
            </div>

            {channelMessages.map((msg) => {
              const sender = users.find((u) => u.id === msg.senderId);
              const isMe = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`flex items-start gap-3 text-xs ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={sender?.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5 shadow-2xs"
                  />

                  <div className={`space-y-1.5 max-w-2xl ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* Message Bubble Card (White for contact, Light Mint for me) */}
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line border ${
                        isMe
                          ? 'bg-[#DCF8C6] text-[#17212B] border-[#BBEBA2] rounded-tr-xs'
                          : 'bg-white text-[#17212B] border-[#DDE3E8] rounded-tl-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Demo File Attachment Card */}
                      {msg.id === 'msg-2' && (
                        <div className="mt-3 p-3 bg-[#F7F9FA] rounded-xl border border-[#DDE3E8] flex items-center justify-between text-[#17212B]">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg font-bold">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <strong className="block text-xs font-black text-[#17212B]">251 - Am cash c...26.pdf</strong>
                              <span className="text-[10px] text-[#5F6B76] font-bold">59 KB</span>
                            </div>
                          </div>
                          <button className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-[#5F6B76] font-semibold block px-1">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CHAT INPUT AREA (CLEAN WHITE INPUT CARD) */}
          <div className="p-4 bg-transparent border-t border-transparent">
            <form onSubmit={handleSend} className="bg-white rounded-2xl p-3 border border-[#DDE3E8] shadow-lg space-y-2">
              
              {/* Mention placeholder bar */}
              <div className="text-[11px] text-[#5F6B76] font-semibold flex items-center gap-1 border-b border-[#F7F9FA] pb-2">
                <Paperclip className="w-3.5 h-3.5 text-[#5F6B76]" />
                <span>Digite @ ou + para mencionar uma pessoa, um bate-papo ou AI</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Escreva sua mensagem para ${activeChannel.name}...`}
                  className="flex-1 border-none outline-none text-xs font-semibold text-[#17212B] bg-transparent placeholder:text-[#5F6B76]"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" className="text-[#5F6B76] hover:text-[#0F8A4B] cursor-pointer">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-[#5F6B76] hover:text-[#0F8A4B] cursor-pointer">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-40 text-white rounded-full cursor-pointer shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
