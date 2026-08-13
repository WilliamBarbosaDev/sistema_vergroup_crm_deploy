import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  Trello,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const {
    companies,
    contacts,
    deals,
    filterByBU,
    setQuickCreateType,
    setSelectedDealId,
    setCurrentTab,
  } = useApp();

  const filteredCompanies = filterByBU(companies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const displayedCompanies = filteredCompanies.filter((comp) => {
    if (selectedSize !== 'all' && comp.size !== selectedSize) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        comp.tradeName.toLowerCase().includes(q) ||
        comp.corporateName.toLowerCase().includes(q) ||
        comp.cnpj.includes(q) ||
        comp.segment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getHealthBadge = (health: 'green' | 'yellow' | 'red') => {
    switch (health) {
      case 'green':
        return <span className="bg-[#ECF8F1] text-[#0F8A4B] px-2 py-0.5 rounded text-[10px] font-bold border border-[#0F8A4B]/20">Saudável</span>;
      case 'yellow':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">Atenção</span>;
      case 'red':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">Em Risco</span>;
    }
  };

  return (
    <div id="companies-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Empresas & Clientes Corporativos</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {displayedCompanies.length} empresas
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Gestão de contas corporativas, contratos, contatos associados e saúde de conta
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickCreateType('company')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#5F6B76]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome fantasia, razão social, CNPJ ou segmento..."
            className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5F6B76] font-medium">Porte da Empresa:</span>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
          >
            <option value="all">Todos os Portes</option>
            <option value="micro">Microempresa</option>
            <option value="small">Pequena</option>
            <option value="medium">Média</option>
            <option value="large">Grande Porte</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCompanies.map((comp) => {
          const compContacts = contacts.filter((c) => c.companyId === comp.id);
          const compDeals = deals.filter((d) => d.companyId === comp.id);
          const totalDealsValue = compDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompany(comp)}
              className="bg-white rounded-xl border border-[#DDE3E8] hover:border-[#0F8A4B] p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F9FA] border border-[#DDE3E8] flex items-center justify-center font-bold text-xs text-[#0F8A4B]">
                      {comp.tradeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#17212B] line-clamp-1">{comp.tradeName}</h3>
                      <p className="text-[11px] text-[#5F6B76] truncate">{comp.corporateName}</p>
                    </div>
                  </div>
                  {getHealthBadge(comp.healthScore)}
                </div>

                <div className="text-[11px] text-[#5F6B76] space-y-1 bg-[#F7F9FA] p-2.5 rounded-lg border border-[#DDE3E8]">
                  <p>CNPJ: <strong className="font-mono text-[#17212B]">{comp.cnpj}</strong></p>
                  <p>Segmento: <strong className="text-[#17212B]">{comp.segment}</strong></p>
                  {comp.address && (
                    <p className="truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5F6B76] shrink-0" />
                      <span>{comp.address.city}/{comp.address.state}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F4F7] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[#5F6B76]">
                  <span className="flex items-center gap-1" title="Contatos cadastrados">
                    <Users className="w-3.5 h-3.5" />
                    <strong className="text-[#17212B]">{compContacts.length}</strong>
                  </span>
                  <span className="flex items-center gap-1" title="Negócios vinculados">
                    <Trello className="w-3.5 h-3.5" />
                    <strong className="text-[#17212B]">{compDeals.length}</strong>
                  </span>
                </div>

                <span className="font-bold text-[#0F8A4B]">
                  R$ {totalDealsValue.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 border border-[#DDE3E8] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ECF8F1] text-[#0F8A4B] font-bold text-base flex items-center justify-center">
                  {selectedCompany.tradeName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17212B]">{selectedCompany.tradeName}</h2>
                  <p className="text-xs text-[#5F6B76]">{selectedCompany.corporateName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F7F9FA] p-3 rounded-lg border border-[#DDE3E8]">
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">CNPJ</span>
                  <span className="font-mono font-semibold text-[#17212B]">{selectedCompany.cnpj}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Segmento</span>
                  <span className="font-semibold text-[#17212B]">{selectedCompany.segment}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Porte</span>
                  <span className="font-semibold text-[#17212B] uppercase">{selectedCompany.size}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">E-mail Corporativo</span>
                  <span className="font-semibold text-[#17212B]">{selectedCompany.email}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Telefone Principal</span>
                  <span className="font-semibold text-[#0F8A4B]">{selectedCompany.phone}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Saúde da Conta</span>
                  {getHealthBadge(selectedCompany.healthScore)}
                </div>
              </div>

              {/* Related Contacts */}
              <div>
                <h4 className="font-bold text-xs text-[#17212B] mb-2 uppercase tracking-wider">
                  Contatos Associados ({contacts.filter(c => c.companyId === selectedCompany.id).length})
                </h4>
                <div className="space-y-1.5">
                  {contacts.filter(c => c.companyId === selectedCompany.id).map(c => (
                    <div key={c.id} className="p-2.5 bg-[#F7F9FA] rounded border border-[#DDE3E8] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#17212B]">{c.name}</p>
                        <p className="text-[11px] text-[#5F6B76]">{c.jobTitle} • {c.email}</p>
                      </div>
                      <span className="font-mono text-[11px] text-[#0F8A4B]">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Deals */}
              <div>
                <h4 className="font-bold text-xs text-[#17212B] mb-2 uppercase tracking-wider">
                  Negócios no Funil ({deals.filter(d => d.companyId === selectedCompany.id).length})
                </h4>
                <div className="space-y-1.5">
                  {deals.filter(d => d.companyId === selectedCompany.id).map(d => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDealId(d.id);
                        setCurrentTab('crm-deals');
                        setSelectedCompany(null);
                      }}
                      className="p-2.5 bg-[#F7F9FA] hover:bg-[#ECF8F1] rounded border border-[#DDE3E8] flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-[#17212B]">{d.title}</p>
                        <p className="text-[11px] text-[#5F6B76]">{d.serviceCategory}</p>
                      </div>
                      <span className="font-bold text-[#0F8A4B]">R$ {d.value.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#DDE3E8]">
              <button
                onClick={() => setSelectedCompany(null)}
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
