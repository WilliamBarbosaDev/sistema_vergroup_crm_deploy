import React, { useState } from 'react';
import {
  Users,
  X,
  Sparkles,
  Building2,
  ShieldCheck,
  Check,
  Search,
  Lock,
  Globe,
  User,
  Crown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatChannel } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface GroupChannelCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGroupData?: ChatChannel | null;
}

export const GroupChannelCreateModal: React.FC<GroupChannelCreateModalProps> = ({
  isOpen,
  onClose,
  initialGroupData,
}) => {
  const {
    users,
    departments,
    businessUnits,
    currentUser,
    selectedBusinessUnitId,
    createGroupChannel,
    updateGroupChannel,
  } = useApp();

  const isEditing = Boolean(initialGroupData);

  const [groupName, setGroupName] = useState<string>(initialGroupData?.name || '');
  const [groupDesc, setGroupDesc] = useState<string>(initialGroupData?.description || '');
  const [groupBUId, setGroupBUId] = useState<string>(
    initialGroupData?.businessUnitId || (selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId)
  );
  const [groupPrivacy, setGroupPrivacy] = useState<'private' | 'business_unit'>(
    initialGroupData?.privacy || 'private'
  );
  const [groupIcon, setGroupIcon] = useState<string>(initialGroupData?.avatarUrl || '💬');

  // Selected Members & Group Admins
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialGroupData?.memberIds || [currentUser.id]
  );
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>(
    initialGroupData?.adminIds || [currentUser.id]
  );

  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  if (!isOpen) return null;

  const availableIcons = ['💬', '🏢', '📊', '⚡', '🚀', '🛡️', '📈', '⚖️', '🎯', '💼', '👥', '💡'];

  const toggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      if (userId === currentUser.id && selectedMemberIds.length === 1) return;
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
      setSelectedAdminIds(selectedAdminIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const toggleAdmin = (userId: string) => {
    if (!selectedMemberIds.includes(userId)) {
      setSelectedMemberIds([...selectedMemberIds, userId]);
      setSelectedAdminIds([...selectedAdminIds, userId]);
      return;
    }

    if (selectedAdminIds.includes(userId)) {
      if (selectedAdminIds.length <= 1 && userId === currentUser.id) {
        alert('⚠️ O grupo deve manter pelo menos um Administrador.');
        return;
      }
      setSelectedAdminIds(selectedAdminIds.filter((id) => id !== userId));
    } else {
      setSelectedAdminIds([...selectedAdminIds, userId]);
    }
  };

  const handleSelectDepartmentMembers = (deptId: string) => {
    const deptMembers = users.filter((u) => u.departmentId === deptId).map((u) => u.id);
    const combined = Array.from(new Set([...selectedMemberIds, ...deptMembers]));
    setSelectedMemberIds(combined);
  };

  const filteredUsers = users.filter((u) => {
    if (selectedDeptFilter !== 'all' && u.departmentId !== selectedDeptFilter) return false;
    if (searchMemberQuery.trim()) {
      const q = searchMemberQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchJob = u.jobTitle.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      return matchName || matchJob || matchEmail;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('⚠️ Preencha o Nome do Grupo.');
      return;
    }

    if (selectedMemberIds.length === 0) {
      alert('⚠️ Selecione pelo menos um integrante para o grupo.');
      return;
    }

    if (isEditing && initialGroupData) {
      updateGroupChannel(initialGroupData.id, {
        name: groupName.trim(),
        description: groupDesc.trim() || undefined,
        businessUnitId: groupBUId,
        privacy: groupPrivacy,
        isPrivate: groupPrivacy === 'private',
        memberIds: selectedMemberIds,
        adminIds: selectedAdminIds,
        avatarUrl: groupIcon,
      });
      alert(`🎉 Grupo "${groupName.trim()}" atualizado com sucesso!`);
    } else {
      createGroupChannel({
        name: groupName.trim(),
        description: groupDesc.trim() || undefined,
        businessUnitId: groupBUId,
        privacy: groupPrivacy,
        memberIds: selectedMemberIds,
        adminIds: selectedAdminIds,
        avatarUrl: groupIcon,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-display">
                {isEditing ? 'Editar Grupo de Conversa' : 'Criar Novo Grupo de Conversa'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Orquestração de equipes, departamentos e projetos no Chat Interno VERGROUP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
          
          {/* Group Name & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-slate-800 font-bold mb-1">
                Nome do Grupo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Equipe Comercial Outbound, Diretoria, Implantação BPO..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Ícone Emoji</label>
              <div className="flex items-center gap-1 overflow-x-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50 custom-scrollbar">
                {availableIcons.map((ico) => (
                  <button
                    type="button"
                    key={ico}
                    onClick={() => setGroupIcon(ico)}
                    className={`p-1 rounded text-sm transition-all cursor-pointer ${
                      groupIcon === ico ? 'bg-white border border-[#0F8A4B] scale-110 shadow-2xs' : 'hover:bg-slate-200'
                    }`}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Descrição do Grupo</label>
            <input
              type="text"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Finalidade e orientações gerais deste grupo..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
            />
          </div>

          {/* Business Unit & Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Empresa do Grupo (BU) *</span>
              </label>
              <select
                value={groupBUId}
                onChange={(e) => setGroupBUId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs cursor-pointer"
              >
                <option value="bu-all">🏢 Todas as Empresas (Holding Consolidado)</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    🏢 {bu.tradeName || bu.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Nível de Privacidade *</span>
              </label>
              <select
                value={groupPrivacy}
                onChange={(e) => setGroupPrivacy(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-bold text-xs cursor-pointer"
              >
                <option value="private">🔒 Privado (Apenas integrantes autorizados)</option>
                <option value="business_unit">🌐 Visível na Business Unit (Membros da BU)</option>
              </select>
            </div>
          </div>

          {/* Members Selection Area */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Integrantes do Grupo ({selectedMemberIds.length} selecionados)</span>
              </label>

              {/* Department Shortcut */}
              <select
                onChange={(e) => {
                  if (e.target.value !== 'none') {
                    handleSelectDepartmentMembers(e.target.value);
                    e.target.value = 'none';
                  }
                }}
                className="text-[11px] font-bold text-[#0F8A4B] bg-[#ECF8F1] border border-[#0F8A4B]/20 px-2 py-1 rounded-lg outline-none cursor-pointer"
              >
                <option value="none">+ Selecionar por Departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    + Todos do {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Input & Dept filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  placeholder="Pesquisar por nome, cargo ou e-mail..."
                  className="w-full bg-transparent outline-none font-semibold text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800 outline-none"
              >
                <option value="all">Filtrar por Todos os Departamentos</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Members Selection List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white space-y-1 custom-scrollbar">
              {filteredUsers.map((u) => {
                const isSelectedMember = selectedMemberIds.includes(u.id);
                const isGroupAdmin = selectedAdminIds.includes(u.id);
                const dept = departments.find((d) => d.id === u.departmentId);

                return (
                  <div
                    key={u.id}
                    className={`p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      isSelectedMember ? 'bg-[#ECF8F1]/60 border border-[#0F8A4B]/20' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div
                      onClick={() => toggleMember(u.id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelectedMember}
                        onChange={() => {}}
                        className="rounded accent-[#0F8A4B]"
                      />
                      <UserAvatar name={u.name} avatarUrl={u.avatar} size="xs" status={u.status} showStatus={false} />
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isGroupAdmin && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-extrabold">
                              <Crown className="w-2.5 h-2.5" /> Admin do Grupo
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {u.jobTitle} {dept ? `• ${dept.name}` : ''}
                        </p>
                      </div>
                    </div>

                    {isSelectedMember && (
                      <button
                        type="button"
                        onClick={() => toggleAdmin(u.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isGroupAdmin
                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={isGroupAdmin ? 'Remover status de Admin do Grupo' : 'Promover a Admin do Grupo'}
                      >
                        {isGroupAdmin ? '👑 Admin do Grupo' : '+ Tornar Admin'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Grupo de Conversa'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
