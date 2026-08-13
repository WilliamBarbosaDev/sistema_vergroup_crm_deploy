import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Trello,
  UserPlus,
  Users,
  Building2,
  CheckSquare,
  FolderKanban,
  Mail,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    deals,
    leads,
    contacts,
    companies,
    tasks,
    projects,
    emails,
    whatsApps,
    setCurrentTab,
    setSelectedDealId,
    setSelectedTaskId,
    setSelectedContactId,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedDeals = q ? deals.filter((d) => d.title.toLowerCase().includes(q) || d.serviceCategory?.toLowerCase().includes(q)) : [];
  const matchedLeads = q ? leads.filter((l) => l.title.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)) : [];
  const matchedContacts = q ? contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)) : [];
  const matchedCompanies = q ? companies.filter((c) => c.tradeName.toLowerCase().includes(q) || c.corporateName.toLowerCase().includes(q) || c.cnpj.includes(q)) : [];
  const matchedTasks = q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) : [];
  const matchedProjects = q ? projects.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) : [];
  const matchedEmails = q ? emails.filter((e) => e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)) : [];
  const matchedWhatsApp = q ? whatsApps.filter((w) => w.contactName.toLowerCase().includes(q) || w.lastMessage.toLowerCase().includes(q)) : [];

  const totalMatches =
    matchedDeals.length +
    matchedLeads.length +
    matchedContacts.length +
    matchedCompanies.length +
    matchedTasks.length +
    matchedProjects.length +
    matchedEmails.length +
    matchedWhatsApp.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#DDE3E8] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#DDE3E8] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#0F8A4B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, CNPJ, negócio, tarefa, projeto..."
            className="flex-1 text-sm bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-[#F7F9FA] rounded text-[#5F6B76]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs text-[#5F6B76] hover:text-[#17212B] px-2 py-1 bg-[#F7F9FA] border border-[#DDE3E8] rounded font-medium cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-8 text-center text-xs text-[#5F6B76] space-y-2">
              <p className="font-semibold text-[#17212B]">Busca Global Unificada VERGROUP</p>
              <p>Digite qualquer termo para localizar instantaneamente registros em todas as empresas e módulos.</p>
              <div className="flex justify-center gap-2 pt-2 text-[11px]">
                <span className="bg-[#F7F9FA] px-2 py-0.5 rounded border border-[#DDE3E8]">Ex: Nexus</span>
                <span className="bg-[#F7F9FA] px-2 py-0.5 rounded border border-[#DDE3E8]">Ex: Alpha Saúde</span>
                <span className="bg-[#F7F9FA] px-2 py-0.5 rounded border border-[#DDE3E8]">Ex: Minuta</span>
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-8 text-center text-xs text-[#5F6B76]">
              Nenhum resultado encontrado para <strong className="text-[#17212B]">"{query}"</strong>.
            </div>
          ) : (
            <>
              {/* Deals */}
              {matchedDeals.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Trello className="w-3.5 h-3.5 text-[#0F8A4B]" />
                    <span>Negócios ({matchedDeals.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => {
                          setSelectedDealId(deal.id);
                          setCurrentTab('crm-deals');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#ECF8F1] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{deal.title}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            R$ {deal.value.toLocaleString('pt-BR')} • {deal.serviceCategory}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#0F8A4B]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads */}
              {matchedLeads.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Leads ({matchedLeads.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setCurrentTab('crm-leads');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{lead.title}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            {lead.name} ({lead.companyName || 'Lead individual'}) • {lead.email}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {matchedContacts.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Contatos ({matchedContacts.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setSelectedContactId(contact.id);
                          setCurrentTab('crm-contacts');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{contact.name}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            {contact.jobTitle || 'Contato'} • {contact.email} • {contact.phone}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies */}
              {matchedCompanies.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Empresas ({matchedCompanies.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedCompanies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => {
                          setCurrentTab('crm-companies');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{company.tradeName}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            {company.corporateName} • CNPJ: {company.cnpj}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tarefas ({matchedTasks.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setCurrentTab('work-tasks');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{task.title}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            Prazo: {task.dueDate} • Prioridade: {task.priority}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {matchedProjects.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Projetos ({matchedProjects.length})</span>
                  </p>
                  <div className="space-y-1">
                    {matchedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setCurrentTab('work-projects');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#17212B]">{proj.name}</p>
                          <p className="text-[11px] text-[#5F6B76]">
                            Código: {proj.code} • Progresso: {proj.progressPercentage}%
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails & WhatsApp */}
              {(matchedEmails.length > 0 || matchedWhatsApp.length > 0) && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F6B76] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mensagens & Comunicação</span>
                  </p>
                  <div className="space-y-1">
                    {matchedEmails.map((eml) => (
                      <div
                        key={eml.id}
                        onClick={() => {
                          setCurrentTab('comms-email');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          <div>
                            <p className="text-xs font-semibold text-[#17212B]">{eml.subject}</p>
                            <p className="text-[11px] text-[#5F6B76]">{eml.from.name} • {eml.snippet}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                    {matchedWhatsApp.map((wpp) => (
                      <div
                        key={wpp.id}
                        onClick={() => {
                          setCurrentTab('comms-whatsapp');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#F7F9FA] cursor-pointer flex items-center justify-between border border-transparent hover:border-[#DDE3E8] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-3.5 h-3.5 text-[#0F8A4B]" />
                          <div>
                            <p className="text-xs font-semibold text-[#17212B]">{wpp.contactName}</p>
                            <p className="text-[11px] text-[#5F6B76]">{wpp.lastMessage}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F6B76]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
