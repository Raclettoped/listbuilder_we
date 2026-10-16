export function itemCost(unit, item) {
  const extra = unit.opts
    .filter((o) => item.opts.includes(o.id))
    .reduce((s, o) => s + o.pts, 0);
  return (unit.pts + extra) * item.qty;
}

export function countOf(items, unitId) {
  return items.filter((i) => i.unitId === unitId).reduce((s, i) => s + i.qty, 0);
}
