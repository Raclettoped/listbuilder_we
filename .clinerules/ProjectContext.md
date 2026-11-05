# Project Context: Erehwon Listbuilder

## Purpose
A local-first army list builder for Warlords of Erehwon, a fantasy tabletop
wargame by Rick Priestley. The app lets players build warbands from 23+ army
lists, manage points totals, add wargear, and print rosters.

Data comes from official PDFs (Warlords of Erehwon warband lists), converted
to JSON via a local LLM pipeline.

## Tech Stack
- Framework: Svelte 5 (runes mode — $state, $derived, $props, $effect)
- Build: Vite 8
- Language: TypeScript for data layer (`src/data/armies/*.ts`), JavaScript
  for runtime logic (`src/lib/*.js`), Svelte for UI
- Persistence: localStorage (`src/lib/storage.js`)
- No test framework currently
- No server. Runs entirely client-side.

## Key Files

### Data layer
- `src/data/armies/index.ts` — auto-discovers all warband JSONs via
  `import.meta.glob`, calls `toArmy()` on each
- `src/data/armies/transform.ts` — parses raw JSON into the flat `ArmyUnit`
  shape the UI consumes (computes `base_size`, `max_size`, `pts_per_extra`,
  `is_monster`)
- `src/data/armies/types/warband.ts` — TypeScript interfaces for both raw
  (`RawWarband`, `RawUnit`, ...) and transformed (`Army`, `ArmyUnit`,
  `ArmyOption`, `MonsterPoints`) shapes
- `src/data/armies/*.json` — 23+ warband data files. Each follows `RawWarband`.

### Runtime logic
- `src/lib/calc.js` — `itemCost(unit, item)` and `countOf(items, unitId)`.
  THE source of truth for points math.
- `src/lib/storage.js` — localStorage read/write for saved lists
- `src/lib/theme.js` — light/dark theme toggle, persists to localStorage

### UI
- `src/App.svelte` — top-level layout, army dropdown, save/print toolbar,
  the single `list` state object
- `src/lib/UnitPicker.svelte` — left column: shows available units,
  monster allies as collapsible section
- `src/lib/ArmyList.svelte` — right column: shows the current army list
  with qty controls, wargear checkboxes, monster mode dropdown, and the
  printable stats table

### PDF pipeline (offline, not part of the deployed app)
- `tools/convert.sh` — processes PDFs from `pdf_todo/`, writes JSON to
  `src/data/armies/`, archives PDFs to `pdf_done/`
- `tools/txt2json.py` — calls Ollama (Qwen 3.5) with a schema prompt
- `tools/schema_prompt.txt` — the prompt that tells the LLM the target shape

## Entry Points
- Dev server: `npm run dev` (Vite, port 5173 or 5174)
- Build: `npm run build` → output to `dist/`
- Deploy: `git push` → GitHub Actions → GitHub Pages

## External Dependencies (local dev only)
- Ollama running at `http://localhost:11434` with model `qwen3.5:latest`
- `pdftotext` (poppler-utils) for PDF text extraction
- Python venv at `venv/` with the `ollama` and `pymupdf` packages

## Directory conventions
- `pdf_todo/` — inbox for PDFs waiting to be converted (gitignored)
- `pdf_done/` — archive of converted PDFs (gitignored)
- `txt_armies/` — intermediate text extractions (gitignored)
- `pdf_armies/` — legacy source PDF folder (partially gitignored)
- Never commit `venv/`, `node_modules/`, `*.bad.txt`

## Domain vocabulary
- **Warband** — an army list (e.g. Dwarfs, Undead). Field `warband` in JSON.
- **Unit** — one purchasable entry (e.g. "Dwarf Lord"). Has profiles,
  options, points cost.
- **Profile** — a stat line within a unit (e.g. "1 x Dwarf Bodyguard").
  Multiple profiles per unit represent a leader + followers.
- **base_size** — starting model count for a unit, derived from the sum of
  "N x" prefixes in profile names (e.g. "1 x Leader" + "4 x Warriors" = 5)
- **max_size** — base_size + any "Add up to N" upgrades found in options
- **pts_per_extra** — cost per additional model beyond base_size (from
  "Add up to N @Xpts each")
- **is_monster** — true only for units in the Monsters warband that have
  tiered pricing ({wild, bound, allied})
- **monster_mode** — the chosen tier for a monster in a list: 'wild',
  'bound', or 'allied'