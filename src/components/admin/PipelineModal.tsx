import React, { useState, useEffect } from 'react';
import { Layers, X, Check, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Pipeline, PipelineType, PipelineStatus } from '../../types';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineToEdit?: Pipeline | null;
}

export const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  pipelineToEdit,
}) => {
  const { businessUnits, departments, addPipeline, updatePipeline, currentUser } = useApp();

  const [businessUnitId, setBusinessUnitId] = useState<string>('bu-tech');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<PipelineType>('sales');
  const [status, setStatus] = useState<PipelineStatus>('active');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  useEffect(() => {
    if (pipelineToEdit) {
      setBusinessUnitId(pipelineToEdit.businessUnitId);
      setDepartmentId(pipelineToEdit.departmentId || '');
      setName(pipelineToEdit.name);
      setDescription(pipelineToEdit.description || '');
      setType(pipelineToEdit.type || 'sales');
      setStatus(pipelineToEdit.status || 'active');
      setIsDefault(pipelineToEdit.isDefault || false);
    } else {
      setBusinessUnitId(businessUnits.find((bu) => !bu.isHolding)?.id || 'bu-tech');
      setDepartmentId('');
      setName('');
      setDescription('');
      setType('sales');
      setStatus('active');
      setIsDefault(false);
    }
  }, [pipelineToEdit, isOpen, businessUnits]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (pipelineToEdit) {
      updatePipeline(pipelineToEdit.id, {
        businessUnitId,
        departmentId: departmentId || undefined,
        name: name.trim(),
        description: description.trim(),
        type,
        status,
        isDefault,
      });
    } else {
      addPipeline({
        businessUnitId,
        departmentId: departmentId || undefined,
        name: name.trim(),
        description: description.trim(),
        type,
        status,
        isDefault,
        stages: [
          { id: `stg-${Date.now()}-1`, name: 'Novo Lead', order: 1, color: '#3B82F6', probability: 20, stageType: 'initial', slaHours: 24 },
          { id: `stg-${Date.now()}-2`, name: 'Qualificação & Diagnóstico', order: 2, color: '#8B5CF6', probability: 50, stageType: 'intermediate', slaHours: 48 },
          { id: `stg-${Date.now()}-3`, name: 'Proposta Comercial', order: 3, color: '#F59E0B', probability: 75, stageType: 'intermediate', slaHours: 48 },
          { id: `stg-${Date.now()}-4`, name: 'Contrato Assinado', order: 4, color: '#0F8A4B', probability: 100, stageType: 'won' },
        ],
        customFields: [],
      });
    }

    onClose();
  };

  const filteredDepartments = departments.filter(
    (d) => d.businessUnitId === businessUnitId || businessUnitId === 'bu-all'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E2E6EA] shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F8FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-display">
                {pipelineToEdit ? 'Editar Estrutura de Pipeline' : '+ Criar Novo Pipeline por Empresa'}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Exclusivo para Administrador Principal (Superadmin)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Empresa (Business Unit) */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Empresa Pertencente (Business Unit) <span className="text-rose-500">*</span>
            </label>
            <select
              value={businessUnitId}
              onChange={(e) => setBusinessUnitId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-[#F5F7F8] text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
              required
            >
              {businessUnits
                .filter((bu) => !bu.isHolding)
                .map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.name} ({bu.code})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 font-normal">
              O pipeline pertence exclusivamente à empresa selecionada com isolamento de acessos.
            </p>
          </div>

          {/* Nome do Pipeline */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Nome do Pipeline / Funil <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pipeline Comercial Enterprise, Onboarding de Clientes..."
              className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Descrição do Processo</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descreva o propósito deste funil de negócios ou operação..."
              className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B] resize-none"
            />
          </div>

          {/* Grid: Tipo & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Tipo de Processo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PipelineType)}
                className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
              >
                <option value="sales">Comercial / Vendas</option>
                <option value="onboarding">Onboarding / Implantação</option>
                <option value="client_success">Sucesso do Cliente (CS)</option>
                <option value="operations">Operacional / Entregas</option>
                <option value="billing">Cobrança & Financeiro</option>
                <option value="projects">Projetos Especializados</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PipelineStatus)}
                className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
              >
                <option value="active">Ativo (Em uso)</option>
                <option value="inactive">Inativo (Arquivado)</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          {/* Departamento Opcional & Check Pipeline Padrão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2E6EA]">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Departamento Responsável</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
              >
                <option value="">Nenhum (Livre para toda a empresa)</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isDefaultPipeline"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#0F8A4B] rounded border-slate-300 accent-[#0F8A4B] cursor-pointer"
              />
              <label htmlFor="isDefaultPipeline" className="font-semibold text-slate-800 cursor-pointer">
                Funil Padrão da Empresa
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E2E6EA] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {pipelineToEdit ? 'Salvar Alterações' : 'Criar Pipeline'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
