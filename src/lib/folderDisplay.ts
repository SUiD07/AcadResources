// ── Pure helpers for the `folders` table ─────────────────────────────────
// No React here. A folder is identified by its Google Drive ID (drive_id).
// Files that are not linked to a folder ID yet (folder_drive_id is empty) fall
// back to their folder_path text; folders found only that way are "virtual"
// and get a key like "path:ACD Resources > AC SUPER". Virtual folders can be
// shown but not renamed, hidden or reordered, because they have no row.

import type { Folder } from './types';

export const PATH_SEP = ' > ';
export const VIRTUAL_PREFIX = 'path:';
const MAX_DEPTH = 60;

export function pathSegments(path: string): string[] {
  const sep = path.includes(PATH_SEP) ? PATH_SEP : '/';
  return path
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isVirtualKey(key: string): boolean {
  return key.startsWith(VIRTUAL_PREFIX);
}

/** Path text of a virtual key (undefined for a real Drive ID). */
export function virtualKeyPath(key: string): string | undefined {
  return isVirtualKey(key) ? key.slice(VIRTUAL_PREFIX.length) : undefined;
}

export type FolderMap = Map<string, Folder>;

export function buildFolderMap(rows: Folder[]): FolderMap {
  const map: FolderMap = new Map();
  for (const r of rows) map.set(r.drive_id, r);
  return map;
}

/** Where the folder is shown: the "Move to" parent if set, otherwise its Drive parent. */
export function effectiveParent(f: Folder): string | null {
  return f.parent_override ?? f.parent_drive_id ?? null;
}

/**
 * Lower-cased Drive path ("A > B > C") -> drive_id. Built from the Drive parents
 * (not "Move to"), because file paths in the database are Drive paths.
 * A path shared by two different folders is left out (ambiguous).
 */
export function buildPathIndex(map: FolderMap): Map<string, string> {
  const own = new Map<string, string>();
  const ownPath = (id: string): string => {
    const hit = own.get(id);
    if (hit !== undefined) return hit;
    const names: string[] = [];
    const seen = new Set<string>();
    let cur: string | null | undefined = id;
    while (cur && !seen.has(cur) && names.length < MAX_DEPTH) {
      const f = map.get(cur);
      if (!f) break;
      seen.add(cur);
      names.unshift(f.drive_name.trim());
      cur = f.parent_drive_id;
    }
    const p = names.join(PATH_SEP);
    own.set(id, p);
    return p;
  };

  const index = new Map<string, string>();
  const ambiguous = new Set<string>();
  for (const id of map.keys()) {
    const key = ownPath(id).toLowerCase();
    if (!key) continue;
    if (index.has(key) && index.get(key) !== id) ambiguous.add(key);
    else index.set(key, id);
  }
  for (const key of ambiguous) index.delete(key);
  return index;
}

export interface ChainNode {
  /** drive_id, or "path:<path>" for a virtual folder. */
  id: string;
  /** Name in Drive (the screen name comes from getDisplayName). */
  name: string;
  virtual: boolean;
}

export interface FolderRef {
  folder_drive_id?: string | null;
  folder_path?: string | null;
}

export interface FolderLookup {
  map: FolderMap;
  pathIndex: Map<string, string>;
}

/** Folders along a path text, outermost first. Known folders are real, the rest virtual. */
function nodesFromPath(lookup: FolderLookup, segments: string[]): ChainNode[] {
  const out: ChainNode[] = [];
  segments.forEach((seg, i) => {
    const prefix = segments.slice(0, i + 1).join(PATH_SEP);
    const id = lookup.pathIndex.get(prefix.toLowerCase());
    if (id) out.push({ id, name: lookup.map.get(id)?.drive_name ?? seg, virtual: false });
    else out.push({ id: VIRTUAL_PREFIX + prefix, name: seg, virtual: true });
  });
  return out;
}

/**
 * The folders a file sits in, outermost first (the file's own folder is last).
 * 1. If the file has a known folder ID, walk up through the parents.
 * 2. If that chain ends at a folder with no parent but the file's path text is
 *    longer, the missing top part is taken from the path text.
 * 3. Otherwise the whole chain comes from the path text.
 */
export function resolveChain(lookup: FolderLookup, item: FolderRef): ChainNode[] {
  const { map } = lookup;
  const segments = pathSegments(item.folder_path ?? '');
  const id = item.folder_drive_id;

  if (id && map.has(id)) {
    const chain: ChainNode[] = [];
    const seen = new Set<string>();
    let cur: string | null | undefined = id;
    while (cur && !seen.has(cur) && chain.length < MAX_DEPTH) {
      const f = map.get(cur);
      if (!f) break;
      seen.add(cur);
      chain.unshift({ id: cur, name: f.drive_name, virtual: false });
      cur = effectiveParent(f);
    }

    const top = map.get(chain[0].id)!;
    const topHasNoParent = effectiveParent(top) === null;
    if (topHasNoParent && segments.length > chain.length) {
      const tail = segments.slice(segments.length - chain.length);
      const tailMatches = tail.every(
        (seg, i) => seg.toLowerCase() === chain[i].name.trim().toLowerCase(),
      );
      if (tailMatches) {
        const prefix = nodesFromPath(lookup, segments.slice(0, segments.length - chain.length));
        return [...prefix, ...chain];
      }
    }
    return chain;
  }

  return nodesFromPath(lookup, segments);
}

export function getDisplayName(map: FolderMap, key: string, fallback: string): string {
  const name = map.get(key)?.custom_name;
  return name && name.trim() ? name : fallback;
}

/** True if any real folder in the chain is hidden. */
export function isChainHidden(map: FolderMap, chain: ChainNode[]): boolean {
  return chain.some((n) => !n.virtual && map.get(n.id)?.hidden === true);
}

/** sort_order first (set before unset), then display name. */
export function sortFolders<T extends { name: string; id: string }>(map: FolderMap, nodes: T[]): T[] {
  return [...nodes].sort((a, b) => {
    const ao = map.get(a.id)?.sort_order ?? null;
    const bo = map.get(b.id)?.sort_order ?? null;
    if (ao !== null && bo !== null && ao !== bo) return ao - bo;
    if (ao !== null && bo === null) return -1;
    if (ao === null && bo !== null) return 1;
    return getDisplayName(map, a.id, a.name).localeCompare(getDisplayName(map, b.id, b.name));
  });
}

/**
 * Can this folder be moved inside the target folder? Both must be real folders,
 * the target must not be the folder itself or anything inside it (that would
 * make a loop), and the folder must not already be there.
 */
export function canMoveFolder(map: FolderMap, folderId: string, targetId: string): boolean {
  if (isVirtualKey(folderId) || isVirtualKey(targetId)) return false;
  if (folderId === targetId) return false;
  const folder = map.get(folderId);
  if (!folder || !map.has(targetId)) return false;
  if (effectiveParent(folder) === targetId) return false;

  // Walk up from the target. Meeting the folder on the way means the target is inside it.
  const seen = new Set<string>();
  let cur: string | null | undefined = targetId;
  while (cur && !seen.has(cur) && seen.size < MAX_DEPTH) {
    if (cur === folderId) return false;
    seen.add(cur);
    const f = map.get(cur);
    cur = f ? effectiveParent(f) : null;
  }
  return true;
}
