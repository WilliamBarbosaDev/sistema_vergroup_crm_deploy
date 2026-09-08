import React, { useMemo, useState } from 'react';
import { X, User as UserIcon, ShieldAlert, Lock, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PermissionScope, User, UserRole } from '../../types';
import { CAPABILITIES_REGISTRY, PermissionEngineService } from '../../services/permissionEngine';
import { UserAvatar } from '../common/UserAvatar';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
}

const roles: UserRole[] = ['superadmin', 'company_admin', 'director', 'manager', 'sales', 'operations', 'operator', 'financial', 'collaborator', 'auditor', 'viewer'];
const scopes: PermissionScope[] = ['own', 'team', 'department', 'department_and_below', 'managed_users', 'business_unit', 'multi_bu', 'all'];

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose }) => {
  const { setUsers, addAuditLog, currentUser, businessUnits, departments, teams, users } = useApp();

  const isSuperadmin = currentUser.role === 'superadmin' || currentUser.isSuperadmin;
  const canUpdateUsers = isSuperadmin || currentUser.capabilities?.includes('users.update');
  const canManageRoles = isSuperadmin || currentUser.capabilities?.includes('users.manage.roles');
  const canManagePermissions = isSuperadmin || currentUser.capabilities?.includes('users.manage.permissions');
  const sameBU = currentUser.primaryBusinessUnitId === user.primaryBusinessUnitId || currentUser.businessUnitIds?.includes(user.primaryBusinessUnitId);
  const canEditGovernance = isSuperadmin || (canUpdateUsers && sameBU);

  const [draft, setDraft] = useState({
    name: user.name || '',
    jobTitle: user.jobTitle || '',
    role: user.role,
    primaryBusinessUnitId: user.primaryBusinessUnitId || '',
    departmentId: user.departmentId || '',
    teamId: user.teamId || '',
    managerId: user.managerId || '',
    supervisorId: user.supervisorId || '',
    status: user.status || 'active',
    employeeCode: user.employeeCode || '',
    capabilities: user.capabilities || [],
    permissionScopes: user.permissionScopes || {},
  });

  const availableDepartments = useMemo(
    () => departments.filter((dept) => !draft.primaryBusinessUnitId || dept.businessUnitId === draft.primaryBusinessUnitId),
    [departments, draft.primaryBusinessUnitId]
  );

  const toggleCapability = (capability: string) => {
    if (!canManagePermissions) return;
    setDraft((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter((item) => item !== capability)
        : [...prev.capabilities, capability],
    }));
  };

  const updateScope = (capability: string, scope: PermissionScope) => {
    if (!canManagePermissions) return;
    const ceiling = PermissionEngineService.checkPrivilegeCeiling(currentUser, draft.role, scope);
    if (!ceiling.allowed) {
      alert(ceiling.message);
      return;
    }
    setDraft((prev) => ({
      ...prev,
      permissionScopes: { ...prev.permissionScopes, [capability]: scope },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditGovernance) return;

    const before = {
      name: user.name,
      jobTitle: user.jobTitle,
      role: user.role,
      primaryBusinessUnitId: user.primaryBusinessUnitId,
      departmentId: user.departmentId,
      teamId: user.teamId,
      managerId: user.managerId,
      supervisorId: user.supervisorId,
      status: user.status,
      employeeCode: user.employeeCode,
      capabilities: user.capabilities,
      permissionScopes: user.permissionScopes,
    };

    const nextUpdates: Partial<User> = {
      name: draft.name.trim(),
      jobTitle: draft.jobTitle.trim(),
      primaryBusinessUnitId: draft.primaryBusinessUnitId,
      businessUnitIds: Array.from(new Set([draft.primaryBusinessUnitId, ...(user.businessUnitIds || [])].filter(Boolean))),
      departmentId: draft.departmentId,
      teamId: draft.teamId || undefined,
      managerId: draft.managerId || undefined,
      supervisorId: draft.supervisorId || undefined,
      status: draft.status as User['status'],
      employeeCode: draft.employeeCode.trim(),
    };

    if (canManageRoles) {
      nextUpdates.role = draft.role;
    }

    if (canManagePermissions) {
      nextUpdates.capabilities = draft.capabilities;
      nextUpdates.permissionScopes = draft.permissionScopes;
    }

    setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...nextUpdates } : item)));

    addAuditLog('user.updated', 'User', user.id, `user.updated | Dados administrativos de ${user.name} atualizados`, {
      before,
      after: nextUpdates as Record<string, unknown>,
      businessUnitId: draft.primaryBusinessUnitId,
    });

    if (canManageRoles && before.role !== nextUpdates.role) {
      addAuditLog('role.changed', 'User', user.id, `role.changed | ${before.role} -> ${nextUpdates.role}`, {
        before: { role: before.role },
        after: { role: nextUpdates.role },
        businessUnitId: draft.primaryBusinessUnitId,
      });
    }

    if (canManagePermissions) {
      addAuditLog('permission.changed', 'User', user.id, `permission.changed | Capabilities administrativas revisadas`, {
        before: { capabilities: before.capabilities, permissionScopes: before.permissionScopes },
        after: { capabilities: nextUpdates.capabilities, permissionScopes: nextUpdates.permissionScopes },
        businessUnitId: draft.primaryBusinessUnitId,
      });
    }

    onClose();
  };

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500';
  const labelClass = 'block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] font-sans">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} avatarUrl={user.avatar} size="lg" status={user.status} />
            <div>
              <h2 className="text-sm font-black tracking-tight">Governança Administrativa do Usuário</h2>
              <p className="text-xs text-slate-400 font-medium">{user.name} • {user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canEditGovernance && (
          <div className="m-5 mb-0 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            Você não possui capability administrativa suficiente para alterar este colaborador.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          <section className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0F8A4B]" />
              Dados Administrativos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className={labelClass}>Nome</label><input disabled={!canEditGovernance} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Cargo</label><input disabled={!canEditGovernance} value={draft.jobTitle} onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Matrícula</label><input disabled={!canEditGovernance} value={draft.employeeCode} onChange={(e) => setDraft({ ...draft, employeeCode: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Business Unit</label><select disabled={!canEditGovernance || (!isSuperadmin && !currentUser.capabilities?.includes('organization.manage'))} value={draft.primaryBusinessUnitId} onChange={(e) => setDraft({ ...draft, primaryBusinessUnitId: e.target.value, departmentId: '', teamId: '' })} className={inputClass}>{businessUnits.map((bu) => <option key={bu.id} value={bu.id}>{bu.tradeName || bu.name}</option>)}</select></div>
              <div><label className={labelClass}>Departamento</label><select disabled={!canEditGovernance} value={draft.departmentId} onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })} className={inputClass}><option value="">Não definido</option>{availableDepartments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></div>
              <div><label className={labelClass}>Equipe</label><select disabled={!canEditGovernance} value={draft.teamId} onChange={(e) => setDraft({ ...draft, teamId: e.target.value })} className={inputClass}><option value="">Não definida</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div>
              <div><label className={labelClass}>Gestor</label><select disabled={!canEditGovernance} value={draft.managerId} onChange={(e) => setDraft({ ...draft, managerId: e.target.value })} className={inputClass}><option value="">Sem gestor</option>{users.filter((item) => item.id !== user.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
              <div><label className={labelClass}>Supervisor</label><select disabled={!canEditGovernance} value={draft.supervisorId} onChange={(e) => setDraft({ ...draft, supervisorId: e.target.value })} className={inputClass}><option value="">Sem supervisor</option>{users.filter((item) => item.id !== user.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
              <div><label className={labelClass}>Status</label><select disabled={!canEditGovernance} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as User['status'] })} className={inputClass}><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="absent">Ausente</option><option value="offline">Offline</option><option value="suspended">Suspenso</option><option value="blocked">Bloqueado</option><option value="invited">Convidado</option></select></div>
              <div><label className={labelClass}>Role RBAC</label><select disabled={!canEditGovernance || !canManageRoles} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })} className={inputClass}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Delegação de Capabilities</h3>
              {!canManagePermissions && <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500"><Lock className="w-3 h-3" /> Requer users.manage.permissions</span>}
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black">
                    <tr><th className="p-3">Permitir</th><th className="p-3">Capability</th><th className="p-3">Módulo</th><th className="p-3">Scope</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CAPABILITIES_REGISTRY.map((cap) => {
                      const enabled = draft.capabilities.includes(cap.capability);
                      return (
                        <tr key={cap.id} className="hover:bg-slate-50">
                          <td className="p-3"><input type="checkbox" disabled={!canManagePermissions} checked={enabled} onChange={() => toggleCapability(cap.capability)} className="w-4 h-4 accent-[#0F8A4B]" /></td>
                          <td className="p-3 font-mono font-black text-[#0F8A4B]">{cap.capability}</td>
                          <td className="p-3 font-bold text-slate-700">{cap.module}</td>
                          <td className="p-3"><select disabled={!canManagePermissions || !enabled} value={draft.permissionScopes[cap.capability] || cap.defaultScope} onChange={(e) => updateScope(cap.capability, e.target.value as PermissionScope)} className="px-2 py-1 border border-slate-200 rounded-lg font-bold bg-white">{scopes.filter((scope) => cap.allowedScopes.includes(scope)).map((scope) => <option key={scope} value={scope}>{scope}</option>)}</select></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            Alterações administrativas geram Audit Log com antes, depois, Business Unit e correlation_id. Nenhuma opção aqui concede acesso a edição de código-fonte.
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={!canEditGovernance} className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Governança
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
