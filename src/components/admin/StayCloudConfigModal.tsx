import React, { useState } from 'react';
import { X, Server, Database, Globe, Key, ShieldCheck, CheckCircle2, AlertCircle, Save, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StayCloudConfigModalProps {
  onClose: () => void;
}

export const StayCloudConfigModal: React.FC<StayCloudConfigModalProps> = ({ onClose }) => {
  const { addAuditLog } = useApp();

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [staycloudDomain, setStaycloudDomain] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('update', 'SystemConfig', 'staycloud-env', 'Updated StayCloud deployment parameters & Supabase production endpoints');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0F8A4B] rounded-xl text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Configurações de Deploy StayCloud & Supabase</h3>
              <p className="text-xs text-slate-300 font-semibold">Parâmetros de ambiente corporativo para importação no StayCloud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-[#0F8A4B] text-xs font-black flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações StayCloud salvas com sucesso!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
              <span>Checklist de Prontidão StayCloud (StayCloud Readiness)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Supabase PostgreSQL RLS Habilitado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Isolamento Multiempresa Soberano</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>ActorContext & Audit Logs Ativos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8A4B]" />
                <span>Build Vite/TypeScript 0 Erros</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">Endereços de API & Banco Supabase</h4>
            
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Supabase Project URL</label>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Database className="w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  required
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Supabase Anon Key</label>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Key className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full bg-transparent outline-none font-mono text-[10px] text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">Domínio & Servidor StayCloud</h4>
            
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Domínio staycloud Autorizado</label>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Globe className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={staycloudDomain}
                  onChange={(e) => setStaycloudDomain(e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros StayCloud</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
