import React, { useState } from 'react';
import {
  UserPlus,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Mail,
  Globe,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  DollarSign,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStatus } from '../../types';

export const LeadsView: React.FC = () => {
  const {
    leads,
    pipelines,
    businessUnits,
    users,
    filterByBU,
    setQuickCreateType,
    updateLead,
    deleteLead,
    convertLeadToDeal,
  } = useApp();

  const filteredLeads = filterByBU(leads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedBuFilter, setSelectedBuFilter] = useState<string>('all');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Convert Lead Modal State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [convertPipelineId, setConvertPipelineId] = useState(pipelines[0]?.id || '');
  const [convertStageId, setConvertStageId] = useState(pipelines[0]?.stages[0]?.id || '');
  const [convertTitle, setConvertTitle] = useState('');
  const [convertValue, setConvertValue] = useState(0);

  // Discard Lead Modal
  const [discardingLead, setDiscardingLead] = useState<Lead | null>(null);
  const [discardReason, setDiscardReason] = useState('');

  const displayedLeads = filteredLeads.filter((l) => {
    if (selectedBuFilter !== 'all' && l.businessUnitId !== selectedBuFilter) return false;
    if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;
    if (selectedSource !== 'all' && l.source !== selectedSource) return false;
    if (selectedAssigneeFilter !== 'all' && l.assignedUserId !== selectedAssigneeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.companyName && l.companyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return (
          <span className="flex items-center gap-1 bg-[#ECF8F1] text-[#0B6B3A] px-2 py-0.5 rounded text-[10px] font-bold border border-[#0F8A4B]/20">
            <PhoneCall className="w-3 h-3 text-[#0F8A4B]" /> WhatsApp
          </span>
        );
      case 'website':
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
            <Globe className="w-3 h-3" /> Site / Web
          </span>
        );
      case 'email':
        return (
          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
            <Mail className="w-3 h-3" /> E-mail
          </span>
        );
      case 'referral':
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
            <Share2 className="w-3 h-3" /> Indicação
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
            {source}
          </span>
        );
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">Novo</span>;
      case 'qualifying':
        return <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-200">Em Qualificação</span>;
      case 'contacted':
        return <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-purple-200">Contatado</span>;
      case 'qualified':
        return <span className="bg-[#ECF8F1] text-[#0B6B3A] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#0F8A4B]/20">Convertido</span>;
      case 'disqualified':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-200">Descartado</span>;
    }
  };

  const openConvertModal = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertPipelineId(pipelines[0]?.id || '');
    setConvertStageId(pipelines[0]?.stages[0]?.id || '');
    setConvertTitle(lead.title);
    setConvertValue(lead.estimatedValue || 50000);
  };

  const handleConfirmConvert = () => {
    if (!convertingLead) return;
    convertLeadToDeal(convertingLead.id, {
      pipelineId: convertPipelineId,
      stageId: convertStageId,
      title: convertTitle,
      value: convertValue,
    });
    setConvertingLead(null);
  };

  const handleConfirmDiscard = () => {
    if (!discardingLead || !discardReason.trim()) return;
    updateLead(discardingLead.id, {
      status: 'disqualified',
      disqualificationReason: discardReason.trim(),
    });
    setDiscardingLead(null);
    setDiscardReason('');
  };

  return (
    <div id="leads-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
            <UserPlus className="w-5 h-5 text-[#0F8A4B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Gestão de Leads & Prospecção (CRM 2.0)</h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0B6B3A] rounded-full">
                {displayedLeads.length} registros
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Captação multicanal completa (WhatsApp, Formulários, Instagram, Site e Inbound) com qualificação guiada
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickCreateType('lead')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Lead</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, empresa, e-mail, telefone..."
            className="w-full bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0F8A4B]" />
            <span className="text-slate-600 font-bold">Empresa do Grupo:</span>
            <select
              value={selectedBuFilter}
              onChange={(e) => setSelectedBuFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todas as BUs da Holding</option>
              {businessUnits.map((bu) => (
                <option key={bu.id} value={bu.id}>🏢 {bu.tradeName || bu.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novo Lead</option>
              <option value="qualifying">Em Qualificação</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Convertido em Negócio</option>
              <option value="disqualified">Descartado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">Origem:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <option value="whatsapp">WhatsApp Direct</option>
              <option value="website">Site / Web</option>
              <option value="email">E-mail</option>
              <option value="referral">Indicação</option>
              <option value="outbound">Outbound / Prospecção</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedLeads.map((lead) => {
          const assignee = users.find((u) => u.id === lead.assignedUserId);
          const ownerBu = businessUnits.find((b) => b.id === lead.businessUnitId);

          return (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8A4B] p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 leading-snug">{lead.title}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{lead.name}</p>
                  </div>
                  {getStatusBadge(lead.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20">
                    🏢 {ownerBu?.tradeName || ownerBu?.name || lead.businessUnitId}
                  </span>
                  {getSourceBadge(lead.source)}
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {lead.companyName && (
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#0F8A4B] shrink-0" />
                      <span className="truncate">{lead.companyName}</span>
                    </p>
                  )}
                  <p className="truncate font-medium">E-mail: <strong className="text-slate-900">{lead.email}</strong></p>
                  <p className="font-medium">Telefone: <strong className="text-[#0F8A4B] font-bold">{lead.phone}</strong></p>
                  {lead.serviceCategory && (
                    <p className="font-medium">Interesse: <strong className="text-slate-900">{lead.serviceCategory}</strong></p>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#0F8A4B]">
                    R$ {(lead.estimatedValue || 0).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {lead.status !== 'qualified' && lead.status !== 'disqualified' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConvertModal(lead);
                        }}
                        className="px-2.5 py-1 bg-[#ECF8F1] hover:bg-emerald-100 text-[#0B6B3A] font-bold text-[10px] rounded-lg border border-[#0F8A4B]/20 cursor-pointer"
                      >
                        Converter
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDiscardingLead(lead);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg border border-rose-200 cursor-pointer"
                      >
                        Descartar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedLeads.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Nenhum lead encontrado para os filtros aplicados.
          </div>
        )}
      </div>

      {/* LEAD DETAIL 360 MODAL / HUB */}
      {selectedLead && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] font-black text-base flex items-center justify-center border border-[#0F8A4B]/20 shadow-2xs">
                  <User className="w-5 h-5 text-[#0F8A4B]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{selectedLead.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold">{selectedLead.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">E-mail</span>
                  <span className="font-semibold text-slate-900">{selectedLead.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Telefone / WhatsApp</span>
                  <span className="font-bold text-[#0F8A4B]">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Empresa</span>
                  <span className="font-bold text-slate-900">{selectedLead.companyName || 'Pessoa Física'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Valor Estimado</span>
                  <span className="font-mono font-black text-[#0F8A4B]">R$ {(selectedLead.estimatedValue || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Origem</span>
                  {getSourceBadge(selectedLead.source)}
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Status</span>
                  {getStatusBadge(selectedLead.status)}
                </div>
              </div>

              {selectedLead.mainNeed && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 text-xs">
                  <strong className="text-amber-900 font-bold block mb-1">Dor / Necessidade Relatada:</strong>
                  <p className="font-medium text-slate-700 leading-relaxed">{selectedLead.mainNeed}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  openConvertModal(selectedLead);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                🚀 Converter Lead em Cliente
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT LEAD MODAL */}
      {convertingLead && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20">
                  <Sparkles className="w-5 h-5 text-[#0F8A4B]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Conversão de Lead em Cliente</h2>
                  <p className="text-xs text-slate-500 font-semibold">Preserva a mesma Company & Contact no Pipeline de Clientes</p>
                </div>
              </div>
              <button onClick={() => setConvertingLead(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Título do Negócio / Contrato *</label>
                <input
                  type="text"
                  value={convertTitle}
                  onChange={(e) => setConvertTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Pipeline de Clientes *</label>
                  <select
                    value={convertPipelineId}
                    onChange={(e) => setConvertPipelineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold outline-none"
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Valor do Fechamento (R$) *</label>
                  <input
                    type="number"
                    value={convertValue}
                    onChange={(e) => setConvertValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-[#0F8A4B] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setConvertingLead(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConvert}
                className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer transition-colors"
              >
                Confirmar Conversão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD LEAD MODAL */}
      {discardingLead && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3 bg-rose-50 -m-5 p-5 rounded-t-2xl">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <h2 className="text-sm font-black text-slate-900">Descartar Lead</h2>
                <p className="text-xs text-rose-700 font-semibold">Registro do motivo de descarte comercial</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <label className="block text-slate-800 font-bold">Motivo do Descarte *</label>
              <textarea
                rows={3}
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                placeholder="Informe o motivo pelo qual o lead foi desqualificado..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button onClick={() => setDiscardingLead(null)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                Cancelar
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black cursor-pointer"
              >
                Confirmar Descarte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
