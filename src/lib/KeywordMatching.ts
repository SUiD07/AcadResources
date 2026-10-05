// ── Pure keyword-matching helpers ───────────────────────────────────────────
// No React here on purpose — these are plain functions over
// StudentDocument[] / KeywordConfig so they're easy to test and reuse.

import type { KeywordConfig, StudentDocument } from '../lib/types';

// ─── Specificity scoring ──────────────────────────────────────────────────────
//
// When multiple configs match the same document we want the *most specific*
// one to win instead of whichever config happens to be first in the DB.
//
// Score for a single (doc, key) pair:
//
//   base      = key.length          longer key → more specific
//   titleHit  = +20 if key appears in doc.title (title match is stronger signal
//               than a folder_path match because it's about the file itself)
//   folderDepth = number of '>' segments in a folder-path key × 5
//               (deeper folder path → more specific location)
//
// The config score = max score across all its matching keys.
// classifyDocument picks the config with the highest score; ties keep the
// first-in-array winner (i.e. DB order as a stable tiebreaker).

export function keyMatchScore(doc: StudentDocument, key: string): number {
  const k = key.trim().toLowerCase();
  if (!k) return -1;

  const inTitle = doc.title.toLowerCase().includes(k);
  const inFolder = doc.folder_path.toLowerCase().includes(k);
  const inFileUrl = (doc.file_url || '').toLowerCase().includes(k);

  if (!inTitle && !inFolder && !inFileUrl) return -1; // no match

  let score = k.length; // base specificity

  if (inTitle) score += 20; // title hit bonus
  if (inFileUrl) score += 10; // drive-link hit bonus

  // Folder-depth bonus: "A > B > C" has depth 3 → +10, shallower keys score less
  const depth = (k.match(/>/g) ?? []).length + 1;
  if (depth > 1) score += depth * 5;

  return score;
}

