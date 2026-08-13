import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const {
    deals,
    leads,
    tasks,
    clientAccounts,
    users,
    pipelines,
    filterByBU,
    currentBU,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sales' | 'ops' | 'clients'>('sales');

  const filteredDeals = filterByBU(deals);
  const filteredLeads = filterByBU(leads);
  const filteredTasks = filterByBU(tasks);
  const filteredClients = filterByBU(clientAccounts);

  // Sales metrics
  const totalPipeline = filteredDeals.filter(d => d.status === 'open').reduce((sum, d) => sum + d.value, 0);
  const wonDeals = filteredDeals.filter(d => d.status === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const conversionRate = filteredDeals.length > 0 ? Math.round((wonDeals.length / filteredDeals.length) * 100) : 0;
  const avgTicket = filteredDeals.length > 0 ? Math.round(totalPipeline / filteredDeals.length) : 0;

  // Ops metrics
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const totalSpentHours = filteredTasks.reduce((sum, t) => sum + t.spentHours, 0);
  const totalEstHours = filteredTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const slaCompliance = filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0;

  // Clients metrics
  const totalMRR = filteredClients.reduce((sum, c) => sum + c.monthlyValue, 0);
  const healthyClients = filteredClients.filter(c => c.healthScore === 'green');

  return (
    <div id="analytics-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">BI & Relatórios Executivos</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] rounded">
                {currentBU.name}
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Métricas consolidadas de vendas, performance operacional e saúde da carteira (PRD 5.14)
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#F7F9FA] border border-[#DDE3E8] rounded-md p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'sales' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Comercial & Vendas
          </button>
          <button
            onClick={() => setActiveTab('ops')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'ops' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Operações & SLAs
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'clients' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Clientes & MRR
          </button>
        </div>
      </div>

      {/* SALES DASHBOARD */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Volume em Pipeline</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">R$ {totalPipeline.toLocaleString('pt-BR')}</p>
              <p className="text-[11px] text-[#0F8A4B] mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{filteredDeals.length} negócios ativos</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Vendas Ganhas (Fechadas)</span>
              <p className="text-2xl font-bold text-[#0F8A4B] mt-1">R$ {wonValue.toLocaleString('pt-BR')}</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">{wonDeals.length} contratos assinados</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Taxa de Conversão</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">{conversionRate}%</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Meta do Grupo: 25%</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Ticket Médio do Negócio</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">R$ {avgTicket.toLocaleString('pt-BR')}</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Base nos funis ativos</p>
            </div>
          </div>

          {/* Sales Performance by Rep */}
          <div className="bg-white rounded-xl border border-[#DDE3E8] p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
              Desempenho Comercial por Responsável
            </h3>
            <div className="divide-y divide-[#F0F4F7]">
              {users.map((u) => {
                const userDeals = filteredDeals.filter(d => d.assignedUserId === u.id);
                const userTotal = userDeals.reduce((sum, d) => sum + d.value, 0);

                return (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#17212B]">{u.name}</p>
                        <p className="text-[11px] text-[#5F6B76]">{u.jobTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[11px] text-[#5F6B76]">Negócios Ativos</span>
                        <p className="font-bold text-[#17212B]">{userDeals.length}</p>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <span className="text-[11px] text-[#5F6B76]">Volume em Carteira</span>
                        <p className="font-bold text-[#0F8A4B]">R$ {userTotal.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OPS DASHBOARD */}
      {activeTab === 'ops' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Taxa de Conclusão de Tarefas</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">{slaCompliance}%</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">{completedTasks.length} de {filteredTasks.length} tarefas</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Horas Realizadas (Time Track)</span>
              <p className="text-2xl font-bold text-[#0F8A4B] mt-1">{totalSpentHours}h</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Estimadas: {totalEstHours}h</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Eficiência de Apontamento</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">
                {totalEstHours > 0 ? Math.round((totalSpentHours / totalEstHours) * 100) : 100}%
              </p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Dentro do orçamento operacional</p>
            </div>
          </div>
        </div>
      )}

      {/* CLIENTS DASHBOARD */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Receita Recorrente Mensal (MRR)</span>
              <p className="text-2xl font-bold text-[#0F8A4B] mt-1">R$ {totalMRR.toLocaleString('pt-BR')}/mês</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">ARR Projetado: R$ {(totalMRR * 12).toLocaleString('pt-BR')}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">Clientes com Saúde Saudável</span>
              <p className="text-2xl font-bold text-[#17212B] mt-1">{healthyClients.length} de {filteredClients.length}</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Baixo risco de churn</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DDE3E8] shadow-xs">
              <span className="text-[11px] font-semibold text-[#5F6B76] uppercase tracking-wider block">NPS Médio da Carteira</span>
              <p className="text-2xl font-bold text-purple-700 mt-1">9.2 / 10</p>
              <p className="text-[11px] text-[#5F6B76] mt-1">Zona de Excelência</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
