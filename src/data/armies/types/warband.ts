export interface RawOption {
  description: string;
  cost?: number;
  per?: string;
  unit?: string;
  note?: string;
}

export interface RawProfile {
  name: string;
  ag?: number | string | null;
  acc?: number | string | null;
  str?: number | string | null;
  res?: number | string | null;
  init?: number | string | null;
  co?: number | string | null;
  special?: string | null;
}

export interface RawUnit {
  name: string;
  type?: string;
  points_value?: number | null;
  special?: string | null;
  profiles?: RawProfile[];
  equipment?: string;
  options?: RawOption[];
}

export interface RawWarband {
  warband: string;
  version?: string;
  updated?: string;
  special_army_rule?: { name: string; description: string };
  additional_notes?: string;
  units: RawUnit[];
  weapons_table?: unknown[];
  special_rules?: Record<string, string>;
}

export interface ArmyOption {
  id: string;
  name: string;
  pts: number;
}

export interface ArmyProfile {
  name: string;
  ag: number | string;
  acc: number | string;
  str: number | string;
  res: number | string;
  init: number | string;
  co: number | string;
  special?: string;
}

export interface ArmyUnit {
  id: string;
  name: string;
  pts: number;
  max: number;
  note: string;
  opts: ArmyOption[];
  profiles: ArmyProfile[];   // ← new

}



export interface Army {
  name: string;
  units: ArmyUnit[];
}
