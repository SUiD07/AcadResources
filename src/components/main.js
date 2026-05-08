import './style.css';
import { categorizeFile, blockMap } from './categorize.js';
import { startDriveSync, DEMO_FILES } from './drive.js';

// ── State ─────────────────────────────────────────────────────────────────────
let allFiles = [];
let searchQuery = '';
let activeDocTypes = new Set();
let activeBlocks = new Set();
let newFileIds = new Set();
let sortBy = 'modified'; // 'modified' | 'name'

const DOC_TYPE_COLORS = {
  'Tutoring':                   '#a78bfa',
  'NLE 1':                      '#34d399',
  'NLE 2':                      '#6ee7b7',
  'Comprehensive Review STEP 1':'#fbbf24',
  'Comprehensive Review STEP 2':'#f59e0b',
  'Summary':                    '#60a5fa',
  'Checklist':                  '#f472b6',
  'Precourse':                  '#c084fc',
  'Guideline':                  '#fb923c',
  'Lecture Slide':              '#38bdf8',
  'Lab & Spottest':             '#4ade80',
  'AC':                         '#f87171',
  'Other':                      '#94a3b8',
  'Unknown':                    '#475569',
};

const MIME_ICONS = {
  'application/pdf': '📄',
  'application/vnd.ms-powerpoint': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'application/vnd.google-apps.document': '📝',
  'application/vnd.google-apps.spreadsheet': '📈',
  'application/vnd.google-apps.presentation': '📊',
};

function mimeIcon(mimeType) {
  return MIME_ICONS[mimeType] || '📁';
}

// ── Filtering ─────────────────────────────────────────────────────────────────
function getFilteredFiles() {
  let files = [...allFiles];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    files = files.filter(f => f.name.toLowerCase().includes(q));
  }

  if (activeDocTypes.size > 0) {
    files = files.filter(f => activeDocTypes.has(f.docType));
  }

  if (activeBlocks.size > 0) {
    files = files.filter(f => activeBlocks.has(f.block));
  }

  if (sortBy === 'name') {
    files.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    files.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
  }

  return files;
}

// ── Derived sets ──────────────────────────────────────────────────────────────
function getAllDocTypes() {
  return [...new Set(allFiles.map(f => f.docType))].sort();
}

function getAllBlocks() {
  return [...new Set(allFiles.map(f => f.block))].sort();
}

// ── Render ────────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderFilterPill(label, color, active, onclick) {
  return `<button class="pill ${active ? 'active' : ''}" style="--pill-color:${color}" onclick="${onclick}">${label}</button>`;
}

function renderFileCard(file) {
  const isNew = newFileIds.has(file.id);
  const color = DOC_TYPE_COLORS[file.docType] || '#94a3b8';
  return `
    <a class="file-card ${isNew ? 'file-new' : ''}" href="${file.url}" target="_blank" rel="noopener">
      <div class="file-icon">${mimeIcon(file.mimeType)}</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-meta">
          <span class="badge" style="--badge-color:${color}">${file.docType}</span>
          <span class="block-tag">${file.block}</span>
          <span class="file-date">${formatDate(file.modifiedTime)}</span>
        </div>
      </div>
      ${isNew ? '<span class="new-dot" title="Newly added">NEW</span>' : ''}
    </a>
  `;
}

function render() {
  const filtered = getFilteredFiles();
  const docTypes = getAllDocTypes();
  const blocks = getAllBlocks();

  document.getElementById('app').innerHTML = `
    <div class="layout">
      <header class="topbar">
        <div class="topbar-left">
          <span class="logo">⬡ Drive Catalog</span>
          <span class="file-count">${allFiles.length} files</span>
        </div>
        <div class="topbar-right">
          <div class="sync-status" id="sync-status">
            <span class="sync-dot"></span>
            <span>Live</span>
          </div>
        </div>
      </header>

      <div class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">DOC TYPE</div>
          <div class="pills">
            ${docTypes.map(dt => renderFilterPill(
              dt,
              DOC_TYPE_COLORS[dt] || '#94a3b8',
              activeDocTypes.has(dt),
              `window.__toggleDocType('${dt.replace(/'/g, "\\'")}')`
            )).join('')}
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-label">BLOCK / SUBJECT</div>
          <div class="pills">
            ${blocks.map(b => renderFilterPill(
              b, '#64748b',
              activeBlocks.has(b),
              `window.__toggleBlock('${b.replace(/'/g, "\\'")}')`
            )).join('')}
          </div>
        </div>

        ${(activeDocTypes.size > 0 || activeBlocks.size > 0) ? `
          <button class="clear-btn" onclick="window.__clearFilters()">✕ Clear filters</button>
        ` : ''}
      </div>

      <main class="main">
        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            <input
              class="search-input"
              type="text"
              placeholder="Search files…"
              value="${searchQuery.replace(/"/g, '&quot;')}"
              oninput="window.__onSearch(this.value)"
              id="search-input"
            />
            ${searchQuery ? `<button class="clear-search" onclick="window.__onSearch('')">✕</button>` : ''}
          </div>

          <div class="sort-wrap">
            <select class="sort-select" onchange="window.__onSort(this.value)">
              <option value="modified" ${sortBy === 'modified' ? 'selected' : ''}>Latest</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>A → Z</option>
            </select>
          </div>
        </div>

        <div class="result-info">
          ${filtered.length} result${filtered.length !== 1 ? 's' : ''}
          ${searchQuery ? ` for "<strong>${searchQuery}</strong>"` : ''}
          ${activeDocTypes.size > 0 ? ` · ${[...activeDocTypes].join(', ')}` : ''}
          ${activeBlocks.size > 0 ? ` · ${[...activeBlocks].join(', ')}` : ''}
        </div>

        <div class="file-list">
          ${filtered.length === 0
            ? `<div class="empty">No files match your filters.</div>`
            : filtered.map(renderFileCard).join('')}
        </div>
      </main>
    </div>
  `;

  // restore focus on search after re-render
  const input = document.getElementById('search-input');
  if (input && document.activeElement?.id === 'search-input') {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

// ── Event handlers ─────────────────────────────────────────────────────────────
window.__onSearch = (val) => { searchQuery = val; render(); };
window.__onSort = (val) => { sortBy = val; render(); };
window.__toggleDocType = (dt) => {
  activeDocTypes.has(dt) ? activeDocTypes.delete(dt) : activeDocTypes.add(dt);
  render();
};
window.__toggleBlock = (b) => {
  activeBlocks.has(b) ? activeBlocks.delete(b) : activeBlocks.add(b);
  render();
};
window.__clearFilters = () => {
  activeDocTypes.clear();
  activeBlocks.clear();
  render();
};

// ── Boot ──────────────────────────────────────────────────────────────────────
function onFilesUpdated(files, newFiles) {
  allFiles = files.map(categorizeFile);
  newFiles.forEach(f => {
    newFileIds.add(f.id);
    // remove "new" highlight after 5s
    setTimeout(() => { newFileIds.delete(f.id); render(); }, 5000);
  });
  render();
}

async function init() {
  // Show demo data immediately while Drive loads
  const demoReady = DEMO_FILES.map(categorizeFile);
  if (!import.meta.env.VITE_GDRIVE_API_KEY) {
    allFiles = demoReady;
    render();
    return;
  }

  allFiles = demoReady;
  render();

  try {
    await startDriveSync(onFilesUpdated);
  } catch (err) {
    console.error('Drive sync failed, using demo data', err);
  }
}

init();
