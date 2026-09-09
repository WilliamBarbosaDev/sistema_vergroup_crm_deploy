import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Smartphone,
  Laptop,
  HardDrive,
  Award,
  Sparkles,
  ShoppingBag,
  Pencil,
  Check,
  Calendar,
  FolderKanban,
  FileText,
  TrendingUp,
  Clock,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Video,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [activeTab, setActiveTab] = useState<string>('geral');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const [draft, setDraft] = useState(() => ({
    firstName: currentUser.firstName || currentUser.name.split(' ')[0] || 'William',
    lastName: currentUser.lastName || currentUser.name.split(' ').slice(1).join(' ') || 'Barbosa',
    name: currentUser.name || 'William Barbosa',
    displayName: currentUser.displayName || currentUser.name || 'William Barbosa',
    jobTitle: currentUser.jobTitle || 'Superadministrador & Diretor',
    email: currentUser.email || 'william@vergroup.com.br',
    personalEmail: currentUser.personalEmail || 'william.barbosa@gmail.com',
    phone: currentUser.phone || '+55 (92) 98124-5500',
    workPhone: currentUser.workPhone || '+55 (92) 3042-0582',
    extensionPhone: currentUser.extensionPhone || 'Ramal 101',
    whatsapp: currentUser.whatsapp || '+55 (92) 98124-5500',
    emergencyContactName: currentUser.emergencyContactName || 'Maria Silva Barbosa',
    emergencyContact: currentUser.emergencyContact || '+55 (92) 99100-2233',
    birthDate: currentUser.birthDate || '1990-05-15',
    gender: currentUser.gender || 'Masculino',
    website: currentUser.website || 'https://vergroup.com.br',
    city: currentUser.city || 'Manaus',
    state: currentUser.state || 'AM',
    country: currentUser.country || 'Brasil',
    hiredAt: currentUser.hiredAt ? new Date(currentUser.hiredAt).toISOString().split('T')[0] : '2022-01-10',
    teamsAccount: currentUser.teamsAccount || 'william.teams@vergroup.com.br',
    zoomAccount: currentUser.zoomAccount || 'william.zoom@vergroup.com.br',
    timezone: currentUser.timezone || 'America/Manaus (UTC-4)',
    language: currentUser.language || 'Português (Brasil)',
    avatar: currentUser.avatar || '',
  }));

  const bu = businessUnits.find((b) => b.id === currentUser.primaryBusinessUnitId);
  const department = departments.find((d) => d.id === currentUser.departmentId);

  if (!isOpen) return null;

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhoneValue = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);

    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  };

  const handlePhoneChange = (field: 'phone' | 'workPhone' | 'emergencyContact', value: string) => {
    updateDraft(field, formatPhoneValue(value));
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

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, avatar: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();

    if (!firstName || !lastName) {
      setSaveError('Nome e sobrenome são obrigatórios.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      updateCurrentUserProfile({
        firstName,
        lastName,
        name: fullName,
        displayName: draft.displayName.trim() || fullName,
        birthDate: draft.birthDate,
        gender: draft.gender,
        city: draft.city.trim(),
        state: draft.state.trim(),
        country: draft.country.trim(),
        language: draft.language,
        timezone: draft.timezone,
        phone: draft.phone.trim(),
        workPhone: draft.workPhone.trim(),
        extensionPhone: draft.extensionPhone.trim(),
        whatsapp: draft.whatsapp.trim(),
        emergencyContactName: draft.emergencyContactName.trim(),
        emergencyContact: draft.emergencyContact.trim(),
        website: draft.website.trim(),
        teamsAccount: draft.teamsAccount.trim(),
        zoomAccount: draft.zoomAccount.trim(),
        avatar: draft.avatar,
      });
      setIsEditing(false);
      setSavedMessage('🎉 Dados do perfil atualizados com sucesso!');
      window.setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const topTabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'tarefas', label: 'Tarefas' },
    { id: 'calendario', label: 'Calendário' },
    { id: 'drive', label: 'Drive' },
    { id: 'feed', label: 'Feed' },
    { id: 'documentos', label: 'Meus documentos' },
    { id: 'analise', label: 'Análise' },
    { id: 'eficiencia', label: 'Eficiência' },
    { id: 'horas', label: 'Horas Trabalhadas' },
    { id: 'relatorios', label: 'Relatórios de Trabalho' },
    { id: 'mais', label: 'Mais...' },
  ];

  const fieldLabelClass = 'block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1';
  const fieldInputClass = 'w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#0F8A4B] focus:ring-2 focus:ring-[#0F8A4B]/10 disabled:bg-slate-50 disabled:text-slate-700 transition-all';

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200 font-sans select-none">
      
      {/* Right drawer panel (ficha de colaborador premium) */}
      <div className="w-full max-w-5xl h-full bg-[#F4F6F8] shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 card-elevated">
        
        {/* TOP HEADER CORPORATIVO */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between">
            
            {/* Header User Identity */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <UserAvatar name={draft.displayName || currentUser.name} avatarUrl={draft.avatar} size="lg" status={currentUser.status} />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-2xs" title="ON-LINE" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-white">{draft.firstName} {draft.lastName}</h2>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    {currentUser.role === 'superadmin' ? 'SUPERADMIN' : currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                  <span>{currentUser.jobTitle || 'Superadministrador & Diretor'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono font-bold">{currentUser.email}</span>
                </p>
              </div>
            </div>

            {/* Top Auxiliary Actions */}
            <div className="flex items-center gap-2.5">
              {savedMessage && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {savedMessage}
                </span>
              )}

              <button
                type="button"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Marketplace</span>
              </button>

              <button
                type="button"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Segurança</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Fechar Ficha de Colaborador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* BARRA DE ABAS NO TOPO (SCROLLABLE TABS) */}
          <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800/80 custom-scrollbar text-xs">
            {topTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0F8A4B] text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ESTRUTURA INTERNA DO PAINEL EM 2 COLUNAS */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 custom-scrollbar">
          
          {/* COLUNA ESQUERDA: FOTO, STATUS & WIDGETS COMPACTOS (4 COLUNAS / lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* CARD 1: FOTO DE PERFIL & STATUS ON-LINE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-3">
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleAvatarSelect} className="hidden" />
              
              <div className="relative inline-block mx-auto">
                <UserAvatar name={draft.displayName || currentUser.name} avatarUrl={draft.avatar} size="xl" status={currentUser.status} />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="ON-LINE" />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">{draft.firstName} {draft.lastName}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{currentUser.jobTitle || 'Superadministrador & Diretor'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B6B3A] border border-emerald-200 text-[10px] font-black uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ON-LINE • Em Expediente</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span>Alterar Foto</span>
                </button>
                {draft.avatar && (
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, avatar: '' }))}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remover Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {avatarError && <p className="text-[11px] font-bold text-rose-600 mt-1">{avatarError}</p>}
            </div>

            {/* CARD 2: APLICATIVO PARA CELULAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#0F8A4B]" />
                  Aplicativo para Celular
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Conectado
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Acesse tarefas, chat e chamadas no iOS e Android.</p>
              <button
                type="button"
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Baixar App Mobile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* CARD 3: APLICATIVO PARA COMPUTADOR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#0F8A4B]" />
                  Aplicativo para Computador
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  v2.4 Windows
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Versão desktop para Windows e macOS com chamadas HD.</p>
              <button
                type="button"
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Abrir App Desktop</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* CARD 4: DRIVE & ARMAZENAMENTO */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#0F8A4B]" />
                  Drive & Armazenamento
                </span>
                <span className="text-xs font-mono font-bold text-[#0F8A4B]">18.4 GB / 100 GB</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-[#0F8A4B] rounded-full" style={{ width: '18.4%' }} />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Arquivos sincronizados e documentos corporativos.</p>
            </div>

            {/* CARD 5: APRECIAÇÕES & CONQUISTAS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Apreciações & Reconhecimento
                </span>
                <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  3 Badges
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[#0B6B3A] rounded-lg text-[10px] font-black flex items-center gap-1">
                  🌟 Top Executor
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-[10px] font-black flex items-center gap-1">
                  🛡️ Governança Pro
                </span>
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[10px] font-black flex items-center gap-1">
                  🚀 Líder de Vendas
                </span>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES DE CONTATO & FORMULÁRIO (8 COLUNAS / lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* BLOCO PRINCIPAL: INFORMAÇÕES DE CONTATO */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              
              {/* Header do Bloco com botão Editar / Salvar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0F8A4B]" />
                    <span>Informações de contato</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Dados cadastrais e informações corporativas do colaborador
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isEditing
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-emerald-50 text-[#0B6B3A] border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Visualizar' : 'Editar'}</span>
                </button>
              </div>

              {/* Grid 2 Colunas com todos os Campos Obrigatórios Solicitados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Nome */}
                <div>
                  <label className={fieldLabelClass}>Nome *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.firstName}
                    onChange={(e) => updateDraft('firstName', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 2. Sobrenome */}
                <div>
                  <label className={fieldLabelClass}>Sobrenome *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.lastName}
                    onChange={(e) => updateDraft('lastName', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 3. E-mail Corporativo */}
                <div>
                  <label className={fieldLabelClass}>E-mail Corporativo</label>
                  <input
                    type="email"
                    disabled
                    value={draft.email}
                    className={`${fieldInputClass} bg-slate-50 font-mono`}
                  />
                </div>

                {/* 4. Cargo */}
                <div>
                  <label className={fieldLabelClass}>Cargo</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.jobTitle}
                    onChange={(e) => updateDraft('jobTitle', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 5. Departamento */}
                <div>
                  <label className={fieldLabelClass}>Departamento</label>
                  <input
                    type="text"
                    disabled
                    value={department?.name || 'Diretoria Executiva / Operações'}
                    className={`${fieldInputClass} bg-slate-50`}
                  />
                </div>

                {/* 6. Data de Nascimento */}
                <div>
                  <label className={fieldLabelClass}>Data de Nascimento</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={draft.birthDate}
                    onChange={(e) => updateDraft('birthDate', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 7. Sexo / Gênero */}
                <div>
                  <label className={fieldLabelClass}>Sexo / Gênero</label>
                  <select
                    disabled={!isEditing}
                    value={draft.gender}
                    onChange={(e) => updateDraft('gender', e.target.value)}
                    className={fieldInputClass}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro / Prefiro não informar</option>
                  </select>
                </div>

                {/* 8. Site / Website */}
                <div>
                  <label className={fieldLabelClass}>Site / Website</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.website}
                    onChange={(e) => updateDraft('website', e.target.value)}
                    placeholder="https://empresa.com.br"
                    className={fieldInputClass}
                  />
                </div>

                {/* 9. Telefone Celular */}
                <div>
                  <label className={fieldLabelClass}>Telefone Celular</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.phone}
                    onChange={(e) => updateDraft('phone', e.target.value)}
                    className={`${fieldInputClass} font-mono`}
                  />
                </div>

                {/* 10. Contato de Emergência */}
                <div>
                  <label className={fieldLabelClass}>Contato de Emergência</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.emergencyContact}
                    onChange={(e) => updateDraft('emergencyContact', e.target.value)}
                    placeholder="Ex: (92) 99100-2233 (Esposa)"
                    className={fieldInputClass}
                  />
                </div>

                {/* 11. Telefone do Trabalho */}
                <div>
                  <label className={fieldLabelClass}>Telefone do Trabalho</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.workPhone}
                    onChange={(e) => updateDraft('workPhone', e.target.value)}
                    className={`${fieldInputClass} font-mono`}
                  />
                </div>

                {/* 12. Telefone Interno / Ramal */}
                <div>
                  <label className={fieldLabelClass}>Telefone Interno / Ramal</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.extensionPhone}
                    onChange={(e) => updateDraft('extensionPhone', e.target.value)}
                    placeholder="Ex: Ramal 101"
                    className={`${fieldInputClass} font-mono`}
                  />
                </div>

                {/* 13. Cidade */}
                <div>
                  <label className={fieldLabelClass}>Cidade / UF</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={`${draft.city}, ${draft.state}`}
                    onChange={(e) => updateDraft('city', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 14. Data de Contratação */}
                <div>
                  <label className={fieldLabelClass}>Data de Contratação</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={draft.hiredAt}
                    onChange={(e) => updateDraft('hiredAt', e.target.value)}
                    className={fieldInputClass}
                  />
                </div>

                {/* 15. Microsoft Teams */}
                <div>
                  <label className={fieldLabelClass}>Microsoft Teams</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.teamsAccount}
                    onChange={(e) => updateDraft('teamsAccount', e.target.value)}
                    placeholder="usuario@teams.com"
                    className={fieldInputClass}
                  />
                </div>

                {/* 16. Zoom */}
                <div>
                  <label className={fieldLabelClass}>Zoom ID / E-mail</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={draft.zoomAccount}
                    onChange={(e) => updateDraft('zoomAccount', e.target.value)}
                    placeholder="usuario@zoom.us"
                    className={fieldInputClass}
                  />
                </div>

                {/* 17. Fuso Horário */}
                <div>
                  <label className={fieldLabelClass}>Fuso Horário</label>
                  <select
                    disabled={!isEditing}
                    value={draft.timezone}
                    onChange={(e) => updateDraft('timezone', e.target.value)}
                    className={fieldInputClass}
                  >
                    <option value="America/Manaus (UTC-4)">America/Manaus (UTC-4)</option>
                    <option value="America/Sao_Paulo (UTC-3)">America/Sao_Paulo (UTC-3)</option>
                    <option value="UTC">UTC (Universal)</option>
                  </select>
                </div>

                {/* 18. Idioma de Notificação */}
                <div>
                  <label className={fieldLabelClass}>Idioma de Notificação</label>
                  <select
                    disabled={!isEditing}
                    value={draft.language}
                    onChange={(e) => updateDraft('language', e.target.value)}
                    className={fieldInputClass}
                  >
                    <option value="Português (Brasil)">Português (Brasil)</option>
                    <option value="English (US)">English (US)</option>
                    <option value="Español">Español</option>
                  </select>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* RODAPÉ DO PAINEL (FOOTER FIXO COM AÇÕES SALVAR / CANCELAR) */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
            <span>Perfil Corporativo VERGROUP • Alterações auditadas</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>SALVAR DADOS DE PERFIL</span>
            </button>
          </div>
        </div>

      </div>
    </div>, document.body);
};
