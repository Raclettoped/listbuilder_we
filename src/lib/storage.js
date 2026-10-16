// Später kann diese Datei durch Supabase/Firebase ersetzt werden,
// solange die Funktionen gleich heißen.
const KEY = 'erehwon-lists';

export function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveAll(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}
