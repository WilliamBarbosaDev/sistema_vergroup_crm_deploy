import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Tag,
  CheckCircle2,
  Trash2,
  Edit2,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contact } from '../../types';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    companies,
    users,
    filterByBU,
    setQuickCreateType,
    deleteContact,
    updateContact,
  } = useApp();

  const filteredContacts = filterByBU(contacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(filteredContacts.flatMap((c) => c.tags || [])));

  const displayedContacts = filteredContacts.filter((contact) => {
    if (selectedTag !== 'all' && !contact.tags?.includes(selectedTag)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const comp = companies.find((c) => c.id === contact.companyId);
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.phone.includes(q) ||
        (contact.document && contact.document.includes(q)) ||
        (comp && comp.tradeName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Documento', 'Empresa', 'Cargo', 'Tags'];
    const rows = displayedContacts.map((c) => {
      const comp = companies.find((comp) => comp.id === c.companyId);
      return [
        c.id,
        `"${c.name}"`,
        c.email,
        `"${c.phone}"`,
        c.document || '',
        `"${comp?.tradeName || ''}"`,
        `"${c.jobTitle || ''}"`,
        `"${c.tags.join(', ')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contatos_vergroup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="contacts-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Gestão de Contatos</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {displayedContacts.length} contatos
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Base centralizada com proteção ativa contra duplicidades (PRD CRM-04)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#DDE3E8] hover:bg-[#F7F9FA] text-[#17212B] rounded-md text-xs font-semibold cursor-pointer"
            title="Exportar base de contatos em formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#5F6B76]" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setQuickCreateType('contact')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contato</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#5F6B76]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail, telefone, CPF ou empresa..."
            className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#5F6B76]" />
          <span className="text-[#5F6B76] font-medium">Tag / Perfil:</span>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
          >
            <option value="all">Todas as Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
              <tr>
                <th className="p-3">Nome do Contato</th>
                <th className="p-3">Empresa Relacionada</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Tags</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F7]">
              {displayedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#5F6B76]">
                    Nenhum contato cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                displayedContacts.map((contact) => {
                  const comp = companies.find((c) => c.id === contact.companyId);

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setViewContact(contact)}
                      className="hover:bg-[#F7F9FA] cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#ECF8F1] text-[#0F8A4B] font-bold text-xs flex items-center justify-center shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#17212B]">{contact.name}</p>
                            {contact.document && (
                              <span className="text-[10px] text-[#5F6B76]">CPF: {contact.document}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {comp ? (
                          <span className="font-medium text-[#17212B] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#5F6B76]" />
                            {comp.tradeName}
                          </span>
                        ) : (
                          <span className="text-[#5F6B76] italic">Sem empresa</span>
                        )}
                      </td>
                      <td className="p-3 text-[#17212B]">{contact.email}</td>
                      <td className="p-3 font-mono text-[#0F8A4B]">{contact.phone}</td>
                      <td className="p-3 text-[#5F6B76]">{contact.jobTitle || '—'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[10px] text-[#17212B]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteContact(contact.id);
                          }}
                          className="p-1 text-[#5F6B76] hover:text-red-600 rounded transition-colors"
                          title="Remover contato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Details Modal */}
      {viewContact && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-[#DDE3E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#ECF8F1] text-[#0F8A4B] font-bold text-sm flex items-center justify-center">
                  {viewContact.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17212B]">{viewContact.name}</h2>
                  <p className="text-xs text-[#5F6B76]">{viewContact.jobTitle || 'Contato cadastrado'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewContact(null)}
                className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F9FA] p-3 rounded-lg border border-[#DDE3E8]">
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">E-mail</span>
                  <span className="font-semibold text-[#17212B]">{viewContact.email}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Telefone (WhatsApp)</span>
                  <span className="font-semibold text-[#0F8A4B]">{viewContact.phone}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">CPF / Documento</span>
                  <span className="font-semibold text-[#17212B]">{viewContact.document || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Empresa</span>
                  <span className="font-semibold text-[#17212B]">
                    {companies.find((c) => c.id === viewContact.companyId)?.tradeName || 'Nenhuma'}
                  </span>
                </div>
              </div>

              {viewContact.notes && (
                <div>
                  <span className="text-[#5F6B76] font-semibold block mb-1">Observações do Contato:</span>
                  <p className="p-2 bg-[#F7F9FA] rounded border border-[#DDE3E8] text-[#17212B]">
                    {viewContact.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#DDE3E8]">
              <button
                onClick={() => setViewContact(null)}
                className="px-4 py-1.5 bg-[#0F8A4B] text-white rounded-md font-semibold text-xs"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
