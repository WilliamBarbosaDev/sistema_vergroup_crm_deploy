import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, HardDrive, Building2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({ isOpen, onClose }) => {
  const { businessUnits, currentUser, addImportJob, addAuditLog } = useApp();
  
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('bitrix24');
  const [businessUnitId, setBusinessUnitId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  const handleFinish = () => {
    if (!businessUnitId || !fileName) return;

    const newJob = addImportJob({
      sourceSystem: source,
      businessUnitId,
      uploadedByUserId: currentUser.id,
      fileName,
      fileSize,
      fileType: fileName.split('.').pop() || 'unknown',
      status: 'preparing',
    });

    addAuditLog(
      'create',
      'import_job',
      newJob.id,
      `Upload de arquivo "${fileName}" preparado para importação do ${source} na BU ${businessUnitId}`
    );

    // Reset state
    setStep(1);
    setFileName('');
    setFileSize(0);
    setBusinessUnitId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-inner shadow-blue-400/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Assistente de Importação
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Prepare os dados externos para análise e mapeamento.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md shadow-blue-900/20' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                1
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 1 ? 'text-blue-700' : 'text-slate-400'}`}>Origem</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md shadow-blue-900/20' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                2
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>Destino</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md shadow-blue-900/20' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                3
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>Arquivo</span>
            </div>
          </div>

          {/* STEP 1: SOURCE */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-black text-slate-900">Selecione o Sistema de Origem</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                  source === 'bitrix24' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                }`}>
                  <input 
                    type="radio" 
                    name="source" 
                    value="bitrix24" 
                    checked={source === 'bitrix24'} 
                    onChange={() => setSource('bitrix24')} 
                    className="sr-only" 
                  />
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                    B24
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-sm">Bitrix24</div>
                    <div className="text-[10px] text-slate-500 font-medium">Backup Padrão (CSV/ZIP)</div>
                  </div>
                </label>
                
                <label className={`cursor-not-allowed opacity-50 border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all border-slate-200 bg-slate-50`}>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black text-xl shadow-inner">
                    SF
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-sm">Salesforce</div>
                    <div className="text-[10px] text-slate-500 font-medium">Em breve</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS UNIT DESTINATION */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-black text-slate-900">Selecione a Unidade de Negócio (Destino)</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Os dados importados serão isolados nesta BU. Certifique-se de escolher a empresa correta para evitar vazamento de dados via RLS.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {businessUnits.map(bu => (
                  <label key={bu.id} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
                    businessUnitId === bu.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${businessUnitId === bu.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{bu.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-wider">CNPJ: {bu.cnpj}</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="bu" 
                      value={bu.id} 
                      checked={businessUnitId === bu.id} 
                      onChange={() => setBusinessUnitId(bu.id)} 
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-black text-slate-900">Upload do Backup</h3>
              
              {!fileName ? (
                <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-10 bg-white hover:bg-slate-50 transition-colors">
                  <div className="text-center">
                    <HardDrive className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-bold text-blue-600 focus-within:outline-none hover:text-blue-500"
                      >
                        <span>Selecione um arquivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept=".zip,.csv,.xlsx,.json" />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2">CSV, XLSX, JSON ou ZIP (até 500MB)</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-xs text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 truncate max-w-xs">{fileName}</div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        {(fileSize / (1024 * 1024)).toFixed(2)} MB • Pronto para preparação
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setFileName('')} className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">
                    Remover
                  </button>
                </div>
              )}

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mt-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  <strong className="block mb-1 text-xs">Nota de Arquitetura:</strong>
                  Nesta fase de homologação, o arquivo não será processado para o CRM imediatamente. Ele será salvo na fila de <strong>Preparação</strong> para que os administradores possam construir as regras de mapeamento de-para nas próximas atualizações.
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="flex-none p-4 bg-white border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-sm"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !businessUnitId}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-900/10 cursor-pointer text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima Etapa
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!fileName}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-900/10 cursor-pointer text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Finalizar Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
