# Code Style

## General principles
- Match what already exists. If a file uses 2-space indentation, use 2
  spaces. If it uses `const`, don't introduce `let` for immutability.
- Prefer explicit over clever. A slightly longer function that reads
  plainly is better than a one-liner that needs decoding.
- Small, focused files. If a `.svelte` file passes ~250 lines, split it.
- No dead code, no commented-out blocks, no TODO placeholders that ship.

## Naming

### Files
- Svelte components: `PascalCase.svelte` (`ArmyList.svelte`, `UnitPicker.svelte`)
- TypeScript modules: `camelCase.ts` (`transform.ts`) or `types/*.ts` for
  interfaces
- JavaScript logic: `camelCase.js` (`calc.js`, `storage.js`, `theme.js`)
- Data files: `kebab-case-vN.M.json` matching the source PDF name
  (`erehwon-dwarfs-warband-v2.0.json`)

### Identifiers
- Variables: `camelCase`
- Functions: `camelCase` and verb-first (`getBaseSize`, `itemCost`,
  `applyTheme`, `normalizeProfile`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants (`STORAGE_KEY`,
  `MODEL`, `OLLAMA_URL`)
- Types / Interfaces: `PascalCase` (`ArmyUnit`, `RawWarband`,
  `MonsterPoints`)
- Svelte props: `snake_case` for data that mirrors the JSON (`base_size`,
  `max_size`, `pts_per_extra`), `camelCase` for pure UI state (`printStats`)

The snake_case/camelCase split is deliberate: it visually distinguishes
"this comes from the JSON" from "this is app state". Don't unify them.

## TypeScript

### Prefer `interface` over `type` for object shapes
Interfaces are easier to extend and produce clearer errors:

    export interface ArmyUnit { ... }  // preferred
    export type ArmyUnit = { ... }     // only for unions or mapped types

### Prefer `??` over `||` for defaults
`??` only falls back on `null`/`undefined`, which is almost always what
you want:

    const max = u.max ?? 1;          // correct
    const max = u.max || 1;          // WRONG — treats 0 as falsy

The only time `||` is acceptable is when `0`, `''`, or `false` are also
invalid values you want to replace. Document this if you use it.

### Prefer strict null checks to guessing
If a field might be null, make it explicit in the type:

    points_value?: number | MonsterPoints | null;

Then guard at the call site:

    if (pv == null) { ... }

Don't rely on `!` non-null assertions. They lie when the data doesn't match.

### Type casts are a red flag
`as RawWarband` in `index.ts` is required because `import.meta.glob` doesn't
know the JSON shape. That's fine. But if you find yourself casting in
`transform.ts`, that means the raw data shape is drifting. Fix the type or
the data, not the cast.

## JavaScript

### Pure functions where possible
`calc.js` functions take input and return output. No side effects, no
reading from `localStorage`, no DOM access. This keeps them testable (if
tests are added) and predictable.

### Two-space indentation, semicolons, single quotes
Existing files use this convention. Don't introduce a different style in
a new file. If you want to change style, run Prettier across the whole
codebase in a single commit.

### Async is explicit
Prefer `async`/`await` over `.then()` chains:

    // preferred
    const data = await response.json();

    // avoid
    response.json().then(data => { ... });

### Error messages
When throwing, say what failed and where:

    // preferred
    throw new Error(`Unknown monster tier: ${tier}`);

    // avoid
    throw new Error('Invalid');

## Svelte

### Use `$props()` destructuring with defaults
Always give defaults for optional props so components don't crash on
missing data:

    let { units, monsters = [], items, onadd } = $props();

### Use `$derived` for computed values, not `$effect`
`$effect` is for side effects (localStorage, `document.*`, external APIs).
Anything that's a pure function of state should be `$derived`:

    let total = $derived(list.items.reduce(...));   // correct
    let total = $state(0);
    $effect(() => { total = list.items.reduce(...); });  // WRONG

### Bind where it helps, callbacks where it doesn't
For input/select, `bind:value` is idiomatic. For button clicks that modify
parent state, pass a callback (`onclick={() => onqty(it, 1)}`).

### Don't put styles in `<style>` blocks unless they're component-local
Global styles (layout, theme, print) live in `src/app.css`. Only truly
component-local styles go in a `<style>` block — and only if they don't
depend on theme variables. This keeps theme switching working.

### Extract repeated blocks into `{@const}` or helpers
If a Svelte template repeats the same computation three times, hoist it:

    {#each units as u (u.id)}
      {@const entryCount = items.filter(i => i.unitId === u.id).length}
      ...
      {#if entryCount > 0}...{/if}
    {/each}

## CSS

### CSS variables, never hardcoded colors
Defined in `src/app.css` under `:root` (light) and `[data-theme="dark"]`.
Use `var(--panel)`, not `#faf4e4`.

### Class naming
Plain `kebab-case` (`.monster-group`, `.stats-table`). No BEM, no utility
classes (Tailwind-style) unless a specific utility is reused 5+ times.

### Print overrides live in `@media print`, not inline
If you need different styles when printing, add to the existing
`@media print` block. Don't scatter `@media print` rules throughout the file.

### Prefer `gap` over margins for flex/grid children
Grid and flexbox layouts should use `gap`, not per-child `margin`:

    .wrap { display: grid; gap: 20px; }   // preferred
    .wrap > * { margin-right: 20px; }     // avoid

## Comments

### Explain WHY, not WHAT
Code already says what it does. Comments should say why it's done that way:

    // Correct: explains the non-obvious
    // base_size is the sum of profile counts because leaders and followers
    // are separate profiles. "1 x Leader" + "4 x Warriors" = 5 models.
    const base_size = profiles.reduce(...);

    // Wrong: just repeats the code
    // Loop over profiles and sum the counts
    const base_size = profiles.reduce(...);

### Prefix workarounds with the reason
If code is doing something odd because of a bug or limitation, note it:

    // Ollama returns an empty response if num_ctx is too small — the model
    // spends its entire budget on the prompt without emitting output.
    "num_ctx": 32768,

### No decorative comments
Don't write:

    // ===== Helper functions =====

The function names already say what they are. File structure should be
readable without section headers.

## Commits

### Format
Single-line subject under 72 chars. No period. Imperative mood:

    Fix monster mode dropdown showing stale price
    Add Greek Fire Team custom unit
    Bump num_ctx to fix Reptilians truncation

### Body when needed
If the commit needs explanation, add a blank line then a short paragraph:

    Bump num_ctx to fix Reptilians truncation

    The 16384 context was too small for PDFs with 14K+ input tokens,
    leaving almost no budget for JSON output. 32768 fixes it.

### One concern per commit
Don't mix "fix bug" and "add feature" in one commit. If a change touches
the parser AND the UI, and they're logically separable, split them.

## Things to avoid

- Don't add `console.log` statements. If you need debugging, use a
  temporary log, then remove it before committing.
- Don't add `try/catch` blocks that swallow errors silently. If you catch,
  either log with context or re-throw.
- Don't add `!` non-null assertions in TypeScript. Use explicit null checks.
- Don't add `any` types. Use `unknown` + narrowing, or define the type.
- Don't add `@ts-ignore` comments. Fix the type instead.
- Don't reformat files you didn't meaningfully change. Keep diffs scoped
  to what the commit message claims.