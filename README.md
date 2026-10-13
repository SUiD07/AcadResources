# AcadResources

Academic resources portal for MDCU (Faculty of Medicine, Chulalongkorn University) students. It collects peer-made study materials from Google Drive, sorts them by block, document type and generation, and also hosts academic activities, official resources, a board-exam section and career navigation.

Built with React 18, TypeScript, Vite, Tailwind CSS v4 and shadcn/ui (Radix). Data is stored in Supabase. Rich-text content is edited with Tiptap.

## Features

| Route | Section | What it does |
|---|---|---|
| `/` | Peer Support | Student documents synced from Google Drive, auto-classified by block, doc type and board exam, filterable by generation/year |
| `/activities`, `/activities/:id` | Academic Activities | Events and workshops with rich-text detail pages |
| `/resources`, `/resources/:categoryId` | Academic Resources | Official materials grouped into categories |
| `/board` | Board | Board exam (NLE) content, organized by generation |
| `/career` | Career Navigation | Career guidance pages |
| `/keywords` | Keyword Management | **Admin only.** Edit the keyword rules used to classify Drive documents |

Students sign in with Google, then pick their study year (saved in `user_preferences`). Admins get add/edit/delete controls, drag-and-drop ordering, and the keyword manager.

## Getting started

Requirements: Node.js 20+ and [pnpm](https://pnpm.io) (the repo pins `pnpm@9` via `packageManager`).

```bash
pnpm install
cp .env.example .env   # or create .env by hand, see below
pnpm dev               # http://localhost:3000
```

### Environment variables

Create a `.env` file in the project root (it is git-ignored):

```dotenv
# Supabase
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>

# Google (sign-in and Drive access)
VITE_GOOGLE_CLIENT_ID=<OAuth client id>.apps.googleusercontent.com
VITE_GDRIVE_FOLDER_ID=<root Drive folder id>
VITE_GDRIVE_API_KEY=<optional API key>
```

`VITE_USE_SUPABASE=false` switches the data layer to the mock data in [src/data/mockData.ts](src/data/mockData.ts), which is useful for UI work without a database. Values are read in [src/lib/config.ts](src/lib/config.ts).

Only `VITE_`-prefixed variables reach the browser. Never put server secrets (such as a Google client secret or Supabase service-role key) in a `VITE_` variable.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite dev server on port 3000 |
| `pnpm build` | Production build into `build/` |

There is no test or lint script yet.

## Project structure

```
src/
  App.tsx                 Login → year selection → routes
  components/
    section/              One component per page (PeerSupport, Activities, Resources, Board, Career, Keywords)
    admin/                Add/edit/delete dialogs and detail pages
    board/                Board editor, slash commands, generation tabs
    keyword/              Keyword rule editing UI
    ui/                   shadcn/ui primitives
  hooks/                  Data hooks (activities, board, generations, content)
  lib/
    config.ts             Env-driven config (Supabase / Drive)
    dataService.ts        Data router: Supabase or mock data
    supabase.ts           Supabase queries
    googleDriveService.ts Google OAuth token + Drive API helpers
    syncStudentDocumentsFromDrive.ts  Drive → student_documents sync and classification
    KeywordMatching.ts    Classifies documents using keyword_configs
    types.ts              Shared types
  data/mockData.ts        Offline mock data
@/components/             Tiptap simple-editor template (imported via the `@` alias)
```

### Supabase tables

The app reads and writes these tables: `peer_support`, `student_documents`, `drive_sync`, `keyword_configs`, `folder_settings`, `generations`, `activities`, `activity_content`, `resource_categories`, `resource_items`, `resource_category_content`, `resource_item_content`, `announcements`, `boards`, `board_content`, `user_preferences`.

The schema isn't checked into the repo. See [src/lib/types.ts](src/lib/types.ts) for the expected row shapes.

### How Drive documents get into the app

1. A Google Apps Script ([src/components/appscript.env](src/components/appscript.env), copied into script.google.com) walks the shared Drive folder and upserts file metadata into Supabase. Fill in its `SUPABASE_URL` / `SUPABASE_KEY` placeholders only inside Apps Script, never in this repo.
2. When the Peer Support page loads, `syncStudentDocumentsFromDrive()` merges new `drive_sync` rows into `student_documents`, classifying each one with the admin-editable rules in `keyword_configs` (block, doc type, board exam).
3. Admins tune those rules on `/keywords`.

## Deployment

The app is deployed on Vercel. [vercel.json](vercel.json) serves `build/` and rewrites every path to `index.html` so client-side routes work. Set the same `VITE_*` environment variables in the Vercel project settings.

## More docs

The `src/` folder has older guides from the original Figma Make setup: [DEVELOPER_GUIDE.md](src/DEVELOPER_GUIDE.md), [PROJECT_STRUCTURE.md](src/PROJECT_STRUCTURE.md), [ARCHITECTURE_DIAGRAM.md](src/ARCHITECTURE_DIAGRAM.md) and [GITHUB_WORKFLOW.md](src/GITHUB_WORKFLOW.md). Some details there (such as the mock login) are out of date, so where they disagree with this README, trust the code. The original design is in [Figma](https://www.figma.com/design/DVEhb2mctFs551TTNBKj1P/Website-Information-Architecture).
