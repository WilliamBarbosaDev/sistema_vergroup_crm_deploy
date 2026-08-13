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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InternalChatView: React.FC = () => {
  const {
    chatChannels,
    chatMessages,
    users,
    currentUser,
    sendChatMessage,
    addChatReaction,
  } = useApp();

  const [activeChannelId, setActiveChannelId] = useState(chatChannels[0]?.id || 'chan-silvestre');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeChannel = chatChannels.find((c) => c.id === activeChannelId) || chatChannels[0];
  const channelMessages = chatMessages.filter((m) => m.channelId === activeChannelId);

  const filteredChannels = chatChannels.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(activeChannelId, inputText.trim());
    setInputText('');
  };

  const getDirectUser = (channel: typeof chatChannels[0]) => {
    if (channel.type !== 'direct') return null;
    const otherId = channel.memberIds.find((id) => id !== currentUser.id) || channel.memberIds[0];
    return users.find((u) => u.id === otherId);
  };

  return (
    <div id="internal-chat-view" className="p-4 md:p-6 max-w-full h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white rounded-xl border border-[#DDE3E8] shadow-xs flex-1 flex overflow-hidden">
        {/* Left Column: Channels & Direct Messages (Bitrix Style) */}
        <div className="w-80 border-r border-[#DDE3E8] bg-[#F7F9FA] flex flex-col shrink-0">
          {/* Search Header */}
          <div className="p-3 border-b border-[#DDE3E8] bg-white">
            <div className="flex items-center gap-2 bg-[#F7F9FA] px-3 py-1.5 rounded-lg border border-[#DDE3E8] text-xs">
              <Search className="w-4 h-4 text-[#5F6B76] shrink-0" />
              <input
                id="search-chat-input"
                type="text"
                placeholder="Buscar conversa ou pessoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
            {filteredChannels.map((chn) => {
              const directUser = getDirectUser(chn);
              const isActive = activeChannelId === chn.id;

              return (
                <button
                  key={chn.id}
                  id={`chat-channel-${chn.id}`}
                  onClick={() => setActiveChannelId(chn.id)}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ECF8F1] border border-[#0F8A4B]/30 shadow-2xs'
                      : 'hover:bg-[#EAEFF3] border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    {directUser ? (
                      <img
                        src={directUser.avatar}
                        alt={directUser.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#0F8A4B] text-white flex items-center justify-center font-bold text-xs">
                        <Hash className="w-4 h-4" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0F8A4B] ring-2 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-[#0F8A4B]' : 'text-[#17212B]'}`}>
                        {chn.name}
                      </span>
                      {chn.lastMessageAt && (
                        <span className="text-[10px] text-[#5F6B76] shrink-0 ml-1">
                          {new Date(chn.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {directUser && (
                      <span className="text-[10px] text-[#5F6B76] block truncate">
                        {directUser.jobTitle}
                      </span>
                    )}
                    <p className="text-[11px] text-[#5F6B76] truncate mt-0.5">
                      {chn.lastMessage || chn.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Main Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Active Chat Header */}
          <div className="p-3.5 border-b border-[#DDE3E8] bg-white flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              {getDirectUser(activeChannel) ? (
                <div className="relative">
                  <img
                    src={getDirectUser(activeChannel)?.avatar}
                    alt={activeChannel.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#0F8A4B] ring-1 ring-white" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-bold">
                  <Hash className="w-5 h-5" />
                </div>
              )}
              <div>
                <h2 className="text-xs font-bold text-[#17212B] flex items-center gap-1.5">
                  <span>{activeChannel?.name}</span>
                  <span className="w-2 h-2 rounded-full bg-[#0F8A4B]" />
                </h2>
                <p className="text-[11px] text-[#5F6B76]">
                  {getDirectUser(activeChannel)?.jobTitle || activeChannel?.description} • Online agora
                </p>
              </div>
            </div>

            {/* Quick Actions (VoIP, Video, Search) */}
            <div className="flex items-center gap-1">
              <button
                id="chat-call-btn"
                title="Ligar via Fale Fácil VoIP"
                className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-lg transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                id="chat-video-btn"
                title="Iniciar Reunião por Vídeo"
                className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-lg transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                title="Notificações"
                className="p-2 text-[#5F6B76] hover:text-[#17212B] hover:bg-[#F7F9FA] rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F7F9FA] custom-scrollbar">
            {channelMessages.map((msg) => {
              const sender = users.find((u) => u.id === msg.senderId);
              const isMe = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`flex items-start gap-3 text-xs ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={sender?.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-[#DDE3E8]"
                  />
                  <div className={`space-y-1 max-w-xl ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                      <span className="font-bold text-[#17212B] text-[11px]">{sender?.name}</span>
                      <span className="text-[10px] text-[#5F6B76]">
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? 'bg-[#0F8A4B] text-white border-[#0F8A4B] rounded-tr-xs'
                          : 'bg-white text-[#17212B] border-[#DDE3E8] shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                        {msg.reactions.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => addChatReaction(msg.id, r.emoji)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#DDE3E8] text-[11px] hover:bg-[#F7F9FA] cursor-pointer shadow-2xs"
                          >
                            <span>{r.emoji}</span>
                            <span className="font-bold text-[#5F6B76]">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#DDE3E8] bg-white flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#5F6B76]">
              <button
                type="button"
                className="p-1.5 hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-md transition-colors cursor-pointer"
                title="Anexar arquivo"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-md transition-colors cursor-pointer"
                title="Inserir imagem"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>

            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escreva uma mensagem para ${activeChannel?.name}...`}
              className="flex-1 px-3 py-2 border border-[#DDE3E8] rounded-lg text-xs bg-[#F7F9FA] outline-none focus:border-[#0F8A4B] focus:bg-white text-[#17212B]"
            />

            <button
              type="button"
              className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#ECF8F1] rounded-lg transition-colors cursor-pointer"
              title="Gravar áudio"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              id="send-chat-msg-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
