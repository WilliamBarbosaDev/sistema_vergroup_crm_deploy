import React, { useState } from 'react';
import {
  Shield,
  Building,
  Users,
  CheckCircle2,
  Lock,
  Key,
  ShieldCheck,
  Building2,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AdminView: React.FC = () => {
  const {
    businessUnits,
    departments,
    users,
    currentUser,
    switchUserRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'units' | 'rbac'>('users');

  const rolesList: { role: UserRole; name: string; desc: string; access: string }[] = [
    { role: 'superadmin', name: 'Superadministrador', desc: 'Acesso irrestrito a todas as empresas, configurações globais e auditoria.', access: 'Total' },
    { role: 'director', name: 'Diretor / C-Level', desc: 'Visualização consolidada de todas as BUs, aprovação estratégica e relatórios executivos.', access: 'Global Executivo' },
    { role: 'manager', name: 'Gestor de Unidade / Setor', desc: 'Gestão de funis da sua BU, aprovação de propostas, distribuição e SLA de tarefas.', access: 'Unidade / Setor' },
    { role: 'sales', name: 'Vendedor / SDR / Closer', desc: 'Gestão de leads atribuídos, pipeline comercial, envio de propostas e WhatsApp.', access: 'CRM Próprio / BU' },
    { role: 'operator', name: 'Operador / Técnico / Suporte', desc: 'Execução de tarefas, atendimento a clientes, checklists e time tracking.', access: 'Operações' },
    { role: 'auditor', name: 'Auditor / Compliance / LGPD', desc: 'Visualização somente-leitura de logs de auditoria, históricos e relatórios.', access: 'Somente Leitura' },
  ];

  return (
    <div id="admin-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Administração & Matriz de Governança</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#ECF8F1] text-[#0F8A4B] rounded">
                VERGROUP Corp
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Gestão de empresas do grupo, organograma funcional e controle de acesso RBAC (PRD 5.1 & 7.1)
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#F7F9FA] border border-[#DDE3E8] rounded-md p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Colaboradores ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'units' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Unidades ({businessUnits.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'rbac' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
            }`}
          >
            Matriz de Permissões (RBAC)
          </button>
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#DDE3E8] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
              Usuários e Perfis Ativos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
                <tr>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Cargo / Função</th>
                  <th className="p-3">Departamento</th>
                  <th className="p-3">Papel RBAC</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Simular Papel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F7]">
                {users.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#F7F9FA] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-[#17212B]">
                              {u.name} {isCurrent && <span className="text-[#0F8A4B] text-[10px]">(Você)</span>}
                            </p>
                            <p className="text-[11px] text-[#5F6B76]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#17212B] font-medium">{u.jobTitle}</td>
                      <td className="p-3 text-[#5F6B76]">{dept?.name || 'Geral'}</td>
                      <td className="p-3">
                        <span className="bg-[#ECF8F1] text-[#0F8A4B] uppercase font-bold text-[10px] px-2 py-0.5 rounded border border-[#0F8A4B]/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#0F8A4B] font-bold text-[10px]">● Ativo</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => switchUserRole(u.role)}
                          className="px-2.5 py-1 bg-[#F7F9FA] hover:bg-[#ECF8F1] hover:text-[#0F8A4B] border border-[#DDE3E8] rounded font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Simular como {u.name.split(' ')[0]}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNITS TAB */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessUnits.map((bu) => (
            <div key={bu.id} className="bg-white p-5 rounded-xl border border-[#DDE3E8] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ECF8F1] text-[#0F8A4B] font-bold text-base flex items-center justify-center">
                  {bu.code}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17212B]">{bu.name}</h3>
                  <p className="text-xs text-[#5F6B76]">CNPJ: {bu.cnpj}</p>
                </div>
              </div>
              <p className="text-xs text-[#5F6B76] leading-relaxed">{bu.segment}</p>
              <div className="pt-3 border-t border-[#F0F4F7] flex items-center justify-between text-xs text-[#5F6B76]">
                <span>Status: <strong className="text-[#0F8A4B]">Ativa no Grupo</strong></span>
                <span>Ambiente Seguro</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RBAC MATRIX TAB */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="bg-[#ECF8F1] p-4 rounded-xl border border-[#0F8A4B]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0F8A4B] shrink-0 mt-0.5" />
            <div className="text-xs text-[#17212B]">
              <p className="font-bold">Simulador de Controle de Acesso Baseado em Papéis (RBAC):</p>
              <p className="text-[#5F6B76] mt-0.5">
                Alterne o papel ativo a qualquer momento no cabeçalho ou abaixo para verificar como as telas se adaptam para Vendedores, Gerentes, Diretores e Auditores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesList.map((r) => {
              const isSelected = currentUser.role === r.role;

              return (
                <div
                  key={r.role}
                  className={`bg-white p-4 rounded-xl border shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#0F8A4B] ring-2 ring-[#0F8A4B]/20 bg-[#F7FAF8]' : 'border-[#DDE3E8]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#17212B] uppercase tracking-wider">{r.name}</h4>
                      {isSelected && (
                        <span className="bg-[#0F8A4B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Papel Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5F6B76] leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-[#DDE3E8] flex items-center justify-between">
                    <span className="text-[11px] text-[#5F6B76]">Escopo: <strong>{r.access}</strong></span>
                    <button
                      onClick={() => switchUserRole(r.role)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0F8A4B] text-white'
                          : 'bg-[#F7F9FA] hover:bg-[#EAEFF3] text-[#17212B] border border-[#DDE3E8]'
                      }`}
                    >
                      {isSelected ? 'Ativo' : 'Simular Papel'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
