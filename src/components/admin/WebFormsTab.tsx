import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  Copy,
  Eye,
  FileBadge2,
  Globe2,
  GripVertical,
  Link2,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Type,
  Mail,
  Phone,
  MessageSquareText,
  ChevronDown,
} from 'lucide-react';
import { BusinessUnit, Company, Lead, User } from '../../types';

const STORAGE_KEY = 'vergroup_webforms_v1';
const SUBMISSIONS_KEY = 'vergroup_webform_submissions_v1';

type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select';
type CaptureAs = 'leadName' | 'email' | 'phone' | 'companyName' | 'jobTitle' | 'message' | 'custom';

type WebFormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  captureAs: CaptureAs;
  options: string[];
};

type WebForm = {
  id: string;
  name: string;
  description: string;
  businessUnitId: string;
  companyId: string;
  status: 'draft' | 'active';
  successMessage: string;
  submitLabel: string;
  fields: WebFormField[];
  createdAt: string;
  updatedAt: string;
};

type WebFormSubmission = {
  id: string;
  formId: string;
  formName: string;
  businessUnitId: string;
  companyId: string;
  companyName: string;
  leadId?: string;
  leadName?: string;
  email?: string;
  payload: Record<string, string>;
  source: 'preview' | 'embed';
  createdAt: string;
};

