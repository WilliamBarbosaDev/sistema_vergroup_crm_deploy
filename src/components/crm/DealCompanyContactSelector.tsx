import React, { useState } from 'react';
import {
  Building2,
  User,
  Search,
  Plus,
  Check,
  X,
  Phone,
  Mail,
  FileText,
  Tag,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Company, Contact } from '../../types';

interface DealCompanyContactSelectorProps {
  businessUnitId: string;
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  selectedContactId: string;
  onSelectContact: (contactId: string) => void;
  additionalParticipantIds?: string[];
  onUpdateParticipants?: (participantIds: string[]) => void;
}

export const DealCompanyContactSelector: React.FC<DealCompanyContactSelectorProps> = ({
  businessUnitId,
  selectedCompanyId,
  onSelectCompany,
  selectedContactId,
  onSelectContact,
  additionalParticipantIds = [],
  onUpdateParticipants,
}) => {
  const { companies, contacts, addCompany, addContact, currentUser } = useApp();

  // Search states
  const [companySearch, setCompanySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);

  // Quick Create Modal States
  const [showQuickCompanyModal, setShowQuickCompanyModal] = useState(false);
  const [showQuickContactModal, setShowQuickContactModal] = useState(false);

  // Quick Company Form
  const [newCorpName, setNewCorpName] = useState('');
  const [newTradeName, setNewTradeName] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');

  // Quick Contact Form
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactJob, setNewContactJob] = useState('');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Filter companies by search
  const filteredCompanies = companies.filter((c) => {
    if (!companySearch.trim()) return true;
    const q = companySearch.toLowerCase();
    return (
      c.tradeName.toLowerCase().includes(q) ||
      c.corporateName.toLowerCase().includes(q) ||
      (c.cnpj && c.cnpj.includes(q))
    );
  });

  // Filter contacts by selected company or search
  const filteredContacts = contacts.filter((ct) => {
    if (selectedCompanyId && ct.companyId && ct.companyId !== selectedCompanyId) {
      return false;
    }
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (
      ct.name.toLowerCase().includes(q) ||
      ct.email.toLowerCase().includes(q) ||
      (ct.phone && ct.phone.includes(q))
    );
  });

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTradeName.trim()) return;

    const newComp: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
      businessUnitId: businessUnitId || 'bu-tech',
      corporateName: newCorpName || newTradeName,
      tradeName: newTradeName,
      cnpj: newCnpj || '00.000.000/0001-00',
      segment: 'Serviços Corporativos',
      size: 'medium',
      email: newCompEmail,
      phone: newCompPhone,
      assignedUserId: currentUser.id,
      status: 'prospect',
      healthScore: 'green',
      tags: ['Cadastrado no Negócio'],
    };

    addCompany(newComp);
    setShowQuickCompanyModal(false);
    setNewTradeName('');
    setNewCorpName('');
    setNewCnpj('');

    // Select the newly added company
    setTimeout(() => {
      const newlyAdded = companies[companies.length - 1];
      if (newlyAdded) onSelectCompany(newlyAdded.id);
    }, 100);
  };

  const handleCreateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newCtData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
      businessUnitId: businessUnitId || 'bu-tech',
      name: newContactName,
      email: newContactEmail || 'contato@cliente.com.br',
      phone: newContactPhone || '(11) 99999-0000',
      companyId: selectedCompanyId || undefined,
      jobTitle: newContactJob || 'Decisor',
      tags: ['Decisor'],
      assignedUserId: currentUser.id,
    };

    const res = addContact(newCtData);
    if (res.duplicateWarning) {
      alert(`⚠️ ${res.duplicateWarning}`);
    } else {
      setShowQuickContactModal(false);
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');

      setTimeout(() => {
        const newlyAdded = contacts[contacts.length - 1];
        if (newlyAdded) onSelectContact(newlyAdded.id);
      }, 100);
    }
  };

  const toggleParticipant = (participantId: string) => {
    if (!onUpdateParticipants) return;
    if (additionalParticipantIds.includes(participantId)) {
      onUpdateParticipants(additionalParticipantIds.filter((id) => id !== participantId));
    } else {
      onUpdateParticipants([...additionalParticipantIds, participantId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* SEÇÃO EMPRESA CLIENTE */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F8A4B]" />
            Empresa Cliente (`public.companies`)
          </h3>

          <button
            type="button"
            onClick={() => setShowQuickCompanyModal(true)}
            className="px-2.5 py-1 bg-[#ECF8F1] hover:bg-emerald-100 text-[#0B6B3A] border border-[#0F8A4B]/20 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Criar Empresa Oficial</span>
          </button>
        </div>

        {/* Company Card or Dropdown Select */}
        {selectedCompany ? (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200">
                  {selectedCompany.tradeName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong className="text-sm font-black text-slate-900 block">{selectedCompany.tradeName}</strong>
                  <span className="text-[11px] text-slate-500 font-medium">{selectedCompany.corporateName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectCompany('')}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Trocar Empresa
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600 font-medium">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">CNPJ Oficial:</span>
                <strong className="text-slate-800 font-mono">{selectedCompany.cnpj}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Segmento & Porte:</span>
                <strong className="text-slate-800">{selectedCompany.segment} • {selectedCompany.size.toUpperCase()}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={companySearch}
                onFocus={() => setIsCompanyDropdownOpen(true)}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setIsCompanyDropdownOpen(true);
                }}
                placeholder="Pesquisar por Razão Social, Nome Fantasia ou CNPJ..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
              />
            </div>

            {isCompanyDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {filteredCompanies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectCompany(c.id);
                      setIsCompanyDropdownOpen(false);
                      setCompanySearch('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-[#ECF8F1] flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{c.tradeName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">CNPJ: {c.cnpj}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {c.segment}
                    </span>
                  </button>
                ))}
                {filteredCompanies.length === 0 && (
                  <div className="p-3 text-center text-slate-500 text-xs">
                    Nenhuma empresa encontrada. <button type="button" onClick={() => setShowQuickCompanyModal(true)} className="text-[#0F8A4B] font-bold underline">Criar agora</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO CONTATO RESPONSÁVEL & PARTICIPANTES */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#0F8A4B]" />
            Contato Principal & Decisor (`public.contacts`) *
          </h3>

          <button
            type="button"
            onClick={() => setShowQuickContactModal(true)}
            className="px-2.5 py-1 bg-[#ECF8F1] hover:bg-emerald-100 text-[#0B6B3A] border border-[#0F8A4B]/20 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Criar Novo Contato</span>
          </button>
        </div>

        {/* Selected Contact Card */}
        {selectedContact ? (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0F8A4B] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <strong className="text-sm font-black text-slate-900 block">{selectedContact.name}</strong>
                  <span className="text-[11px] text-slate-500 font-medium">{selectedContact.jobTitle || 'Contato Oficial'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectContact('')}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Trocar Contato
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedContact.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{selectedContact.phone}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={contactSearch}
                onFocus={() => setIsContactDropdownOpen(true)}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setIsContactDropdownOpen(true);
                }}
                placeholder="Pesquisar contato por Nome, E-mail ou Telefone..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-[#0F8A4B] outline-none font-semibold text-xs"
              />
            </div>

            {isContactDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {filteredContacts.map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => {
                      onSelectContact(ct.id);
                      setIsContactDropdownOpen(false);
                      setContactSearch('');
                      if (ct.companyId && !selectedCompanyId) {
                        onSelectCompany(ct.companyId);
                      }
                    }}
                    className="w-full p-2.5 text-left hover:bg-[#ECF8F1] flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{ct.name}</strong>
                      <span className="text-[11px] text-slate-500">{ct.jobTitle} • {ct.email}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      {ct.phone}
                    </span>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="p-3 text-center text-slate-500 text-xs">
                    Nenhum contato encontrado. <button type="button" onClick={() => setShowQuickContactModal(true)} className="text-[#0F8A4B] font-bold underline">Criar novo contato</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Participantes Adicionais */}
        {onUpdateParticipants && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Participantes Adicionais (Sócios, Decisores Tecnológicos, Financeiro):
            </label>

            <div className="flex flex-wrap gap-1.5">
              {contacts.map((ct) => {
                const isSelected = additionalParticipantIds.includes(ct.id);
                if (ct.id === selectedContactId) return null; // Exclude main contact

                return (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => toggleParticipant(ct.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0F8A4B] text-white border-[#0F8A4B]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{ct.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* QUICK COMPANY CREATION MODAL */}
      {showQuickCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCompanySubmit} className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Cadastrar Nova Empresa (`public.companies`)</h3>
              <button type="button" onClick={() => setShowQuickCompanyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nome Fantasia *</label>
              <input
                type="text"
                required
                value={newTradeName}
                onChange={(e) => setNewTradeName(e.target.value)}
                placeholder="Ex: Inovar Logística & Tecnologia"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Razão Social:</label>
              <input
                type="text"
                value={newCorpName}
                onChange={(e) => setNewCorpName(e.target.value)}
                placeholder="Ex: Inovar Serviços de Logística LTDA"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">CNPJ Oficial:</label>
                <input
                  type="text"
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={newCompPhone}
                  onChange={(e) => setNewCompPhone(e.target.value)}
                  placeholder="(11) 3000-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold outline-none focus:border-[#0F8A4B]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowQuickCompanyModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-xl font-black shadow-md">
                Salvar Empresa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK CONTACT CREATION MODAL */}
      {showQuickContactModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateContactSubmit} className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Cadastrar Novo Contato (`public.contacts`)</h3>
              <button type="button" onClick={() => setShowQuickContactModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Ex: Marcelo Pires"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">E-mail Corporativo:</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="marcelo@inovar.com.br"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold outline-none focus:border-[#0F8A4B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Cargo / Função:</label>
              <input
                type="text"
                value={newContactJob}
                onChange={(e) => setNewContactJob(e.target.value)}
                placeholder="Ex: Diretor de Operações"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowQuickContactModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-xl font-black shadow-md">
                Salvar Contato
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
