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
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const {
    companies,
    contacts,
    deals,
    businessUnits,
    filterByBU,
    setQuickCreateType,
    setSelectedDealId,
    setCurrentTab,
  } = useApp();

  const filteredCompanies = filterByBU(companies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedBuIdFilter, setSelectedBuIdFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const displayedCompanies = filteredCompanies.filter((comp) => {
    if (selectedBuIdFilter !== 'all' && comp.businessUnitId !== selectedBuIdFilter) return false;
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
        return <span className="bg-[#ECF8F1] text-[#0B6B3A] px-2 py-0.5 rounded text-[10px] font-bold border border-[#0F8A4B]/20">Saudável</span>;
      case 'yellow':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">Atenção</span>;
      case 'red':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">Em Risco</span>;
    }
  };

  return (
    <div id="companies-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
            <Building2 className="w-5 h-5 text-[#0F8A4B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Empresas & Clientes Corporativos</h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0B6B3A] rounded-full">
                {displayedCompanies.length} empresas
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gestão de contas corporativas isoladas por Empresa do Grupo (Business Unit), contatos e contratos
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickCreateType('company')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Empresa</span>
        </button>
      </div>

      {/* Filter Bar com Seletor por Business Unit */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome fantasia, razão social, CNPJ ou segmento..."
            className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor por Empresa do Grupo (Business Unit) */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span className="text-slate-600 font-bold">Empresa do Grupo:</span>
            <select
              value={selectedBuIdFilter}
              onChange={(e) => setSelectedBuIdFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer hover:border-[#0F8A4B]"
            >
              <option value="all">Todas as BUs da Holding</option>
              {businessUnits.map((bu) => (
                <option key={bu.id} value={bu.id}>
                  🏢 {bu.tradeName || bu.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">Porte:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
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
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCompanies.map((comp) => {
          const compContacts = contacts.filter((c) => c.companyId === comp.id);
          const compDeals = deals.filter((d) => d.companyId === comp.id);
          const totalDealsValue = compDeals.reduce((sum, d) => sum + d.value, 0);
          const ownerBu = businessUnits.find((b) => b.id === comp.businessUnitId);

          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompany(comp)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8A4B] p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#ECF8F1] border border-[#0F8A4B]/20 flex items-center justify-center font-black text-sm text-[#0F8A4B] shadow-2xs">
                      {comp.tradeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1">{comp.tradeName}</h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{comp.corporateName}</p>
                    </div>
                  </div>
                  {getHealthBadge(comp.healthScore)}
                </div>

                {/* Badge da Business Unit Responsável */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20">
                    🏢 {ownerBu?.tradeName || ownerBu?.name || comp.businessUnitId}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p>CNPJ: <strong className="font-mono text-slate-900">{comp.cnpj}</strong></p>
                  <p>Segmento: <strong className="text-slate-900 font-semibold">{comp.segment}</strong></p>
                  {comp.address && (
                    <p className="truncate flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{comp.address.city}/{comp.address.state}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-semibold">
                  <span className="flex items-center gap-1" title="Contatos cadastrados">
                    <Users className="w-3.5 h-3.5" />
                    <strong className="text-slate-900 font-bold">{compContacts.length}</strong>
                  </span>
                  <span className="flex items-center gap-1" title="Negócios vinculados">
                    <Trello className="w-3.5 h-3.5" />
                    <strong className="text-slate-900 font-bold">{compDeals.length}</strong>
                  </span>
                </div>

                <span className="font-mono text-xs font-black text-[#0F8A4B]">
                  R$ {totalDealsValue.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}

        {displayedCompanies.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhuma empresa ou cliente corporativo encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] font-black text-base flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
                  {selectedCompany.tradeName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{selectedCompany.tradeName}</h2>
                  <p className="text-xs text-slate-500 font-semibold">{selectedCompany.corporateName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Business Unit Owner Alert */}
              <div className="p-3 bg-[#ECF8F1] rounded-xl border border-[#0F8A4B]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B6B3A]">
                  🏢 Empresa do Grupo Responsável: {businessUnits.find(b => b.id === selectedCompany.businessUnitId)?.tradeName || selectedCompany.businessUnitId}
                </span>
                {getHealthBadge(selectedCompany.healthScore)}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">CNPJ</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCompany.cnpj}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Segmento</span>
                  <span className="font-bold text-slate-900">{selectedCompany.segment}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Porte</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedCompany.size}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">E-mail Corporativo</span>
                  <span className="font-semibold text-slate-900">{selectedCompany.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Telefone Principal</span>
                  <span className="font-bold text-[#0F8A4B]">{selectedCompany.phone}</span>
                </div>
              </div>

              {/* Related Contacts */}
              <div>
                <h4 className="font-black text-xs text-slate-900 mb-2 uppercase tracking-wider">
                  Contatos Associados ({contacts.filter(c => c.companyId === selectedCompany.id).length})
                </h4>
                <div className="space-y-1.5">
                  {contacts.filter(c => c.companyId === selectedCompany.id).map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{c.jobTitle} • {c.email}</p>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#0F8A4B]">{c.phone}</span>
                    </div>
                  ))}

                  {contacts.filter(c => c.companyId === selectedCompany.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Nenhum contato associado cadastrado ainda.</p>
                  )}
                </div>
              </div>

              {/* Related Deals */}
              <div>
                <h4 className="font-black text-xs text-slate-900 mb-2 uppercase tracking-wider">
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
                      className="p-3 bg-slate-50 hover:bg-[#ECF8F1] rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{d.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{d.serviceCategory}</p>
                      </div>
                      <span className="font-mono text-xs font-black text-[#0F8A4B]">R$ {d.value.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}

                  {deals.filter(d => d.companyId === selectedCompany.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Nenhum negócio cadastrado no funil.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
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
