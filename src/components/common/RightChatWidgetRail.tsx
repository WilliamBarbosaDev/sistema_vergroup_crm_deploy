import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  Search,
  Bot,
  Play,
  FileText,
  PhoneOff,
  MicOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatChannel } from '../../types';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Call modal simulator state
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Voice Recording Ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingVoice]);

  // Call Duration Ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeCallType) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCallType]);

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
    if (!activeChatChannelId) return;

    if (isRecordingVoice) {
      const voiceText = `🎤 Mensagem de Áudio (${formatTime(recordingSeconds)})`;
      sendChatMessage(activeChatChannelId, voiceText);
      setIsRecordingVoice(false);
      return;
    }

    if (!inputText.trim()) return;

    sendChatMessage(activeChatChannelId, inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const directUser = activeChannel ? getDirectUser(activeChannel) : null;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeChatChannelId) {
            sendChatMessage(activeChatChannelId, `📎 Arquivo enviado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
          }
        }}
        className="hidden"
      />

      {/* CALL MODAL */}
      {activeCallType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A3429] text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#197960]/50 text-center space-y-6">
            <img
              src={directUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Chamada"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0F8A4B] mx-auto shadow-xl"
            />
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">{activeChannel?.name || 'Chamada Corporativa'}</h3>
              <p className="text-xs text-emerald-300 font-extrabold uppercase">Chamada em Andamento</p>
              <p className="text-sm font-mono font-bold text-white pt-1">{formatTime(callDuration)}</p>
            </div>
            <button
              onClick={() => setActiveCallType(null)}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer mx-auto block"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* BITRIX24 FLOATING RIGHT RAIL WIDGET (VERGROUP BRAND GREEN PALETTE) */}
      <aside
        id="bitrix-right-chat-rail"
        className="fixed right-0 top-16 bottom-0 w-16 bg-[#0A3429] text-emerald-100 flex flex-col items-center py-3 space-y-3 z-40 border-l border-[#13604C]/60 shadow-2xl font-sans overflow-y-auto custom-scrollbar select-none"
      >
        {/* Top Clock */}
        <div className="flex flex-col items-center space-y-1 bg-[#0F493A] p-1.5 rounded-2xl border border-[#197960]/40 shadow-2xs">
          <span className="text-[10px] font-mono font-black text-emerald-300 tracking-tight">
            {currentTime || '17:55'}
          </span>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0F8A4B]"
            title={`Conectado como: ${currentUser.name}`}
          />
        </div>

        <div className="w-8 h-px bg-[#13604C]/60 my-1" />

        {/* User Avatars List across all Companies */}
        <div className="flex-1 w-full space-y-2.5 px-2">
          {allConversations.map((chan) => {
            const user = getDirectUser(chan);
            const isSelected = chan.id === activeChatChannelId;

            return (
              <button
                key={chan.id}
                onClick={() => setActiveChatChannelId(chan.id)}
                className={`relative w-full aspect-square rounded-2xl flex items-center justify-center transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[#197960] ring-2 ring-emerald-400 shadow-md scale-105'
                    : 'hover:bg-[#0F493A]'
                }`}
                title={chan.name}
              >
                {chan.type === 'direct' && user ? (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-400/40"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A3429] ${
                        user.status === 'online'
                          ? 'bg-emerald-400'
                          : user.status === 'busy'
                          ? 'bg-amber-400'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#13604C] text-emerald-200 flex items-center justify-center font-bold text-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </aside>

      {/* FLOATING DRAWER WHEN A CONVERSATION AVATAR IS CLICKED */}
      {activeChatChannelId && activeChannel && (
        <div className="fixed right-16 top-16 bottom-0 w-96 bg-white shadow-2xl border-l border-[#DDE3E8] z-40 flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 bg-[#0F493A] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              {directUser ? (
                <img
                  src={directUser.avatar}
                  alt={directUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="font-black text-xs text-white leading-tight">{activeChannel.name}</h3>
                <span className="text-[10px] text-emerald-200 font-bold block">
                  {directUser?.jobTitle || 'Chat Interno'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCallType('audio')}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#13604C] rounded-lg cursor-pointer"
                title="Chamada de Voz"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveCallType('video')}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#13604C] rounded-lg cursor-pointer"
                title="Chamada de Vídeo"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAvatarClick(activeChannel.id)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#13604C] rounded-lg cursor-pointer text-[10px] font-bold"
                title="Abrir Tela Cheia"
              >
                Expandir
              </button>
              <button
                onClick={() => setActiveChatChannelId(null)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#13604C] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4F7F5] custom-scrollbar">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex text-xs ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-line border ${
                      isMe
                        ? 'bg-[#DCF8C6] text-slate-900 border-[#BBEBA2] rounded-tr-xs'
                        : 'bg-white text-slate-900 border-[#DDE3E8] rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                    <span className="block text-[9px] text-slate-400 text-right mt-1 font-semibold">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-[#0F8A4B] cursor-pointer"
              title="Anexar Arquivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRecordingVoice(!isRecordingVoice)}
              className={`p-2 rounded-lg cursor-pointer ${
                isRecordingVoice ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-[#0F8A4B]'
              }`}
              title="Gravar Áudio"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecordingVoice ? `Gravando... ${formatTime(recordingSeconds)}` : 'Enviar mensagem...'}
              className="flex-1 text-xs font-bold outline-none text-slate-900 bg-transparent placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !isRecordingVoice}
              className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-40 text-white rounded-full cursor-pointer shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
