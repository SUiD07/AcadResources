# 🎓 Academic Resources Portal - Developer Guide

## 📋 Table of Contents
1. [Project Architecture](#project-architecture)
2. [GitHub Workflow](#github-workflow)
3. [Figma Make Workflow](#figma-make-workflow)
4. [Supabase Integration Guide](#supabase-integration-guide)
5. [File Permissions Reference](#file-permissions-reference)

---

## 🏗 Project Architecture

This project uses a **separation of concerns** architecture to prevent merge conflicts between GitHub development and Figma Make UI changes.

### Architecture Layers

```
┌─────────────────────────────────────────┐
│          UI Components Layer            │  ← Edit in FIGMA MAKE
│  (All components in /components/)       │
└─────────────────────────────────────────┘
                    ↓ uses
┌─────────────────────────────────────────┐
│      Data Abstraction Layer             │  ← DO NOT EDIT
│      (/lib/dataService.ts)              │
└─────────────────────────────────────────┘
         ↓ switches based on config
┌──────────────────┬──────────────────────┐
│   Mock Data      │   Supabase API       │
│   (/data/)       │   (/lib/supabase.ts) │  ← Edit in GITHUB
└──────────────────┴──────────────────────┘
```

### Key Principle
**UI components NEVER directly import from Supabase or mock data**  
They ONLY import from `dataService.ts`, which handles the routing.

---

## 🔧 GitHub Workflow

### Files You SHOULD Edit in GitHub

#### 1. `/lib/config.ts` - Configuration File
**Purpose:** Control which data source to use

```typescript
// Set to true when Supabase is ready
export const USE_SUPABASE = false; // ← Change this to true when ready
```

**When to Edit:**
- When you finish Supabase integration
- When you want to switch between mock/real data for testing

---

#### 2. `/lib/supabase.ts` - Supabase API Functions
**Purpose:** All Supabase database interactions

**What to Add:**
```typescript
// Install Supabase client first:
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Implement all the TODO functions
export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
  const { data, error } = await supabase
    .from('peer_support')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// ... implement other functions
```

**Functions to Implement:**
- ✅ `fetchPeerSupportData()` - Get all peer support items
- ✅ `createPeerSupportItem()` - Add new item
- ✅ `updatePeerSupportItem()` - Update existing item
- ✅ `deletePeerSupportItem()` - Delete item
- ✅ `fetchActivities()` - Get all activities
- ✅ `createActivity()` - Add new activity
- ✅ `updateActivity()` - Update activity
- ✅ `deleteActivity()` - Delete activity
- ✅ `fetchResourceCategories()` - Get all resource categories
- ✅ `createResourceCategory()` - Add new category
- ✅ `updateResourceCategory()` - Update category
- ✅ `deleteResourceCategory()` - Delete category

---

#### 3. `/lib/types.ts` - Type Definitions
**Purpose:** TypeScript interfaces for data structures

**When to Edit:**
- When adding new fields to database tables
- When creating new data structures

**Example:**
```typescript
export interface PeerSupportItem {
  id: string;
  blockName: string;
  blockCode?: string;
  thumbnail: string;
  driveLink: string;
  generation: string;
  block: string;
  category: string;
  // Add new fields here when needed
  createdAt?: string;
  updatedAt?: string;
}
```

---

#### 4. Environment Variables
**Create:** `.env.local` file (not tracked in Git)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### Files You SHOULD NOT Edit in GitHub

❌ **DO NOT EDIT THESE IN GITHUB:**
- `/App.tsx` - Main application component
- `/components/**/*.tsx` - All UI components
- `/styles/globals.css` - Styling

**Why?** These are managed by Figma Make for UI changes.

---

## 🎨 Figma Make Workflow

### Files You CAN Edit in Figma Make

#### 1. All Components (`/components/**/*.tsx`)
**What You Can Do:**
- Change UI layouts
- Update styling and colors
- Add new UI components
- Modify component logic

**Example Request:**
> "Add a search bar to the Peer Support section"
> "Change the card layout to show 3 columns instead of 2"
> "Add a loading spinner when data is fetching"

---

#### 2. Mock Data (`/data/mockData.ts`)
**What You Can Do:**
- Add more test data
- Modify existing mock entries
- Test edge cases

**When to Edit:**
- Testing UI with different data scenarios
- Before Supabase integration is complete

---

#### 3. App.tsx
**What You Can Do:**
- Change routing logic
- Modify authentication flow
- Update layout structure

---

### Files You SHOULD NOT Edit in Figma Make

❌ **DO NOT ASK FIGMA MAKE TO EDIT:**
- `/lib/config.ts` - Configuration
- `/lib/supabase.ts` - Database functions
- `/lib/dataService.ts` - Abstraction layer

**Why?** These control data fetching and will be managed in GitHub.

---

## 🗄️ Supabase Integration Guide

### Step 1: Create Supabase Tables

#### Table: `peer_support`
```sql
create table peer_support (
  id uuid default uuid_generate_v4() primary key,
  block_name text not null,
  block_code text,
  thumbnail text not null,
  drive_link text not null,
  generation text not null,
  block text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Table: `activities`
```sql
create table activities (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  icon text not null,
  date text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Table: `resource_categories`
```sql
create table resource_categories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  icon text not null,
  items jsonb not null,
  link text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

### Step 2: Set Up Row Level Security (RLS)

```sql
-- Enable RLS
alter table peer_support enable row level security;
alter table activities enable row level security;
alter table resource_categories enable row level security;

-- Allow public read access
create policy "Allow public read access" on peer_support
  for select using (true);

create policy "Allow public read access" on activities
  for select using (true);

create policy "Allow public read access" on resource_categories
  for select using (true);

-- Allow authenticated users to insert/update/delete
create policy "Allow authenticated insert" on peer_support
  for insert to authenticated using (true);

create policy "Allow authenticated update" on peer_support
  for update to authenticated using (true);

create policy "Allow authenticated delete" on peer_support
  for delete to authenticated using (true);

-- Repeat for other tables
```

---

### Step 3: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

### Step 4: Implement Functions in `/lib/supabase.ts`

See the TODO comments in that file for guidance.

---

### Step 5: Test with Mock Data First

1. Keep `USE_SUPABASE = false` in `/lib/config.ts`
2. Test all UI features with mock data
3. Implement Supabase functions
4. Switch to `USE_SUPABASE = true`
5. Test with real database

---

### Step 6: Deploy Environment Variables

Make sure to add environment variables to your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

---

## 📁 File Permissions Reference

### 🟢 SAFE TO EDIT IN GITHUB

| File | Purpose | What to Edit |
|------|---------|--------------|
| `/lib/config.ts` | Configuration | Toggle `USE_SUPABASE` flag |
| `/lib/supabase.ts` | Database API | Implement Supabase functions |
| `/lib/types.ts` | Type definitions | Add/modify TypeScript interfaces |
| `.env.local` | Environment vars | Add Supabase credentials |

---

### 🔵 SAFE TO EDIT IN FIGMA MAKE

| File | Purpose | What to Edit |
|------|---------|--------------|
| `/App.tsx` | Main app | Routing, authentication flow |
| `/components/**/*.tsx` | UI components | Layout, styling, interactivity |
| `/data/mockData.ts` | Test data | Add/modify mock entries |
| `/styles/globals.css` | Global styles | Theme, typography, colors |

---

### 🔴 DO NOT EDIT (Auto-managed)

| File | Purpose | Why Not? |
|------|---------|----------|
| `/lib/dataService.ts` | Data abstraction | Auto-routes between mock/Supabase |
| `/components/figma/ImageWithFallback.tsx` | System component | Protected by Figma Make |

---

## 🚀 Workflow Examples

### Example 1: Adding Supabase Integration

**In GitHub:**
```bash
# 1. Create branch
git checkout -b feature/supabase-integration

# 2. Edit /lib/supabase.ts (implement functions)
# 3. Edit /lib/config.ts (keep USE_SUPABASE = false for now)
# 4. Create .env.local with credentials

# 5. Test locally
npm run dev

# 6. When ready, set USE_SUPABASE = true
# 7. Commit and push
git add lib/
git commit -m "Add Supabase integration"
git push origin feature/supabase-integration
```

**In Figma Make:**
- No changes needed! UI components automatically use new data source.

---

### Example 2: Adding New UI Feature

**In Figma Make:**
> "Add a search bar to the Peer Support section that filters by block name"

**Result:** Figma Make edits `/components/PeerSupportSection.tsx` only

**In GitHub:**
- No changes needed! Data layer unchanged.
- Pull latest changes when ready to sync

---

### Example 3: Avoiding Conflicts

**Scenario:** Both editing at the same time

✅ **Safe:**
- GitHub: Editing `/lib/supabase.ts`
- Figma Make: Editing `/components/PeerSupportSection.tsx`
- No conflict - different files!

❌ **Conflict:**
- GitHub: Editing `/components/PeerSupportSection.tsx`
- Figma Make: Editing `/components/PeerSupportSection.tsx`
- CONFLICT - same file!

**Solution:** Coordinate who edits what, or always pull latest before editing in Figma Make.

---

## 🎯 Quick Reference

### "I want to add real database functionality"
→ Edit in **GITHUB**: `/lib/supabase.ts` and `/lib/config.ts`

### "I want to change the UI design"
→ Edit in **FIGMA MAKE**: Ask AI to modify components

### "I want to add a new data field"
→ Edit in **GITHUB**: `/lib/types.ts`, then update `/lib/supabase.ts`

### "I want to test with different data"
→ Edit in **FIGMA MAKE**: `/data/mockData.ts` (or ask AI)

### "I want to switch between mock and real data"
→ Edit in **GITHUB**: `/lib/config.ts` (toggle `USE_SUPABASE`)

---

## 📞 Support

If you run into conflicts or issues:

1. **Check this guide** for file permissions
2. **Pull latest changes** from GitHub before using Figma Make
3. **Communicate with team** about what files you're editing
4. **Use feature branches** in GitHub for all Supabase work

---

## ✅ Checklist for Supabase Integration

- [ ] Create Supabase project
- [ ] Set up database tables (peer_support, activities, resource_categories)
- [ ] Configure Row Level Security policies
- [ ] Add environment variables (.env.local)
- [ ] Install @supabase/supabase-js
- [ ] Implement functions in /lib/supabase.ts
- [ ] Test with USE_SUPABASE = false (mock data)
- [ ] Switch to USE_SUPABASE = true
- [ ] Test all CRUD operations
- [ ] Deploy with environment variables
- [ ] Update admin functionality to use real database

---

**Last Updated:** November 25, 2025  
**Project:** Academic Resources Portal - Chulalongkorn University Medical School
