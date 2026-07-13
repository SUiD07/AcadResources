// supabase/functions/_shared/classify.ts
// Ported from lib/KeywordMatching.ts — pure logic, no changes to behavior.

export interface StudentDocument {
  id: number;
  title: string;
  file_url: string;
  folder_path: string;
  uploaded_by: string;
  upload_date: string;
  block: string;
  doc_type: string;
  generation: number;
  thumbnail_url?: string;
  drive_id?: string;
  board_exam?: string;
  is_overridden?: boolean;
}

export interface KeywordConfig {
  id: number;
  config_type: "block_mapping" | "doc_type" | "board_exam";
  label: string;
  keys: string[];
  year?: number | "other";
}

function keyMatchScore(doc: StudentDocument, key: string): number {
  const k = key.trim().toLowerCase();
  if (!k) return -1;

  const inTitle = doc.title.toLowerCase().includes(k);
  const inFolder = doc.folder_path.toLowerCase().includes(k);

  if (!inTitle && !inFolder) return -1;

  let score = k.length;
  if (inTitle) score += 20;

  const depth = (k.match(/>/g) ?? []).length + 1;
  if (depth > 1) score += depth * 5;

  return score;
}

function configScore(doc: StudentDocument, config: KeywordConfig): number {
  let best = -1;
  for (const key of config.keys) {
    const s = keyMatchScore(doc, key);
    if (s > best) best = s;
  }
  return best;
}

export function classifyDocument(
  doc: StudentDocument,
  configs: KeywordConfig[],
  configType: KeywordConfig["config_type"],
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
  }

  return bestConfig;
}