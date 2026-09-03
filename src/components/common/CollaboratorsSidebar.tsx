import React, { useState } from 'react';
import {
  Users,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { User } from '../../types';

export const CollaboratorsSidebar: React.FC = () => {
  const {
    users,
    currentUser,
    businessUnits,
    departments,
    currentTab,
    setCurrentTab,
    previousTab,
    setPreviousTab,
    setActiveChatChannelId,
    getOrCreateDirectChannel,
    chatChannels,
    filterByBU,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  // BU Scoped User Filter
  const filteredUsers = filterByBU(users);

  const displayedUsers = filteredUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bu = businessUnits.find((b) => b.id === u.businessUnitId);
    const dept = departments.find((d) => d.id === u.departmentId);
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.jobTitle.toLowerCase().includes(q) ||
      (bu && (bu.tradeName || bu.name).toLowerCase().includes(q)) ||
      (dept && dept.name.toLowerCase().includes(q))
    );
  });

  // Direct Click Action: Avatar Click -> Direct Chat
  const handleAvatarClick = (targetUser: User) => {
    // If not currently in chat, save currentTab as previousTab for returning
    if (currentTab !== 'comms-chat' && currentTab !== 'comm-chat') {
      setPreviousTab(currentTab);
    }

    // Get or create direct channel for target user
    const directChannelId = getOrCreateDirectChannel(targetUser.id);
    setActiveChatChannelId(directChannelId);

    // Switch view to Central de Comunicação / Chat Interno
    setCurrentTab('comms-chat');
  };

  return (
    <>
      {/* Desktop Vertical Sidebar (Fixed Right, 52px width) */}
      <aside
        id="collaborators-sidebar"
        className="hidden md:flex flex-col w-13 h-screen bg-white border-l border-slate-200 shrink-0 z-40 select-none items-center py-3 justify-between shadow-2xs"
      >
        {/* Top Header Controls */}
        <div className="flex flex-col items-center gap-3 w-full border-b border-slate-100 pb-3">
          <button
            onClick={() => setShowSearchPopover(!showSearchPopover)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSearchPopover
                ? 'bg-[#ECF8F1] border-[#0F8A4B] text-[#0F8A4B]'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
            title="Buscar Colaborador para Iniciar Chat Direto"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Search Popover Modal */}
        {showSearchPopover && (
          <div className="absolute right-14 top-3 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 w-64 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0F8A4B]" />
                Buscar Equipe ({displayedUsers.length})
              </span>
              <button onClick={() => setShowSearchPopover(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite nome, cargo ou BU..."
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Scrollable Avatars Column */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-2.5 py-2 no-scrollbar">
          {displayedUsers.map((u) => {
            const bu = businessUnits.find((b) => b.id === u.businessUnitId);
            const dept = departments.find((d) => d.id === u.departmentId);

            // Real Direct Unread Message Count
            const directChannel = chatChannels.find(
              (c) => c.type === 'direct' && c.memberIds.includes(currentUser.id) && c.memberIds.includes(u.id)
            );
            const unreadCount = directChannel?.unreadCount || 0;

            return (
              <div key={u.id} className="relative group">
                <UserAvatar
                  name={u.name}
                  avatarUrl={u.avatar}
                  size="md"
                  status={u.status}
                  badgeCount={unreadCount}
                  onClick={() => handleAvatarClick(u)}
                />

                {/* Elegant Hover Tooltip */}
                <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl w-52 text-xs space-y-1 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <p className="font-extrabold text-white truncate">{u.name}</p>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.status === 'active' ? 'bg-[#0F8A4B]' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 font-semibold">{u.jobTitle}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">
                    🏢 {bu?.tradeName || bu?.name || u.businessUnitId} {dept ? `• ${dept.name}` : ''}
                  </p>
                </div>
              </div>
            );
          })}

          {displayedUsers.length === 0 && (
            <div className="text-[10px] text-slate-400 italic text-center p-2">Nenhum membro</div>
          )}
        </div>

        {/* Bottom Self Avatar */}
        <div className="border-t border-slate-100 pt-3 w-full flex flex-col items-center">
          <UserAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatar}
            size="sm"
            status={currentUser.status}
            onClick={() => handleAvatarClick(currentUser)}
          />
        </div>
      </aside>
    </>
  );
};
