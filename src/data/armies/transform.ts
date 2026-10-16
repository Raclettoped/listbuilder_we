import type {
  RawWarband,
  RawUnit,
  RawOption,
  Army,
  ArmyUnit,
  ArmyOption,
  RawProfile,
  ArmyProfile
} from './types/warband';

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isUnitOption(o: RawOption): boolean {
  return !/^add up to/i.test(o.description);
}

function extractMax(special?: string | null): number | null {
  if (!special) return null;
  if (/maximum of one/i.test(special)) return 1;
  if (/must include one .* and one only/i.test(special)) return 1;
  return null;
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

      const opts: ArmyOption[] = (u.options ?? [])
        .filter(isUnitOption)
        .map((o: RawOption, i: number): ArmyOption => ({
          id: `${id}-opt-${i}`,
          name: o.description,
          pts: o.cost ?? 0
        }));

      return {
        id,
        name: u.name,
        pts: u.points_value ?? 0,
        max: extractMax(u.special) ?? 1,
        note: u.type ?? '',
        opts,
        profiles: (u.profiles ?? []).map(normalizeProfile)
      };
    })
  };
}