type WebFormsTabProps = {
  currentUser: User;
  businessUnits: BusinessUnit[];
  companies: Company[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addAuditLog: (action: any, entity: string, entityId: string, description: string) => void;
};

const blankField = (type: FieldType = 'text'): WebFormField => ({
  id: `field-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  label: type === 'email' ? 'E-mail' : type === 'phone' ? 'Telefone' : 'Campo personalizado',
  type,
  placeholder: type === 'email' ? 'nome@empresa.com' : type === 'phone' ? '(11) 99999-9999' : 'Digite aqui',
  required: true,
  captureAs: type === 'email' ? 'email' : type === 'phone' ? 'phone' : 'custom',
  options: type === 'select' ? ['Opção 1', 'Opção 2'] : [],
});

const createBlankForm = (currentUser: User, companies: Company[]): WebForm => ({
  id: `form-${Date.now()}`,
  name: 'Novo formulário de captação',
  description: 'Formulário padrão para inserir em site, landing page ou campanha.',
  businessUnitId: currentUser.primaryBusinessUnitId || currentUser.businessUnitIds?.[0] || '',
  companyId: companies[0]?.id || '',
  status: 'draft',
  successMessage: 'Obrigado! Recebemos seu contato e a equipe comercial vai falar com você em breve.',
  submitLabel: 'Enviar',
  fields: [
    { id: 'name', label: 'Nome', type: 'text', placeholder: 'Seu nome completo', required: true, captureAs: 'leadName', options: [] },
    { id: 'email', label: 'E-mail', type: 'email', placeholder: 'nome@empresa.com', required: true, captureAs: 'email', options: [] },
    { id: 'phone', label: 'Telefone', type: 'phone', placeholder: '(11) 99999-9999', required: true, captureAs: 'phone', options: [] },
    { id: 'message', label: 'Mensagem', type: 'textarea', placeholder: 'Conte rapidamente sua necessidade', required: false, captureAs: 'message', options: [] },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const normalizeForm = (form: WebForm): WebForm => ({
  ...form,
  fields: form.fields.length > 0 ? form.fields : createBlankForm({} as User, []).fields,
});

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const makeSnippet = (form: WebForm) => {
  const payload = {
    id: form.id,
    name: form.name,
    businessUnitId: form.businessUnitId,
    companyId: form.companyId,
    submitUrl: `${window.location.origin}/api/webforms/submit`,
    successMessage: form.successMessage,
    fields: form.fields,
  };

  return `<script src="${window.location.origin}/webforms/embed.js" data-vergroup-form='${escapeHtml(JSON.stringify(payload))}' defer></script>`;
};

export const WebFormsTab: React.FC<WebFormsTabProps> = ({ currentUser, businessUnits, companies, addLead, addAuditLog }) => {
  const isSuperadmin = currentUser.role === 'superadmin' || (currentUser as User & { isSuperadmin?: boolean }).isSuperadmin;

  const [forms, setForms] = useState<WebForm[]>(() => {
    if (typeof window === 'undefined') return [createBlankForm(currentUser, companies)];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as WebForm[];
      } catch {
        return [createBlankForm(currentUser, companies)];
      }
    }
    return [createBlankForm(currentUser, companies)];
  });

  const [submissions, setSubmissions] = useState<WebFormSubmission[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(SUBMISSIONS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as WebFormSubmission[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || '');
  const [draft, setDraft] = useState<WebForm>(forms[0] || createBlankForm(currentUser, companies));
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<'snippet' | 'preview' | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    const firstForm = forms[0];
    if (!selectedFormId && firstForm) {
      setSelectedFormId(firstForm.id);
      setDraft(firstForm);
    }
  }, [forms, selectedFormId]);

  useEffect(() => {
    const current = forms.find((form) => form.id === selectedFormId);
    if (current) setDraft(current);
  }, [forms, selectedFormId]);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    draft.fields.forEach((field) => {
      defaults[field.id] = field.captureAs === 'leadName' ? 'Marina Costa' : field.captureAs === 'email' ? 'marina.costa@empresa.com' : field.captureAs === 'phone' ? '(11) 98888-7777' : field.type === 'select' ? field.options[0] || '' : 'Conteúdo de teste';
    });
    setPreviewValues(defaults);
  }, [draft.id]);

  const selectedCompany = companies.find((company) => company.id === draft.companyId);
  const filteredCompanies = useMemo(() => {
    if (isSuperadmin) return companies;
    const permittedBuIds = currentUser.businessUnitIds?.length ? currentUser.businessUnitIds : [currentUser.primaryBusinessUnitId];
    return companies.filter((company) => permittedBuIds.includes(company.businessUnitId));
  }, [companies, currentUser, isSuperadmin]);

  const filteredBusinessUnits = useMemo(() => {
    if (isSuperadmin) return businessUnits;
    return businessUnits.filter((bu) => bu.id === currentUser.primaryBusinessUnitId || currentUser.businessUnitIds.includes(bu.id));
  }, [businessUnits, currentUser, isSuperadmin]);

  const visibleForms = useMemo(() => {
    return forms
      .filter((form) => {
        const company = companies.find((item) => item.id === form.companyId);
        const bu = businessUnits.find((item) => item.id === form.businessUnitId);
        const term = searchTerm.toLowerCase();
        const searchable = [form.name, form.description, company?.tradeName || company?.name || '', bu?.tradeName || bu?.name || ''].join(' ').toLowerCase();
        if (!term) return true;
        return searchable.includes(term);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [businessUnits, companies, forms, searchTerm]);

  const activeCount = forms.filter((form) => form.status === 'active').length;
  const leadCount = submissions.filter((submission) => submission.leadId).length;

  const newForm = () => {
    const blank = createBlankForm(currentUser, filteredCompanies);
    setSelectedFormId('');
    setDraft(blank);
  };

  const loadForm = (form: WebForm) => {
    setSelectedFormId(form.id);
    setDraft(form);
  };

  const updateField = (fieldId: string, updates: Partial<WebFormField>) => {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addField = (type: FieldType = 'text') => {
    setDraft((prev) => ({
      ...prev,
      fields: [...prev.fields, blankField(type)],
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeField = (fieldId: string) => {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
      updatedAt: new Date().toISOString(),
    }));
  };

  const reorderField = (fieldId: string, direction: 'up' | 'down') => {
    setDraft((prev) => {
      const index = prev.fields.findIndex((field) => field.id === fieldId);
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.fields.length) return prev;
      const next = [...prev.fields];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return { ...prev, fields: next, updatedAt: new Date().toISOString() };
    });
  };

  const saveForm = () => {
    if (!draft.name.trim()) return;
    const payload = {
      ...draft,
      businessUnitId: draft.businessUnitId || currentUser.primaryBusinessUnitId,
      companyId: draft.companyId || filteredCompanies[0]?.id || companies[0]?.id || '',
      updatedAt: new Date().toISOString(),
      createdAt: draft.createdAt || new Date().toISOString(),
    };

    setForms((prev) => {
      const exists = prev.some((form) => form.id === draft.id);
      if (exists) {
        return prev.map((form) => (form.id === draft.id ? payload : form));
      }
      const newId = draft.id || `form-${Date.now()}`;
      const next = { ...payload, id: newId };
      setSelectedFormId(newId);
      return [next, ...prev];
    });
    setDraft(payload);
    addAuditLog('update', 'automation', payload.id, `Formulário web "${payload.name}" salvo`);
  };

  const duplicateForm = () => {
    const duplicated: WebForm = {
      ...draft,
      id: `form-${Date.now()}`,
      name: `${draft.name} (Cópia)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setForms((prev) => [duplicated, ...prev]);
    setSelectedFormId(duplicated.id);
    setDraft(duplicated);
    addAuditLog('create', 'automation', duplicated.id, `Formulário web duplicado a partir de "${draft.name}"`);
  };

  const deleteForm = () => {
    if (!selectedFormId) return;
    const target = forms.find((form) => form.id === selectedFormId);
    setForms((prev) => prev.filter((form) => form.id !== selectedFormId));
    setSubmissions((prev) => prev.filter((submission) => submission.formId !== selectedFormId));
    setDraft(createBlankForm(currentUser, filteredCompanies));
    setSelectedFormId('');
    if (target) addAuditLog('delete', 'automation', target.id, `Formulário web "${target.name}" removido`);
  };

  const simulateCapture = () => {
    const company = companies.find((item) => item.id === draft.companyId) || filteredCompanies[0];
    const leadName = previewValues[draft.fields.find((field) => field.captureAs === 'leadName')?.id || draft.fields[0]?.id] || 'Lead via formulário';
    const email = previewValues[draft.fields.find((field) => field.captureAs === 'email')?.id || ''];
    const phone = previewValues[draft.fields.find((field) => field.captureAs === 'phone')?.id || ''];
    const payload = draft.fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.label] = previewValues[field.id] || '';
      return acc;
    }, {});

    const leadId = `lead-${Date.now()}`;
    addLead({
      businessUnitId: draft.businessUnitId || currentUser.primaryBusinessUnitId,
      title: `${draft.name} - ${company?.tradeName || company?.name || 'Novo lead'}`,
      name: leadName || 'Lead sem nome',
      email: email || 'nao-informado@vergroup.local',
      phone: phone || '(00) 00000-0000',
      source: 'website',
      status: 'new',
      companyId: company?.id,
      companyName: company?.tradeName || company?.name,
      assignedUserId: currentUser.id,
      notes: `Lead captado via formulário web "${draft.name}".\n\nDados recebidos:\n${Object.entries(payload)
        .map(([label, value]) => `- ${label}: ${value || '—'}`)
        .join('\n')}`,
    });

    setSubmissions((prev) => [
      {
        id: `submission-${Date.now()}`,
        formId: draft.id,
        formName: draft.name,
        businessUnitId: draft.businessUnitId,
        companyId: company?.id || '',
        companyName: company?.tradeName || company?.name || '',
        leadId,
        leadName,
        email,
        payload,
        source: 'preview',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    addAuditLog('create', 'lead', leadId, `Lead captado via formulário web "${draft.name}"`);
  };

  const copySnippet = async () => {
    await navigator.clipboard.writeText(makeSnippet(draft));
    setCopied('snippet');
    window.setTimeout(() => setCopied(null), 1600);
  };

  const copyEmbedUrl = async () => {
    const url = `${window.location.origin}/webforms/embed.js`;
    await navigator.clipboard.writeText(url);
    setCopied('preview');
    window.setTimeout(() => setCopied(null), 1600);
  };

  const currentForm = forms.find((form) => form.id === selectedFormId) || draft;
  const currentCompany = companies.find((company) => company.id === currentForm.companyId);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Formulários web de captação</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
                {activeCount} ativos
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                {leadCount} leads capturados
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Crie formulários com seleção de empresa, gere o script de inserção para o site e teste a captura direto no CRM sem depender de banco de dados nesta fase.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={newForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo formulário
          </button>
          <button
            onClick={copyEmbedUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            URL do embed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-5">
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-900">Formulários</h3>
                <p className="text-[11px] text-slate-500">Selecione um formulário para editar.</p>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Limpar
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar formulário ou empresa"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>

            <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
              {visibleForms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 bg-slate-50">
                  Nenhum formulário encontrado com esse filtro.
                </div>
              ) : visibleForms.map((form) => {
                const company = companies.find((item) => item.id === form.companyId);
                const active = form.id === currentForm.id;
                return (
                  <button
                    key={form.id}
                    onClick={() => loadForm(form)}
                    className={`w-full text-left rounded-2xl border p-3 transition-all ${
                      active
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{form.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${form.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {form.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{form.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                            <Building2 className="w-3 h-3" />
                            {company?.tradeName || company?.name || 'Sem empresa'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                            <BadgeCheck className="w-3 h-3" />
                            {form.fields.length} campos
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${active ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <p className="text-[10px] uppercase tracking-wide font-black text-slate-500">Formulários</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{forms.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <p className="text-[10px] uppercase tracking-wide font-black text-slate-500">Submissões</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{submissions.length}</p>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900">{draft.name || 'Novo formulário'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${draft.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {draft.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Defina empresa, campos e o comportamento de captura.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={duplicateForm}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={deleteForm}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={saveForm}
                    className="px-4 py-2 rounded-xl bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-xs font-black transition-colors inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Nome do formulário</span>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value, updatedAt: new Date().toISOString() }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Status</span>
                  <select
                    value={draft.status}
                    onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as WebForm['status'], updatedAt: new Date().toISOString() }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Descrição</span>
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value, updatedAt: new Date().toISOString() }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Empresa (BU)</span>
                  <select
                    value={draft.businessUnitId}
                    onChange={(event) => {
                      const businessUnitId = event.target.value;
                      const companiesInBu = companies.filter((company) => company.businessUnitId === businessUnitId);
                      setDraft((prev) => ({
                        ...prev,
                        businessUnitId,
                        companyId: companiesInBu[0]?.id || '',
                        updatedAt: new Date().toISOString(),
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    {filteredBusinessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>{bu.tradeName || bu.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Empresa específica</span>
                  <select
                    value={draft.companyId}
                    onChange={(event) => setDraft((prev) => ({ ...prev, companyId: event.target.value, updatedAt: new Date().toISOString() }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    {companies
                      .filter((company) => company.businessUnitId === draft.businessUnitId)
                      .map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.tradeName || company.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Mensagem de sucesso</span>
                  <input
                    value={draft.successMessage}
                    onChange={(event) => setDraft((prev) => ({ ...prev, successMessage: event.target.value, updatedAt: new Date().toISOString() }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">Campos do formulário</h4>
                  <p className="text-[11px] text-slate-500">Adicione campos, reordene e mapeie cada entrada para o CRM.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addField('text')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200">
                    <Type className="w-4 h-4" /> Texto
                  </button>
                  <button onClick={() => addField('email')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200">
                    <Mail className="w-4 h-4" /> E-mail
                  </button>
                  <button onClick={() => addField('phone')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200">
                    <Phone className="w-4 h-4" /> Telefone
                  </button>
                  <button onClick={() => addField('textarea')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200">
                    <MessageSquareText className="w-4 h-4" /> Área de texto
                  </button>
                  <button onClick={() => addField('select')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200">
                    <ChevronDown className="w-4 h-4" /> Select
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {draft.fields.map((field, index) => (
                  <div key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                        <GripVertical className="w-4 h-4" />
                        Campo {index + 1}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => reorderField(field.id, 'up')} className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 disabled:opacity-30" disabled={index === 0}>
                          ↑
                        </button>
                        <button onClick={() => reorderField(field.id, 'down')} className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 disabled:opacity-30" disabled={index === draft.fields.length - 1}>
                          ↓
                        </button>
                        <button onClick={() => removeField(field.id)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700">
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="space-y-1 md:col-span-2">
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Rótulo</span>
                        <input
                          value={field.label}
                          onChange={(event) => updateField(field.id, { label: event.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Tipo</span>
                        <select
                          value={field.type}
                          onChange={(event) => updateField(field.id, { type: event.target.value as FieldType })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="text">Texto</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Telefone</option>
                          <option value="textarea">Área de texto</option>
                          <option value="select">Select</option>
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Mapear para CRM</span>
                        <select
                          value={field.captureAs}
                          onChange={(event) => updateField(field.id, { captureAs: event.target.value as CaptureAs })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="custom">Campo customizado</option>
                          <option value="leadName">Nome do lead</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Telefone</option>
                          <option value="companyName">Nome da empresa</option>
                          <option value="jobTitle">Cargo / função</option>
                          <option value="message">Mensagem</option>
                        </select>
                      </label>

                      <label className="space-y-1 md:col-span-2">
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Placeholder</span>
                        <input
                          value={field.placeholder}
                          onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      </label>
                    </div>

                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">Opções do select</span>
                        <div className="flex flex-wrap gap-2">
                          {field.options.map((option, optionIndex) => (
                            <input
                              key={`${field.id}-${optionIndex}`}
                              value={option}
                              onChange={(event) => {
                                const nextOptions = [...field.options];
                                nextOptions[optionIndex] = event.target.value;
                                updateField(field.id, { options: nextOptions });
                              }}
                              className="min-w-[140px] flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          ))}
                          <button
                            onClick={() => updateField(field.id, { options: [...field.options, `Opção ${field.options.length + 1}`] })}
                            className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                          >
                            + opção
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Preview do formulário</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Essa prévia representa o formulário que o visitante verá no site. Use para validar campos, textos e a captura direta no CRM.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Snippet</p>
                    <p className="text-xs font-bold text-slate-900">Embed com configuração embutida</p>
                  </div>
                  <button
                    onClick={copySnippet}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                    {copied === 'snippet' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl bg-slate-950 text-slate-100 text-[11px] leading-relaxed p-3 whitespace-pre-wrap border border-slate-800">
                  {makeSnippet(draft)}
                </pre>
              </div>

              <div className="space-y-3">
                {draft.fields.map((field) => (
                  <label key={`preview-${field.id}`} className="block space-y-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">{field.label}</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={previewValues[field.id] || ''}
                        onChange={(event) => setPreviewValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={previewValues[field.id] || ''}
                        onChange={(event) => setPreviewValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        <option value="">Selecione</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={previewValues[field.id] || ''}
                        onChange={(event) => setPreviewValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                        type={field.type === 'phone' ? 'tel' : field.type}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder={field.placeholder}
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                onClick={simulateCapture}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white text-sm font-black transition-colors"
              >
                <BadgeCheck className="w-4 h-4" />
                Testar captação no CRM
              </button>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950">
                <p className="font-black uppercase tracking-wide text-emerald-700">Vínculo atual</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-bold">{currentCompany?.tradeName || currentCompany?.name || 'Sem empresa'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-bold">{draft.fields.length} campos</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 font-bold">{draft.status === 'active' ? 'Publicado' : 'Rascunho'}</span>
                </div>
                <p className="leading-relaxed">Quando o botão de teste é acionado, o lead entra no CRM já associado à empresa selecionada.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Últimas captações</h3>
                  <p className="text-[11px] text-slate-500">Submissões testadas e enviadas via embed.</p>
                </div>
                <div className="text-[11px] font-bold text-slate-500 inline-flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  Atualizado em memória local
                </div>
              </div>

              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-xs text-slate-500">
                    Ainda não há captações. Use o botão de teste para criar o primeiro lead.
                  </div>
                ) : submissions.slice(0, 6).map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900">{submission.formName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">{submission.source}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{submission.leadName || 'Lead captado'} · {submission.email || 'sem e-mail'}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{new Date(submission.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.leadId ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Lead criado
                        </span>
                      ) : null}
                      <button
                        onClick={copyEmbedUrl}
                        className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        Copiar URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900">Como usar</h3>
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-900 mb-1">1. Configure a empresa</p>
                  <p>Escolha a BU e a empresa que deve receber os leads deste formulário.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-900 mb-1">2. Gere o script</p>
                  <p>Cole o snippet no site. O script do embed fica em <span className="font-mono">/webforms/embed.js</span>.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-900 mb-1">3. Teste a captura</p>
                  <p>Use o preview ao lado para validar a experiência e criar um lead real de teste no CRM.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
                <p className="font-black uppercase tracking-wide text-emerald-700 mb-1">Estado atual</p>
                <p>
                  {isSuperadmin ? 'Visão global habilitada para superadmin.' : 'Visão limitada às empresas vinculadas ao usuário atual.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
