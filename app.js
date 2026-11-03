const methodSteps = [
  { label: 'COARSE PHASE', title: 'Spend queries in a smaller space.', description: 'Represent the update with low-rank factors B and A. Sample in r(m + n) coordinates instead of mn full-space coordinates, and maintain a compact curvature model for each branch.', formula: 'ΔW = BA <span class="formula-divider">·</span> d<sub>c</sub> = r(m + n)', note: 'The dimension-dependent variance bound decreases under comparable gradient and preconditioning scales.' },
  { label: 'VMS-EO CORRECTION', title: 'Bring the missing curvature back.', description: 'Preconditioning before restriction and preconditioning after restriction produce different coarse directions. Their difference defines the subgrid correction, which supplies fine-scale feedback to the coarse update.', formula: 'τ<sub>sgs</sub> = ℛ(Σ<sub>f</sub>G) − Σ<sub>c</sub>ℛ(G)', note: 'The two directions live in the same coarse coordinate space. Branch-specific mixing weights control the correction strength.' },
  { label: 'FINE PHASE', title: 'Let the operator evolve with the model.', description: 'Merge the low-rank update into the full weights and perform full-space optimization. Transfer momentum and curvature information between phases, with periodic fine probes refreshing the operator during coarse optimization.', formula: 'Coarse <span class="formula-divider">⇄</span> Fine', note: 'The V-cycle couples the two scales as training changes the curvature. The reported C60F60 schedule alternates 60 coarse and 60 fine epochs.' }
];
function selectTab(buttons, selected, callback) {
  buttons.forEach(button => {
    const active = button === selected;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  callback(selected);
}
function wireTabs(selector, callback) {
  const buttons = Array.from(document.querySelectorAll(selector));
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(buttons, button, callback));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      buttons[next].focus();
      selectTab(buttons, buttons[next], callback);
    });
  });
}
wireTabs('[data-step]', button => {
  const step = methodSteps[Number(button.dataset.step)];
  document.getElementById('step-panel').setAttribute('aria-labelledby', button.id);
  document.getElementById('step-label').textContent = step.label;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-description').textContent = step.description;
  document.getElementById('step-formula').innerHTML = step.formula;
  document.getElementById('step-note').textContent = step.note;
});
function renderModel(model, index) {
  const table = document.getElementById('results-table');
  table.querySelector('caption').textContent = `Main results for ${model.name}`;
  const header = document.createElement('tr');
  ['Method', ...model.tasks, 'Avg.'].forEach(name => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = name;
    header.append(th);
  });
  table.querySelector('thead').replaceChildren(header);
  const maxima = model.rows[0].values.map((_, col) => Math.max(...model.rows.map(row => row.values[col])));
  const rows = model.rows.map(row => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = row.method;
    if (row.method === 'ENGINE') {
      tr.className = 'engine-row';
      const badge = document.createElement('span');
      badge.textContent = 'OURS';
      th.append(badge);
    }
    tr.append(th);
    row.values.forEach((value, col) => {
      const td = document.createElement('td');
      td.textContent = value.toFixed(1);
      if (value === maxima[col]) td.className = 'best';
      tr.append(td);
    });
    return tr;
  });
  table.querySelector('tbody').replaceChildren(...rows);
  document.getElementById('dataset-label').textContent = model.dataset;
  document.getElementById('results-panel').setAttribute('aria-labelledby', `model-tab-${index}`);
}
async function loadResults() {
  try {
    const response = await fetch('assets/results.json');
    if (!response.ok) throw new Error('Results unavailable');
    const models = await response.json();
    renderModel(models[0], 0);
    wireTabs('[data-model]', button => renderModel(models[Number(button.dataset.model)], Number(button.dataset.model)));
  } catch {
    document.getElementById('results-panel').innerHTML = '<p>The results table could not be loaded. Please <a class="text-link" href="https://arxiv.org/abs/2611.03293">read the main table in the paper</a>.</p>';
  }
}
loadResults();
document.getElementById('copy-citation').addEventListener('click', async () => {
  const code = document.getElementById('bibtex');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'Citation copied.';
    document.getElementById('copy-citation').textContent = 'Copied ✓';
    setTimeout(() => { document.getElementById('copy-citation').textContent = 'Copy citation ⧉'; }, 2500);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});
const dialog = document.getElementById('figure-dialog');
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  document.getElementById('dialog-image').src = button.dataset.zoom;
  document.getElementById('dialog-image').alt = button.querySelector('img').alt;
  document.getElementById('dialog-caption').textContent = button.dataset.caption;
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
