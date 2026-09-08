import React, { useState } from 'react';
import {
  X,
  Users,
  Building2,
  ShieldCheck,
  Crown,
  UserPlus,
  Trash2,
  LogOut,
  Archive,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatChannel } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface GroupChannelDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ChatChannel;
  onEditGroup: () => void;
}

export const GroupChannelDetailsDrawer: React.FC<GroupChannelDetailsDrawerProps> = ({
  isOpen,
  onClose,
  channel,
  onEditGroup,
}) => {
  const {
    users,
    departments,
    businessUnits,
    currentUser,
    removeGroupMember,
    promoteGroupAdmin,
    demoteGroupAdmin,
    leaveGroupChannel,
    archiveGroupChannel,
    addGroupMember,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'add' | 'settings'>('members');
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');
  const [searchNonMemberQuery, setSearchNonMemberQuery] = useState<string>('');

  if (!isOpen) return null;

  // Check if current user is Group Admin or System Admin
  const isSystemAdmin = ['superadmin', 'company_admin', 'director', 'manager'].includes(currentUser.role);
  const isGroupAdmin = isSystemAdmin || (channel.adminIds && channel.adminIds.includes(currentUser.id));

  const bu = businessUnits.find((b) => b.id === channel.businessUnitId);
  const creator = users.find((u) => u.id === channel.createdById);

  // Group Members
  const memberUsers = users.filter((u) => channel.memberIds.includes(u.id));
  const filteredMembers = memberUsers.filter((u) => {
    if (!searchMemberQuery.trim()) return true;
    const q = searchMemberQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.jobTitle.toLowerCase().includes(q);
  });

  // Non-Group Members available to add
  const nonMemberUsers = users.filter((u) => !channel.memberIds.includes(u.id));
  const filteredNonMembers = nonMemberUsers.filter((u) => {
    if (!searchNonMemberQuery.trim()) return true;
    const q = searchNonMemberQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.jobTitle.toLowerCase().includes(q);
  });

  const handleRemoveMember = (userId: string, userName: string) => {
    if (!isGroupAdmin) return;
    if (confirm(`Deseja remover "${userName}" deste grupo? O histórico de mensagens do colaborador será preservado.`)) {
      removeGroupMember(channel.id, userId);
    }
  };

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    if (!isGroupAdmin) return;
    if (isCurrentlyAdmin) {
      demoteGroupAdmin(channel.id, userId);
    } else {
      promoteGroupAdmin(channel.id, userId);
    }
  };

  const handleLeaveGroup = () => {
    if (confirm(`Tem certeza que deseja sair do grupo "${channel.name}"?`)) {
      leaveGroupChannel(channel.id);
      onClose();
    }
  };

  const handleArchiveGroup = () => {
    if (!isGroupAdmin) return;
    if (confirm(`Deseja arquivar o grupo "${channel.name}"? O grupo não receberá novas mensagens mas o histórico continuará disponível.`)) {
      archiveGroupChannel(channel.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex justify-end font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-[#ECF8F1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#0F8A4B]/20 flex items-center justify-center text-xl shadow-2xs">
              {channel.avatarUrl || '💬'}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">{channel.name}</h2>
              <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>🏢 {bu?.tradeName || bu?.name || 'Todas as BUs'}</span>
                <span>•</span>
                <span>{channel.memberIds.length} integrantes</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Badges & Info Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 bg-white text-[#0B6B3A] border border-[#0F8A4B]/20 rounded-full font-bold text-[10px]">
              {channel.privacy === 'business_unit' ? '🌐 Visível na BU' : '🔒 Grupo Privado'}
            </span>
            <span className="px-2.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-[10px]">
              {channel.status === 'archived' ? '📂 Arquivado' : '🟢 Grupo Ativo'}
            </span>
          </div>

          {channel.description && (
            <p className="text-slate-600 font-medium text-xs leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
              {channel.description}
            </p>
          )}

          {creator && (
            <p className="text-[10px] text-slate-400 font-semibold">
              Criado por {creator.name} {channel.createdAt ? `em ${new Date(channel.createdAt).toLocaleDateString('pt-BR')}` : ''}
            </p>
          )}
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-white px-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Integrantes ({channel.memberIds.length})
          </button>
          {isGroupAdmin && (
            <button
              onClick={() => setActiveTab('add')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'add' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              + Adicionar ({nonMemberUsers.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'border-[#0F8A4B] text-[#0F8A4B] font-black' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Configurações
          </button>
        </div>

        {/* Tab 1: Members List */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                placeholder="Pesquisar integrantes..."
                className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              {filteredMembers.map((u) => {
                const isAdmin = channel.adminIds?.includes(u.id);
                const dept = departments.find((d) => d.id === u.departmentId);

                return (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={u.name} avatarUrl={u.avatar} size="sm" status={u.status} showStatus={false} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          <span>{u.name}</span>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-extrabold shrink-0">
                              <Crown className="w-2.5 h-2.5" /> Admin
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {u.jobTitle} {dept ? `• ${dept.name}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isGroupAdmin && u.id !== currentUser.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleAdmin(u.id, Boolean(isAdmin))}
                          className="p-1 text-slate-400 hover:text-amber-700 rounded hover:bg-amber-50 cursor-pointer"
                          title={isAdmin ? 'Remover status de Admin do Grupo' : 'Promover a Admin do Grupo'}
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(u.id, u.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                          title="Remover do Grupo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Add Members */}
        {activeTab === 'add' && isGroupAdmin && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchNonMemberQuery}
                onChange={(e) => setSearchNonMemberQuery(e.target.value)}
                placeholder="Pesquisar colaboradores..."
                className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              {filteredNonMembers.map((u) => {
                const dept = departments.find((d) => d.id === u.departmentId);

                return (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={u.name} avatarUrl={u.avatar} size="sm" status={u.status} showStatus={false} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {u.jobTitle} {dept ? `• ${dept.name}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addGroupMember(channel.id, u.id)}
                      className="px-3 py-1 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                );
              })}

              {filteredNonMembers.length === 0 && (
                <p className="p-6 text-center text-slate-400 italic font-medium">
                  Todos os colaboradores qualificados já pertencem ao grupo.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Group Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
            {isGroupAdmin && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Edição & Governança do Grupo
                </h3>
                <p className="text-slate-500 font-medium">
                  Alterar nome, descrição, foto, privacidade e administradores do grupo.
                </p>
                <button
                  onClick={() => {
                    onEditGroup();
                    onClose();
                  }}
                  className="btn-secondary w-full py-2 flex items-center justify-center gap-1.5 text-xs mt-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Informações do Grupo</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleLeaveGroup}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/50 text-amber-800 font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-amber-600" />
                  <span>Sair do Grupo</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400">Preserva Histórico</span>
              </button>

              {isGroupAdmin && (
                <button
                  onClick={handleArchiveGroup}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/50 text-rose-700 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-rose-600" />
                    <span>Arquivar Grupo</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Somente Leitura</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
