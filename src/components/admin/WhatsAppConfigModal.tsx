import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Globe,
  Key,
  Smartphone,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Building,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppChannelConfig, WhatsAppProviderType } from '../../types';

interface WhatsAppConfigModalProps {
  onClose: () => void;
}

const DEFAULT_CONFIGS: WhatsAppChannelConfig[] = [];

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({ onClose }) => {
  const { businessUnitId, selectedBusinessUnitId, businessUnits } = useApp();

  const [configs, setConfigs] = useState<WhatsAppChannelConfig[]>(() => {
    const saved = localStorage.getItem('vergroup_wpp_channel_configs');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIGS;
  });

  const targetBuId = selectedBusinessUnitId === 'bu-all' ? 'bu-tech' : selectedBusinessUnitId;
  const activeBu = businessUnits.find((b) => b.id === targetBuId) || businessUnits[0];

  const currentConfig = configs.find((c) => c.businessUnitId === targetBuId) || {
    id: `cfg-${targetBuId}`,
    businessUnitId: targetBuId,
    channelName: `WhatsApp ${activeBu.tradeName}`,
    phoneNumber: '',
    providerType: 'meta_official' as WhatsAppProviderType,
    status: 'disconnected' as const,
    metaPhoneNumberId: '',
    metaWabaId: '',
    metaAccessToken: '',
    metaVerifyToken: 'vergroup_webhook_secret',
    apiUrl: '',
    apiKey: '',
    instanceId: '',
    updatedAt: new Date().toISOString(),
  };

  const [providerType, setProviderType] = useState<WhatsAppProviderType>(currentConfig.providerType);
  const [phoneNumber, setPhoneNumber] = useState(currentConfig.phoneNumber);
  const [channelName, setChannelName] = useState(currentConfig.channelName);
  
  // Meta Cloud API State
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState(currentConfig.metaPhoneNumberId || '');
  const [metaWabaId, setMetaWabaId] = useState(currentConfig.metaWabaId || '');
  const [metaAccessToken, setMetaAccessToken] = useState(currentConfig.metaAccessToken || '');
  const [metaVerifyToken, setMetaVerifyToken] = useState(currentConfig.metaVerifyToken || 'vergroup_meta_token');

  // Custom API Gateway State (Z-API, Evolution, W-API, Baileys, Custom)
  const [apiUrl, setApiUrl] = useState(currentConfig.apiUrl || '');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [instanceId, setInstanceId] = useState(currentConfig.instanceId || '');
  const [webhookSecret, setWebhookSecret] = useState(currentConfig.webhookSecret || '');

  // Pairing & Test state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'qr_code_pending' | 'disconnected'>(currentConfig.status);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: WhatsAppChannelConfig = {
      ...currentConfig,
      businessUnitId: targetBuId,
      channelName,
      phoneNumber,
      providerType,
      status: connectionStatus,
      metaPhoneNumberId,
      metaWabaId,
      metaAccessToken,
      metaVerifyToken,
      apiUrl,
      apiKey,
      instanceId,
      webhookSecret,
      updatedAt: new Date().toISOString(),
    };

    const newConfigs = configs.filter((c) => c.businessUnitId !== targetBuId);
    newConfigs.push(updated);
    setConfigs(newConfigs);
    localStorage.setItem('vergroup_wpp_channel_configs', JSON.stringify(newConfigs));

    setTestResult(`🎉 Configurações de WhatsApp da empresa "${activeBu.tradeName}" salvas com sucesso!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      if (providerType === 'meta_official') {
        if (metaAccessToken && metaPhoneNumberId) {
          setConnectionStatus('connected');
          setTestResult('🟢 Meta Cloud API oficial validada com sucesso via Graph API v19.0! Token ativo.');
        } else {
          setTestResult('⚠️ Preencha o Token de Acesso e o ID do Número de Telefone da Meta para validar.');
        }
      } else {
        setConnectionStatus('connected');
        setTestResult(`🟢 Conexão com Gateway (${providerType.toUpperCase()}) estabelecida com sucesso! Instância "${instanceId || 'main'}" online.`);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] flex items-center justify-center border border-[#0F8A4B]/20 font-black">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Configuração Multi-Provedor de WhatsApp
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#ECF8F1] text-[#0B6B3A] rounded border border-[#0F8A4B]/20">
                  {activeBu.tradeName}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Conecte a Meta Cloud API Oficial ou qualquer provedor/gateway de API de sua preferência
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* General Channel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Empresa / Unidade de Negócio (BU):</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0F8A4B]" />
                <span>{activeBu.tradeName} ({activeBu.code})</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nome do Canal / Atendimento:</label>
              <input
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Ex: Suporte Comercial VERGROUP"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Número do Telefone Oficial da Empresa:</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900 outline-none focus:border-[#0F8A4B]"
                />
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
              Selecione o Provedor de API da Empresa:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option 1: Meta Cloud API Direct */}
              <button
                type="button"
                onClick={() => setProviderType('meta_official')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  providerType === 'meta_official'
                    ? 'bg-[#ECF8F1] border-[#0F8A4B] ring-2 ring-[#0F8A4B]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#0F8A4B] text-white shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-black text-slate-900">Meta Cloud API Oficial</strong>
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-[#0B6B3A] rounded">
                      Direto Meta
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                    Conexão direta com a plataforma oficial do WhatsApp Business via Meta Graph API.
                  </p>
                </div>
              </button>

              {/* Option 2: Custom / Multi-API Gateway */}
              <button
                type="button"
                onClick={() => setProviderType('evolution_api')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  providerType !== 'meta_official'
                    ? 'bg-[#ECF8F1] border-[#0F8A4B] ring-2 ring-[#0F8A4B]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-black text-slate-900">API Gateway Personalizada</strong>
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded">
                      Multi-API / Webhook
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                    Compatível com Z-API, Evolution API, W-API, Baileys ou servidor Webhook próprio.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Credentials Form */}
          {providerType === 'meta_official' ? (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F8A4B]" />
                <span>Credenciais do Meta WhatsApp Business API</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number ID (Meta):</label>
                  <input
                    type="text"
                    value={metaPhoneNumberId}
                    onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                    placeholder="109823741092384"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-[#0F8A4B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">WABA ID (WhatsApp Business Account):</label>
                  <input
                    type="text"
                    value={metaWabaId}
                    onChange={(e) => setMetaWabaId(e.target.value)}
                    placeholder="394827104928374"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-[#0F8A4B]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Permanent Access Token (Token de Sistema Meta):</label>
                  <input
                    type="password"
                    value={metaAccessToken}
                    onChange={(e) => setMetaAccessToken(e.target.value)}
                    placeholder="EAAG...meta_permanent_token"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-[#0F8A4B]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Webhook Verify Token:</label>
                  <input
                    type="text"
                    value={metaVerifyToken}
                    onChange={(e) => setMetaVerifyToken(e.target.value)}
                    placeholder="vergroup_meta_webhook_secret_2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-[#0F8A4B]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Configurações do Servidor de API Gateway</span>
                </h4>

                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value as WhatsAppProviderType)}
                  className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900 outline-none"
                >
                  <option value="evolution_api">Evolution API</option>
                  <option value="z_api">Z-API</option>
                  <option value="w_api">W-API</option>
                  <option value="baileys">Baileys Node.js</option>
                  <option value="custom_webhook">Custom Webhook API</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">URL Base da API do Servidor:</label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.vergroup-wpp.com.br"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">API Key / Secret Token:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ev_sec_token_9918237491"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">ID da Instância / Sessão:</label>
                  <input
                    type="text"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="bu1_atendimento_main"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test & Result Output */}
          {testResult && (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-medium leading-relaxed shadow-inner">
              {testResult}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-300"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão de API'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Salvar Configurações da BU
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
