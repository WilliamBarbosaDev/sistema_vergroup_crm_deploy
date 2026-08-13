import React from 'react';
import {
  Trello,
  UserPlus,
  CheckSquare,
  Building2,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CockpitView: React.FC = () => {
  const {
    filterByBU,
    deals,
    leads,
    tasks,
    clientAccounts,
    activities,
    currentBU,
    currentUser,
    setCurrentTab,
    setSelectedDealId,
    setSelectedTaskId,
    setQuickCreateType,
    toggleTaskStatus,
  } = useApp();

  const filteredDeals = filterByBU(deals);
  const filteredLeads = filterByBU(leads);
  const filteredTasks = filterByBU(tasks);
  const filteredClients = filterByBU(clientAccounts);

  const openDeals = filteredDeals.filter((d) => d.status === 'open');
  const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const newLeads = filteredLeads.filter((l) => l.status === 'new' || l.status === 'qualifying');
  const urgentTasks = filteredTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');
  const totalMRR = filteredClients.reduce((sum, c) => sum + c.monthlyValue, 0);

  const hotDeals = openDeals.filter((d) => d.value >= 50000).slice(0, 4);

  return (
    <div id="cockpit-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F8A4B] uppercase tracking-wider bg-[#ECF8F1] px-2 py-0.5 rounded">
              {currentBU.name}
            </span>
            <span className="text-xs text-[#5F6B76]">• Papel ativo: <strong className="text-[#17212B] uppercase">{currentUser.role}</strong></span>
          </div>
          <h1 className="text-xl font-bold text-[#17212B] mt-1">
            Olá, {currentUser.name.split(' ')[0]}! Aqui está o panorama operacional de hoje.
          </h1>
          <p className="text-xs text-[#5F6B76] mt-0.5">
            Você possui <strong className="text-[#17212B]">{urgentTasks.length} tarefas prioritárias</strong> e <strong className="text-[#0F8A4B]">{openDeals.length} negócios ativos</strong> no funil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setQuickCreateType('deal')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Negócio</span>
          </button>
          <button
            onClick={() => setQuickCreateType('task')}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#DDE3E8] hover:bg-[#F7F9FA] text-[#17212B] rounded-md text-xs font-semibold cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#5F6B76]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pipeline Value */}
        <div
          onClick={() => setCurrentTab('crm-deals')}
          className="bg-white p-4 rounded-xl border border-[#DDE3E8] hover:border-[#0F8A4B] shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider">Pipeline Aberto</span>
            <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17212B] mt-2">
            R$ {totalPipelineValue.toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-[#5F6B76] mt-1 flex items-center justify-between">
            <span>{openDeals.length} negócios em andamento</span>
            <ArrowRight className="w-3 h-3 text-[#0F8A4B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 2: Leads */}
        <div
          onClick={() => setCurrentTab('crm-leads')}
          className="bg-white p-4 rounded-xl border border-[#DDE3E8] hover:border-blue-500 shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider">Novos Leads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17212B] mt-2">
            {newLeads.length}
          </p>
          <p className="text-[11px] text-[#5F6B76] mt-1 flex items-center justify-between">
            <span>Aguardando qualificação</span>
            <ArrowRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 3: Urgent Tasks */}
        <div
          onClick={() => setCurrentTab('work-tasks')}
          className="bg-white p-4 rounded-xl border border-[#DDE3E8] hover:border-amber-500 shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider">Tarefas Críticas</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17212B] mt-2">
            {urgentTasks.length}
          </p>
          <p className="text-[11px] text-[#5F6B76] mt-1 flex items-center justify-between">
            <span>Prioridade Urgente / Alta</span>
            <ArrowRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 4: Monthly Recurring Revenue */}
        <div
          onClick={() => setCurrentTab('clients-pipeline')}
          className="bg-white p-4 rounded-xl border border-[#DDE3E8] hover:border-purple-500 shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider">Receita Recorrente (MRR)</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17212B] mt-2">
            R$ {totalMRR.toLocaleString('pt-BR')}/mês
          </p>
          <p className="text-[11px] text-[#5F6B76] mt-1 flex items-center justify-between">
            <span>{filteredClients.length} contas ativas na carteira</span>
            <ArrowRight className="w-3 h-3 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Critical Tasks & Hot Deals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Critical Tasks Section */}
          <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Tarefas Prioritárias & SLAs
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('work-tasks')}
                className="text-[11px] font-semibold text-[#0F8A4B] hover:underline"
              >
                Ver todas ({filteredTasks.length})
              </button>
            </div>

            <div className="divide-y divide-[#F0F4F7] mt-1">
              {urgentTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5F6B76]">
                  Nenhuma tarefa urgente pendente no momento. Excelente trabalho!
                </div>
              ) : (
                urgentTasks.map((task) => (
                  <div key={task.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 w-4 h-4 rounded border border-[#DDE3E8] hover:border-[#0F8A4B] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#0F8A4B]" />}
                      </button>
                      <div>
                        <p
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setCurrentTab('work-tasks');
                          }}
                          className="font-semibold text-[#17212B] hover:text-[#0F8A4B] cursor-pointer"
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5F6B76]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Vence em {task.dueDate}</span>
                          </span>
                          <span>•</span>
                          <span className="bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setCurrentTab('work-tasks');
                      }}
                      className="px-2.5 py-1 bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] rounded text-[11px] font-medium text-[#17212B] shrink-0"
                    >
                      Detalhes
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hot Deals Section */}
          <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F8A4B]" />
                <h2 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Oportunidades em Destaque (VGV Alto)
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('crm-deals')}
                className="text-[11px] font-semibold text-[#0F8A4B] hover:underline"
              >
                Abrir Funil Completo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {hotDeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => {
                    setSelectedDealId(deal.id);
                    setCurrentTab('crm-deals');
                  }}
                  className="p-3 rounded-lg border border-[#DDE3E8] hover:border-[#0F8A4B] bg-[#F7F9FA] hover:bg-white transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold text-[#17212B] line-clamp-1">{deal.title}</p>
                  </div>
                  <p className="text-base font-bold text-[#0F8A4B]">
                    R$ {deal.value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[11px] text-[#5F6B76] truncate">{deal.serviceCategory}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Timeline & System Activity */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Atividades & Linha do Tempo
                </h2>
              </div>
              <span className="text-[11px] text-[#5F6B76]">Tempo Real</span>
            </div>

            <div className="divide-y divide-[#F0F4F7] max-h-[420px] overflow-y-auto">
              {activities.slice(0, 6).map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#17212B] leading-tight">{act.title}</p>
                    {act.description && (
                      <p className="text-[11px] text-[#5F6B76] mt-0.5 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                    <span className="text-[10px] text-[#5F6B76] block mt-1">
                      {new Date(act.createdAt).toLocaleDateString('pt-BR')} {new Date(act.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="bg-[#ECF8F1] rounded-xl border border-[#0F8A4B]/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#0F8A4B]">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Governança VERGROUP</h3>
            </div>
            <p className="text-[11px] text-[#17212B] leading-relaxed">
              Sistema em conformidade total com a matriz de segurança, isolamento multiempresa e trilha imutável de auditoria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
