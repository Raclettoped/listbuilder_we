import type {
  RawWarband,
  RawUnit,
  RawOption,
  RawProfile,
  Army,
  ArmyUnit,
  ArmyOption,
  ArmyProfile
} from './types/warband';

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCountFromName(name: string): number {
  const match = name.match(/^(\d+)\s*x/i);
  return match ? parseInt(match[1], 10) : 1;
}

function normalizeProfile(p: RawProfile): ArmyProfile {
  return {
    name: p.name,
    ag: p.ag ?? '-',
    acc: p.acc ?? '-',
    str: p.str ?? '-',
    res: p.res ?? '-',
    init: p.init ?? '-',
    co: p.co ?? '-',
    special: p.special ?? undefined
  };
}

export function toArmy(raw: RawWarband): Army {
  return {
    name: raw.warband,
    units: raw.units.map((u: RawUnit): ArmyUnit => {
      const id = slug(u.name);

      // 1. Base size from profiles
      const base_size = (u.profiles ?? []).reduce((sum, p) => sum + getCountFromName(p.name), 0) || 1;

      // 2. Defaults for max size and extra-model cost
      let max_size = base_size;
      let pts_per_extra = 0;

      // 3. Parse options
      const opts: ArmyOption[] = [];
      for (const [i, o] of (u.options ?? []).entries()) {
        const desc = o.description ?? '';

        const addMatch = desc.match(/add up to (\d+)/i);
        if (addMatch) {
          max_size += parseInt(addMatch[1], 10);

          const costMatch = desc.match(/@(\d+)\s*pts?/i);
          if (costMatch) {
            pts_per_extra = parseInt(costMatch[1], 10);
          } else if (o.cost) {
            pts_per_extra = o.cost;
          }
          continue; // skip size upgrades, they're handled via base_size/max_size
        }

        // Regular wargear / upgrade option
        opts.push({
          id: `${id}-opt-${i}`,
          name: desc,
          pts: o.cost ?? 0
        });
      }

      // 4. Max number of this unit allowed in the list
      let max = 999;
      if (typeof u.special === 'string' && u.special.length > 0) {
        const oneAndOnly = /one and only/i.test(u.special);
        const maxOf = u.special.match(/maximum of (\w+)/i);

        if (oneAndOnly) {
          max = 1;
        } else if (maxOf) {
          const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
          max = words[maxOf[1].toLowerCase()] ?? parseInt(maxOf[1], 10) ?? 999;
        }
      }

            const pv = u.points_value;
      const isMonster =
        typeof pv === 'object' &&
        pv !== null &&
        ('wild' in pv || 'bound' in pv || 'allied' in pv);

      const pts = typeof pv === 'number'
        ? pv
        : (pv && typeof pv === 'object'
            ? (pv.allied ?? pv.bound ?? pv.wild ?? 0)
            : 0);

      return {
        id,
        name: u.name,
        pts,
        max,
        note: u.type ?? '',
        opts,
        profiles: (u.profiles ?? []).map(normalizeProfile),
        base_size,
        max_size,
        pts_per_extra,
        points_value: pv ?? 0,
        is_monster: isMonster
      };
    })
  };
}