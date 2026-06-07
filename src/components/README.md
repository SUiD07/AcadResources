# Drive Catalog

A Vite + vanilla JS app that pulls files from Google Drive, auto-categorizes them using your `detectDocType` and `blockMap` logic, and presents a searchable/filterable UI.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → enable **Google Drive API**
3. Create an **API Key** under APIs & Services → Credentials
4. (Optional) Restrict the key to `https://www.googleapis.com/drive/v3/files`

```bash
cp .env.example .env
# Edit .env and fill in your VITE_GDRIVE_API_KEY and VITE_GDRIVE_FOLDER_ID
```

> **Note:** The API Key method works for files shared publicly or in a shared drive. For private files, you'll need OAuth 2.0 — see [Drive API docs](https://developers.google.com/drive/api/guides/about-auth).

### 3. Run
```bash
npm run dev
```

Without an API key, the app runs with demo data automatically.

## How it works

- **`src/categorize.js`** — Your `detectDocType` and `blockMap` logic. Edit keyword arrays here to update categories.
- **`src/drive.js`** — Fetches all files from Drive using the Files API, polls every 60s for new files.
- **`src/main.js`** — Renders the UI: sidebar filters (doc type + block), search bar, sortable file list.

## Live sync

New files appear automatically (60s poll interval). They flash green and show a **NEW** badge for 5 seconds.

To change the poll interval, edit `POLL_INTERVAL_MS` in `src/drive.js`.

## Adding more categories

Edit the `docKeywords` array in `src/categorize.js`:

```js
{ keys: ['your keyword', 'another'], val: 'Your Category' }
```

Same for `blockMap` — add new subject blocks as needed.
