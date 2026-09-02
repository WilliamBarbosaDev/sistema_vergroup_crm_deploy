import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calculator,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Company } from '../../../types';

export interface FiscalRoutine {
  id: string;
  name: string;
  code: string;
  frequency: 'monthly' | 'yearly' | 'quarterly';
  dueDay: number;
  description: string;
}

export const DEFAULT_FISCAL_ROUTINES: FiscalRoutine[] = [
  { id: 'fisc-1', name: 'Apuração DAS (Simples Nacional)', code: 'DAS-SN', frequency: 'monthly', dueDay: 20, description: 'Cálculo de imposto unificado e emissão do guia DAS' },
  { id: 'fisc-2', name: 'SPED Fiscal & EFD ICMS/IPI', code: 'SPED-ICMS', frequency: 'monthly', dueDay: 25, description: 'Escrituração fiscal digital de ICMS/IPI' },
  { id: 'fisc-3', name: 'EFD Reinf & DCTFWeb', code: 'DCTFWEB', frequency: 'monthly', dueDay: 15, description: 'Declaração de retenções tributárias e contribuição previdenciária' },
  { id: 'fisc-4', name: 'Declaração DEFIS Anual', code: 'DEFIS', frequency: 'yearly', dueDay: 31, description: 'Declaração de informações socioeconômicas e fiscais' },
];

