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

  // Weapon / upgrade options. Options flagged "per" model are bought for every
  // model in the unit (qty); flat options are bought once per unit entry.
  const qty = item.qty ?? 1;
  const extraOpts = unit.opts
    .filter((o) => item.opts.includes(o.id))
    .reduce((s, o) => s + (o.per === 'model' ? o.pts * qty : o.pts), 0);

  // Base cost scales with the number of models. `pts` covers `base_size`
  // models, so the cost at qty == base_size stays exactly `pts` (the printed
  // army-list value). Reducing below base_size lowers the cost proportionally.
  // Adding models beyond base_size charges pts_per_extra per extra model; if
  // no pts_per_extra is defined (0), fall back to proportional scaling so
  // each extra model still costs its share of the base price.
  const base_size = unit.base_size ?? 1;
  const perModelBase = base_size > 0 ? basePts / base_size : basePts;
  const extraModelCost = unit.pts_per_extra > 0 ? unit.pts_per_extra : perModelBase;
  let baseCost;
  if (qty <= base_size) {
    baseCost = perModelBase * qty;
  } else {
    baseCost = basePts + (qty - base_size) * extraModelCost;
  }

  return baseCost + extraOpts;
}

export function countOf(items, unitId) {
  return items.filter((i) => i.unitId === unitId).reduce((s, i) => s + i.qty, 0);
}
