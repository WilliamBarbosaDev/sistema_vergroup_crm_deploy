import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CatalogItem } from '../../types';
import { Plus, Search, Package, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { CatalogFormDrawer } from './CatalogFormDrawer';

export const CatalogTab: React.FC = () => {
  const { catalogItems, businessUnits, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBU, setSelectedBU] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Filtros
  const filteredItems = catalogItems.filter((item) => {
    // Admin BU check (Privilege Ceiling)
    if (currentUser.role !== 'SUPERADMIN') {
      if (item.businessUnitId !== 'bu-all' && item.businessUnitId !== currentUser.businessUnitId) {
        return false;
      }
    }

    const matchSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchBU = selectedBU === 'all' || item.businessUnitId === selectedBU;
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchSearch && matchBU && matchStatus;
  });

  const getBUName = (id: string) => {
    if (id === 'bu-all') return 'Global';
    return businessUnits.find((b) => b.id === id)?.name || 'Desconhecida';
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0F8A4B]" />
            Catálogo Comercial
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestão oficial de produtos e serviços disponíveis no CRM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar item, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] w-full lg:w-64"
            />
          </div>

          <select
            value={selectedBU}
            onChange={(e) => setSelectedBU(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]"
          >
            <option value="all">Todas as BUs</option>
            <option value="bu-all">Global</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F8A4B]"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#0F8A4B] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0B6B3A] transition shadow-md shadow-emerald-900/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-black text-slate-900">Nenhum produto ou serviço cadastrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Inicie a montagem do seu portfólio oficial para que sua equipe comercial possa gerar negócios rastreáveis.
            </p>
            <button
              onClick={handleCreate}
              className="mt-6 flex items-center gap-2 text-[#0F8A4B] font-bold hover:bg-emerald-50 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Cadastrar primeiro produto/serviço
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider">Tipo / Categoria</th>
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider">Preço Base</th>
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider">Business Unit</th>
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.sku && <div className="text-xs font-mono text-slate-400 mt-0.5">{item.sku}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'product' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.type === 'product' ? 'Produto' : 'Serviço'}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">{item.category}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-900">
                        {item.currency} {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs font-medium text-slate-500 capitalize">
                        {item.billingType === 'unique' ? 'Único' : item.billingType}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                        {getBUName(item.businessUnitId)}
                      </div>
                    </td>
                    <td className="p-4">
                      {item.status === 'active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                          <XCircle className="w-4 h-4" /> Inativo
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#0F8A4B] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CatalogFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={editingItem}
      />
    </div>
  );
};
