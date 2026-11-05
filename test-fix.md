# Point-Cost Calculation Fixes

## Summary

Fixed two bugs in the list builder's point-cost calculation (`src/lib/calc.js` `itemCost` function), plus supporting data changes.

## Bug 1 — Quantity changes did not update the total

**Cause:** `basePts = unit.pts ?? 0` was a flat cost that never scaled with `item.qty`. Only models *above* `base_size` added cost (via `pts_per_extra`). Adding or reducing unit quantity often left the total unchanged.

**Dwarf Warriors example:** `pts = 100`, `base_size = 5`, but the JSON had no "Add up to N" option so `pts_per_extra = 0`. Increasing quantity beyond 5 added **0 points** — the total stayed stuck at 100 regardless of how many models were added.

## Bug 2 — Weapon options charged once instead of per model

**Cause:** Raw army options carry a `per` field (`"model"`, `"each"`, `null`), but `transform.ts` dropped it when building `ArmyOption` (kept only `id`, `name`, `pts`). `itemCost` then added each selected option's `pts` exactly once, regardless of unit size. So "big axe +1 per model" on 5 models added 1pt instead of 5pt.

## Changes

### `src/lib/calc.js` — `itemCost`

- **Per-model options:** Selected options with `per === 'model'` are now multiplied by `item.qty` (5 models × +1 = +5pts). Flat options (`per: null`/`'each'`) are still bought once per unit entry.
- **Base cost scaling:** `pts` covers `base_size` models, so cost at `qty == base_size` stays exactly `pts` (matches the printed army-list value).
  - `qty <= base_size`: cost scales proportionally (`(pts / base_size) × qty`), so reducing below base_size lowers the cost.
  - `qty > base_size`: cost = `pts + (qty - base_size) × extraModelCost`, where `extraModelCost` is `pts_per_extra` when defined (> 0), otherwise falls back to proportional per-model share (`pts / base_size`) so every extra model still costs something.

### `src/data/armies/transform.ts`

- Preserves `o.per` when building `ArmyOption` (previously discarded).

### `src/data/armies/types/warband.ts`

- Added `per?: 'model' | 'each' | null` to `ArmyOption`.

## Verification

- `npm run build` passes cleanly.
- Tested against real army data:

| Unit | Scenario | Result | Expected |
|------|----------|--------|----------|
| Dwarf Warriors (pts=100, base=5, no pts_per_extra) | qty=5 | 100 | 100 ✓ |
| Dwarf Warriors | qty=6 | 120 | 100+20 ✓ |
| Dwarf Warriors | qty=10 | 200 | 100+5×20 ✓ |
| Dwarf Warriors | qty=4 | 80 | 100/5×4 ✓ |
| Dwarf Warriors + bloomin big axes (1/model) | qty=6 | 126 | 120+6 ✓ |
| Barbarian Warriors (pts=72, base=5, pts_per_extra=12) | qty=10 | 132 | 72+5×12 ✓ (unchanged) |
| Barbarian Warriors + medium armour (2/model) | qty=5 | 82 | 72+10 ✓ |
