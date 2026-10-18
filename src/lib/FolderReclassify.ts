// ── Bulk reclassify: change doc_type / board_exam / block for the files in a
// folder (and its subfolders) that currently match a "From" filter. ─────────
// Matching files get is_overridden = true so the Drive sync keeps the result.

import { countFolderDocs, listFolderDocs, updateDocsClassification } from './dataService';
import type { ReclassifyFilter, ReclassifyPatch } from './supabase';

/** Sentinel select values. */
export const ANY = '__any__';    // From: match any value
export const KEEP = '__keep__';  // To: leave the field unchanged
export const NONE = '__none__';  // From: empty value / To: clear the value

export const CHUNK_SIZE = 200;
const PAGE_SIZE = 1000;

export interface FieldSet {
  docType: string;
  boardExam: string;
  block: string;
}

export function toFilter(from: FieldSet): ReclassifyFilter {
  const f = (v: string) => (v === ANY ? null : v === NONE ? '' : v);
  return { fromDocType: f(from.docType), fromBoardExam: f(from.boardExam), fromBlock: f(from.block) };
}

/** null when nothing would change. */
export function toPatch(to: FieldSet): ReclassifyPatch | null {
  const patch: ReclassifyPatch = {};
  if (to.docType !== KEEP && to.docType !== NONE) patch.doc_type = to.docType;
  if (to.block !== KEEP && to.block !== NONE) patch.block = to.block;
  if (to.boardExam !== KEEP) patch.board_exam = to.boardExam === NONE ? null : to.boardExam;
  return Object.keys(patch).length > 0 ? patch : null;
}

export interface ReclassifyPreview {
  count: number;
  samples: string[];
}

export async function previewReclassify(folder: string, filter: ReclassifyFilter): Promise<ReclassifyPreview> {
  const [count, first] = await Promise.all([
    countFolderDocs(folder, filter),
    listFolderDocs(folder, filter, 0, 5),
  ]);
  return { count, samples: first.map((r) => r.title) };
}

async function loadAllMatchingIds(folder: string, filter: ReclassifyFilter): Promise<number[]> {
  const ids: number[] = [];
  let after = 0;
  for (;;) {
    const page = await listFolderDocs(folder, filter, after, PAGE_SIZE);
    for (const r of page) ids.push(r.id);
    if (page.length < PAGE_SIZE) break;
    after = page[page.length - 1].id;
  }
  return ids;
}

export interface ReclassifyResult {
  total: number;
  updated: number;
  error?: string;
}

/**
 * Updates matching files in chunks. Stops at the first failed chunk; running it
 * again is safe because already-updated files no longer match "From".
 * The id list is loaded BEFORE any update, so it can't shift while running.
 */
export async function runReclassify(
  folder: string,
  filter: ReclassifyFilter,
  patch: ReclassifyPatch,
  onProgress: (done: number, total: number) => void,
): Promise<ReclassifyResult> {
  const ids = await loadAllMatchingIds(folder, filter);
  const total = ids.length;
  let updated = 0;
  onProgress(0, total);
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    try {
      await updateDocsClassification(chunk, patch);
    } catch (e) {
      return { total, updated, error: e instanceof Error ? e.message : String(e) };
    }
    updated += chunk.length;
    onProgress(updated, total);
  }
  return { total, updated };
}