// // ── Google Drive Integration ──────────────────────────────────────────────────
// // Configure these in your .env file:
// //   VITE_GDRIVE_API_KEY=your_api_key
// //   VITE_GDRIVE_FOLDER_ID=your_folder_id (optional, leave blank for all files)

// const API_KEY = import.meta.env.VITE_GDRIVE_API_KEY;
// const FOLDER_ID = import.meta.env.VITE_GDRIVE_FOLDER_ID;
// const POLL_INTERVAL_MS = 60_000; // poll every 60 seconds

// let _pollTimer = null;
// let _onUpdate = null;
// let _knownIds = new Set();

// // Build Drive files.list query
// function buildQuery() {
//   const parts = ["trashed = false", "mimeType != 'application/vnd.google-apps.folder'"];
//   if (FOLDER_ID) parts.push(`'${FOLDER_ID}' in parents`);
//   return parts.join(' and ');
// }

// // Fetch all pages of files from Drive
// async function fetchAllFiles() {
//   if (!API_KEY) {
//     console.warn('[Drive] No API key — using demo data');
//     return null;
//   }

//   const fields = 'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,parents)';
//   const query = buildQuery();
//   let allFiles = [];
//   let pageToken = null;

//   do {
//     const params = new URLSearchParams({
//       key: API_KEY,
//       q: query,
//       fields,
//       pageSize: 1000,
//       orderBy: 'modifiedTime desc',
//       ...(pageToken ? { pageToken } : {}),
//     });

//     const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
//     if (!res.ok) throw new Error(`Drive API error: ${res.status} ${res.statusText}`);
//     const data = await res.json();
//     allFiles = allFiles.concat(data.files || []);
//     pageToken = data.nextPageToken;
//   } while (pageToken);

//   return allFiles.map(f => ({
//     id: f.id,
//     name: f.name,
//     mimeType: f.mimeType,
//     modifiedTime: f.modifiedTime,
//     url: f.webViewLink,
//     path: '',
//   }));
// }

// // Check for new files and notify
// async function poll() {
//   try {
//     const files = await fetchAllFiles();
//     if (!files) return;

//     const newFiles = files.filter(f => !_knownIds.has(f.id));
//     if (newFiles.length > 0) {
//       newFiles.forEach(f => _knownIds.add(f.id));
//       if (_onUpdate) _onUpdate(files, newFiles);
//     }
//   } catch (err) {
//     console.error('[Drive] Poll error:', err);
//   }
// }

// // Start polling; calls onUpdate(allFiles, newFiles) on changes
// export async function startDriveSync(onUpdate) {
//   _onUpdate = onUpdate;

//   const files = await fetchAllFiles();
//   if (files) {
//     files.forEach(f => _knownIds.add(f.id));
//     onUpdate(files, files); // initial load = all files are "new"
//   }

//   _pollTimer = setInterval(poll, POLL_INTERVAL_MS);
//   return () => clearInterval(_pollTimer); // returns cleanup fn
// }

// export function stopDriveSync() {
//   if (_pollTimer) clearInterval(_pollTimer);
// }

// // ── Demo / fallback data ──────────────────────────────────────────────────────
// export const DEMO_FILES = [
//   { id: '1', name: 'NLE1 RS Summary 2024.pdf', mimeType: 'application/pdf', modifiedTime: '2024-11-01T10:00:00Z', url: '#', path: '' },
//   { id: '2', name: 'CVS I Lecture Slide Block 7.pptx', mimeType: 'application/vnd.ms-powerpoint', modifiedTime: '2024-10-20T08:00:00Z', url: '#', path: '' },
//   { id: '3', name: 'AC NLE2 MCQ Practice Set 77.pdf', mimeType: 'application/pdf', modifiedTime: '2024-10-15T14:00:00Z', url: '#', path: '' },
//   { id: '4', name: 'GI I Spot Test Images Histo.pdf', mimeType: 'application/pdf', modifiedTime: '2024-09-30T09:00:00Z', url: '#', path: '' },
//   { id: '5', name: 'Compre MDCU Step 1 Prep Lecture.pptx', mimeType: 'application/vnd.ms-powerpoint', modifiedTime: '2024-09-25T11:00:00Z', url: '#', path: '' },
//   { id: '6', name: 'Endocrine I Summary Thyroid.pdf', mimeType: 'application/pdf', modifiedTime: '2024-09-20T10:00:00Z', url: '#', path: '' },
//   { id: '7', name: 'KUB Spot Test Anatomy of Renal.pdf', mimeType: 'application/pdf', modifiedTime: '2024-09-10T16:00:00Z', url: '#', path: '' },
//   { id: '8', name: 'NLE MS Guideline Protocol 2024.pdf', mimeType: 'application/pdf', modifiedTime: '2024-08-28T08:00:00Z', url: '#', path: '' },
//   { id: '9', name: 'Peer Tutoring NL Step 1 Slide.pptx', mimeType: 'application/vnd.ms-powerpoint', modifiedTime: '2024-08-15T12:00:00Z', url: '#', path: '' },
//   { id: '10', name: 'AC78 CVS Final Exam Key Answer.pdf', mimeType: 'application/pdf', modifiedTime: '2024-08-01T09:00:00Z', url: '#', path: '' },
//   { id: '11', name: 'Biochem Metabolism Checklist.pdf', mimeType: 'application/pdf', modifiedTime: '2024-07-20T11:00:00Z', url: '#', path: '' },
//   { id: '12', name: 'RS I Precourse Lecture Note.pdf', mimeType: 'application/pdf', modifiedTime: '2024-07-10T10:00:00Z', url: '#', path: '' },
// ];
