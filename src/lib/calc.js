export function itemCost(unit, item) {
  if (!unit) return 0;
  let basePts;
  if (unit.is_monster && unit.points_value && typeof unit.points_value === 'object') {
    const mode = item.monster_mode ?? 'allied';
    basePts = unit.points_value[mode]
          ?? unit.points_value.allied
          ?? unit.points_value.bound
          ?? unit.points_value.wild
          ?? 0;
  } else {
    basePts = unit.pts ?? 0;
  }

  const extraOpts = unit.opts
    .filter((o) => item.opts.includes(o.id))
    .reduce((s, o) => s + o.pts, 0);

  const extraModels = Math.max(0, item.qty - unit.base_size);
  const extraModelCost = extraModels * (unit.pts_per_extra || 0);

  return basePts + extraOpts + extraModelCost;
}

export function countOf(items, unitId) {
  return items.filter((i) => i.unitId === unitId).reduce((s, i) => s + i.qty, 0);
}
