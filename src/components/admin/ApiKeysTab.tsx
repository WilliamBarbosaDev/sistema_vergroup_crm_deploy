export default function ApiKeysTab() {
  const fields = [
    'id',
    'organizationId',
    'businessUnitId',
    'userId',
    'applicationName',
    'name',
    'scopes',
    'environment',
    'status',
    'keyPrefix',
    'secretLast4',
    'lastUsedAt',
    'createdByUserId',
    'createdByName',
    'revokedAt',
    'createdAt',
    'updatedAt',
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">API Keys</p>
        <h2 className="mt-2 text-sm font-black text-slate-900 uppercase tracking-[0.18em]">Estrutura pronta para receber chaves</h2>
        <p className="mt-2 text-sm text-slate-600 font-medium max-w-3xl">
          Nada é salvo aqui por enquanto. Esta tela só deixa o sistema preparado para receber e vincular chaves no banco depois, sem expor segredo em tela nem gravar valor em localStorage.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-700">Campos já previstos</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {fields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-700">Pronto para integração</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
            <li>• ligar com Supabase quando a API estiver definida</li>
            <li>• criar/editar/revogar sem mostrar segredo salvo</li>
            <li>• filtrar por empresa, BU e usuário dono</li>
            <li>• registrar uso e auditoria depois da ativação</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
