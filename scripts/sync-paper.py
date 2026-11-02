#!/usr/bin/env python3
"""Refresh paper-derived assets. Usage: python3 scripts/sync-paper.py PAPER_DIR."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from PIL import Image

source = Path(sys.argv[1]).resolve()
root = Path(__file__).resolve().parents[1]
assets = root / 'assets'
text = (source / 'Sections/experiments.tex').read_text()
main_table = text.split(r'\label{tab:main-results}', 1)[1].split(r'\end{table}', 1)[0]
method_names = ['MeZO', 'MeZO-Adam', 'MeZO-SVRG', 'LOZO', 'HiZOO', 'LOREN', 'ENGINE']
rows = []
for line in main_table.splitlines():
    if '&' not in line:
        continue
    name, *cells = line.split('&')
    name = name.strip()
    if r'\Engine' in name:
        name = 'ENGINE'
    if name not in method_names:
        continue
    values = []
    for cell in cells:
        match = re.search(r'\d+\.\d+', cell)
        assert match, cell
        values.append(float(match[0]))
    assert len(values) == 10
    rows.append((name, values))
assert len(rows) == 14
models = []
for index, (name, dataset, tasks) in enumerate([
    ('GPT-2-XL', 'GLUE / FP32', ['MNLI','QNLI','SST-2','CoLA']),
    ('OPT-2.7B', 'GLUE / FP32', ['MNLI','QNLI','SST-2','CoLA']),
    ('LLaMA-3-8B', 'SuperGLUE / BF16', ['RTE','BoolQ','WiC','CB']),
    ('OPT-13B', 'SuperGLUE / BF16', ['RTE','BoolQ','WiC','CB']),
]):
    group = rows[:7] if index < 2 else rows[7:]
    start = (index % 2) * 5
    models.append({'name': name, 'dataset': dataset, 'tasks': tasks,
                   'rows': [{'method': method, 'values': vals[start:start+5]} for method, vals in group]})
(assets/'results.json').write_text(json.dumps(models, indent=2) + '\n')
with tempfile.TemporaryDirectory() as temp:
    for name in ['concept', 'speedup-convergence', 'gpt2xl_1x3_valacc']:
        output = str(Path(temp)/name)
        subprocess.run(['pdftoppm', '-scale-to', '2200', '-singlefile', '-png', str(source/'images'/f'{name}.pdf'), output], check=True)
        with Image.open(output+'.png') as im:
            im.convert('RGB').save(assets/f'{name}.webp', quality=90)
pdf = source/'Engine-2026-0502.pdf'
assert pdf.read_bytes().startswith(b'%PDF-')
shutil.copy2(pdf, assets/'ENGINE.pdf')
commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
metadata = {'paper_commit': commit, 'table_source': 'Sections/experiments.tex, tab:main-results',
            'pdf_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
            'notes': ['Means and averages are preserved as printed in the source table.',
                      'CoLA uses MCC x 100. Other task columns use accuracy in percent.',
                      'Unfinished CoLA ablation results are not included.']}
(assets/'provenance.json').write_text(json.dumps(metadata, indent=2)+'\n')
print('Refreshed 4 model tables, 3 figures, and the paper PDF.')
