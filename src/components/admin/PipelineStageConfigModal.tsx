import React, { useState } from 'react';
import {
  Layers,
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sliders,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ListTodo,
  FileCode,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Pipeline,
  PipelineStage,
  StageType,
  CustomFieldType,
  PipelineCustomField,
} from '../../types';

interface PipelineStageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline;
}

export const PipelineStageConfigModal: React.FC<PipelineStageConfigModalProps> = ({
  isOpen,
  onClose,
  pipeline,
}) => {
  const {
    addPipelineStage,
    updatePipelineStage,
    reorderPipelineStages,
    deletePipelineStage,
    addPipelineCustomField,
    updatePipelineCustomField,
    deletePipelineCustomField,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stages' | 'custom_fields'>('stages');

  // New Stage Form State
  const [stageName, setStageName] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [stageColor, setStageColor] = useState('#3B82F6');
  const [stageType, setStageType] = useState<StageType>('intermediate');
  const [stageProbability, setStageProbability] = useState(50);
  const [stageSlaHours, setStageSlaHours] = useState(48);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  // New Custom Field Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldIsRequired, setFieldIsRequired] = useState(false);

  if (!isOpen) return null;

  const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);

  // Handle Stage Submit
  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    if (editingStageId) {
      updatePipelineStage(pipeline.id, editingStageId, {
        name: stageName.trim(),
        description: stageDescription.trim(),
        color: stageColor,
        stageType,
        probability: Number(stageProbability),
        slaHours: Number(stageSlaHours),
      });
      setEditingStageId(null);
    } else {
      addPipelineStage(pipeline.id, {
        name: stageName.trim(),
        description: stageDescription.trim(),
        order: sortedStages.length + 1,
        color: stageColor,
        stageType,
        probability: Number(stageProbability),
        slaHours: Number(stageSlaHours),
      });
    }

    setStageName('');
    setStageDescription('');
    setStageColor('#3B82F6');
    setStageType('intermediate');
    setStageProbability(50);
    setStageSlaHours(48);
  };

  const handleEditStageClick = (stg: PipelineStage) => {
    setEditingStageId(stg.id);
    setStageName(stg.name);
    setStageDescription(stg.description || '');
    setStageColor(stg.color);
    setStageType(stg.stageType || 'intermediate');
    setStageProbability(stg.probability);
    setStageSlaHours(stg.slaHours || 48);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedStages.length) return;

    const ids = sortedStages.map((s) => s.id);
    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    reorderPipelineStages(pipeline.id, ids);
  };

  const handleDeleteStage = (stgId: string) => {
    const res = deletePipelineStage(pipeline.id, stgId);
    if (!res.success) {
      alert(res.error);
    }
  };

  // Handle Custom Field Submit
  const handleSaveCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !fieldKey.trim()) return;

    addPipelineCustomField({
      pipelineId: pipeline.id,
      name: fieldName.trim(),
      internalKey: fieldKey.trim().toLowerCase().replace(/\s+/g, '_'),
      fieldType,
      description: fieldDescription.trim(),
      isRequired: fieldIsRequired,
      position: (pipeline.customFields || []).length + 1,
      isVisible: true,
      isEditable: true,
    });

    setFieldName('');
    setFieldKey('');
    setFieldType('text');
    setFieldDescription('');
    setFieldIsRequired(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E2E6EA] shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F8FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 font-display">
                  Configuração de Etapas & Regras: {pipeline.name}
                </h2>
                <span className="text-[10px] font-mono bg-emerald-50 text-[#0B6B3A] border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                  {pipeline.stages.length} Etapas
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Ordenação por posição (sort_order), SLAs em horas, tipos semânticos e campos obrigatórios
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

        {/* Tab Switcher */}
        <div className="px-6 border-b border-[#E2E6EA] flex items-center gap-4 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stages'
                ? 'border-[#0F8A4B] text-[#0B6B3A] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Etapas & SLAs ({sortedStages.length})
          </button>

          <button
            onClick={() => setActiveTab('custom_fields')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom_fields'
                ? 'border-[#0F8A4B] text-[#0B6B3A] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Campos Personalizados do Pipeline ({pipeline.customFields?.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* TAB 1: STAGES CONFIGURATOR */}
          {activeTab === 'stages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Stages List (Drag/Order) */}
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Etapas do Funil (Ordenadas por Posição)
                </p>

                <div className="space-y-2">
                  {sortedStages.map((stg, idx) => (
                    <div
                      key={stg.id}
                      className="p-3 bg-[#F8FAFB] border border-[#E2E6EA] rounded-lg flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveStage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Mover para Cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveStage(idx, 'down')}
                            disabled={idx === sortedStages.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Mover para Baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: stg.color }}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-semibold">{stg.name}</strong>
                            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                              #{stg.order}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              stg.stageType === 'won'
                                ? 'bg-emerald-100 text-[#0B6B3A]'
                                : stg.stageType === 'lost'
                                ? 'bg-rose-100 text-rose-700'
                                : stg.stageType === 'initial'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {stg.stageType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                            SLA: <strong>{stg.slaHours || 48}h</strong> • Probabilidade: <strong>{stg.probability}%</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditStageClick(stg)}
                          className="p-1.5 text-slate-500 hover:text-[#0F8A4B] hover:bg-white rounded cursor-pointer"
                          title="Editar Etapa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stg.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                          title="Excluir Etapa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Stage Form */}
              <div className="lg:col-span-5 bg-[#F8FAFB] p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 font-display">
                  {editingStageId ? 'Editar Etapa Selecionada' : '+ Adicionar Nova Etapa'}
                </h3>

                <form onSubmit={handleSaveStage} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Nome da Etapa *</label>
                    <input
                      type="text"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="Ex: Proposta Enviada, Reunião Agendada..."
                      className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Tipo Semântico *</label>
                      <select
                        value={stageType}
                        onChange={(e) => setStageType(e.target.value as StageType)}
                        className="w-full px-2.5 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      >
                        <option value="initial">Inicial</option>
                        <option value="intermediate">Intermediária</option>
                        <option value="won">Ganha (Won)</option>
                        <option value="lost">Perdida (Lost)</option>
                        <option value="completed">Concluída</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Cor da Etapa</label>
                      <input
                        type="color"
                        value={stageColor}
                        onChange={(e) => setStageColor(e.target.value)}
                        className="w-full h-8 p-0.5 border border-[#E2E6EA] rounded-lg bg-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">SLA Limite (Horas)</label>
                      <input
                        type="number"
                        value={stageSlaHours}
                        onChange={(e) => setStageSlaHours(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Probabilidade %</label>
                      <input
                        type="number"
                        value={stageProbability}
                        onChange={(e) => setStageProbability(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {editingStageId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStageId(null);
                          setStageName('');
                        }}
                        className="btn-secondary w-full"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn-primary w-full"
                    >
                      {editingStageId ? 'Salvar Etapa' : 'Adicionar Etapa'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: CUSTOM FIELDS CONFIGURATOR */}
          {activeTab === 'custom_fields' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Existing Custom Fields Table */}
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Campos Personalizados Cadastrados
                </p>

                <div className="space-y-2">
                  {(pipeline.customFields || []).map((field) => (
                    <div
                      key={field.id}
                      className="p-3 bg-[#F8FAFB] border border-[#E2E6EA] rounded-lg flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-semibold">{field.name}</strong>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded font-bold">
                            key: {field.internalKey}
                          </span>
                          {field.isRequired && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tipo: <strong>{field.fieldType}</strong> • {field.description || 'Sem descrição'}
                        </p>
                      </div>

                      <button
                        onClick={() => deletePipelineCustomField(field.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                        title="Remover Campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(!pipeline.customFields || pipeline.customFields.length === 0) && (
                    <p className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-[#E2E6EA] rounded-lg">
                      Nenhum campo personalizado cadastrado para este pipeline.
                    </p>
                  )}
                </div>
              </div>

              {/* Add Custom Field Form */}
              <div className="lg:col-span-5 bg-[#F8FAFB] p-4 rounded-xl border border-[#E2E6EA] space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 font-display">
                  + Adicionar Campo Personalizado
                </h3>

                <form onSubmit={handleSaveCustomField} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Nome do Campo *</label>
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => {
                        setFieldName(e.target.value);
                        setFieldKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                      }}
                      placeholder="Ex: Faturamento Anual, Canal de Mídia..."
                      className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Chave Interna *</label>
                      <input
                        type="text"
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.target.value)}
                        placeholder="ex: faturamento_anual"
                        className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-mono outline-none focus:border-[#0F8A4B]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Tipo de Dado *</label>
                      <select
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                        className="w-full px-2.5 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                      >
                        <option value="text">Texto Simples</option>
                        <option value="long_text">Texto Longo</option>
                        <option value="number">Número</option>
                        <option value="currency">Moeda (R$)</option>
                        <option value="percent">Percentual (%)</option>
                        <option value="date">Data</option>
                        <option value="datetime">Data / Hora</option>
                        <option value="select">Seleção Única</option>
                        <option value="multiselect">Múltipla Seleção</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="user">Usuário</option>
                        <option value="company">Empresa</option>
                        <option value="contact">Contato</option>
                        <option value="phone">Telefone</option>
                        <option value="email">E-mail</option>
                        <option value="url">URL / Link</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Descrição / Instrução</label>
                    <input
                      type="text"
                      value={fieldDescription}
                      onChange={(e) => setFieldDescription(e.target.value)}
                      placeholder="Orientação para o preenchimento..."
                      className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isRequiredCheck"
                      checked={fieldIsRequired}
                      onChange={(e) => setFieldIsRequired(e.target.checked)}
                      className="w-4 h-4 text-[#0F8A4B] rounded border-slate-300 accent-[#0F8A4B] cursor-pointer"
                    />
                    <label htmlFor="isRequiredCheck" className="font-semibold text-slate-800 cursor-pointer">
                      Campo Obrigatório no Funil
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full mt-2"
                  >
                    Adicionar Campo Personalizado
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E2E6EA] flex items-center justify-end bg-[#F8FAFB]">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Concluir Configuração
          </button>
        </div>

      </div>
    </div>
  );
};