/** Best specificity score this config achieves on a given document, or -1 if no match. */
function configScore(doc: StudentDocument, config: KeywordConfig): number {
  let best = -1;
  for (const key of config.keys) {
    const s = keyMatchScore(doc, key);
    if (s > best) best = s;
  }
  return best;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Classify a single document against all configs of a given type.
 *
 * Returns the config with the highest specificity score (longest / most
 * specific matching keyword), or null if nothing matches.
 * DB order acts as a stable tiebreaker when scores are equal.
 */
export function classifyDocument(
  doc: StudentDocument,
  configs: KeywordConfig[],
  configType: KeywordConfig['config_type'],
): KeywordConfig | null {
  const relevant = configs.filter((c) => c.config_type === configType);

  let bestConfig: KeywordConfig | null = null;
  let bestScore = -1;

  for (const config of relevant) {
    const score = configScore(doc, config);
    if (score > bestScore) {
      bestScore = score;
      bestConfig = config;
    }
    // Equal score → keep earlier config (stable tiebreaker, same as before)
  }

  return bestConfig;
}

// ─── Matching file helpers (used by KeywordCategoryCard preview panels) ──────

function textIncludesKey(doc: StudentDocument, key: string): boolean {
  const k = key.trim().toLowerCase();
  if (!k) return false;
  return (
    doc.title.toLowerCase().includes(k) ||
    doc.folder_path.toLowerCase().includes(k) ||
    (doc.file_url || '').toLowerCase().includes(k)
  );
}

function configMatchesDocument(doc: StudentDocument, config: KeywordConfig): boolean {
  return config.keys.some((key) => textIncludesKey(doc, key));
}

/**
 * Files whose path/title matches a config's keys.
 * Pass `onlyKeyIndex` to restrict to a single key (used by the focus preview).
 *
 * NOTE: this is used only for the *preview panels* in KeywordCategoryCard.
 * It intentionally does NOT apply specificity — it just shows "which files
 * contain this keyword anywhere", so admins can audit overlap themselves.
 */
export function getMatchingFiles(
  documents: StudentDocument[],
  config: KeywordConfig,
  onlyKeyIndex?: number,
): StudentDocument[] {
  const keysToCheck =
    onlyKeyIndex !== undefined ? [config.keys[onlyKeyIndex] ?? ''] : config.keys;
  return documents.filter((doc) => keysToCheck.some((key) => textIncludesKey(doc, key)));
}

/** Files matching a config minus one key ("before this key existed"). */
export function getMatchingFilesExcludingKey(
  documents: StudentDocument[],
  config: KeywordConfig,
  excludeKeyIndex: number,
): StudentDocument[] {
  const keysToCheck = config.keys.filter((_, i) => i !== excludeKeyIndex);
  return documents.filter((doc) => keysToCheck.some((key) => textIncludesKey(doc, key)));
}

/** Files matching a single raw keyword string (quick-add bar preview). */
export function getFilesMatchingKeyword(
  documents: StudentDocument[],
  keyword: string,
): StudentDocument[] {
  const k = keyword.trim();
  if (!k) return [];
  return documents.filter((doc) => textIncludesKey(doc, k));
}

/** Complement of getFilesMatchingKeyword. */
export function getFilesNotMatchingKeyword(
  documents: StudentDocument[],
  keyword: string,
): StudentDocument[] {
  const k = keyword.trim();
  if (!k) return [];
  return documents.filter((doc) => !textIncludesKey(doc, k));
}

// ─── Overlap audit helper (used by KeywordManagementSection) ─────────────────

export interface OverlapInfo {
  doc: StudentDocument;
  /** The config that WINS under specificity rules */
  winner: KeywordConfig;
  /** All other configs that also match but lose */
  losers: KeywordConfig[];
  winnerScore: number;
  loserScores: { config: KeywordConfig; score: number }[];
}

/**
 * Find every document that matches more than one config of the given type,
 * and report which config wins and why.
 *
 * Useful for an audit panel so admins can see where keyword overlap exists.
 */
export function findOverlaps(
  documents: StudentDocument[],
  configs: KeywordConfig[],
  configType: KeywordConfig['config_type'],
): OverlapInfo[] {
  const relevant = configs.filter((c) => c.config_type === configType);
  const result: OverlapInfo[] = [];

  for (const doc of documents) {
    const scored = relevant
      .map((config) => ({ config, score: configScore(doc, config) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score); // highest score first

    if (scored.length < 2) continue; // no overlap

    result.push({
      doc,
      winner: scored[0].config,
      losers: scored.slice(1).map((x) => x.config),
      winnerScore: scored[0].score,
      loserScores: scored.slice(1),
    });
  }

  return result;
}

// ─── Classification trace + summary (ใช้โชว์บนการ์ดในหน้า Peer Support) ──────

export interface ClassificationTraceEntry {
  config: KeywordConfig;
  score: number;
  matchedKeys: { key: string; score: number; inTitle: boolean; inFolder: boolean; inFileUrl: boolean }[];
}

export function getClassificationTrace(
  doc: StudentDocument,
  configs: KeywordConfig[],
  configType: KeywordConfig['config_type'],
): ClassificationTraceEntry[] {
  const relevant = configs.filter((c) => c.config_type === configType);

  return relevant
    .map((config) => {
      const matchedKeys = config.keys
        .map((key) => {
          const k = key.trim().toLowerCase();
          const inTitle = doc.title.toLowerCase().includes(k);
          const inFolder = doc.folder_path.toLowerCase().includes(k);
          const inFileUrl = (doc.file_url || '').toLowerCase().includes(k);
          const score = keyMatchScore(doc, key);
          return { key, score, inTitle, inFolder, inFileUrl };
        })
        .filter((k) => k.score >= 0)
        .sort((a, b) => b.score - a.score);

      const score = matchedKeys.length > 0 ? matchedKeys[0].score : -1;
      return { config, score, matchedKeys };
    })
    .filter((e) => e.score >= 0)
    .sort((a, b) => b.score - a.score);
}

export type ClassificationFieldStatus = 'auto' | 'override' | 'overlap' | 'unclassified';

export interface ClassificationFieldNote {
  status: ClassificationFieldStatus;
  text: string;
}

export interface ClassificationSummary {
  overallStatus: ClassificationFieldStatus;
  block: ClassificationFieldNote;
  docType: ClassificationFieldNote;
  boardExam: ClassificationFieldNote;
}

function noteForField(
  doc: StudentDocument,
  configs: KeywordConfig[],
  configType: KeywordConfig['config_type'],
  overriddenValue: string | undefined,
  isOverridden: boolean | undefined,
): ClassificationFieldNote {
  const trace = getClassificationTrace(doc, configs, configType);
  const winner = trace[0];

  if (isOverridden && overriddenValue) {
    const autoPart = winner
      ? ` (auto จะได้ "${winner.config.label}" จาก match "${winner.matchedKeys[0]?.key}" คะแนน ${winner.score})`
      : ` (auto จะได้ "Unclassified")`;
    return { status: 'override', text: `override โดยแอดมิน → "${overriddenValue}"${autoPart}` };
  }

  if (!winner) {
    return { status: 'unclassified', text: `ไม่มี keyword ไหน match เลย → "Unclassified"` };
  }

  const topKey = winner.matchedKeys[0];
  const where = [topKey.inTitle && 'ชื่อไฟล์', topKey.inFolder && 'folder path', topKey.inFileUrl && 'drive link']
    .filter(Boolean)
    .join(', ');

  if (trace.length > 1) {
    const loser = trace[1];
    return {
      status: 'overlap',
      text: `🏆 "${winner.config.label}" ชนะ (คะแนน ${winner.score}) — แพ้ "${loser.config.label}" (คะแนน ${loser.score})`,
    };
  }

  return { status: 'auto', text: `match "${topKey.key}" ใน${where} (คะแนน ${winner.score})` };
}

/** สรุปที่มาของการจัดหมวด 1 ไฟล์ ครบทั้ง 3 ประเภท + สถานะรวม สำหรับโชว์บนการ์ด (admin only) */
export function buildClassificationSummary(doc: StudentDocument, configs: KeywordConfig[]): ClassificationSummary {
  const block = noteForField(doc, configs, 'block_mapping', doc.block, doc.is_overridden);
  const docType = noteForField(doc, configs, 'doc_type', doc.doc_type, doc.is_overridden);

  let boardExam = noteForField(doc, configs, 'board_exam', doc.board_exam, doc.is_overridden);
  // ไม่ใช่ทุกไฟล์จะเป็นข้อสอบ board — "ไม่ match" ของ field นี้ถือเป็นปกติ ไม่นับเป็นปัญหาที่ต้องรีบแก้
  if (boardExam.status === 'unclassified') {
    boardExam = { status: 'auto', text: 'ไม่มี keyword board exam match → "None"' };
  }

  const statuses = [block.status, docType.status, boardExam.status];
  let overallStatus: ClassificationFieldStatus = 'auto';
  if (statuses.includes('unclassified')) overallStatus = 'unclassified';
  else if (statuses.includes('overlap')) overallStatus = 'overlap';
  else if (statuses.includes('override')) overallStatus = 'override';

  return { overallStatus, block, docType, boardExam };
}