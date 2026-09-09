import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ImportWizardModal } from './ImportWizardModal';
import { Database, Plus, Search, Filter, History, HardDrive, AlertCircle } from 'lucide-react';

export const ImportsTab: React.FC = () => {
  const { importJobs, businessUnits } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = importJobs.filter(job => 
    job.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.sourceSystem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded uppercase tracking-wider">Preparando</span>;
      case 'analyzing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded uppercase tracking-wider">Analisando</span>;
      case 'ready':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded uppercase tracking-wider">Pronto</span>;
      case 'importing':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded uppercase tracking-wider">Importando</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase tracking-wider">Concluído</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded uppercase tracking-wider">Falhou</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] font-black rounded uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Importação de Dados
          </h2>
          <p className="section-muted mt-1 max-w-2xl">
            Importe bases externas com rastreabilidade, contexto por unidade de negócio e sem sobrescrever registros existentes.
          </p>
        </div>
        
        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-900/10 hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Nova Importação
        </button>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
          <strong className="block mb-1 text-xs">Modo seguro de importação</strong>
          Nesta etapa, o assistente registra apenas o arquivo enviado e o contexto da unidade de negócio. Nenhum dado operacional é alterado até a etapa final.
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="surface-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 input-shell px-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar arquivo ou origem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-0 text-sm focus:outline-none transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="surface-card-strong overflow-hidden">
        {importJobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1">Nenhuma importação realizada</h3>
            <p className="text-xs font-medium text-slate-500 max-w-sm mb-6">
              O histórico de importações aparecerá aqui. Clique em "Nova Importação" para iniciar o envio de um arquivo.
            </p>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-xs hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" /> Nova Importação
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Data</th>
                  <th className="p-4 whitespace-nowrap">Origem</th>
                  <th className="p-4 whitespace-nowrap">Arquivo</th>
                  <th className="p-4 whitespace-nowrap">Business Unit</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const bu = businessUnits.find(b => b.id === job.businessUnitId);
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                        {new Date(job.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded uppercase tracking-wider">
                          {job.sourceSystem}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-xs font-black text-slate-900">{job.fileName}</div>
                            <div className="text-[10px] font-medium text-slate-500">{(job.fileSize / (1024 * 1024)).toFixed(2)} MB</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-700">{bu?.name || 'BU Desconhecida'}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(job.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ImportWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </div>
  );
};
