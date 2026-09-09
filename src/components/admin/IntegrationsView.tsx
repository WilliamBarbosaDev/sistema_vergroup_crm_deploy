import { useState } from 'react';
import { cn } from '../../lib/utils';
import ApiKeysTab from './ApiKeysTab';

const tabs = [
  { id: 'api-keys', label: 'API Keys' },
  { id: 'webhooks-out', label: 'Webhooks - Saída' },
  { id: 'webhooks-in', label: 'Webhooks - Entrada' },
  { id: 'connectors', label: 'Conectores' },
] as const;

type IntegrationTab = (typeof tabs)[number]['id'];

function PlaceholderTab({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
        <h2 className="mt-2 text-sm font-black text-slate-900 uppercase tracking-[0.18em]">Estrutura preparada</h2>
        <p className="mt-2 text-sm text-slate-600 font-medium max-w-3xl">{description}</p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 shadow-2xs">
        <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-700">O que entra depois</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
          {bullets.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function IntegrationsView() {
  const [currentTab, setCurrentTab] = useState<IntegrationTab>('api-keys');

  return (
    <div className="px-8 py-6 space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Admin</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Integrações</h1>
        <p className="mt-2 text-sm text-slate-600 font-medium max-w-3xl">
          Tela deixada pronta para receber dados reais depois. Nada é salvo aqui agora.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold border transition-colors',
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {currentTab === 'api-keys' && <ApiKeysTab />}
        {currentTab === 'webhooks-out' && (
          <PlaceholderTab
            title="Webhooks - Saída"
            description="Espaço reservado para configurar eventos de saída, destino, headers e assinatura."
            bullets={[
              'nome da integração',
              'URL de destino',
              'eventos monitorados',
              'segredo/assinatura mascarados',
              'tentativas, status e auditoria',
            ]}
          />
        )}
        {currentTab === 'webhooks-in' && (
          <PlaceholderTab
            title="Webhooks - Entrada"
            description="Espaço reservado para endpoints que recebem eventos externos com validação de assinatura."
            bullets={[
              'slug do endpoint',
              'eventos aceitos',
              'schema do payload',
              'status ativo/inativo',
              'último recebimento e erros',
            ]}
          />
        )}
        {currentTab === 'connectors' && (
          <PlaceholderTab
            title="Conectores"
            description="Espaço reservado para integrações com sistemas externos e filas de sincronização."
            bullets={[
              'origem e destino do conector',
              'credenciais criptografadas no backend',
              'mapeamento de campos',
              'sincronização manual e automática',
              'logs e reprocessamento',
            ]}
          />
        )}
      </div>
    </div>
  );
}