export const FiscalModuleView: React.FC = () => {
  const {
    companies,
    users,
    tasks,
    currentUser,
    filterByBU,
    addTask,
    setSelectedTaskId,
    setCurrentTab,
  } = useApp();

  const filteredCompanies = filterByBU(companies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(filteredCompanies[0]?.id || '');
  const [selectedRegime, setSelectedRegime] = useState<'simples' | 'presumido' | 'real'>('simples');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || null;
  const companyTasks = tasks.filter((t) => t.clientId === selectedCompanyId && t.title.toLowerCase().includes('fiscal'));

  const handleGenerateFiscalTasks = () => {
    if (!activeCompany) return;

    DEFAULT_FISCAL_ROUTINES.forEach((routine) => {
      const dueDate = new Date();
      dueDate.setDate(routine.dueDay);
      if (dueDate < new Date()) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      addTask({
        businessUnitId: activeCompany.businessUnitId,
        title: `[FISCAL] ${routine.name} — ${activeCompany.tradeName}`,
        description: `Obrigação fiscal referente a ${routine.description}. Prazo de entrega no dia ${routine.dueDay}.`,
        taskContext: 'client',
        confirmedInternal: false,
        clientId: activeCompany.id,
        creatorId: currentUser.id,
        ownerUserId: currentUser.id,
        assignedUserId: activeCompany.assignedUserId || currentUser.id,
        priority: 'high',
        dueDate: dueDate.toISOString().split('T')[0],
        estimatedHours: 8,
        checklist: [
          { id: `chk-f1-${Date.now()}`, title: 'Importar notas fiscais de entrada e saída', completed: false },
          { id: `chk-f2-${Date.now()}`, title: 'Validar apuração e gerar guia de recolhimento', completed: false },
          { id: `chk-f3-${Date.now()}`, title: 'Enviar guia para o cliente com protocolo', completed: false },
        ],
      });
    });

    alert(`🎉 4 Rotinas Fiscais mensais geradas com sucesso para a empresa "${activeCompany.tradeName}" no Core de Tarefas!`);
  };

  const handleRunAiTaxAudit = () => {
    if (!activeCompany) return;
    setAiAnalysisResult(
      `📊 **Diagnóstico Fiscal VER AI — [${activeCompany.tradeName}]**:\n- **Regime Atual**: ${selectedRegime.toUpperCase()}\n- **Faturamento Médio Estimado**: R$ 180.000,00/mês\n- **Conformidade Tributária**: 🟢 Regularidade Mantida\n- **Oportunidade Tributária**: Possibilidade de redução de PIS/COFINS monofásico no segmento ${activeCompany.segment}.\n\n💡 **Recomendação VER AI**: Manter as apurações atreladas às tarefas com aviso de SLA no dia 15.`
    );
  };

  return (
    <div id="fiscal-module-view" className="p-4 md:p-6 max-w-full space-y-4 font-sans select-none">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center font-black border border-[#0F8A4B]/20">
            <FileSpreadsheet className="w-5 h-5 text-[#0F8A4B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Gestão Fiscal & Tributária (Módulo de Extensão)</h1>
              <span className="text-xs font-black px-2.5 py-0.5 bg-[#ECF8F1] text-[#0B6B3A] border border-[#0F8A4B]/20 rounded-full">
                Extensão Pilot v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Módulo de extensão consumindo o CRM Core, Tasks Core e assistente de IA tributária sem alterar o núcleo congelado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateFiscalTasks}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Rotinas Fiscais no Tasks Core</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Col: Client Company Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F8A4B]" />
            Empresa / Cliente CRM
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Selecionar Empresa:</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold outline-none focus:border-[#0F8A4B]"
            >
              {filteredCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradeName} ({c.cnpj})
                </option>
              ))}
            </select>
          </div>

          {activeCompany && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Dados Cadastrais CRM</span>
              <strong className="text-slate-900 font-bold block">{activeCompany.tradeName}</strong>
              <p className="text-slate-600 text-[11px] font-medium">CNPJ: {activeCompany.cnpj}</p>
              <p className="text-slate-600 text-[11px] font-medium">Segmento: {activeCompany.segment}</p>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Regime Tributário:</label>
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold outline-none focus:border-[#0F8A4B]"
            >
              <option value="simples">Simples Nacional</option>
              <option value="presumido">Lucro Presumido</option>
              <option value="real">Lucro Real</option>
            </select>
          </div>
        </div>

        {/* Middle Col: Fiscal Routines Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0F8A4B]" />
              Obrigações e Rotinas Fiscais Periódicas
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              {DEFAULT_FISCAL_ROUTINES.length} rotinas ativas
            </span>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_FISCAL_ROUTINES.map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-[#ECF8F1] text-[#0B6B3A] rounded border border-[#0F8A4B]/20">
                      {r.code}
                    </span>
                    <strong className="text-slate-900 font-bold">{r.name}</strong>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 font-medium">{r.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-800 block">Vencimento: Dia {r.dueDay}</span>
                  <span className="text-[10px] font-bold text-[#0B6B3A] uppercase">{r.frequency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* VER AI Tax Diagnostic Box */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 rounded-2xl border border-emerald-500/30 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white">VER AI Fiscal Copilot — Auditoria de Enquadramento</h4>
              </div>
              <button
                onClick={handleRunAiTaxAudit}
                className="px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                ⚡ Auditar Regime
              </button>
            </div>

            {aiAnalysisResult && (
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {aiAnalysisResult}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fiscal Tasks Linked to Core Tasks */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Tarefas Fiscais Geradas no Core (`public.tasks`) — [{companyTasks.length}]
        </h3>

        <div className="space-y-2">
          {companyTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedTaskId(t.id);
                setCurrentTab('work-tasks');
              }}
              className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition hover:border-[#0F8A4B] text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] font-black text-[#0B6B3A] bg-[#ECF8F1] px-2 py-0.5 rounded border border-[#0F8A4B]/20">
                  {t.protocolNumber || t.id}
                </span>
                <strong className="text-slate-900 font-bold">{t.title}</strong>
              </div>
              <div className="flex items-center gap-3 font-semibold text-slate-600">
                <span className="font-mono">{t.dueDate}</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-black uppercase">{t.status}</span>
              </div>
            </div>
          ))}

          {companyTasks.length === 0 && (
            <p className="text-xs text-slate-500 italic py-2">
              Nenhuma tarefa fiscal gerada ainda para a empresa selecionada. Clique em "Gerar Rotinas Fiscais no Tasks Core".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
