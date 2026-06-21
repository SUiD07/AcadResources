// ── Pure keyword-matching helpers ───────────────────────────────────────────
// No React here on purpose — these are plain functions over
// StudentDocument[] / KeywordConfig so they're easy to test and reuse
// (e.g. PeerSupportSection could use the same logic for live classification).

import type { KeywordConfig, StudentDocument } from '../lib/types';

function textIncludesKey(doc: StudentDocument, key: string): boolean {
  const k = key.trim().toLowerCase();
  if (!k) return false;
  return (
    doc.title.toLowerCase().includes(k) ||
    doc.folder_path.toLowerCase().includes(k)
  );
}

/** Does any key in this config match the document? */
function configMatchesDocument(doc: StudentDocument, config: KeywordConfig): boolean {
  return config.keys.some((key) => textIncludesKey(doc, key));
}

/**
 * Classify a single document against all configs of a given type, live.
 * Returns the first matching config (configs are checked in array order,
 * so order in the `keyword_config` table acts as priority), or null if
 * nothing matches.
 */
export function classifyDocument(
  doc: StudentDocument,
  configs: KeywordConfig[],
  configType: 'doc_type' | 'block_mapping',
): KeywordConfig | null {
  const relevant = configs.filter((c) => c.config_type === configType);
  for (const config of relevant) {
    if (configMatchesDocument(doc, config)) return config;
  }
  return null;
}

/** Files matching a config's keys. Pass `onlyKeyIndex` to check a single key only. */
export function getMatchingFiles(
  documents: StudentDocument[],
  config: KeywordConfig,
  onlyKeyIndex?: number,
): StudentDocument[] {
  const keysToCheck =
    onlyKeyIndex !== undefined ? [config.keys[onlyKeyIndex] ?? ''] : config.keys;

  return documents.filter((doc) => keysToCheck.some((key) => textIncludesKey(doc, key)));
}

/** Files matching a config's keys, with one key index excluded ("before this key existed"). */
export function getMatchingFilesExcludingKey(
  documents: StudentDocument[],
  config: KeywordConfig,
  excludeKeyIndex: number,
): StudentDocument[] {
  const keysToCheck = config.keys.filter((_, i) => i !== excludeKeyIndex);
  return documents.filter((doc) => keysToCheck.some((key) => textIncludesKey(doc, key)));
}

/** Files matching a single raw keyword string (used by the quick-add bar before it's saved). */
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