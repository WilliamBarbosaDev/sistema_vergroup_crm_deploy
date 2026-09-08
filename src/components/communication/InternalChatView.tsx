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
  Settings,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, ChatChannel } from '../../types';
import { GroupChannelCreateModal } from './GroupChannelCreateModal';
import { GroupChannelDetailsDrawer } from './GroupChannelDetailsDrawer';
import { UserAvatar } from '../common/UserAvatar';

export const InternalChatView: React.FC = () => {
  const {
    users,
    currentUser,
    businessUnits,
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
  const [mentionFilter, setMentionFilter] = useState('');

  // Group Management Modals
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [editingGroupData, setEditingGroupData] = useState<ChatChannel | null>(null);
  const [chatFilterTab, setChatFilterTab] = useState<'all' | 'direct' | 'groups'>('all');
  
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
  const isSystemAdmin = ['superadmin', 'company_admin', 'director', 'manager'].includes(currentUser.role);

  // Filter channels based on RLS, BU scope and Group privacy
  const visibleChannels = chatChannels.filter((c) => {
    if (c.type === 'group') {
      if (c.status === 'archived' && !isSystemAdmin) return false;
      if (c.privacy === 'private') {
        return c.memberIds.includes(currentUser.id) || isSystemAdmin;
      }
      const isBuMatch = !c.businessUnitId || c.businessUnitId === 'bu-all' || c.businessUnitId === currentUser.primaryBusinessUnitId;
      return isBuMatch || c.memberIds.includes(currentUser.id) || isSystemAdmin;
    }
    return true;
  });

  const directChannels = visibleChannels.filter((c) => c.type === 'direct');
  const groupChannels = visibleChannels.filter((c) => c.type === 'group' || c.type === 'channel');

  const displayedChannels = chatFilterTab === 'direct'
    ? directChannels
    : chatFilterTab === 'groups'
    ? groupChannels
    : visibleChannels;

  // Default active channel fallback
  const currentChannelId = activeChatChannelId || visibleChannels[0]?.id || 'chan-1';
  const activeChannel = visibleChannels.find((c) => c.id === currentChannelId) || visibleChannels[0];

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'work-projects': return 'Gestão de Projetos';
      case 'crm-deals': return 'Pipeline de CRM';
      case 'crm-leads': return 'Gestão de Leads';
      case 'work-tasks': return 'Central de Tarefas';
      case 'crm-companies': return 'Empresas & Clientes';
      case 'crm-contacts': return 'Contatos';
      case 'cockpit': return 'Cockpit Visão Geral';
      default: return 'Módulo Anterior';
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

  const activeGroupMembers = activeChannel?.type === 'group'
    ? users.filter((u) => activeChannel.memberIds.includes(u.id))
    : [];

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
              <UserAvatar name={directUser?.name || activeChannel?.name || 'Chamada'} avatarUrl={directUser?.avatar} size="xl" status={directUser?.status} showStatus={false} className="border-4 border-[#0F8A4B] shadow-xl mx-auto rounded-full" />
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
              <UserAvatar name={directUser?.name || activeChannel.name} avatarUrl={directUser?.avatar} size="md" status={directUser?.status} showStatus={false} />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-[#ECF8F1] text-[#0F8A4B] border border-[#0F8A4B]/20 flex items-center justify-center text-xl shadow-2xs">
              {activeChannel?.avatarUrl || '💬'}
            </div>
          )}

          <div>
            <h2 className="text-sm font-black text-[#17212B] flex items-center gap-2">
              <span>{activeChannel?.name || 'Canal Geral'}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                activeChannel?.type === 'group'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-emerald-100 text-[#0F8A4B]'
              }`}>
                {activeChannel?.type === 'group' ? 'Grupo' : activeChannel?.type === 'direct' ? 'Direto' : 'Canal'}
              </span>
              {activeChannel?.type === 'group' && (
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {activeChannel.memberIds.length} membros
                </span>
              )}
            </h2>
            <p className="text-[11px] text-[#5F6B76] font-semibold">
              {activeChannel?.type === 'direct'
                ? directUser?.jobTitle || 'Ativo agora no sistema VERGROUP'
                : activeChannel?.description || `Grupo oficial (${activeChannel?.memberIds.length || 0} integrantes)`}
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5">
          {/* Group Details Button for Group Channels */}
          {activeChannel?.type === 'group' && (
            <button
              onClick={() => setIsGroupDetailsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Ver Integrantes e Configurações do Grupo"
            >
              <Settings className="w-4 h-4 text-[#0F8A4B]" />
              <span>Detalhes do Grupo</span>
            </button>
          )}

          {/* Return Button to Previous Tab Context */}
          <button
            onClick={() => setCurrentTab(previousTab || 'cockpit')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
            title={`Voltar para ${getTabLabel(previousTab)}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
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
        <div className="w-72 bg-white border-r border-[#DDE3E8] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#DDE3E8] flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Conversas & Grupos</h3>
            {isSystemAdmin && (
              <button
                onClick={() => {
                  setEditingGroupData(null);
                  setIsGroupCreateOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                title="Criar Novo Grupo de Conversa"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Grupo</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold gap-1">
            <button
              onClick={() => setChatFilterTab('all')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                chatFilterTab === 'all' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos ({visibleChannels.length})
            </button>
            <button
              onClick={() => setChatFilterTab('direct')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                chatFilterTab === 'direct' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Diretas ({directChannels.length})
            </button>
            <button
              onClick={() => setChatFilterTab('groups')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                chatFilterTab === 'groups' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grupos ({groupChannels.length})
            </button>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {displayedChannels.map((chan) => {
              const dUser = getDirectUser(chan);
              const isActive = chan.id === currentChannelId;

              return (
                <div
                  key={chan.id}
                  onClick={() => setActiveChatChannelId(chan.id)}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#ECF8F1] border border-[#0F8A4B]/20 shadow-2xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {chan.type === 'direct' ? (
                      <UserAvatar name={dUser?.name || chan.name} avatarUrl={dUser?.avatar} size="sm" status={dUser?.status} showStatus={false} />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center text-sm font-bold shrink-0">
                        {chan.avatarUrl || '💬'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className={`text-xs truncate flex items-center gap-1.5 ${isActive ? 'font-black text-[#0F8A4B]' : 'font-bold text-slate-800'}`}>
                        <span className="truncate">{chan.name}</span>
                        {chan.type === 'group' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                            {chan.memberIds.length}m
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">
                        {chan.lastMessage || 'Nenhuma mensagem recente'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {chatFilterTab === 'groups' && groupChannels.length === 0 && (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">Nenhum grupo de conversa criado ainda.</p>
                {isSystemAdmin && (
                  <button
                    onClick={() => setIsGroupCreateOpen(true)}
                    className="btn-primary text-xs bg-[#0F8A4B] text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    + Criar Primeiro Grupo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MAIN MESSAGES CANVAS */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredMessages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              const sender = users.find((u) => u.id === m.senderId);

              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <UserAvatar name={sender?.name || 'Usuario'} avatarUrl={sender?.avatar} size="sm" status={sender?.status} showStatus={false} className="mt-1" />
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
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escrever mensagem para ${activeChannel?.name || 'conversa'}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0F8A4B]"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* GROUP CREATE / EDIT MODAL */}
      <GroupChannelCreateModal
        isOpen={isGroupCreateOpen}
        onClose={() => {
          setIsGroupCreateOpen(false);
          setEditingGroupData(null);
        }}
        initialGroupData={editingGroupData}
      />

      {/* GROUP DETAILS DRAWER */}
      {activeChannel && activeChannel.type === 'group' && (
        <GroupChannelDetailsDrawer
          isOpen={isGroupDetailsOpen}
          onClose={() => setIsGroupDetailsOpen(false)}
          channel={activeChannel}
          onEditGroup={() => {
            setEditingGroupData(activeChannel);
            setIsGroupCreateOpen(true);
          }}
        />
      )}
    </div>
  );
};
