import React, { useState } from 'react';
import {
  Zap,
  Play,
  Plus,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AutomationsView: React.FC = () => {
  const {
    automations,
    toggleAutomation,
    triggerAutomationManually,
  } = useApp();

  const [testLog, setTestLog] = useState<{ id: string; name: string; timestamp: string } | null>(null);

  const handleTest = (autoId: string, autoName: string) => {
    triggerAutomationManually(autoId);
    setTestLog({
      id: autoId,
      name: autoName,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    });
    setTimeout(() => {
      setTestLog(null);
    }, 4000);
  };

  return (
    <div id="automations-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Motor de Automações & Regras de Negócio</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] rounded">
                {automations.filter((a) => a.isActive).length} regras ativas
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Gatilhos automatizados (Ganha de Negócio → Projeto + Onboarding + Tarefas) (PRD 5.13)
            </p>
          </div>
        </div>
      </div>

      {/* Test Success Feedback Banner */}
      {testLog && (
        <div className="p-3 bg-[#ECF8F1] border border-[#0F8A4B]/30 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-[#0F8A4B]">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Automação <strong>"{testLog.name}"</strong> disparada com sucesso às {testLog.timestamp}! Tarefas e registros vinculados criados.
            </span>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
              auto.isActive ? 'border-[#DDE3E8]' : 'border-[#DDE3E8] opacity-60 bg-[#F7F9FA]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#17212B]">{auto.name}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F7F9FA] border border-[#DDE3E8] text-[#5F6B76]">
                    Gatilho: {auto.trigger}
                  </span>
                </div>
                <p className="text-xs text-[#5F6B76] mt-0.5">{auto.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTest(auto.id, auto.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FA] hover:bg-[#EAEFF3] border border-[#DDE3E8] text-[#17212B] rounded-md text-xs font-semibold cursor-pointer"
                  title="Simular execução da automação agora"
                >
                  <Play className="w-3.5 h-3.5 text-[#0F8A4B]" />
                  <span>Simular Disparo</span>
                </button>

                <button
                  onClick={() => toggleAutomation(auto.id)}
                  className="p-1 text-2xl text-[#0F8A4B] cursor-pointer"
                  title={auto.isActive ? 'Desativar regra' : 'Ativar regra'}
                >
                  {auto.isActive ? (
                    <ToggleRight className="w-8 h-8 text-[#0F8A4B]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#5F6B76]" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions Flow Steps */}
            <div className="bg-[#F7F9FA] p-3.5 rounded-lg border border-[#DDE3E8] text-xs space-y-2">
              <span className="text-[10px] font-bold text-[#5F6B76] uppercase tracking-wider block">
                Ações Executadas no Disparo ({auto.actions.length} etapas):
              </span>
              <div className="space-y-1.5">
                {auto.actions.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#17212B]">
                    <span className="w-4 h-4 rounded-full bg-[#ECF8F1] text-[#0F8A4B] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{act.type}: {act.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
