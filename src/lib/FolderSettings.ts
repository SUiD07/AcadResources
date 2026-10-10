// ── Pure helpers for folder_settings ─────────────────────────────────────
// No React here. Settings are keyed by the folder's full path, joined with
// ' > ' (same convention as folder_path in student_documents / drive_sync).
// Lookups are case-insensitive, matching DriveTree.ts.

import type { FolderSetting } from './types';

export const PATH_SEP = ' > ';

export function pathSegments(path: string): string[] {
  const sep = path.includes(PATH_SEP) ? PATH_SEP : '/';
  return path
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Canonical form stored in the DB: segments joined with ' > '. */
export function normalizeFolderPath(path: string): string {
  return pathSegments(path).join(PATH_SEP);
}

/** Case-insensitive lookup key. */
export function settingKey(path: string): string {
  return normalizeFolderPath(path).toLowerCase();
}

export type FolderSettingsMap = Map<string, FolderSetting>;

export function buildFolderSettingsMap(rows: FolderSetting[]): FolderSettingsMap {
  const map: FolderSettingsMap = new Map();
  for (const r of rows) map.set(settingKey(r.folder_path), r);
  return map;
}

export function getDisplayName(map: FolderSettingsMap, path: string, fallback: string): string {
  const name = map.get(settingKey(path))?.custom_name;
  return name && name.trim() ? name : fallback;
}

/** True if this folder OR any ancestor folder is hidden. */
export function isPathHidden(map: FolderSettingsMap, path?: string): boolean {
  if (!path) return false;
  let acc = '';
  for (const seg of pathSegments(path)) {
    acc = acc ? `${acc}${PATH_SEP}${seg}` : seg;
    if (map.get(settingKey(acc))?.hidden) return true;
  }
  return false;
}

/** sort_order first (set before unset), then display name. */
export function sortFolders<T extends { name: string; fullPath: string }>(
  map: FolderSettingsMap,
  nodes: T[],
): T[] {
  return [...nodes].sort((a, b) => {
    const ao = map.get(settingKey(a.fullPath))?.sort_order ?? null;
    const bo = map.get(settingKey(b.fullPath))?.sort_order ?? null;
    if (ao !== null && bo !== null && ao !== bo) return ao - bo;
    if (ao !== null && bo === null) return -1;
    if (ao === null && bo !== null) return 1;
    return getDisplayName(map, a.fullPath, a.name).localeCompare(
      getDisplayName(map, b.fullPath, b.name),
    );
  });
}
