(() => {
  const script = document.currentScript;
  if (!script) return;

  const raw = script.getAttribute('data-vergroup-form') || '{}';
  let config;

  try {
    config = JSON.parse(raw);
  } catch (error) {
    console.error('[VERGROUP webform] Invalid form config', error);
    return;
  }

  const fields = Array.isArray(config.fields) ? config.fields : [];
  const submitUrl = config.submitUrl || '';
  const successMessage = config.successMessage || 'Obrigado! Recebemos sua mensagem.';

  const root = document.createElement('div');
  root.className = 'vergroup-webform-root';
  root.innerHTML = `
    <style>
      .vergroup-webform-root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:100%;}
      .vergroup-webform-card{box-sizing:border-box;background:#fff;border:1px solid #dbe4ec;border-radius:18px;padding:20px;box-shadow:0 12px 30px rgba(15,23,42,.08);color:#0f172a}
      .vergroup-webform-title{font-size:18px;font-weight:800;line-height:1.2;margin:0 0 6px}
      .vergroup-webform-desc{font-size:13px;line-height:1.5;color:#475569;margin:0 0 18px}
      .vergroup-webform-field{margin:0 0 14px}
      .vergroup-webform-label{display:block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin:0 0 6px;color:#334155}
      .vergroup-webform-input,.vergroup-webform-select,.vergroup-webform-textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font:inherit;font-size:14px;background:#fff;color:#0f172a;outline:none;transition:border-color .15s,box-shadow .15s}
      .vergroup-webform-input:focus,.vergroup-webform-select:focus,.vergroup-webform-textarea:focus{border-color:#34c36b;box-shadow:0 0 0 3px rgba(52,195,107,.15)}
      .vergroup-webform-textarea{min-height:108px;resize:vertical}
      .vergroup-webform-button{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:12px;padding:12px 16px;background:#0f8a4b;color:#fff;font-size:14px;font-weight:800;cursor:pointer;transition:background .15s,transform .15s}
      .vergroup-webform-button:hover{background:#0b6b3a;transform:translateY(-1px)}
      .vergroup-webform-success{display:none;margin-top:14px;padding:12px 14px;border-radius:12px;background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;font-size:13px;font-weight:600;line-height:1.45}
      .vergroup-webform-helper{margin-top:10px;font-size:12px;color:#64748b}
      .vergroup-webform-error{display:none;margin-top:14px;padding:12px 14px;border-radius:12px;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;font-size:13px;font-weight:600;line-height:1.45}
    </style>
    <div class="vergroup-webform-card">
      <h3 class="vergroup-webform-title">${escapeHtml(config.name || 'Formulário de contato')}</h3>
      <p class="vergroup-webform-desc">${escapeHtml(config.description || 'Receba os dados direto no CRM.')}</p>
      <form class="vergroup-webform-form"></form>
      <div class="vergroup-webform-success">${escapeHtml(successMessage)}</div>
      <div class="vergroup-webform-error"></div>
      <div class="vergroup-webform-helper">Powered by VERGROUP CRM</div>
    </div>
  `;

  const form = root.querySelector('.vergroup-webform-form');
  const successBox = root.querySelector('.vergroup-webform-success');
  const errorBox = root.querySelector('.vergroup-webform-error');
  const helperBox = root.querySelector('.vergroup-webform-helper');

  const buildField = (field) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'vergroup-webform-field';

    const label = document.createElement('label');
    label.className = 'vergroup-webform-label';
    label.textContent = field.label || 'Campo';

    let control;
    if (field.type === 'textarea') {
      control = document.createElement('textarea');
      control.className = 'vergroup-webform-textarea';
    } else if (field.type === 'select') {
      control = document.createElement('select');
      control.className = 'vergroup-webform-select';
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Selecione';
      control.appendChild(empty);
      (field.options || []).forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        control.appendChild(opt);
      });
    } else {
      control = document.createElement('input');
      control.className = 'vergroup-webform-input';
      control.type = field.type === 'phone' ? 'tel' : field.type || 'text';
    }

    control.name = field.id || field.label || `field-${Math.random().toString(16).slice(2)}`;
    control.placeholder = field.placeholder || '';
    if (field.required) control.required = true;

    label.appendChild(control);
    wrapper.appendChild(label);
    return wrapper;
  };

  fields.forEach((field) => {
    if (!field || !field.label) return;
    form.appendChild(buildField(field));
  });

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'vergroup-webform-button';
  button.textContent = config.submitLabel || 'Enviar';
  form.appendChild(button);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.style.display = 'none';
    successBox.style.display = 'none';
    helperBox.textContent = 'Enviando...';

    const data = {};
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      if (input.name) data[input.name] = input.value;
    });

    try {
      if (submitUrl) {
        const response = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: config.id,
            businessUnitId: config.businessUnitId,
            companyId: config.companyId,
            payload: data,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      successBox.style.display = 'block';
      helperBox.textContent = 'Enviado com sucesso.';
      form.reset();
      window.dispatchEvent(new CustomEvent('vergroup:webform:submitted', { detail: { formId: config.id, data } }));
    } catch (error) {
      errorBox.textContent = 'Não foi possível enviar agora. Verifique o endpoint configurado para o embed.';
      errorBox.style.display = 'block';
      helperBox.textContent = 'Falha no envio.';
      console.error('[VERGROUP webform] Submit failed', error);
    }
  });

  script.insertAdjacentElement('afterend', root);

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
