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
    <div id="cockpit-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      
      {/* 1. WELCOME HEADER (CLEAN LIGHT SAAS STYLE) */}
      <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0B6B3A] uppercase tracking-wider bg-[#ECF8F1] px-2 py-0.5 rounded-md">
              {currentBU.name}
            </span>
            <span className="text-xs text-slate-500">• Papel ativo: <strong className="text-slate-800 uppercase font-semibold">{currentUser.role}</strong></span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mt-1 font-display">
            Olá, {currentUser.name.split(' ')[0]}! Aqui está o panorama de hoje.
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Você possui <strong className="text-slate-900 font-semibold">{urgentTasks.length} tarefas prioritárias</strong> e <strong className="text-[#0F8A4B] font-semibold">{openDeals.length} negócios ativos</strong> no funil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCreateType('deal')}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Negócio</span>
          </button>

          <button
            onClick={() => setQuickCreateType('task')}
            className="btn-secondary flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT KPI METRIC BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Pipeline Value */}
        <div
          onClick={() => setCurrentTab('crm-deals')}
          className="bg-white p-4 rounded-xl border border-[#E2E6EA] hover:border-[#0F8A4B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pipeline Aberto</span>
            <div className="p-1.5 bg-[#ECF8F1] text-[#0F8A4B] rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-2 font-display">
            R$ {totalPipelineValue.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between font-normal">
            <span>{openDeals.length} negócios ativos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0F8A4B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 2: Leads */}
        <div
          onClick={() => setCurrentTab('crm-leads')}
          className="bg-white p-4 rounded-xl border border-[#E2E6EA] hover:border-sky-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Novos Leads</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-md">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-2 font-display">
            {newLeads.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between font-normal">
            <span>Aguardando qualificação</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 3: Urgent Tasks */}
        <div
          onClick={() => setCurrentTab('work-tasks')}
          className="bg-white p-4 rounded-xl border border-[#E2E6EA] hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tarefas Críticas</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-2 font-display">
            {urgentTasks.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between font-normal">
            <span>Prioridade Urgente / Alta</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* KPI 4: Monthly Recurring Revenue */}
        <div
          onClick={() => setCurrentTab('crm-companies')}
          className="bg-white p-4 rounded-xl border border-[#E2E6EA] hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MRR Carteira</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-2 font-display">
            R$ {totalMRR.toLocaleString('pt-BR')} /mês
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between font-normal">
            <span>{filteredClients.length} contas de clientes</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

      </div>

      {/* 3. VER AI COPILOT BRIEFING (CLEAN ELEGANT BOX) */}
      <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ECF8F1] text-[#0B6B3A] rounded-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>✨ VER AI Briefing Executivo</span>
              <span className="text-[10px] font-mono bg-emerald-50 text-[#0B6B3A] border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                Auditoria em Tempo Real
              </span>
            </h2>
          </div>

          <button
            onClick={() => alert('Sintese atualizada pela inteligência VER AI.')}
            className="btn-secondary text-xs"
          >
            Atualizar Análise IA
          </button>
        </div>

        <div className="p-3.5 bg-[#F5F7F8] rounded-lg border border-[#E2E6EA] text-xs text-slate-700 leading-relaxed font-normal">
          <p>
            O motor de inteligência <strong>VER AI Copilot</strong> realizou a varredura contínua dos eventos e identificou conformidade estrita de prazos operacionais, com <strong>{openDeals.length} negócios em negociação ativa</strong> e <strong>{urgentTasks.length} entregas críticas sob monitoramento SLA</strong>.
          </p>
        </div>
      </div>

      {/* 4. MAIN OPERATIONAL SECTIONS (HOT DEALS & PENDING TASKS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hot Deals Section */}
        <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Trello className="w-4 h-4 text-[#0F8A4B]" />
              <span>Oportunidades em Destaque (Hot Deals)</span>
            </h2>
            <button
              onClick={() => setCurrentTab('crm-deals')}
              className="text-xs text-[#0F8A4B] font-semibold hover:underline cursor-pointer"
            >
              Ver Funil Completo →
            </button>
          </div>

          <div className="space-y-2">
            {hotDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => { setSelectedDealId(deal.id); setCurrentTab('crm-deals'); }}
                className="p-3 bg-[#F5F7F8] hover:bg-[#F3F5F6] border border-[#E2E6EA] rounded-lg flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">{deal.title}</h3>
                  <span className="text-[11px] text-slate-500 font-normal">{deal.companyName}</span>
                </div>
                <span className="text-xs font-semibold text-[#0F8A4B]">
                  R$ {deal.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Tasks Section */}
        <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Entregas Prioritárias & SLA</span>
            </h2>
            <button
              onClick={() => setCurrentTab('work-tasks')}
              className="text-xs text-[#0F8A4B] font-semibold hover:underline cursor-pointer"
            >
              Ver Central de Tarefas →
            </button>
          </div>

          <div className="space-y-2">
            {urgentTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 bg-[#F5F7F8] border border-[#E2E6EA] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#0F8A4B] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-semibold text-slate-900">{task.title}</h3>
                    <span className="text-[11px] text-slate-500 font-normal">Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded border border-amber-200">
                  {task.priority === 'urgent' ? 'Urgente' : 'Alta'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
