import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Save,
  Lock,
  Globe,
  Bell,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProfileTab = 'personal' | 'contact' | 'professional' | 'photo' | 'security' | 'preferences';

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    businessUnits,
    departments,
    teams,
    users,
    updateCurrentUserProfile,
    requestCurrentUserEmailChange,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [emailChangeRequest, setEmailChangeRequest] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [draft, setDraft] = useState(() => ({
    firstName: currentUser.firstName || currentUser.name.split(' ')[0] || '',
    lastName: currentUser.lastName || currentUser.name.split(' ').slice(1).join(' '),
    name: currentUser.name || '',
    displayName: currentUser.displayName || currentUser.name.split(' ')[0] || '',
    birthDate: currentUser.birthDate || '',
    gender: currentUser.gender || '',
    city: currentUser.city || '',
    state: currentUser.state || '',
    country: currentUser.country || 'Brasil',
    language: currentUser.language || 'Português (Brasil)',
    timezone: currentUser.timezone || 'America/Manaus',
    bio: currentUser.bio || '',
    personalNotes: currentUser.personalNotes || '',
    personalEmail: currentUser.personalEmail || '',
    phone: currentUser.phone || '',
    whatsapp: currentUser.whatsapp || currentUser.phone || '',
    alternatePhone: currentUser.alternatePhone || '',
    emergencyContactName: currentUser.emergencyContactName || '',
    emergencyContact: currentUser.emergencyContact || '',
    avatar: currentUser.avatar || '',
    notificationPreferences: {
      email: currentUser.notificationPreferences?.email ?? true,
      push: currentUser.notificationPreferences?.push ?? true,
      taskDigest: currentUser.notificationPreferences?.taskDigest ?? true,
      meetingReminders: currentUser.notificationPreferences?.meetingReminders ?? true,
    },
  }));

  const bu = businessUnits.find((b) => b.id === currentUser.primaryBusinessUnitId);
  const department = departments.find((d) => d.id === currentUser.departmentId);
  const team = teams.find((t) => t.id === currentUser.teamId);
  const manager = users.find((u) => u.id === currentUser.managerId);
  const supervisor = users.find((u) => u.id === currentUser.supervisorId);

  const profileCompletion = useMemo(() => {
    const fields = [
      draft.name,
      draft.displayName,
      draft.birthDate,
      draft.city,
      draft.state,
      draft.country,
      draft.language,
      draft.timezone,
      draft.phone,
      draft.whatsapp,
      draft.emergencyContactName,
      draft.emergencyContact,
      draft.avatar,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [draft]);

  if (!isOpen) return null;

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError('');
    if (!file) return;

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      setAvatarError('Formato inválido. Use JPG, JPEG, PNG ou WEBP.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError('A foto deve ter no máximo 2 MB.');
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    if (!/\.(jpe?g|png|webp)$/i.test(safeName)) {
      setAvatarError('Nome de arquivo inválido para foto de perfil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, avatar: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fullName = draft.name.trim() || `${draft.firstName} ${draft.lastName}`.trim();
    updateCurrentUserProfile({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      name: fullName,
      displayName: draft.displayName.trim() || fullName,
      birthDate: draft.birthDate,
      gender: draft.gender,
      city: draft.city.trim(),
      state: draft.state.trim(),
      country: draft.country.trim(),
      language: draft.language,
      timezone: draft.timezone,
      bio: draft.bio.trim(),
      personalNotes: draft.personalNotes.trim(),
      personalEmail: draft.personalEmail.trim(),
      phone: draft.phone.trim(),
      whatsapp: draft.whatsapp.trim(),
      alternatePhone: draft.alternatePhone.trim(),
      emergencyContactName: draft.emergencyContactName.trim(),
      emergencyContact: draft.emergencyContact.trim(),
      avatar: draft.avatar,
      notificationPreferences: draft.notificationPreferences,
    });
    setIsEditing(false);
    setSavedMessage('Perfil atualizado com sucesso.');
    window.setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleEmailRequest = () => {
    if (!emailChangeRequest.trim() || emailChangeRequest.trim() === currentUser.email) return;
    requestCurrentUserEmailChange(emailChangeRequest.trim());
    setSavedMessage('Solicitação de alteração de e-mail registrada para fluxo seguro de confirmação.');
    setEmailChangeRequest('');
    window.setTimeout(() => setSavedMessage(''), 4000);
  };

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Pessoal', icon: <User className="w-4 h-4" /> },
    { id: 'contact', label: 'Contato', icon: <Phone className="w-4 h-4" /> },
    { id: 'professional', label: 'Profissional', icon: <Building2 className="w-4 h-4" /> },
    { id: 'photo', label: 'Foto', icon: <Camera className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferências', icon: <Globe className="w-4 h-4" /> },
  ];

  const fieldClass = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-[#0F8A4B] focus:ring-2 focus:ring-[#0F8A4B]/10 disabled:bg-slate-50 disabled:text-slate-500';
  const labelClass = 'block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5';

  const ReadOnlyGovernanceField = ({ label, value }: { label: string; value?: string }) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm text-slate-900">{value || 'Nao definido'}</strong>
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
          <Lock className="w-3 h-3" />
          Admin
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-6xl bg-[#F7F9FA] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 font-sans">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar name={currentUser.name} avatarUrl={draft.avatar} size="xl" status={currentUser.status} />
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight truncate">Meu Perfil</h2>
              <p className="text-xs text-slate-300 font-semibold truncate">
                {currentUser.jobTitle || 'Colaborador'} • {currentUser.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedMessage && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F8A4B]/20 text-emerald-200 rounded-xl border border-[#0F8A4B]/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {savedMessage}
              </span>
            )}
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-0">
          <aside className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 space-y-5">
            <div className="flex flex-col items-center text-center">
              <UserAvatar name={currentUser.name} avatarUrl={draft.avatar} size="xl" status={currentUser.status} />
              <h3 className="mt-3 text-base font-black text-slate-900">{draft.displayName || currentUser.name}</h3>
              <p className="text-xs font-semibold text-slate-500">{currentUser.jobTitle || 'Cargo gerenciado pela administracao'}</p>
              <span className="mt-2 px-2.5 py-1 rounded-lg bg-[#ECF8F1] text-[#0F8A4B] text-[10px] font-black uppercase">
                {currentUser.status === 'active' ? 'Ativo' : currentUser.status}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-2">
                <span>Completude</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="h-2 bg-white border border-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0F8A4B]" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#ECF8F1] text-[#0F8A4B] border border-[#0F8A4B]/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex flex-col min-h-0">
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Ficha de Perfil do Usuario</h3>
                <p className="text-[11px] text-slate-500 font-semibold">Dados pessoais editaveis. Governanca institucional somente por administracao.</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-2xs">
                      <Save className="w-4 h-4" />
                      Salvar Perfil
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-xl bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black cursor-pointer shadow-2xs">
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
              {activeTab === 'personal' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Informacoes Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Nome</label><input disabled={!isEditing} value={draft.firstName} onChange={(e) => updateDraft('firstName', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Sobrenome</label><input disabled={!isEditing} value={draft.lastName} onChange={(e) => updateDraft('lastName', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Nome Completo</label><input disabled={!isEditing} value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Nome de Exibicao</label><input disabled={!isEditing} value={draft.displayName} onChange={(e) => updateDraft('displayName', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Data de Nascimento</label><input type="date" disabled={!isEditing} value={draft.birthDate} onChange={(e) => updateDraft('birthDate', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Genero</label><input disabled={!isEditing} value={draft.gender} onChange={(e) => updateDraft('gender', e.target.value)} className={fieldClass} placeholder="Opcional" /></div>
                    <div><label className={labelClass}>Cidade</label><input disabled={!isEditing} value={draft.city} onChange={(e) => updateDraft('city', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Estado</label><input disabled={!isEditing} value={draft.state} onChange={(e) => updateDraft('state', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Pais</label><input disabled={!isEditing} value={draft.country} onChange={(e) => updateDraft('country', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Idioma</label><select disabled={!isEditing} value={draft.language} onChange={(e) => updateDraft('language', e.target.value)} className={fieldClass}><option>Português (Brasil)</option><option>English (US)</option><option>Español</option></select></div>
                    <div className="md:col-span-2"><label className={labelClass}>Bio</label><textarea disabled={!isEditing} value={draft.bio} onChange={(e) => updateDraft('bio', e.target.value)} rows={3} className={fieldClass} placeholder="Apresentacao curta para colegas." /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Observacoes Pessoais Permitidas</label><textarea disabled={!isEditing} value={draft.personalNotes} onChange={(e) => updateDraft('personalNotes', e.target.value)} rows={3} className={fieldClass} /></div>
                  </div>
                </section>
              )}

              {activeTab === 'contact' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Contato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>E-mail Corporativo / Login</label><input disabled value={currentUser.email} className={fieldClass} /></div>
                    <div><label className={labelClass}>Solicitar Novo E-mail Corporativo</label><div className="flex gap-2"><input disabled={!isEditing} type="email" value={emailChangeRequest} onChange={(e) => setEmailChangeRequest(e.target.value)} className={fieldClass} placeholder="novo@email.com" /><button type="button" disabled={!isEditing || !emailChangeRequest} onClick={handleEmailRequest} className="px-3 rounded-xl bg-slate-900 text-white text-xs font-black disabled:opacity-40">Solicitar</button></div></div>
                    <div><label className={labelClass}>E-mail Pessoal</label><input disabled={!isEditing} type="email" value={draft.personalEmail} onChange={(e) => updateDraft('personalEmail', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Telefone Celular</label><input disabled={!isEditing} value={draft.phone} onChange={(e) => updateDraft('phone', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>WhatsApp</label><input disabled={!isEditing} value={draft.whatsapp} onChange={(e) => updateDraft('whatsapp', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Telefone Alternativo</label><input disabled={!isEditing} value={draft.alternatePhone} onChange={(e) => updateDraft('alternatePhone', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Nome do Contato de Emergencia</label><input disabled={!isEditing} value={draft.emergencyContactName} onChange={(e) => updateDraft('emergencyContactName', e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Contato de Emergencia</label><input disabled={!isEditing} value={draft.emergencyContact} onChange={(e) => updateDraft('emergencyContact', e.target.value)} className={fieldClass} /></div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Alteracao de e-mail corporativo exige confirmacao do provedor de Auth. Aqui registramos a solicitacao, sem atualizar visualmente o login.
                  </div>
                </section>
              )}

              {activeTab === 'professional' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Dados Profissionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyGovernanceField label="Cargo" value={currentUser.jobTitle} />
                    <ReadOnlyGovernanceField label="Departamento" value={department?.name} />
                    <ReadOnlyGovernanceField label="Business Unit" value={bu?.tradeName || bu?.name} />
                    <ReadOnlyGovernanceField label="Equipe" value={team?.name} />
                    <ReadOnlyGovernanceField label="Gestor" value={manager?.name} />
                    <ReadOnlyGovernanceField label="Supervisor" value={supervisor?.name} />
                    <ReadOnlyGovernanceField label="Role RBAC" value={currentUser.role} />
                    <ReadOnlyGovernanceField label="Status Funcional" value={currentUser.status} />
                    <ReadOnlyGovernanceField label="Matricula / Codigo Interno" value={currentUser.employeeCode} />
                    <ReadOnlyGovernanceField label="Data de Contratacao" value={currentUser.hiredAt ? new Date(currentUser.hiredAt).toLocaleDateString('pt-BR') : undefined} />
                  </div>
                </section>
              )}

              {activeTab === 'photo' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Foto e Identidade</h4>
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleAvatarSelect} className="hidden" />
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <UserAvatar name={draft.name || currentUser.name} avatarUrl={draft.avatar} size="xl" status={currentUser.status} />
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-semibold text-slate-700">Esta e a foto oficial do colaborador no sistema. Onde nao houver foto, o fallback oficial sao as iniciais do nome.</p>
                      <div className="flex flex-wrap gap-2">
                        <button disabled={!isEditing} onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-[#0F8A4B] text-white text-xs font-black flex items-center gap-2 disabled:opacity-40 cursor-pointer"><Upload className="w-4 h-4" /> Enviar Foto</button>
                        <button disabled={!isEditing || !draft.avatar} onClick={() => setDraft((prev) => ({ ...prev, avatar: '' }))} className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-black flex items-center gap-2 disabled:opacity-40 cursor-pointer"><Trash2 className="w-4 h-4" /> Remover</button>
                      </div>
                      {avatarError && <p className="text-xs font-bold text-rose-600">{avatarError}</p>}
                      <p className="text-[11px] text-slate-500 font-semibold">Formatos aceitos: JPG, JPEG, PNG e WEBP. Limite atual: 2 MB. Storage externo deve preencher `avatarStoragePath` quando configurado.</p>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'security' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Seguranca da Conta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className={labelClass}>Alterar Senha</span><strong className="text-sm text-slate-900">Fluxo seguro pelo Auth Provider</strong><p className="text-[11px] text-slate-500 mt-1">Preparado para integracao Supabase Auth.</p></div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className={labelClass}>Ultima Alteracao de Senha</span><strong className="text-sm text-slate-900">{currentUser.lastPasswordChangedAt ? new Date(currentUser.lastPasswordChangedAt).toLocaleDateString('pt-BR') : 'Nao informado'}</strong></div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className={labelClass}>Sessoes Ativas</span><strong className="text-sm text-slate-900">Disponivel quando Auth expor sessoes</strong></div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className={labelClass}>MFA</span><strong className="text-sm text-slate-900">Previsto para fase futura</strong></div>
                  </div>
                </section>
              )}

              {activeTab === 'preferences' && (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Preferencias</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Fuso Horario</label><select disabled={!isEditing} value={draft.timezone} onChange={(e) => updateDraft('timezone', e.target.value)} className={fieldClass}><option value="America/Manaus">America/Manaus</option><option value="America/Sao_Paulo">America/Sao_Paulo</option><option value="UTC">UTC</option></select></div>
                    <div><label className={labelClass}>Idioma</label><select disabled={!isEditing} value={draft.language} onChange={(e) => updateDraft('language', e.target.value)} className={fieldClass}><option>Português (Brasil)</option><option>English (US)</option><option>Español</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      ['email', 'Notificacoes por e-mail'],
                      ['push', 'Notificacoes no sistema'],
                      ['taskDigest', 'Resumo de tarefas'],
                      ['meetingReminders', 'Lembretes de reuniao'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                        <span className="flex items-center gap-2"><Bell className="w-4 h-4 text-[#0F8A4B]" /> {label}</span>
                        <input
                          type="checkbox"
                          disabled={!isEditing}
                          checked={Boolean(draft.notificationPreferences[key as keyof typeof draft.notificationPreferences])}
                          onChange={(e) => setDraft((prev) => ({
                            ...prev,
                            notificationPreferences: { ...prev.notificationPreferences, [key]: e.target.checked },
                          }))}
                          className="w-4 h-4 accent-[#0F8A4B]"
                        />
                      </label>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
