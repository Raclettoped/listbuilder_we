import type { RawWarband } from './types/warband';
import { toArmy } from './transform';

// Vite: eagerly import every .json in this folder
const modules = import.meta.glob<{ default: RawWarband }>('./*.json', { eager: true });

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const armies = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const raw = mod.default;
    // Use the warband's own name for the dropdown key; fall back to filename
    const key = slug(raw.warband ?? path.replace('./', '').replace(/\.json$/, ''));
    return [key, toArmy(raw)];
  })
);

console.log('[armies] loaded:', Object.keys(armies));