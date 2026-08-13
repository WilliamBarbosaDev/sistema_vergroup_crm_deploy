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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3 text-sky-600" />
            <span>Viewed</span>
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
    <div id="deals-pipeline-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Top Header & Pipeline Selector */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Pipeline de Negócios & Clientes (CRM)</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0F8A4B] rounded-md">
                {filteredPipelineDeals.length} negócios
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5 flex items-center gap-2">
              <span>Volume no funil: <strong className="text-[#0F8A4B]">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>•</span>
              <span>Funil selecionado: <strong>{activePipeline?.name}</strong></span>
            </p>
          </div>
        </div>

        {/* Pipeline Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="pipeline-select"
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE3E8] rounded-md text-xs font-bold bg-[#F7F9FA] text-[#17212B] outline-none cursor-pointer hover:border-[#0F8A4B] transition-colors"
          >
            {pipelines.map((pipe) => (
              <option key={pipe.id} value={pipe.id}>
                {pipe.name}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-[#F7F9FA] border border-[#DDE3E8] rounded-md p-0.5 text-xs">
            <button
              id="view-kanban-btn"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76] hover:text-[#17212B]'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76] hover:text-[#17212B]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            id="create-deal-btn"
            onClick={() => setQuickCreateType('deal')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Negócio</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#DDE3E8] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#F7F9FA] px-3 py-1.5 rounded-lg border border-[#DDE3E8]">
          <Search className="w-4 h-4 text-[#5F6B76] shrink-0" />
          <input
            id="search-deal-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, empresa, razão social ou responsável..."
            className="w-full bg-transparent outline-none text-[#17212B] placeholder:text-[#5F6B76]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5F6B76]" />
            <span className="text-[#5F6B76] font-medium">Responsável:</span>
            <select
              id="filter-assignee-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-2.5 py-1 border border-[#DDE3E8] rounded-md bg-white font-medium text-[#17212B] outline-none cursor-pointer"
            >
              <option value="all">Todos os Colaboradores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 items-start min-h-[calc(100vh-280px)]">
          {activePipeline?.stages.map((stage) => {
            const stageDeals = filteredPipelineDeals.filter((d) => d.stageId === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-76 shrink-0 bg-[#F2F4F7] rounded-xl border border-[#DDE3E8] flex flex-col max-h-[78vh]"
              >
                {/* Bitrix Styled Stage Header */}
                <div
                  className="p-3 rounded-t-xl text-white relative shadow-xs"
                  style={{ backgroundColor: stage.color }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider truncate drop-shadow-xs">
                      {stage.name}
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-white/90">
                    <span className="font-bold">
                      R$ {stageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-white/80">{stage.probability}%</span>
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#5F6B76] border-2 border-dashed border-[#DDE3E8] rounded-lg bg-white/50">
                      Arraste um negócio aqui
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const comp = companies.find((c) => c.id === deal.companyId);
                      const cont = contacts.find((c) => c.id === deal.contactId);
                      const assignee = users.find((u) => u.id === deal.assignedUserId);

                      return (
                        <div
                          key={deal.id}
                          id={`deal-card-${deal.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onClick={() => setSelectedDealId(deal.id)}
                          className="bg-white p-3 rounded-lg border border-[#DDE3E8] hover:border-[#0F8A4B] shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                        >
                          {/* Top Row: Title & Badge */}
                          <div className="space-y-1">
                            <h3 className="text-xs font-bold text-[#17212B] group-hover:text-[#0F8A4B] transition-colors leading-snug line-clamp-2">
                              {deal.title}
                            </h3>
                            {deal.cardBadge && <div>{renderBadge(deal.cardBadge)}</div>}
                          </div>

                          {/* Value in BRL */}
                          <div className="text-sm font-extrabold text-[#0F8A4B]">
                            R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>

                          {/* Contact and Company Information */}
                          <div className="text-[11px] text-[#5F6B76] space-y-1 pt-1 border-t border-[#F0F4F7]">
                            {cont && (
                              <div className="flex items-center gap-1.5 text-[#17212B] font-medium truncate">
                                <User className="w-3.5 h-3.5 text-[#5F6B76] shrink-0" />
                                <span className="truncate">{cont.name}</span>
                              </div>
                            )}
                            {comp && (
                              <div className="flex items-center gap-1.5 text-[#5F6B76] truncate">
                                <Building2 className="w-3.5 h-3.5 text-[#5F6B76] shrink-0" />
                                <span className="truncate">{comp.tradeName}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Date & Assignee */}
                          <div className="flex items-center justify-between text-[11px] text-[#5F6B76] pt-1.5 border-t border-[#F0F4F7]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#5F6B76]" />
                              <span>{deal.expectedCloseDate}</span>
                            </div>

                            {assignee && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#5F6B76] hidden group-hover:inline-block">
                                  {assignee.name.split(' ')[0]}
                                </span>
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  title={`Responsável: ${assignee.name}`}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
                <tr>
                  <th className="p-3">Título do Negócio</th>
                  <th className="p-3">Status / Badge</th>
                  <th className="p-3">Contato / Empresa</th>
                  <th className="p-3">Etapa Atual</th>
                  <th className="p-3">Valor (R$)</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Previsão</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F7]">
                {filteredPipelineDeals.map((deal) => {
                  const comp = companies.find((c) => c.id === deal.companyId);
                  const cont = contacts.find((c) => c.id === deal.contactId);
                  const stage = activePipeline?.stages.find((s) => s.id === deal.stageId);
                  const assignee = users.find((u) => u.id === deal.assignedUserId);

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className="hover:bg-[#F7F9FA] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-[#17212B]">{deal.title}</td>
                      <td className="p-3">{renderBadge(deal.cardBadge)}</td>
                      <td className="p-3 text-[#5F6B76]">
                        <div className="font-medium text-[#17212B]">{cont?.name || '—'}</div>
                        <div className="text-[11px] text-[#5F6B76]">{comp?.tradeName}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold text-white inline-block shadow-2xs"
                          style={{ backgroundColor: stage?.color || '#0F8A4B' }}
                        >
                          {stage?.name}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#0F8A4B]">
                        R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-[#17212B]">
                        <div className="flex items-center gap-1.5">
                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                            />
                          )}
                          <span>{assignee?.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#5F6B76]">{deal.expectedCloseDate}</td>
                      <td className="p-3 text-right">
                        <button className="flex items-center gap-1 text-[11px] font-bold text-[#0F8A4B] hover:underline ml-auto">
                          <span>Ficha 360°</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
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
