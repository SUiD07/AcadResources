# 🚀 GitHub Workflow - Quick Start for Backend Team

> **TL;DR**: Edit `/lib/` files in GitHub. Don't touch `/components/` files. That's it!

---

## 📂 Your Files (Edit These in GitHub)

### ✅ Files You OWN:

```
/lib/
  ├── config.ts         ← Toggle mock/Supabase here
  ├── supabase.ts       ← Write all database queries here
  └── types.ts          ← Add new data fields here (coordinate with UI team)

/data/
  └── mockData.ts       ← Update test data during development

.env.local              ← Add your Supabase credentials
```

### 🚫 Files You DON'T Touch:

```
/App.tsx                    ← Figma Make edits this
/components/**/*.tsx        ← Figma Make edits these
/lib/dataService.ts         ← Never edit (auto-router)
/styles/globals.css         ← Figma Make edits this
```

---

## 🎯 Your Mission: Add Supabase to Project

### Step 1: Install Supabase
```bash
npm install @supabase/supabase-js
```

### Step 2: Add Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Edit `/lib/supabase.ts`

**Uncomment the client:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
```

**Implement the functions** (replace all `throw new Error('Supabase not yet implemented');`):

```typescript
export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
  const { data, error } = await supabase
    .from('peer_support')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPeerSupportItem(item: Omit<PeerSupportItem, 'id'>): Promise<PeerSupportItem> {
  const { data, error } = await supabase
    .from('peer_support')
    .insert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePeerSupportItem(id: string, updates: Partial<PeerSupportItem>): Promise<PeerSupportItem> {
  const { data, error } = await supabase
    .from('peer_support')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePeerSupportItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('peer_support')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Repeat for activities and resource_categories...
```

### Step 4: Test with Mock Data First
```typescript
// In /lib/config.ts - Keep this false while developing
export const USE_SUPABASE = false;
```

Run app: `npm run dev`  
Everything should still work with mock data.

### Step 5: Switch to Supabase
```typescript
// In /lib/config.ts - Change when ready
export const USE_SUPABASE = true;
```

Test all features. UI will automatically use real database!

---

## 🗄️ Database Setup (Supabase Dashboard)

### Create These Tables:

#### Table: `peer_support`
```sql
CREATE TABLE peer_support (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_name TEXT NOT NULL,
  block_code TEXT,
  thumbnail TEXT NOT NULL,
  drive_link TEXT NOT NULL,
  generation TEXT NOT NULL,
  block TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE peer_support ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read access" ON peer_support
  FOR SELECT USING (true);

-- Allow authenticated write (for admin)
CREATE POLICY "Authenticated write access" ON peer_support
  FOR ALL TO authenticated USING (true);
```

#### Table: `activities`
```sql
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write access" ON activities
  FOR ALL TO authenticated USING (true);
```

#### Table: `resource_categories`
```sql
CREATE TABLE resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON resource_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write access" ON resource_categories
  FOR ALL TO authenticated USING (true);
```

---

## ✅ Testing Checklist

Test these operations for each section:

**Peer Support:**
- [ ] View all items (READ)
- [ ] Add new item (CREATE)
- [ ] Edit item (UPDATE)
- [ ] Delete item (DELETE)
- [ ] Filter by generation (MDCU 81-76)
- [ ] Filter by block

**Activities:**
- [ ] View all activities
- [ ] Add new activity
- [ ] Edit activity
- [ ] Delete activity

**Resources:**
- [ ] View all categories
- [ ] Add new category
- [ ] Edit category
- [ ] Delete category

---

## 🔄 How Data Flows (Don't Break This!)

```
Component calls:
getPeerSupportData()
        ↓
   dataService.ts checks config
        ↓
   If USE_SUPABASE = false → mockData.ts
   If USE_SUPABASE = true  → supabase.ts (your code!)
```

**Why this matters:**
- Components never directly call Supabase
- You can switch data source by changing one flag
- No UI code changes needed when you add Supabase!

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T:
```typescript
// In a component file - WRONG!
import { supabase } from '../lib/supabase';
const data = await supabase.from('peer_support').select('*');
```

### ✅ DO:
```typescript
// In a component file - CORRECT!
import { getPeerSupportData } from '../lib/dataService';
const data = await getPeerSupportData();
```

**But you won't edit components anyway!** UI team handles that in Figma Make.

---

## 📝 Git Workflow

```bash
# 1. Create feature branch
git checkout -b backend/supabase-integration

# 2. Make changes to /lib/supabase.ts

# 3. Test locally
npm run dev

# 4. Commit ONLY /lib/ files
git add lib/
git commit -m "Implement Supabase queries for peer support"

# 5. Push
git push origin backend/supabase-integration

# 6. Create Pull Request
```

**Pro tip:** Only commit files in `/lib/` and `/data/`. Avoid committing changes to `/components/` or `/App.tsx`.

---

## 💡 Adding New Data Fields

**Example:** Want to add `authorName` field to peer support?

### 1. Update `/lib/types.ts`:
```typescript
export interface PeerSupportItem {
  id: string;
  blockName: string;
  // ... existing fields
  authorName?: string; // ✅ Add new field
}
```

### 2. Update Supabase table:
```sql
ALTER TABLE peer_support ADD COLUMN author_name TEXT;
```

### 3. Update `/data/mockData.ts`:
```typescript
export const mockPeerSupportData: PeerSupportItem[] = [
  {
    id: "1",
    blockName: "Block 1.1",
    authorName: "John Doe", // ✅ Add to mock data
    // ... existing fields
  }
];
```

### 4. Tell UI team:
> "Hey, added `authorName` field to PeerSupportItem type. You can now display it in UI!"

---

## 🤝 Coordination with UI Team

### When to notify them:
- ✅ When you add new fields to `/lib/types.ts`
- ✅ When you change API response structure
- ✅ When you're ready to switch `USE_SUPABASE = true`
- ✅ When there are breaking changes

### What they'll notify you about:
- ✅ When they need new data fields
- ✅ When they add new sections needing data
- ✅ When they're about to make big UI changes in Figma Make

---

## 📊 Environment Variables Checklist

### Local Development (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

### Production Deployment:
Add same variables to:
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Build & deploy → Environment
- **Other**: Your platform's env var settings

---

## 🎓 Quick Reference

| Task | File to Edit | Command |
|------|-------------|---------|
| Write database queries | `/lib/supabase.ts` | Edit in VS Code |
| Switch data source | `/lib/config.ts` | Change `USE_SUPABASE` flag |
| Add new data field | `/lib/types.ts` | Add to interface |
| Update test data | `/data/mockData.ts` | Edit mock arrays |
| Add Supabase credentials | `.env.local` | Create file |

---

## 🆘 Troubleshooting

### "Supabase not yet implemented" error
**Cause:** `USE_SUPABASE = true` but functions not implemented  
**Fix:** Set `USE_SUPABASE = false` or finish implementing functions

### TypeScript errors about missing fields
**Cause:** Database returns different structure than types  
**Fix:** Update `/lib/types.ts` to match database schema

### No data showing in UI
**Cause:** Supabase query returning empty or wrong format  
**Fix:** Check browser console for errors, verify table names match

### Merge conflict in components
**Cause:** Accidentally edited `/components/` files  
**Fix:** Accept "theirs" (Figma Make version), don't edit components!

---

## ✨ Summary

**What You Edit:**
- ✅ `/lib/supabase.ts` - Your database code
- ✅ `/lib/config.ts` - Toggle flag
- ✅ `/lib/types.ts` - Data structures (coordinate)

**What You Don't Edit:**
- 🚫 `/components/**` - UI code (Figma Make)
- 🚫 `/lib/dataService.ts` - Auto-router (never touch)
- 🚫 `/App.tsx` - Main app (Figma Make)

**Your Job:**
1. Set up Supabase tables
2. Implement functions in `/lib/supabase.ts`
3. Test with mock data (`USE_SUPABASE = false`)
4. Switch to real data (`USE_SUPABASE = true`)
5. UI magically works! ✨

---

**Questions?** Read `/COLLABORATION_GUIDE.md` or `/DEVELOPER_GUIDE.md` for more details.

---

**Happy coding!** 🎉
