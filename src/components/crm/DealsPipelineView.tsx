import React, { useState } from 'react';
import {
  Trello,
  List,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Phone,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Deal } from '../../types';

export const DealsPipelineView: React.FC = () => {
  const {
    businessUnits,
    pipelines,
    deals,
    contacts,
    companies,
    users,
    filterByBU,
    moveDealStage,
    setSelectedDealId,
    setQuickCreateType,
  } = useApp();

  const filteredDeals = filterByBU(deals);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(pipelines[0]?.id || 'pipe-ver-clientes');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const filteredPipelineDeals = filteredDeals.filter((deal) => {
    if (deal.pipelineId !== activePipeline?.id) return false;
    if (selectedUserId !== 'all' && deal.assignedUserId !== selectedUserId) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = deal.title.toLowerCase().includes(q);
      const matchService = deal.serviceCategory.toLowerCase().includes(q);
      const comp = companies.find((c) => c.id === deal.companyId);
      const cont = contacts.find((c) => c.id === deal.contactId);
      const matchCompany = comp?.tradeName.toLowerCase().includes(q);
      const matchContact = cont?.name.toLowerCase().includes(q);
      return matchTitle || matchService || matchCompany || matchContact;
    }
    return true;
  });

  const totalValue = filteredPipelineDeals.reduce((sum, d) => sum + d.value, 0);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      moveDealStage(dealId, stageId);
    }
    setDraggedDealId(null);
  };

  const renderBadge = (badge?: string) => {
    if (!badge) return null;
    switch (badge) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B6B3A] bg-[#ECF8F1] border border-[#0F8A4B]/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-[#0F8A4B]" />
            <span>Completed</span>
          </span>
        );
      case 'Deadline changed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Deadline changed</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Overdue</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        );
    }
  };

  return (
    <div id="deals-pipeline-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      {/* Top Header & Pipeline Selector Multiempresa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-xl border border-[#0F8A4B]/20 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Pipeline de Negócios & Clientes (CRM)</h1>
              <span className="text-xs font-black px-2 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0B6B3A] rounded-full">
                {filteredPipelineDeals.length} negócios
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-semibold">
              <span>Volume no funil: <strong className="text-[#0F8A4B] font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Funil selecionado: <strong className="text-slate-900 font-black">{activePipeline?.name}</strong></span>
            </p>
          </div>
        </div>

        {/* Pipeline Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SELETOR MULTIEMPRESA AGRUPADO POR BUSINESS UNIT */}
          <select
            id="pipeline-select"
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-black bg-slate-50 text-slate-900 outline-none cursor-pointer hover:border-[#0F8A4B] transition-colors"
          >
            {businessUnits.map((bu) => {
              const buPipes = pipelines.filter((p) => p.businessUnitId === bu.id || p.businessUnitId === 'bu-all');
              if (buPipes.length === 0) return null;

              return (
                <optgroup key={bu.id} label={`🏢 ${bu.tradeName || bu.name}`}>
                  {buPipes.map((pipe) => {
                    const count = deals.filter((d) => d.pipelineId === pipe.id).length;
                    return (
                      <option key={pipe.id} value={pipe.id}>
                        {pipe.name} ({count} negócios)
                      </option>
                    );
                  })}
                </optgroup>
              );
            })}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-bold">
            <button
              id="view-kanban-btn"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            id="create-deal-btn"
            onClick={() => setQuickCreateType('deal')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Negócio</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, empresa, contato..."
            className="bg-transparent text-xs text-slate-900 focus:outline-none w-full font-semibold placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600 font-bold">Responsável:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold outline-none cursor-pointer"
          >
            <option value="all">Todos os responsáveis</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && activePipeline && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[560px]">
          {activePipeline.stages.map((stage) => {
            const stageDeals = filteredPipelineDeals.filter((d) => d.stageId === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-80 shrink-0 bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color || '#0F8A4B' }} />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{stage.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Total da Etapa:</span>
                    <strong className="text-[#0F8A4B] font-black">R$ {stageTotal.toLocaleString('pt-BR')}</strong>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 min-h-[420px]">
                    {stageDeals.map((deal) => {
                      const company = companies.find((c) => c.id === deal.companyId);
                      const contact = contacts.find((c) => c.id === deal.contactId);
                      const assignee = users.find((u) => u.id === deal.assignedUserId);

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onClick={() => setSelectedDealId(deal.id)}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#0F8A4B] transition-all cursor-pointer space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0F8A4B] transition-colors leading-snug">
                              {deal.title}
                            </h4>
                            {renderBadge(deal.cardBadge)}
                          </div>

                          {company && (
                            <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{company.tradeName}</span>
                            </p>
                          )}

                          {contact && (
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{contact.name} ({contact.phone})</span>
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-mono text-xs font-black text-[#0F8A4B]">
                              R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{assignee?.name || 'Não atribuído'}</span>
                          </div>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="p-6 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">
                        Nenhum negócio nesta etapa
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Negócio</th>
                  <th className="p-3.5">Empresa</th>
                  <th className="p-3.5">Contato Responsável</th>
                  <th className="p-3.5">Etapa</th>
                  <th className="p-3.5">Valor (R$)</th>
                  <th className="p-3.5">Responsável</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredPipelineDeals.map((d) => {
                  const company = companies.find((c) => c.id === d.companyId);
                  const contact = contacts.find((c) => c.id === d.contactId);
                  const stage = activePipeline?.stages.find((s) => s.id === d.stageId);
                  const assignee = users.find((u) => u.id === d.assignedUserId);

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDealId(d.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-900">{d.title}</td>
                      <td className="p-3.5 font-medium text-slate-700">{company?.tradeName || 'Sem Empresa'}</td>
                      <td className="p-3.5 font-medium text-slate-700">{contact?.name || 'Sem Contato'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800 uppercase">
                          {stage?.name || d.stageId}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-[#0F8A4B]">
                        R$ {d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{assignee?.name}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          d.status === 'won' ? 'bg-emerald-100 text-[#0B6B3A]' :
                          d.status === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
