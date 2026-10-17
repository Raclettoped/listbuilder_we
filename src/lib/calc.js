export function itemCost(unit, item) {
  // 1. Kosten für Upgrades (Waffen, Rüstung, etc.)
  const extraOpts = unit.opts
    .filter((o) => item.opts.includes(o.id))
    .reduce((s, o) => s + o.pts, 0);

  // 2. Kosten für zusätzliche Modelle (falls mehr als base_size)
  const extraModels = Math.max(0, item.qty - unit.base_size);
  const extraModelCost = extraModels * (unit.pts_per_extra || 0);

  // 3. Gesamtkosten
  return (unit.pts + extraOpts + extraModelCost) * 1; // *1 weil wir nicht mehr mit qty multiplizieren!
}

export function countOf(items, unitId) {
  return items.filter((i) => i.unitId === unitId).reduce((s, i) => s + i.qty, 0);
}
