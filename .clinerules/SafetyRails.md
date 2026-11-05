# Safety Rails

## Things you must never do

### Never multiply unit.pts by item.qty
`unit.pts` is the cost of the FULL starting unit (base_size models), not
per-model. A Dwarf Warriors unit with `pts: 100` and `base_size: 5` costs
100, not 500. Correct calculation lives in `itemCost()` in
`src/lib/calc.js`:

    basePts + extraOpts + (qty - base_size) * pts_per_extra

If you find yourself writing `unit.pts * item.qty` anywhere, stop.

### Never edit `src/data/armies/*.json` by hand for correctness
These files are LLM-generated from PDFs. Hand edits drift from the source
and will be lost on the next `./tools/convert.sh` run. If the data is
wrong, fix `tools/schema_prompt.txt` and re-convert, OR add a post-process
step in `transform.ts`. Hand edits are only acceptable for:
- Adding a custom unit the user designed (e.g. "Dwarf Greek Fire Team")
- Fixing a missing points value after verifying against the PDF

### Never re-number `ArmyOption.id` values
The format is `${unit-id}-opt-${index}`. Saved lists in localStorage
reference these IDs. Changing the format or the index order breaks every
saved list. If the option ordering must change, add a migration in
`storage.js`.

### Never assume `army.units` contains monsters
Monsters live in `armies.monsters.units`, not in any army's unit array.
Anywhere you resolve a unit by ID from `list.items`, you must check both:

    const unit = army.units.find(u => u.id === it.unitId)
              || armies.monsters?.units.find(u => u.id === it.unitId);

If you forget the second half, `itemCost(undefined, ...)` will crash.

### Never trust `points_value` to be a number
For monsters it's `{ wild, bound, allied }`. Always check:

    typeof unit.points_value === 'object'

before treating it as a scalar. `transform.ts` normalizes this into `pts`
(a flat fallback) but `calc.js` needs the raw object for mode-aware pricing.

### Never hardcode colors outside `@media print`
The app has light and dark themes via CSS variables. Hardcoding `#fff` or
`#333` anywhere outside the print block means that element breaks in dark
mode. Use `var(--bg)`, `var(--panel)`, `var(--ink)`, `var(--line)`,
`var(--brass)`, `var(--blood)`, `var(--muted)`, `var(--bad)`.

### Never commit these
- `venv/`, `node_modules/`, `dist/`, `.vite/`
- `pdf_todo/`, `pdf_done/`, `txt_armies/`
- `*.bad.txt` (failed LLM output dumps)
- `.env`, `.env.local`
- Any file containing a GitHub Personal Access Token

If `git status` shows any of these before a commit, stop and check
`.gitignore`.

### Never add a dependency for a solved problem
The app has zero runtime dependencies beyond Svelte itself. Things that
have already been considered and rejected:
- State management library → `$state` + `$derived` is sufficient
- UI component library → custom Svelte components match the theme
- Form validation library → HTML5 validation is enough
- Routing library → single-page app, no routes

If a new dependency is truly needed, justify it in the commit message.

## Things to be careful about

### Printing
`@media print` in `src/app.css` hides `.noprint` elements and shows
`.only-print`. When adding new UI, decide deliberately:
- Should this show in the printed roster? → add `class="only-print"` or
  no class (default visible in print)
- Should this be screen-only? → add `class="noprint"`
- Should this be print-only? → add `class="only-print"`

Use `display: revert` (not `display: block`) to show `.only-print` in print,
so tables keep their table layout.

### Svelte 5 runes
This project uses Svelte 5 runes. Do not use Svelte 4 syntax:
- State: `let x = $state(0)` not `let x = 0` + `$:`
- Derived: `let y = $derived(x * 2)` not `$: y = x * 2`
- Props: `let { foo, bar = 0 } = $props()` not `export let foo`
- Effects: `$effect(() => { ... })` not `$: { ... }` or `onMount`

Svelte 4 syntax will compile but behave unpredictably. If you're unsure,
search for existing patterns in the file you're editing.

### localStorage schema
Saved lists are stored as `{ [listId]: { id, name, army, limit, items } }`.
Each item is `{ uid, unitId, qty, opts: string[], monster_mode?: string }`.
If you change this shape, every user's saved lists break. Add a version
field and a migration function in `storage.js` if you must change it.

### The JSON pipeline
If you change the shape of `RawWarband` in `types/warband.ts`, you must
also update `tools/schema_prompt.txt` so the LLM produces the new shape.
The two must stay in sync. The transform will crash on any JSON that
doesn't match the current `RawWarband` interface.