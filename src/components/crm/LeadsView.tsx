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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStatus } from '../../types';

export const LeadsView: React.FC = () => {
  const {
    leads,
    pipelines,
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
    if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;
    if (selectedSource !== 'all' && l.source !== selectedSource) return false;
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
          <span className="flex items-center gap-1 bg-[#ECF8F1] text-[#0F8A4B] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#0F8A4B]/20">
            <PhoneCall className="w-3 h-3" /> WhatsApp
          </span>
        );
      case 'website':
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-200">
            <Globe className="w-3 h-3" /> Site / Formulário
          </span>
        );
      case 'email':
        return (
          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-200">
            <Mail className="w-3 h-3" /> E-mail
          </span>
        );
      case 'referral':
        return (
          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-200">
            <Share2 className="w-3 h-3" /> Indicação
          </span>
        );
      default:
        return (
          <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-semibold">
            {source}
          </span>
        );
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">Novo</span>;
      case 'qualifying':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">Em Qualificação</span>;
      case 'contacted':
        return <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Contatado</span>;
      case 'qualified':
        return <span className="bg-[#ECF8F1] text-[#0F8A4B] px-2 py-0.5 rounded text-[10px] font-bold">Convertido em Negócio</span>;
      case 'disqualified':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">Descartado</span>;
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
    <div id="leads-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Gestão de Leads & Prospecção</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {displayedLeads.length} registros
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Captação multicanal integrada (WhatsApp, Formulários e Inbound)
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickCreateType('lead')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Lead</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#5F6B76]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, empresa, e-mail..."
            className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#5F6B76]" />
            <span className="text-[#5F6B76] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novo</option>
              <option value="qualifying">Em Qualificação</option>
              <option value="contacted">Contatado</option>
              <option value="qualified">Convertido</option>
              <option value="disqualified">Descartado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#5F6B76] font-medium">Origem:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <option value="whatsapp">WhatsApp (W-API)</option>
              <option value="website">Site</option>
              <option value="email">E-mail</option>
              <option value="referral">Indicação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
              <tr>
                <th className="p-3">Lead / Interesse</th>
                <th className="p-3">Contato & Empresa</th>
                <th className="p-3">Canal de Origem</th>
                <th className="p-3">Valor Estimado</th>
                <th className="p-3">Status</th>
                <th className="p-3">Responsável</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F7]">
              {displayedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#5F6B76]">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                displayedLeads.map((lead) => {
                  const assignee = users.find((u) => u.id === lead.assignedUserId);
                  const isConverted = lead.status === 'qualified';

                  return (
                    <tr key={lead.id} className="hover:bg-[#F7F9FA] transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-[#17212B]">{lead.title}</p>
                        {lead.campaign && (
                          <span className="text-[10px] text-[#5F6B76] block mt-0.5">
                            Campanha: {lead.campaign}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#17212B]">{lead.name}</p>
                        <p className="text-[11px] text-[#5F6B76]">
                          {lead.companyName ? `${lead.companyName} • ` : ''}
                          {lead.phone}
                        </p>
                      </td>
                      <td className="p-3">{getSourceBadge(lead.source)}</td>
                      <td className="p-3 font-bold text-[#0F8A4B]">
                        {lead.estimatedValue ? `R$ ${lead.estimatedValue.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td className="p-3">{getStatusBadge(lead.status)}</td>
                      <td className="p-3 text-[#17212B]">{assignee?.name.split(' ')[0] || 'Fila Geral'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isConverted && lead.status !== 'disqualified' && (
                            <>
                              <button
                                onClick={() => openConvertModal(lead)}
                                className="px-2.5 py-1 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Converter Lead em Contato, Empresa e Negócio (1-click)"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Qualificar & Converter</span>
                              </button>
                              <button
                                onClick={() => setDiscardingLead(lead)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-semibold rounded text-[11px] cursor-pointer"
                                title="Descartar Lead com motivo"
                              >
                                Descartar
                              </button>
                            </>
                          )}
                          {isConverted && (
                            <span className="text-[11px] text-[#0F8A4B] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Convertido
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-[#DDE3E8] space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#0F8A4B] font-bold text-sm">
              <Sparkles className="w-5 h-5" />
              <span>Qualificar e Converter Lead (PRD LEAD-04)</span>
            </div>

            <p className="text-xs text-[#5F6B76]">
              Esta ação criará simultaneamente o <strong>Contato</strong> ({convertingLead.name}), a <strong>Empresa</strong> ({convertingLead.companyName || 'Nova Empresa'}) e abrirá um <strong>Negócio</strong> no pipeline comercial selecionado.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Título do Negócio *</label>
                <input
                  type="text"
                  required
                  value={convertTitle}
                  onChange={(e) => setConvertTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md outline-none focus:border-[#0F8A4B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Pipeline de Destino</label>
                  <select
                    value={convertPipelineId}
                    onChange={(e) => {
                      setConvertPipelineId(e.target.value);
                      const p = pipelines.find((pipe) => pipe.id === e.target.value);
                      if (p && p.stages.length > 0) setConvertStageId(p.stages[0].id);
                    }}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md bg-white outline-none focus:border-[#0F8A4B]"
                  >
                    {pipelines.map((pipe) => (
                      <option key={pipe.id} value={pipe.id}>
                        {pipe.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Valor do Negócio (R$)</label>
                  <input
                    type="number"
                    value={convertValue}
                    onChange={(e) => setConvertValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DDE3E8] rounded-md outline-none focus:border-[#0F8A4B]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE3E8]">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-3 py-1.5 border border-[#DDE3E8] text-xs font-medium rounded-md hover:bg-[#F7F9FA]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-4 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Conversão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Modal */}
      {discardingLead && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 border border-[#DDE3E8] space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Descartar Lead (Motivo Obrigatório - PRD LEAD-05)</span>
            </div>
            <p className="text-xs text-[#5F6B76]">
              Informe a razão da desqualificação do lead <strong>"{discardingLead.name}"</strong> para auditoria:
            </p>
            <textarea
              rows={3}
              required
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder="Ex: Fora do perfil de cliente ideal / Telefone inexistente / Não tem orçamento"
              className="w-full p-2.5 border border-[#DDE3E8] rounded-md text-xs outline-none focus:border-red-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDiscardingLead(null)}
                className="px-3 py-1.5 border border-[#DDE3E8] text-xs font-medium rounded-md hover:bg-[#F7F9FA]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!discardReason.trim()}
                onClick={handleConfirmDiscard}
                className="px-3 py-1.5 bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs"
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
