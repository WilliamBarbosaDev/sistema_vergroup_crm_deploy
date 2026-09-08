import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CatalogItem, DealItem } from '../../types';
import { X, Search, Plus, Package } from 'lucide-react';

interface DealCatalogSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  businessUnitId: string;
  onSelect: (item: Omit<DealItem, 'id' | 'addedAt'>) => void;
}

export const DealCatalogSelector: React.FC<DealCatalogSelectorProps> = ({
  isOpen,
  onClose,
  businessUnitId,
  onSelect,
}) => {
  const { catalogItems, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const availableItems = catalogItems.filter(
    (c) =>
      c.status === 'active' &&
      (c.businessUnitId === 'bu-all' || c.businessUnitId === businessUnitId) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sku && c.sku.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSelect = (catalogItem: CatalogItem) => {
    // Retorna o item básico, o DealDetailDrawer cuidará de gerar o ID e quantity/discount
    onSelect({
      catalogItemId: catalogItem.id,
      name: catalogItem.name,
      basePrice: catalogItem.price,
      negotiatedPrice: catalogItem.price,
      quantity: 1,
      discount: 0,
      subtotal: catalogItem.price,
      billingType: catalogItem.billingType,
      addedByUserId: currentUser.id,
      notes: catalogItem.shortDescription,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" /> Adicionar Produto / Serviço
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Busque no catálogo oficial para inserir neste negócio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, SKU ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 custom-scrollbar">
          {availableItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium text-sm">
              Nenhum item encontrado no catálogo para esta busca ou Business Unit.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 p-2">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.type === 'product' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.type === 'product' ? 'Produto' : 'Serviço'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{item.category}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{item.name}</h4>
                    {item.shortDescription && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.shortDescription}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-slate-900">
                        {item.currency} {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        {item.billingType === 'unique' ? 'Único' : item.billingType}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(item)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
