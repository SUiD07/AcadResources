// ── Pure drive-tree helpers ──────────────────────────────────────────────
// No React here on purpose — same rationale as KeywordMatching.ts: plain
// functions over DriveSyncRecord[] are easy to test and reuse.
//
// drive_sync has no parent_folder_id — folders and files are a flat table
// distinguished only by `is_folder`, and nesting is implied entirely by
// `folder_path` string structure (same convention as StudentDocument).
// So "building a tree" here means parsing path segments, not walking a
// real adjacency list.

import type { DriveSyncRecord } from './types';

function pathSegments(path: string): string[] {
  return path
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface DriveTreeNode {
  /** Path segment name at this level, e.g. "Anatomy" (not the full path). */
  name: string;
  /** Full path from the scoped root down to and including this node. */
  fullPath: string;
  isFolder: boolean;
  /** The underlying drive_sync row for this exact node, if one exists.
   *  A folder node may have no direct row of its own (it can be purely
   *  implied by deeper paths) — in that case this is null. */
  record: DriveSyncRecord | null;
  children: DriveTreeNode[];
}

/**
 * Distinct FOLDER paths from drive_sync, i.e. rows where is_folder === true.
 * Used to populate the "Add Folder" picker — this is now the source of
 * truth for folder keys, replacing the StudentDocument-derived heuristic.
 */
export function getDriveSyncFolderPaths(records: DriveSyncRecord[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    if (!r.is_folder) continue;
    const trimmed = r.folder_path.trim();
    if (trimmed) set.add(trimmed);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Is `key` exactly one of drive_sync's real folder paths? Used to decide
 * whether a given config key is "a folder key" (vs. a plain text keyword),
 * which in turn decides whether the UI shows the nested tree or the flat
 * file list for that key.
 */
export function isDriveSyncFolderKey(key: string, folderPaths: string[]): boolean {
  const k = key.trim().toLowerCase();
  if (!k) return false;
  return folderPaths.some((p) => p.trim().toLowerCase() === k);
}

/**
 * Build a nested tree of DriveSyncRecord rows, SCOPED to `rootPath` — i.e.
 * the returned tree's root IS rootPath itself (no parent levels above it),
 * containing only rows whose folder_path is rootPath or a path under it.
 *
 * Returns null if rootPath matches no rows at all (defensive: e.g. the
 * folder was deleted from Drive after being saved as a keyword).
 */
export function buildScopedDriveTree(
  records: DriveSyncRecord[],
  rootPath: string,
): DriveTreeNode | null {
  const rootSegs = pathSegments(rootPath);
  if (rootSegs.length === 0) return null;

  // Rows that live at or under rootPath.
  const scoped = records.filter((r) => {
    const segs = pathSegments(r.folder_path);
    if (segs.length < rootSegs.length) return false;
    return rootSegs.every((seg, i) => segs[i].toLowerCase() === seg.toLowerCase());
  });

  if (scoped.length === 0) return null;

  // Index every row by its full segment path (lowercased) for quick lookup,
  // and collect every distinct path (folders implied by depth included).
  const recordBySegPath = new Map<string, DriveSyncRecord>();
  for (const r of scoped) {
    recordBySegPath.set(pathSegments(r.folder_path).join('/').toLowerCase(), r);
  }

  // Build nodes bottom-up via a path -> node map, then wire parent/child by
  // segment prefix relationships relative to the scoped root.
  const nodeByPath = new Map<string, DriveTreeNode>();

  function getOrCreateNode(segs: string[]): DriveTreeNode {
    const key = segs.join('/').toLowerCase();
    const existing = nodeByPath.get(key);
    if (existing) return existing;

    const record = recordBySegPath.get(key) ?? null;
    const node: DriveTreeNode = {
      name: segs[segs.length - 1],
      fullPath: segs.join('/'),
      isFolder: record ? record.is_folder : true, // implied intermediate folders
      record,
      children: [],
    };
    nodeByPath.set(key, node);
    return node;
  }

  const rootNode = getOrCreateNode(rootSegs);

  for (const r of scoped) {
    const segs = pathSegments(r.folder_path);
    // Walk every level from rootSegs.length up to this row's own depth,
    // wiring each level as a child of the previous, so intermediate
    // folders that have no row of their own still appear in the tree.
    let parent = rootNode;
    for (let depth = rootSegs.length + 1; depth <= segs.length; depth++) {
      const levelSegs = segs.slice(0, depth);
      const node = getOrCreateNode(levelSegs);
      if (!parent.children.includes(node)) {
        parent.children.push(node);
      }
      parent = node;
    }
  }

  // Sort each level: folders first, then alphabetical by name.
  function sortTree(node: DriveTreeNode) {
    node.children.sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortTree);
  }
  sortTree(rootNode);

  return rootNode;
}