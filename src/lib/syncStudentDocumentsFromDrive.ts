import type { StudentDocument, DriveSyncRecord, KeywordConfig } from './types';
import { classifyDocument } from './KeywordMatching';
import { getDriveSync, getStudentDocuments, getKeywordConfigs, upsertStudentDocuments } from './dataService';

function asClassifiableDoc(record: DriveSyncRecord): StudentDocument {
  return {
    id: -1, // placeholder, classifyDocument never reads this
    title: record.title,
    file_url: record.file_url,
    folder_path: record.folder_path,
    uploaded_by: '',
    upload_date: '',
    block: '',
    doc_type: '',
    generation: record.generation,
  };
}

function classifyFresh(
  record: DriveSyncRecord,
  configs: KeywordConfig[],
): { block: string; doc_type: string; board_exam: string | undefined } {
  const doc = asClassifiableDoc(record);
  const blockConfig = classifyDocument(doc, configs, 'block_mapping');
  const typeConfig = classifyDocument(doc, configs, 'doc_type');
  const boardConfig = classifyDocument(doc, configs, 'board_exam');

  return {
    block: blockConfig ? blockConfig.label : 'Unclassified',
    doc_type: typeConfig ? typeConfig.label : 'Unknown',
    board_exam: boardConfig ? boardConfig.label : undefined,
  };
}

/**
 * Main entry point. Call this once on PeerSupportSection mount, before
 * (or in parallel with, then awaited before) getStudentDocuments().
 */
export async function syncStudentDocumentsFromDrive(): Promise<void> {
  const [driveRowsRaw, existingDocs, configs] = await Promise.all([
    getDriveSync(),
    getStudentDocuments(),
    getKeywordConfigs(),
  ]);

  // drive_sync intentionally keeps folder rows (is_folder: true) for other
  // uses (e.g. breadcrumbs/admin views), but student_documents is files only.
  const driveRows = driveRowsRaw.filter((record) => !record.is_folder);

  const existingByDriveId = new Map<string, StudentDocument>();
  for (const doc of existingDocs) {
    if (doc.drive_id) existingByDriveId.set(doc.drive_id, doc);
  }

  const merged: Partial<StudentDocument>[] = driveRows.map((record) => {
    const existing = existingByDriveId.get(record.drive_id);

    // Always-fresh fields, regardless of override status.
    const base: Partial<StudentDocument> = {
      drive_id: record.drive_id,
      title: record.title,
      file_url: record.file_url,
      folder_path: record.folder_path,
      thumbnail_url: record.thumbnail_url,
    };

    if (existing?.is_overridden) {
      // Admin already edited this row — leave classification untouched.
      return {
        ...base,
        block: existing.block,
        doc_type: existing.doc_type,
        board_exam: existing.board_exam,
        generation: existing.generation,
        student_year: existing.student_year,
        is_overridden: true,
      };
    }

    // No override — reclassify from keyword_configs, take generation/year
    // straight from the Drive sync (those are plain facts, not keyword
    // classified — see note in the Apps Script).
    const classified = classifyFresh(record, configs);
    return {
      ...base,
      ...classified,
      generation: record.generation,
      student_year: record.student_year,
      is_overridden: false,
    };
  });

  if (merged.length > 0) {
    await upsertStudentDocuments(merged);
  }
}