import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditView: React.FC = () => {
  const {
    auditLogs,
    users,
    businessUnits,
    filterByBU,
  } = useApp();

  const filteredLogs = filterByBU(auditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');

  const displayedLogs = filteredLogs.filter((log) => {
    if (selectedUser !== 'all' && log.userId !== selectedUser) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Unidade', 'Ação', 'Entidade', 'ID da Entidade', 'Detalhes'];
    const rows = displayedLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${users.find((u) => u.id === l.userId)?.name || l.userId}"`,
      `"${businessUnits.find((b) => b.id === l.businessUnitId)?.name || l.businessUnitId}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_vergroup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="audit-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Trilha Imutável de Auditoria & Conformidade</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {displayedLogs.length} eventos registrados
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Registro completo e auditável de alterações, criações, exclusões e acessos LGPD (PRD 5.5 & 7.2)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#DDE3E8] hover:bg-[#F7F9FA] text-[#17212B] rounded-md text-xs font-semibold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#5F6B76]" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#DDE3E8] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#5F6B76]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ação, entidade ou detalhes..."
            className="w-full bg-transparent outline-none text-[#17212B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#5F6B76]" />
          <span className="text-[#5F6B76] font-medium">Usuário:</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-2 py-1 border border-[#DDE3E8] rounded bg-white outline-none cursor-pointer"
          >
            <option value="all">Todos os Usuários</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F9FA] border-b border-[#DDE3E8] text-[#5F6B76] font-semibold">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Colaborador</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Entidade</th>
                <th className="p-3">Detalhes do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F7]">
              {displayedLogs.map((log) => {
                const user = users.find((u) => u.id === log.userId);
                const bu = businessUnits.find((b) => b.id === log.businessUnitId);

                return (
                  <tr key={log.id} className="hover:bg-[#F7F9FA] transition-colors">
                    <td className="p-3 font-mono text-[#5F6B76]">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR')}{' '}
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="p-3 font-semibold text-[#17212B]">{user?.name || log.userId}</td>
                    <td className="p-3 text-[#5F6B76]">{bu?.name || 'Todas'}</td>
                    <td className="p-3">
                      <span className="font-mono bg-[#F7F9FA] border border-[#DDE3E8] px-1.5 py-0.5 rounded text-[10px] text-[#17212B]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 uppercase font-semibold text-[#0F8A4B] text-[10px]">
                      {log.entityType}
                    </td>
                    <td className="p-3 text-[#5F6B76] max-w-md truncate">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
