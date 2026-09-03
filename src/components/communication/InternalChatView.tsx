import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  FileText,
  Download,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Bot,
  Plus,
  X,
  Play,
  Volume2,
  PhoneOff,
  MicOff,
  Image as ImageIcon,
  Pin,
  MoreVertical,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, ChatChannel } from '../../types';

export const InternalChatView: React.FC = () => {
  const {
    users,
    currentUser,
    chatChannels,
    chatMessages,
    activeChatChannelId,
    setActiveChatChannelId,
    sendChatMessage,
    addChatReaction,
    previousTab,
    setCurrentTab,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  
  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Call Modal State
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Attachment state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default active channel fallback
  const currentChannelId = activeChatChannelId || chatChannels[0]?.id || 'chan-1';
  const activeChannel = chatChannels.find((c) => c.id === currentChannelId) || chatChannels[0];

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'work-projects':
        return 'Gestão de Projetos';
      case 'crm-deals':
        return 'Pipeline de CRM';
      case 'crm-leads':
        return 'Gestão de Leads';
      case 'work-tasks':
        return 'Central de Tarefas';
      case 'crm-companies':
        return 'Empresas & Clientes';
      case 'crm-contacts':
        return 'Contatos';
      case 'cockpit':
        return 'Cockpit Visão Geral';
      case 'mod-fiscal':
        return 'Módulo Fiscal';
      default:
        return 'Módulo Anterior';
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, currentChannelId]);

  // Voice recording timer ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingVoice]);

  // Call duration ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeCallType) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCallType]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile && !isRecordingVoice) return;

    let finalMessage = inputText.trim();

    if (isRecordingVoice) {
      finalMessage = `🎙️ [Áudio Gravado - ${formatTime(recordingSeconds)}]`;
      setIsRecordingVoice(false);
    }

    sendChatMessage(currentChannelId, finalMessage);
    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    setShowMentionMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type.includes('image') ? 'image' : 'doc',
      });
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getDirectUser = (channel: ChatChannel) => {
    if (channel.type !== 'direct') return null;
    const otherId = channel.memberIds.find((id) => id !== currentUser.id) || channel.memberIds[0];
    return users.find((u) => u.id === otherId);
  };

  const directUser = activeChannel ? getDirectUser(activeChannel) : null;
  const channelMessages = chatMessages.filter((m) => m.channelId === currentChannelId);

  const filteredMessages = searchQuery
    ? channelMessages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : channelMessages;

  const emojiList = ['😊', '😂', '😍', '👍', '🎉', '🚀', '❤️', '👏', '🔥', '✅', '💼', '📁', '💡', '📊', '⚡', '🙏'];

  return (
    <div id="internal-chat-full-view" className="h-full flex flex-col bg-[#F4F7F5] font-sans overflow-hidden select-none">
      
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* CALL MODAL (AUDIO & VIDEO SIMULATOR) */}
      {activeCallType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A3429] text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#197960]/50 text-center space-y-6">
            <div className="relative inline-block">
              <img
                src={directUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={activeChannel?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#0F8A4B] shadow-xl mx-auto"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#0A3429] animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-black">{activeChannel?.name}</h3>
              <p className="text-xs text-emerald-300 font-semibold mt-1">
                {activeCallType === 'video' ? 'Chamada de Vídeo HD em Andamento' : 'Chamada de Voz Encriptada'}
              </p>
              <p className="text-lg font-mono font-bold text-white mt-2">{formatTime(callDuration)}</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={isMuted ? 'Desmutar' : 'Silenciar'}
              >
                <MicOff className="w-6 h-6" />
              </button>

              <button
                onClick={() => setActiveCallType(null)}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                title="Desligar"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT HEADER */}
      <div className="h-16 bg-white border-b border-[#DDE3E8] px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          {activeChannel?.type === 'direct' ? (
            <div className="relative">
              <img
                src={directUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={activeChannel.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
          )}

          <div>
            <h2 className="text-sm font-black text-[#17212B] flex items-center gap-2">
              <span>{activeChannel?.name || 'Canal Geral'}</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-[#0F8A4B] px-2 py-0.5 rounded font-extrabold uppercase">
                {activeChannel?.type === 'direct' ? 'Direto' : 'Grupo'}
              </span>
            </h2>
            <p className="text-[11px] text-[#5F6B76] font-semibold">
              {directUser?.jobTitle || 'Ativo agora no sistema VERGROUP'}
            </p>
          </div>
        </div>

        {/* Action Buttons Header & Return Button */}
        <div className="flex items-center gap-3">
          {/* Prominent Return Button to Previous Tab Context */}
          <button
            onClick={() => setCurrentTab(previousTab || 'cockpit')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
            title={`Voltar para ${getTabLabel(previousTab)}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para {getTabLabel(previousTab)}</span>
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isSearchActive ? 'bg-[#ECF8F1] text-[#0F8A4B]' : 'text-[#5F6B76] hover:bg-[#F7F9FA]'
            }`}
            title="Buscar Mensagens"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveCallType('audio')}
            className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#F7F9FA] rounded-xl transition-colors cursor-pointer"
            title="Iniciar Chamada de Voz"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveCallType('video')}
            className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-[#F7F9FA] rounded-xl transition-colors cursor-pointer"
            title="Iniciar Chamada de Vídeo HD"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SEARCH BAR OVERLAY */}
      {isSearchActive && (
        <div className="bg-[#ECF8F1] border-b border-[#0F8A4B]/20 p-2.5 px-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-[#0F8A4B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar nesta conversa..."
            className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-[#17212B] placeholder:text-slate-500"
            autoFocus
          />
          <button onClick={() => setIsSearchActive(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CHAT BODY & MESSAGES AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT CHANNEL LIST */}
        <div className="w-64 bg-white border-r border-[#DDE3E8] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#DDE3E8] text-xs font-bold text-slate-700">
            Conversas & Grupos
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chatChannels.map((chan) => {
              const dUser = getDirectUser(chan);
              const isActive = chan.id === currentChannelId;

              return (
                <div
                  key={chan.id}
                  onClick={() => setActiveChatChannelId(chan.id)}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#ECF8F1] border border-[#0F8A4B]/20' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={dUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={chan.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs truncate ${isActive ? 'font-black text-[#0F8A4B]' : 'font-bold text-slate-800'}`}>
                        {chan.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{chan.lastMessage}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN MESSAGES CANVAS */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredMessages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              const sender = users.find((u) => u.id === m.senderId);

              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img
                    src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={sender?.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-slate-200"
                  />
                  <div className={`max-w-md space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] font-bold text-slate-700">{sender?.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs font-medium shadow-2xs ${
                        isMe
                          ? 'bg-[#0F8A4B] text-white rounded-tr-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escrever mensagem para ${activeChannel?.name}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0F8A4B]"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
