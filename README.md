# ENGINE project website

English research project page for **ENGINE: Endogenous Variational MultiScale Optimization for Zeroth-Order LLM Fine-Tuning**, NeurIPS 2026.

- Paper: https://arxiv.org/abs/2611.03293
- Website: https://dominator-index.github.io/ENGINE-website/
- Official implementation: https://github.com/AI4Science-WestlakeU/ENGINE

## Preview

No build step or frontend dependencies are needed.

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Use an HTTP server so the interactive results table can load its JSON data.

## Contents

- `index.html`: paper overview, method, theory, results, and citation
- `style.css`: responsive warm-white, terracotta, and blue visual design
- `app.js`: method tabs, model switching, figure enlargement, and citation copying
- `assets/results.json`: all four model blocks from the paper's main table
- `assets/ENGINE.pdf`: compiled manuscript
- `assets/provenance.json`: manuscript commit and PDF hash

The figures and numerical results come from the manuscript. The hero diagram is a conceptual illustration, not a measured loss landscape. The theory section distinguishes ideal exact correction from the approximate correction studied in the paper. CoLA ablation results awaiting reruns are omitted.

## Refresh manuscript assets

Requires Python, Pillow, and Poppler (`pdftoppm`). The input manuscript must already be compiled.

```sh
python3 scripts/sync-paper.py /path/to/NeurIPS2026-ENGINE
```

This regenerates the main results JSON, WebP figures, PDF, and provenance file. Preserve the source table's reported averages and metric definitions. Manually review website prose when the paper changes.

## Publishing

GitHub Pages serves the root of the `main` branch. Push site updates to `main` to trigger publication.

Author and figure attribution remains with the paper's authors. This repository does not grant additional rights to the manuscript or its figures.
