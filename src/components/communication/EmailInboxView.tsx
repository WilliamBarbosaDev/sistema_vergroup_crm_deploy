import React, { useState } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Star,
  Sparkles,
  CheckSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Building2,
  TrendingUp,
  FolderKanban,
  User,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmailMessage, EmailAccountConfig } from '../../types';

export const EmailInboxView: React.FC = () => {
  const {
    emails,
    deals,
    projects,
    tasks,
    contacts,
    users,
    currentUser,
    sendEmail,
    markEmailRead,
    toggleEmailStar,
    emailAccountConfig,
    saveEmailAccountConfig,
    setSelectedDealId,
    setSelectedTaskId,
    setCurrentTab,
    setQuickCreateType,
    openTaskCreate,
  } = useApp();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'linked'>('inbox');
  const [activeEmailId, setActiveEmailId] = useState<string>(emails[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Compose modal
  const [composeModal, setComposeModal] = useState(false);
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [selectedDealBinding, setSelectedDealBinding] = useState<string>('');
  const [selectedProjectBinding, setSelectedProjectBinding] = useState<string>('');
  const [selectedTaskBinding, setSelectedTaskBinding] = useState<string>('');

  // Settings modal
  const [settingsModal, setSettingsModal] = useState(false);
  const [configForm, setConfigForm] = useState<EmailAccountConfig>(emailAccountConfig);

  const displayedEmails = emails.filter((e) => {
    if (activeFolder === 'inbox' && e.folder !== 'inbox') return false;
    if (activeFolder === 'sent' && e.folder !== 'sent') return false;
    if (activeFolder === 'starred' && !e.starred) return false;
    if (activeFolder === 'linked' && !e.relatedDealId && !e.relatedProjectId && !e.relatedTaskId) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        e.subject.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.from.email.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeEmail = emails.find((e) => e.id === activeEmailId) || displayedEmails[0];

  const handleSelectEmail = (e: EmailMessage) => {
    setActiveEmailId(e.id);
    if (!e.isRead) {
      markEmailRead(e.id);
    }
  };

  const handleSendCompose = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!toInput.trim() || !subjectInput.trim() || !bodyInput.trim()) return;

    sendEmail(
      toInput.trim(),
      subjectInput.trim(),
      bodyInput.trim(),
      selectedDealBinding || undefined,
      selectedProjectBinding || undefined,
      selectedTaskBinding || undefined
    );

    setComposeModal(false);
    setToInput('');
    setSubjectInput('');
    setBodyInput('');
    setSelectedDealBinding('');
    setSelectedProjectBinding('');
    setSelectedTaskBinding('');
  };

  const handleSaveSettings = (ev: React.FormEvent) => {
    ev.preventDefault();
    saveEmailAccountConfig(configForm);
    setSettingsModal(false);
  };

  const relatedDeal = activeEmail?.relatedDealId ? deals.find((d) => d.id === activeEmail.relatedDealId) : null;
  const relatedProject = activeEmail?.relatedProjectId ? projects.find((p) => p.id === activeEmail.relatedProjectId) : null;
  const relatedTask = activeEmail?.relatedTaskId ? tasks.find((t) => t.id === activeEmail.relatedTaskId) : null;

  return (
    <div id="email-inbox-view" className="p-4 md:p-6 max-w-full h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Top Bar Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-[#0F8A4B] rounded-lg border border-emerald-200/50">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900">E-mail Corporativo Integrado (CRM 360°)</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-[#0F8A4B] border border-emerald-200 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>IMAP/SMTP TLS Criptografado</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Conectado como <strong className="text-neutral-800">{emailAccountConfig.email}</strong> • Rastreabilidade direta com Contatos, Negócios e Tarefas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-md text-xs font-semibold text-neutral-700 cursor-pointer"
            title="Configurar servidores IMAP/SMTP e assinatura"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações IMAP/SMTP</span>
          </button>
          <button
            onClick={() => setComposeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Escrever E-mail</span>
          </button>
        </div>
      </div>

      {/* Main Mailbox Frame */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex-1 flex overflow-hidden">
        {/* Left Side: Folders & Message List */}
        <div className="w-96 border-r border-neutral-200 bg-neutral-50/70 flex flex-col shrink-0">
          {/* Folders navigation chips */}
          <div className="p-3 border-b border-neutral-200 bg-white grid grid-cols-4 gap-1 text-[11px] font-semibold">
            <button
              onClick={() => setActiveFolder('inbox')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-colors ${
                activeFolder === 'inbox' ? 'bg-[#0F8A4B] text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Entrada</span>
            </button>

            <button
              onClick={() => setActiveFolder('sent')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-colors ${
                activeFolder === 'sent' ? 'bg-[#0F8A4B] text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviados</span>
            </button>

            <button
              onClick={() => setActiveFolder('starred')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-colors ${
                activeFolder === 'starred' ? 'bg-[#0F8A4B] text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Estrela</span>
            </button>

            <button
              onClick={() => setActiveFolder('linked')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-colors ${
                activeFolder === 'linked' ? 'bg-[#0F8A4B] text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Mensagens vinculadas a negócios ou projetos"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CRM</span>
            </button>
          </div>

          {/* Search bar inside mailbox */}
          <div className="p-2.5 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar em assuntos ou remetentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-xs text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Email Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-200/70">
            {displayedEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Nenhum e-mail nesta pasta.
              </div>
            ) : (
              displayedEmails.map((email) => {
                const isSelected = email.id === activeEmail?.id;
                const hasDeal = !!email.relatedDealId;

                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3 cursor-pointer transition-colors space-y-1 relative ${
                      isSelected
                        ? 'bg-white border-l-4 border-[#0F8A4B] shadow-2xs'
                        : 'hover:bg-neutral-100/80 bg-neutral-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate ${email.isRead ? 'text-neutral-700 font-medium' : 'text-neutral-900 font-bold'}`}>
                        {email.from.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggleEmailStar(email.id);
                          }}
                          className={`p-0.5 rounded hover:text-amber-500 ${email.starred ? 'text-amber-500' : 'text-neutral-300'}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(email.receivedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <h4 className={`text-xs line-clamp-1 ${email.isRead ? 'text-neutral-800' : 'text-neutral-900 font-bold'}`}>
                      {email.subject}
                    </h4>

                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {email.snippet || email.body}
                    </p>

                    {hasDeal && (
                      <div className="pt-1 flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-[#0F8A4B] font-bold border border-emerald-200">
                          🤝 CRM Vinculado
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Email Reading & CRM Context Panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeEmail ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-neutral-200 bg-neutral-50/60 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">{activeEmail.subject}</h2>
                    <p className="text-xs text-neutral-600 mt-1">
                      De: <strong className="text-neutral-900">{activeEmail.from.name}</strong> &lt;{activeEmail.from.email}&gt;
                    </p>
                    <p className="text-xs text-neutral-500">
                      Para: {activeEmail.to.map((t) => `${t.name} <${t.email}>`).join(', ')} • {new Date(activeEmail.receivedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {/* Actions to Convert to CRM */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setQuickCreateType('deal')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-[#0F8A4B] text-[#0F8A4B] hover:text-white border border-emerald-300 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Transformar este e-mail em um Negócio no CRM"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar Negócio</span>
                    </button>

                    <button
                      onClick={() => openTaskCreate({ initialTitle: activeEmail ? `[E-mail] ${activeEmail.subject}` : 'Tarefa via E-mail' })}
                      className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Transformar em Tarefa"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Criar Tarefa</span>
                    </button>
                  </div>
                </div>

                {/* CRM Contextual Binding Bar */}
                {(relatedDeal || relatedProject || relatedTask) && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {relatedDeal && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-800">Negócio:</span>
                          <strong className="text-emerald-950">{relatedDeal.title} (R$ {relatedDeal.value.toLocaleString('pt-BR')})</strong>
                        </div>
                      )}
                      {relatedProject && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-blue-800">Projeto:</span>
                          <strong className="text-blue-950">{relatedProject.name}</strong>
                        </div>
                      )}
                    </div>

                    {relatedDeal && (
                      <button
                        onClick={() => setSelectedDealId(relatedDeal.id)}
                        className="text-xs text-[#0F8A4B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver Ficha do Negócio</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">
                {activeEmail.body}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
              Nenhum e-mail selecionado.
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal with CRM Linking */}
      {composeModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0F8A4B]" />
                <h3 className="text-sm font-bold text-neutral-900">Novo E-mail Corporativo (VERGROUP Mail)</h3>
              </div>
              <button
                onClick={() => setComposeModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Para (Destinatário) *</label>
                <input
                  type="email"
                  required
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="cliente@empresa.com.br"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                />
              </div>

              {/* CRM Link Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Vincular a Negócio CRM:</label>
                  <select
                    value={selectedDealBinding}
                    onChange={(e) => setSelectedDealBinding(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="">Nenhum vínculo</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (R$ {d.value.toLocaleString('pt-BR')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Vincular a Projeto:</label>
                  <select
                    value={selectedProjectBinding}
                    onChange={(e) => setSelectedProjectBinding(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                  >
                    <option value="">Nenhum vínculo</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Assunto *</label>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="Proposta Comercial / Alinhamento de Escopo"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Mensagem *</label>
                <textarea
                  rows={6}
                  required
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  placeholder="Escreva sua mensagem oficial..."
                  className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setComposeModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar E-mail Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAP/SMTP Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F8A4B]" />
                <h3 className="text-sm font-bold text-neutral-900">Configurações de E-mail (IMAP / SMTP / TLS)</h3>
              </div>
              <button
                onClick={() => setSettingsModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    value={configForm.email}
                    onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Nome de Exibição</label>
                  <input
                    type="text"
                    required
                    value={configForm.displayName}
                    onChange={(e) => setConfigForm({ ...configForm, displayName: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 block text-[11px]">Servidor de Entrada (IMAP)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={configForm.imapServer}
                    onChange={(e) => setConfigForm({ ...configForm, imapServer: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded bg-white"
                  />
                  <input
                    type="number"
                    value={configForm.imapPort}
                    onChange={(e) => setConfigForm({ ...configForm, imapPort: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 block text-[11px]">Servidor de Saída (SMTP)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={configForm.smtpServer}
                    onChange={(e) => setConfigForm({ ...configForm, smtpServer: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded bg-white"
                  />
                  <input
                    type="number"
                    value={configForm.smtpPort}
                    onChange={(e) => setConfigForm({ ...configForm, smtpPort: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Assinatura de E-mail</label>
                <textarea
                  rows={3}
                  value={configForm.signature}
                  onChange={(e) => setConfigForm({ ...configForm, signature: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSettingsModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Salvar Parâmetros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
