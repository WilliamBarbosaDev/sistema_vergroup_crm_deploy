import React, { useState, useEffect } from 'react';
import { CatalogItem, CatalogBillingType } from '../../types';
import { X, Check, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CatalogFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item?: CatalogItem | null;
}

export const CatalogFormDrawer: React.FC<CatalogFormDrawerProps> = ({ isOpen, onClose, item }) => {
  const { businessUnits, catalogItems, setCatalogItems, currentUser, addAuditLog } = useApp();

  const [type, setType] = useState<'product' | 'service'>('product');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('BRL');
  const [billingType, setBillingType] = useState<CatalogBillingType>('monthly');
  const [billingUnit, setBillingUnit] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [businessUnitId, setBusinessUnitId] = useState<string>('bu-all');

  useEffect(() => {
    if (item) {
      setType(item.type);
      setName(item.name);
      setSku(item.sku || '');
      setCategory(item.category);
      setPrice(item.price);
      setCurrency(item.currency);
      setBillingType(item.billingType);
      setBillingUnit(item.billingUnit || '');
      setShortDescription(item.shortDescription || '');
      setFullDescription(item.fullDescription || '');
      setInternalNotes(item.internalNotes || '');
      setStatus(item.status);
      setBusinessUnitId(item.businessUnitId);
    } else {
      // Reset form
      setType('product');
      setName('');
      setSku('');
      setCategory('');
      setPrice(0);
      setCurrency('BRL');
      setBillingType('monthly');
      setBillingUnit('');
      setShortDescription('');
      setFullDescription('');
      setInternalNotes('');
      setStatus('active');
      setBusinessUnitId('bu-all');
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    if (item) {
      // Editar
      const hasPriceChanged = item.price !== price;
      
      const updatedItem: CatalogItem = {
        ...item,
        type,
        name,
        sku,
        category,
        price,
        currency,
        billingType,
        billingUnit,
        shortDescription,
        fullDescription,
        internalNotes,
        status,
        businessUnitId,
        updatedAt: new Date().toISOString(),
      };

      setCatalogItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));

      if (hasPriceChanged) {
        addAuditLog({
          id: `log-catalog-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'catalog.price.changed',
          entityType: 'catalog_item',
          entityId: item.id,
          entityName: name,
          details: `Preço alterado de ${item.currency} ${item.price} para ${currency} ${price}`,
          businessUnitId,
          timestamp: new Date().toISOString(),
        });
      } else {
        addAuditLog({
          id: `log-catalog-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'catalog.item.updated',
          entityType: 'catalog_item',
          entityId: item.id,
          entityName: name,
          details: `Item de catálogo atualizado: ${name}`,
          businessUnitId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Novo
      const newItem: CatalogItem = {
        id: `cat-${Date.now()}`,
        type,
        name,
        sku,
        category,
        price,
        currency,
        billingType,
        billingUnit,
        shortDescription,
        fullDescription,
        internalNotes,
        status,
        businessUnitId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCatalogItems((prev) => [...prev, newItem]);

      addAuditLog({
        id: `log-catalog-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'catalog.item.created',
        entityType: 'catalog_item',
        entityId: newItem.id,
        entityName: name,
        details: `Item de catálogo criado: ${name}`,
        businessUnitId,
        timestamp: new Date().toISOString(),
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none" 
        onClick={onClose}
      >
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-none p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F8A4B] rounded-xl text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  {item ? 'Editar Item do Catálogo' : 'Novo Produto / Serviço'}
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Configure as informações oficiais para uso no CRM.
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

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
          <form id="catalog-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tipo *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all"
                  required
                >
                  <option value="product">Produto</option>
                  <option value="service">Serviço</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Business Unit *</label>
                <select
                  value={businessUnitId}
                  onChange={(e) => setBusinessUnitId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all"
                  required
                >
                  <option value="bu-all">Global (Todas)</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nome Oficial *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consultoria Tributária Plena"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Categoria *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Licenças, Consultoria"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">SKU / Código (Opcional)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: VER-TR-001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all uppercase"
                />
              </div>
            </div>

            <div className="p-4 bg-[#0F8A4B]/5 border border-[#0F8A4B]/20 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-[#0F8A4B] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Precificação Base
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Preço Padrão *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cobrança *</label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] transition-all"
                    required
                  >
                    <option value="unique">Única (One-off)</option>
                    <option value="monthly">Mensal (Recorrente)</option>
                    <option value="yearly">Anual</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>

              {item && (
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  <strong className="text-slate-700">Nota Histórica:</strong> Alterar o preço afetará apenas negócios <strong className="text-slate-700">futuros</strong>. Negócios e faturas já criadas preservam o preço acordado no momento da venda (Snapshot de Preço).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Descrição Comercial Curta</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Resumo que aparecerá na proposta comercial..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0F8A4B] transition-all ${
                    status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <option value="active">🟢 Ativo (Visível no CRM)</option>
                  <option value="inactive">🔴 Inativo / Arquivado</option>
                </select>
              </div>
            </div>

          </form>
        </div>

          <div className="flex-none p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              form="catalog-form"
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0F8A4B] hover:bg-[#0B6B3A] transition shadow-md shadow-emerald-900/10 cursor-pointer text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Salvar Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
