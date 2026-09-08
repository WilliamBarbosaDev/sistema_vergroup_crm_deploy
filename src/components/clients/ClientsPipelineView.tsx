import React, { useState } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientAccount, ClientAccountStage } from '../../types';

export const ClientsPipelineView: React.FC = () => {
  const {
    clientAccounts,
    companies,
    users,
    filterByBU,
    updateClientAccountStage,
    setQuickCreateType,
  } = useApp();

  const filteredClients = filterByBU(clientAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);

  const stages: { id: ClientAccountStage; name: string; color: string }[] = [
    { id: 'onboarding', name: '1. Onboarding & Kickoff', color: '#2563EB' },
    { id: 'documentation', name: '2. Coleta de Documentos', color: '#D97706' },
    { id: 'implementation', name: '3. Implantação / Setup', color: '#7C3AED' },
    { id: 'active', name: '4. Ativo / Recorrência', color: '#0F8A4B' },
    { id: 'pending', name: '5. Pendência / Alerta', color: '#DC2626' },
  ];

  const displayedClients = filteredClients.filter((client) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const comp = companies.find((c) => c.id === client.companyId);
      return (
        comp?.tradeName.toLowerCase().includes(q) ||
        client.activeServices.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalMRR = displayedClients.reduce((sum, c) => sum + c.monthlyValue, 0);

  const getHealthDot = (health: 'green' | 'yellow' | 'red') => {
    switch (health) {
      case 'green': return <span className="w-2.5 h-2.5 rounded-full bg-[#0F8A4B]" title="Saúde: Excelente" />;
      case 'yellow': return <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Saúde: Atenção" />;
      case 'red': return <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Saúde: Crítica / Risco Churn" />;
    }
  };

  return (
    <div id="clients-pipeline-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Gestão de Contas & Sucesso do Cliente (CS)</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] border border-[#0F8A4B]/20 rounded">
                MRR: R$ {totalMRR.toLocaleString('pt-BR')}/mês
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Acompanhamento 360° do ciclo de vida: Onboarding, Setup, Recorrência e Prevenção de Churn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#5F6B76]">Total de Contas: <strong className="text-[#17212B]">{displayedClients.length}</strong></span>
          <button
            onClick={() => setQuickCreateType('company')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Empresa / Cliente</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs max-w-md">
        <Search className="w-4 h-4 text-[#5F6B76]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar conta por empresa ou serviço ativo..."
          className="w-full bg-transparent outline-none text-[#17212B]"
        />
      </div>

      {/* Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-280px)]">
        {stages.map((stage) => {
          const stageClients = displayedClients.filter((c) => c.stage === stage.id);
          const stageMRR = stageClients.reduce((sum, c) => sum + c.monthlyValue, 0);

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 bg-[#F7F9FA] rounded-xl border border-[#DDE3E8] flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[#DDE3E8] bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h2 className="text-xs font-bold text-[#17212B] leading-tight truncate">{stage.name}</h2>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-[#F7F9FA] border border-[#DDE3E8] text-[#5F6B76]">
                    {stageClients.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6B76] mt-1">
                  Receita: <strong className="text-[#17212B]">R$ {stageMRR.toLocaleString('pt-BR')}/mês</strong>
                </p>
              </div>

              {/* Client Cards */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {stageClients.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#5F6B76] border-2 border-dashed border-[#DDE3E8] rounded-lg">
                    Nenhuma conta nesta etapa
                  </div>
                ) : (
                  stageClients.map((client) => {
                    const comp = companies.find((c) => c.id === client.companyId);
                    const manager = users.find((u) => u.id === client.accountManagerId);
                    const ops = users.find((u) => u.id === client.operationalLeadId);

                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="bg-white p-3.5 rounded-lg border border-[#DDE3E8] hover:border-[#0F8A4B] shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h3 className="text-xs font-bold text-[#17212B] line-clamp-1">{comp?.tradeName}</h3>
                            <p className="text-[10px] text-[#5F6B76]">Início: {client.contractStartDate}</p>
                          </div>
                          {getHealthDot(client.healthScore)}
                        </div>

                        {/* Services Badges */}
                        <div className="flex flex-wrap gap-1">
                          {client.activeServices.map((srv) => (
                            <span key={srv} className="bg-[#F7F9FA] border border-[#DDE3E8] text-[#17212B] text-[10px] px-1.5 py-0.5 rounded">
                              {srv}
                            </span>
                          ))}
                        </div>

                        {/* Financial & NPS */}
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F0F4F7]">
                          <span className="font-bold text-[#0F8A4B]">
                            R$ {client.monthlyValue.toLocaleString('pt-BR')}<span className="text-[10px] font-normal text-[#5F6B76]">/mês</span>
                          </span>
                          {client.npsScore && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-semibold">
                              NPS: {client.npsScore}
                            </span>
                          )}
                        </div>

                        {/* Team Responsibles */}
                        <div className="flex items-center justify-between text-[10px] text-[#5F6B76] pt-1">
                          <span>CSM: <strong>{manager?.name.split(' ')[0]}</strong></span>
                          <span>Ops: <strong>{ops?.name.split(' ')[0]}</strong></span>
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

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-[#DDE3E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3E8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ECF8F1] text-[#0F8A4B] font-bold text-base flex items-center justify-center">
                  {companies.find(c => c.id === selectedClient.companyId)?.tradeName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17212B]">
                    {companies.find(c => c.id === selectedClient.companyId)?.tradeName}
                  </h2>
                  <p className="text-xs text-[#5F6B76]">Ficha de Gestão de Conta & Sucesso</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1 text-[#5F6B76] hover:text-[#17212B] rounded text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Quick Stage Mover */}
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Mover Etapa do Cliente:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {stages.map((stg) => (
                    <button
                      key={stg.id}
                      onClick={() => {
                        updateClientAccountStage(selectedClient.id, stg.id);
                        setSelectedClient({ ...selectedClient, stage: stg.id });
                      }}
                      className={`p-1.5 rounded text-[11px] font-semibold border text-center transition-colors ${
                        selectedClient.stage === stg.id
                          ? 'bg-[#0F8A4B] text-white border-[#0F8A4B]'
                          : 'bg-[#F7F9FA] text-[#5F6B76] border-[#DDE3E8] hover:bg-[#EAEFF3]'
                      }`}
                    >
                      {stg.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#F7F9FA] p-3 rounded-lg border border-[#DDE3E8]">
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Valor Mensal Recorrente</span>
                  <span className="font-bold text-sm text-[#0F8A4B]">
                    R$ {selectedClient.monthlyValue.toLocaleString('pt-BR')}/mês
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Início do Contrato</span>
                  <span className="font-semibold text-[#17212B]">{selectedClient.contractStartDate}</span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Gestor da Conta (CSM)</span>
                  <span className="font-semibold text-[#17212B]">
                    {users.find(u => u.id === selectedClient.accountManagerId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6B76] block text-[11px]">Líder Operacional</span>
                  <span className="font-semibold text-[#17212B]">
                    {users.find(u => u.id === selectedClient.operationalLeadId)?.name}
                  </span>
                </div>
              </div>

              {/* Active Services */}
              <div>
                <span className="text-[#5F6B76] font-semibold block mb-1">Serviços Contratados:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClient.activeServices.map((srv) => (
                    <span key={srv} className="bg-white border border-[#DDE3E8] text-[#17212B] text-xs px-2.5 py-1 rounded font-medium shadow-2xs">
                      ✓ {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#DDE3E8]">
              <button
                onClick={() => setSelectedClient(null)}
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
