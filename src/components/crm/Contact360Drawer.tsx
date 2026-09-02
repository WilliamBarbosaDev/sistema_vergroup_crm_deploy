import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Sparkles,
  Shield,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  History,
  Copy,
  ExternalLink,
  ChevronRight,
  Send,
  UserCheck,
  User,
  MapPin,
  Lock,
  Globe,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contact, Deal, Task, Activity, AuditLog } from '../../types';
import { ContactEditModal } from './ContactEditModal';
import { Tabs } from '../ui/vercel-tabs';

interface Contact360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export const Contact360Drawer: React.FC<Contact360DrawerProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const {
    companies,
    users,
    deals,
    tasks,
    activities,
    whatsApps,
    emails,
    auditLogs,
    filterByBU,
    currentUser,
    addActivity,
    setQuickCreateType,
    setSelectedDealId,
    setSelectedTaskId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'timeline' | 'deals' | 'tasks' | 'communications' | 'documents' | 'history'
  >('overview');

  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [aiInsightResponse, setAiInsightResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  // Linked Entities Resolution
  const primaryCompany = companies.find((c) => c.id === contact.companyId);
  const assignedUser = users.find((u) => u.id === contact.assignedUserId);
  const contactDeals = deals.filter(
    (d) => d.contactId === contact.id || d.additionalContacts?.some((ac) => ac.contactId === contact.id)
  );
  const contactTasks = tasks.filter((t) => t.assignedUserId === contact.id || t.title.toLowerCase().includes(contact.name.toLowerCase()));
  const contactWhatsApp = whatsApps.find((w) => w.contactPhone.replace(/\D/g, '') === contact.phone.replace(/\D/g, ''));
  const contactEmailsList = emails.filter((e) => e.from.toLowerCase().includes(contact.email.toLowerCase()) || e.to.toLowerCase().includes(contact.email.toLowerCase()));
  const contactAuditLogs = auditLogs.filter((a) => a.entityId === contact.id);

  // Calculate completeness %
  const expectedFields = [
    contact.name,
    contact.email,
    contact.phone,
    contact.document,
    contact.jobTitle,
    contact.companyId,
    contact.city,
    contact.notes,
    contact.digitalChannels?.linkedin,
  ];
  const filledFieldsCount = expectedFields.filter(Boolean).length;
  const completenessPercent = Math.round((filledFieldsCount / expectedFields.length) * 100);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // AI Prompt Helper
  const handleAskAI = (prompt: string) => {
    setAiInsightResponse(
      `🤖 VER AI: "${contact.name}" é um contato estratégico ligado à empresa ${primaryCompany?.tradeName || 'VERGROUP'}. ` +
        `Possui ${contactDeals.length} negócios em andamento no valor acumulado de R$ ${contactDeals.reduce((sum, d) => sum + d.value, 0).toLocaleString('pt-BR')}. ` +
        `Sua última interação ocorreu recentemente via WhatsApp. Recomendamos agendar follow-up para alinhamento de proposta.`
    );
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addActivity({
      entityType: 'contact',
      entityId: contact.id,
      businessUnitId: contact.businessUnitId,
      userId: currentUser.id,
      type: 'note',
      title: 'Anotação / Comentário',
      description: commentText.trim(),
    });

    if (commentText.includes('@VER AI')) {
      handleAskAI(commentText);
    }

    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-[#E2E6EA] overflow-hidden">
        
        {/* TOP BAR & HEADER */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] bg-[#F8FAFB] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Contatos</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">{contact.name}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Identity Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E2E6EA]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20 flex items-center justify-center font-bold text-xl font-display">
                    {contact.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Contato Ativo" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 font-display">
                    {contact.salutation ? `${contact.salutation} ` : ''}{contact.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#0B6B3A] border border-emerald-200 rounded-md uppercase">
                    Ficha 360º
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-normal mt-0.5">
                  {contact.jobTitle || 'Sem cargo definido'} {primaryCompany ? `na ${primaryCompany.tradeName}` : ''}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 mt-2">
                  {(contact.tags || ['DECISOR', 'CLIENTE']).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Manager info */}
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E2E6EA]">
              <UserCheck className="w-4 h-4 text-[#0F8A4B]" />
              <div className="text-xs">
                <span className="text-[10px] text-slate-400 font-normal uppercase block">Responsável Interno</span>
                <strong className="text-slate-900 font-semibold">{assignedUser?.name || 'Não atribuído'}</strong>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#E2E6EA] overflow-x-auto custom-scrollbar">
            <a
              href={`tel:${contact.phone}`}
              className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ligar (VoIP)</span>
            </a>

            <a
              href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail</span>
            </a>

            <button
              onClick={() => setQuickCreateType('task')}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tarefa</span>
            </button>

            <button
              onClick={() => setQuickCreateType('deal')}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Negócio</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0 ml-auto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Cadastro</span>
            </button>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="px-6 border-b border-[#E2E6EA] flex items-center gap-4 bg-white text-xs font-medium overflow-x-auto custom-scrollbar">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'timeline', label: 'Timeline Unificada', badge: activities.length },
              { id: 'deals', label: 'Negócios', badge: contactDeals.length },
              { id: 'tasks', label: 'Tarefas', badge: contactTasks.length },
              { id: 'communications', label: 'Comunicações' },
              { id: 'documents', label: 'Documentos' },
              { id: 'history', label: 'Histórico' },
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as any)}
          />
        </div>

        {/* DRAWER BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* VER AI Relationship Card */}
              <div className="bg-[#ECF8F1] border border-[#0F8A4B]/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                    <h3 className="text-xs font-semibold text-slate-900 font-display">VER AI — Inteligência do Relacionamento</h3>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-[#0B6B3A] rounded border border-emerald-200">
                    Relacionamento Ativo
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {contact.name} é um contato decisor da empresa {primaryCompany?.tradeName || 'VERGROUP'}.
                  Há {contactDeals.length} negócios associados. Última interação recente registrada via WhatsApp.
                </p>

                {aiInsightResponse && (
                  <div className="p-3 bg-white rounded-lg border border-[#0F8A4B]/30 text-slate-800 text-xs font-medium space-y-1">
                    {aiInsightResponse}
                  </div>
                )}

                {/* Quick Question Pills */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto custom-scrollbar">
                  <button
                    onClick={() => handleAskAI('Resumir relacionamento')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#0B6B3A] border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors shrink-0"
                  >
                    ✨ Resumir relacionamento
                  </button>

                  <button
                    onClick={() => handleAskAI('O que está pendente?')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#0B6B3A] border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors shrink-0"
                  >
                    ✨ O que está pendente?
                  </button>

                  <button
                    onClick={() => handleAskAI('Qual foi a última conversa?')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#0B6B3A] border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors shrink-0"
                  >
                    ✨ Qual foi a última conversa?
                  </button>
                </div>
              </div>

              {/* Progress & Completeness Banner */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E6EA] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Completude do Cadastro</span>
                    <span className="text-[11px] font-mono font-bold text-[#0B6B3A] bg-[#ECF8F1] px-2 py-0.5 rounded">
                      {completenessPercent}% completo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Apenas dados reais preenchidos são exibidos. Clique em adicionar para enriquecer a ficha.
                  </p>
                </div>

                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary text-xs font-semibold px-3 py-1.5 shrink-0"
                >
                  + Adicionar informação
                </button>
              </div>

              {/* Grid 2-cols: Sobre o Contato & Canais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sobre o Contato (NO empty field placeholders!) */}
                <div className="bg-white p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 font-display uppercase tracking-wider">
                    Sobre o Contato
                  </h3>

                  <div className="space-y-2 text-xs">
                    {contact.document && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-normal">CPF / RG:</span>
                        <strong className="text-slate-900 font-medium font-mono">{contact.document}</strong>
                      </div>
                    )}

                    {contact.city && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-normal">Cidade / UF:</span>
                        <strong className="text-slate-900 font-medium">{contact.city}</strong>
                      </div>
                    )}

                    {contact.birthDate && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-normal">Data de Nascimento:</span>
                        <strong className="text-slate-900 font-medium">{contact.birthDate}</strong>
                      </div>
                    )}

                    {contact.notes && (
                      <div className="pt-1">
                        <span className="text-slate-500 font-normal block mb-1">Observações Cadastrais:</span>
                        <p className="text-slate-800 bg-[#F8FAFB] p-2.5 rounded-lg border border-[#E2E6EA] font-normal leading-relaxed">
                          {contact.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contatos & Canais Digitais */}
                <div className="bg-white p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 font-display uppercase tracking-wider">
                    Canais de Comunicação
                  </h3>

                  <div className="space-y-2">
                    {/* Primary Phone */}
                    <div className="p-2.5 bg-[#F8FAFB] rounded-lg border border-[#E2E6EA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#0F8A4B]" />
                        <div>
                          <strong className="text-slate-900 font-medium font-mono block">{contact.phone}</strong>
                          <span className="text-[10px] text-slate-500">WhatsApp • Principal</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(contact.phone)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copiar Telefone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Primary Email */}
                    <div className="p-2.5 bg-[#F8FAFB] rounded-lg border border-[#E2E6EA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <strong className="text-slate-900 font-medium block">{contact.email}</strong>
                          <span className="text-[10px] text-slate-500">Corporativo • Principal</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(contact.email)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copiar E-mail"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Context Comments & @VER AI Prompt */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 font-display uppercase tracking-wider">
                  Comentários Internos & @VER AI
                </h3>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escreva um comentário interno ou digite @VER AI para consultar..."
                    className="flex-1 px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B] text-xs"
                  />
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-1 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: TIMELINE UNIFICADA */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Timeline Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {['all', 'whatsapp', 'email', 'calls', 'tasks', 'deals', 'ver_ai'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimelineFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors shrink-0 ${
                      timelineFilter === f
                        ? 'bg-[#0F8A4B] text-white'
                        : 'bg-[#F8FAFB] text-slate-600 border border-[#E2E6EA] hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'Tudo' : f}
                  </button>
                ))}
              </div>

              {/* Timeline Stream */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E6EA]">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-9 space-y-1">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-[#0F8A4B] border-2 border-white ring-2 ring-emerald-100" />
                    <div className="bg-white p-3 rounded-xl border border-[#E2E6EA] shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className="text-slate-900 font-semibold">{act.title}</strong>
                        <span className="text-slate-400 font-mono">{act.createdAt.split('T')[0]}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NEGÓCIOS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 font-display">
                  Negócios Vinculados ao Contato ({contactDeals.length})
                </h3>
                <button
                  onClick={() => setQuickCreateType('deal')}
                  className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Criar Negócio</span>
                </button>
              </div>

              <div className="space-y-2">
                {contactDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    className="p-3 bg-white rounded-xl border border-[#E2E6EA] hover:border-[#0F8A4B] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div>
                      <strong className="text-slate-900 font-semibold block">{deal.title}</strong>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Previsão: {deal.expectedCloseDate} • Etapa: {deal.stageId}
                      </span>
                    </div>

                    <div className="text-right">
                      <strong className="text-slate-900 font-bold font-mono block">
                        R$ {deal.value.toLocaleString('pt-BR')}
                      </strong>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        deal.status === 'won'
                          ? 'bg-emerald-100 text-[#0B6B3A]'
                          : deal.status === 'lost'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {deal.status}
                      </span>
                    </div>
                  </div>
                ))}

                {contactDeals.length === 0 && (
                  <p className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-[#E2E6EA] rounded-xl">
                    Nenhum negócio vinculado a este contato.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 font-display">
                  Tarefas Relacionadas ({contactTasks.length})
                </h3>
                <button
                  onClick={() => setQuickCreateType('task')}
                  className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Criar Tarefa</span>
                </button>
              </div>

              <div className="space-y-2">
                {contactTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="p-3 bg-white rounded-xl border border-[#E2E6EA] hover:border-[#0F8A4B] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {t.protocolNumber && (
                          <span className="font-mono text-[10px] font-black text-[#0F8A4B] bg-[#ECF8F1] px-1.5 py-0.2 rounded border border-[#0F8A4B]/20">
                            📋 {t.protocolNumber}
                          </span>
                        )}
                        <strong className="text-slate-900 font-semibold text-xs">{t.title}</strong>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Prazo: {t.dueDate}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMUNICAÇÕES */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 font-display uppercase tracking-wider">
                  Histórico WhatsApp & E-mails
                </h3>

                {contactWhatsApp ? (
                  <div className="p-3 bg-[#ECF8F1] border border-[#0F8A4B]/20 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-[#0B6B3A] uppercase block">Última Conversa WhatsApp</span>
                    <p className="text-xs text-slate-800 font-medium">{contactWhatsApp.lastMessage}</p>
                    <span className="text-[10px] text-slate-500">{contactWhatsApp.lastMessageTime}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum histórico de mensagens arquivado para este número.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTOS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-900 font-display">Documentos & Anexos do Contato</p>
              <div className="p-6 text-center border border-dashed border-[#E2E6EA] rounded-xl text-slate-400 italic text-xs">
                Nenhum arquivo ou proposta assinado pendente.
              </div>
            </div>
          )}

          {/* TAB 7: HISTÓRICO */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-900 font-display">Trilha de Auditoria Cadastral (Audit Trail)</p>
              <div className="space-y-2">
                {contactAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white rounded-lg border border-[#E2E6EA] text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 font-medium block">{log.details}</strong>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Edição */}
        {showEditModal && (
          <ContactEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            contact={contact}
          />
        )}

      </div>
    </div>
  );
};
