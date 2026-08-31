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

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (isRecordingVoice) {
      const voiceText = `🎤 Mensagem de Áudio (${formatTime(recordingSeconds)})`;
      sendChatMessage(currentChannelId, voiceText);
      setIsRecordingVoice(false);
      return;
    }

    if (!inputText.trim() && !attachedFile) return;

    let finalMessage = inputText.trim();
    if (attachedFile) {
      finalMessage = `📎 Arquivo Anexado: ${attachedFile.name} (${attachedFile.size})\n${finalMessage}`.trim();
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
                alt="Chamada"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0F8A4B] mx-auto shadow-xl"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">{activeChannel?.name || 'Chamada Corporativa'}</h3>
              <p className="text-xs text-emerald-300 font-extrabold uppercase tracking-wider">
                {activeCallType === 'video' ? 'Chamada de Vídeo HD em Andamento' : 'Chamada de Voz em Andamento'}
              </p>
              <p className="text-sm font-mono font-bold text-white pt-1">{formatTime(callDuration)}</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all cursor-pointer ${
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

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2">
          
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

          {/* Audio Call */}
          <button
            onClick={() => setActiveCallType('audio')}
            className="p-2 rounded-xl text-[#5F6B76] hover:bg-[#F7F9FA] hover:text-[#0F8A4B] transition-colors cursor-pointer"
            title="Iniciar Chamada de Voz"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => setActiveCallType('video')}
            className="p-2 rounded-xl text-[#5F6B76] hover:bg-[#F7F9FA] hover:text-[#0F8A4B] transition-colors cursor-pointer"
            title="Iniciar Chamada de Vídeo HD"
          >
            <Video className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* SEARCH BAR (IF SEARCH ACTIVE) */}
      {isSearchActive && (
        <div className="bg-white border-b border-[#DDE3E8] px-6 py-2.5 flex items-center gap-3 animate-in slide-in-from-top-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar histórico de conversas..."
            className="w-full text-xs font-bold outline-none text-[#17212B]"
          />
          <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }} className="text-xs text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CHAT MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        
        {/* Date Separator Pill */}
        <div className="flex justify-center my-2">
          <span className="px-3.5 py-1 bg-white/90 border border-slate-200 text-[#5F6B76] text-[11px] font-extrabold rounded-full shadow-2xs">
            Hoje
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const sender = users.find((u) => u.id === msg.senderId);
          const isMe = msg.senderId === currentUser.id;

          return (
            <div key={msg.id} className={`flex items-start gap-3 text-xs group ${isMe ? 'flex-row-reverse' : ''}`}>
              <img
                src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={sender?.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5 shadow-2xs"
              />

              <div className={`space-y-1 max-w-2xl ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Message Bubble Card */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line border relative ${
                    isMe
                      ? 'bg-[#DCF8C6] text-[#17212B] border-[#BBEBA2] rounded-tr-xs'
                      : 'bg-white text-[#17212B] border-[#DDE3E8] rounded-tl-xs'
                  }`}
                >
                  {msg.text}

                  {/* Audio Voice Player Card */}
                  {msg.text.includes('🎤 Mensagem de Áudio') && (
                    <div className="mt-2.5 p-3 bg-white/80 rounded-xl border border-slate-200 flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-[#0F8A4B] text-white flex items-center justify-center shadow-xs cursor-pointer">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0F8A4B] w-1/3" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">Áudio Gravado</span>
                      </div>
                    </div>
                  )}

                  {/* Reaction bar trigger on hover */}
                  <div className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-md rounded-full px-2 py-0.5 flex gap-1 z-10 ${
                    isMe ? '-left-20' : '-right-20'
                  }`}>
                    {['👍', '❤️', '🔥', '😂'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addChatReaction(msg.id, emoji)}
                        className="text-xs hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-1 text-[10px] text-[#5F6B76] font-semibold">
                  <span>{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#0F8A4B]" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT AREA WITH FULLY FUNCTIONAL BUTTONS */}
      <div className="p-4 bg-transparent border-t border-transparent relative">
        
        {/* EMOJI PICKER OVERLAY */}
        {showEmojiPicker && (
          <div className="absolute bottom-24 right-12 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 z-30 grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* MENTION & COPILOT POPUP MENU */}
        {showMentionMenu && (
          <div className="absolute bottom-24 left-6 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 z-30 w-72 space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Mencionar Colaborador ou VER AI
            </div>
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setInputText((prev) => `@${u.name} `); setShowMentionMenu(false); }}
                className="w-full p-2 hover:bg-emerald-50 rounded-xl text-left flex items-center gap-2 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                <span>@{u.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setInputText((prev) => `@VER_AI Resumir tarefas prioritárias `); setShowMentionMenu(false); }}
              className="w-full p-2 hover:bg-emerald-50 rounded-xl text-left flex items-center gap-2 text-xs font-black text-[#0F8A4B] transition-colors cursor-pointer border-t border-slate-100"
            >
              <Bot className="w-4 h-4 text-[#0F8A4B]" />
              <span>@VER_AI Copilot</span>
            </button>
          </div>
        )}

        {/* ATTACHED FILE PREVIEW BAR */}
        {attachedFile && (
          <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-[#0F8A4B] font-bold">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{attachedFile.name} ({attachedFile.size})</span>
            </div>
            <button type="button" onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="bg-white rounded-2xl p-3 border border-[#DDE3E8] shadow-lg space-y-2">
          
          {/* Top Mention Bar */}
          <div className="text-[11px] text-[#5F6B76] font-extrabold flex items-center justify-between border-b border-slate-100 pb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 hover:text-[#0F8A4B] cursor-pointer transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 text-[#0F8A4B]" />
              <span>Anexar arquivo ou imagem</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMentionMenu(!showMentionMenu)}
              className="flex items-center gap-1 text-[#0F8A4B] hover:underline cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>@ Mencionar Colaborador / AI</span>
            </button>
          </div>

          {/* Bottom Input Controls */}
          <div className="flex items-center gap-3 pt-1">
            
            {isRecordingVoice ? (
              <div className="flex-1 flex items-center justify-between bg-rose-50 px-4 py-2 rounded-xl border border-rose-200 animate-pulse">
                <div className="flex items-center gap-2 text-rose-600 font-black text-xs">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <span>Gravando Áudio: {formatTime(recordingSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(false)}
                  className="text-xs text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Escreva sua mensagem para ${activeChannel?.name || 'equipe'}...`}
                className="flex-1 border-none outline-none text-xs font-bold text-[#17212B] bg-transparent placeholder:text-slate-400"
              />
            )}

            {/* Right Action Icons (Emoji, Mic, Send) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title="Inserir Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isRecordingVoice
                    ? 'bg-rose-600 text-white'
                    : 'text-[#5F6B76] hover:text-[#0F8A4B] hover:bg-emerald-50'
                }`}
                title={isRecordingVoice ? 'Enviar Áudio' : 'Gravar Áudio'}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() && !attachedFile && !isRecordingVoice}
                className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-40 text-white rounded-full cursor-pointer shadow-md transition-all hover:scale-105"
                title="Enviar Mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </form>

      </div>

    </div>
  );
};
