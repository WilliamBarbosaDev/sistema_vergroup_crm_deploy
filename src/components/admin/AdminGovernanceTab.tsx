import React from 'react';
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Workflow,
  GitBranch,
  ScrollText,
  Lock,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CAPABILITIES_REGISTRY } from '../../services/permissionEngine';

export const AdminGovernanceTab: React.FC = () => {
  const { currentUser, businessUnits, users, pipelines, catalogItems, importJobs, auditLogs } = useApp();

  const isSuperadmin = currentUser.role === 'superadmin' || currentUser.isSuperadmin;
  const adminScopeLabel = isSuperadmin
    ? 'Global da plataforma'
    : businessUnits.find((bu) => bu.id === currentUser.primaryBusinessUnitId)?.tradeName ||
      businessUnits.find((bu) => bu.id === currentUser.primaryBusinessUnitId)?.name ||
      'Business Unit autorizada';

  const adminCapabilityGroups = CAPABILITIES_REGISTRY.filter((cap) =>
    [
      'Administração de Usuários',
      'Governança Operacional',
      'Pipelines & Funis',
      'Catálogo Comercial',
      'Importações',
      'Agenda & Reuniões',
      'Comunicação Interna',
      'Automações',
      'Administração & BUs',
    ].includes(cap.module)
  );

  const authorityLevels = [
    {
      title: 'Superadmin',
      scope: 'Toda a plataforma',
      summary: 'Configura BUs, roles, permissões, integrações, módulos, pipelines globais, catálogo, importações e auditoria global.',
    },
    {
      title: 'Administrador de BU',
      scope: 'Business Unit sob responsabilidade',
      summary: 'Administra usuários, departamentos, projetos, CRM, pipelines, catálogo, calendário, grupos, automações e importações da própria BU.',
    },
    {
      title: 'Gestor com capability',
      scope: 'Área, departamento ou equipe',
      summary: 'Recebe poderes delegados pelo Permission Engine para operar configurações específicas sem ultrapassar privilege ceiling.',
    },
    {
      title: 'Usuário comum',
      scope: 'Recursos próprios ou atribuídos',
      summary: 'Opera dentro das permissões recebidas e não altera role, BU, departamento, gestor, permissões ou escopo.',
    },
  ];

  const operationalAreas = [
    ['Usuários e convites', users.length, 'users.update'],
    ['Business Units e departamentos', businessUnits.length, 'organization.manage'],
    ['Pipelines e etapas', pipelines.length, 'pipelines.manage'],
    ['Produtos e serviços', catalogItems.length, 'catalog.manage'],
    ['Importações', importJobs.length, 'imports.manage'],
    ['Logs e auditoria', auditLogs.length, 'audit.read'],
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F8A4B]" />
                Governança Administrativa
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Administradores autorizados configuram a operação. Código-fonte continua no fluxo de desenvolvimento e deploy.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#ECF8F1] text-[#0F8A4B] border border-[#0F8A4B]/20 text-[10px] font-black uppercase">
              Escopo: {adminScopeLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {authorityLevels.map((level) => (
              <div key={level.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-900">{level.title}</h3>
                  <span className="text-[10px] font-black uppercase text-slate-500">{level.scope}</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 leading-relaxed mt-2">{level.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs text-white space-y-4">
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-300" />
              Limite Seguro
            </h3>
            <p className="text-xs text-slate-300 font-semibold mt-1 leading-relaxed">
              O Admin altera regras, permissões, workflows, estruturas, integrações e parâmetros operacionais. O painel não executa comandos Git arbitrários nem edita código-fonte.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-[11px] font-bold">
            {[
              'Privilege Ceiling obrigatório',
              'Escopo por Business Unit',
              'Delegação via Permission Engine',
              'Audit Log para alteração relevante',
              'Deploy futuro apenas por integração segura e auditada',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F8A4B]" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#0F8A4B]" />
          Áreas Administráveis da Operação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {operationalAreas.map(([label, count, capability]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{label}</span>
                <span className="text-lg font-black text-[#0F8A4B]">{count}</span>
              </div>
              <span className="inline-flex mt-2 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-500">
                {capability}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0F8A4B]" />
              Delegação por Capability
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Superadmin/Admin de BU pode conceder permissões específicas sem entregar acesso global.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            {adminCapabilityGroups.length} capabilities administrativas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-black">
              <tr>
                <th className="p-3">Módulo</th>
                <th className="p-3">Capability</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Escopo padrão</th>
                <th className="p-3">Escopos permitidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminCapabilityGroups.map((cap) => (
                <tr key={cap.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-700">{cap.module}</td>
                  <td className="p-3 font-mono font-black text-[#0F8A4B]">{cap.capability}</td>
                  <td className="p-3 font-bold text-slate-900">{cap.actionName}</td>
                  <td className="p-3 font-mono text-slate-600">{cap.defaultScope}</td>
                  <td className="p-3 text-slate-500 font-semibold">{cap.allowedScopes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#0F8A4B]" />
            Auditoria Obrigatória
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
            {[
              'permission.changed',
              'role.changed',
              'user.updated',
              'pipeline.updated',
              'catalog.updated',
              'integration.updated',
              'automation.updated',
              'organization.updated',
            ].map((event) => (
              <span key={event} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                {event}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-semibold text-slate-500">
            Cada alteração deve registrar ator, objeto, antes, depois, data/hora, Business Unit e correlation_id.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#0F8A4B]" />
            Atualizações do Sistema
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><span className="text-[10px] font-black uppercase text-slate-500">Versão</span><strong className="block text-slate-900">1.0.0</strong></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><span className="text-[10px] font-black uppercase text-slate-500">Ambiente</span><strong className="block text-slate-900">Local / Vite</strong></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><span className="text-[10px] font-black uppercase text-slate-500">Deploy</span><strong className="block text-slate-900">Somente leitura</strong></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><span className="text-[10px] font-black uppercase text-slate-500">Saúde</span><strong className="block text-[#0F8A4B]">Build validado</strong></div>
          </div>
          <p className="text-[11px] font-semibold text-slate-500">
            Deploy controlado futuro deve usar integração segura, escopo explícito e auditoria. Sem shell, Git arbitrário ou edição de código pelo navegador.
          </p>
        </section>
      </div>
    </div>
  );
};
