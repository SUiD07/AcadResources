# 🤝 GitHub + Figma Make Collaboration Guide

## For: Coworkers Working on Chulalongkorn Medical Academic Portal

---

## 🎯 Quick Overview

This project is designed to be edited in **TWO PLACES**:
- **GitHub** → For backend logic, data fetching, and Supabase integration
- **Figma Make** → For UI changes, styling, and new component features

**The architecture prevents conflicts** by separating files into clear zones.

---

## 📁 File Organization

### ✅ **SAFE TO EDIT IN GITHUB** (Data & Backend Layer)

These files are YOUR domain. Edit freely in GitHub without worrying about Figma Make conflicts:

| File Path | Purpose | What You'll Do Here |
|-----------|---------|---------------------|
| **`/lib/config.ts`** | Toggle between mock/Supabase data | Change `USE_SUPABASE` flag, add environment variables |
| **`/lib/supabase.ts`** | All Supabase API functions | Write database queries, CRUD operations |
| **`/data/mockData.ts`** | Mock data for development | Update sample data during development |
| **`.env` files** | Environment variables | Add Supabase URL, keys, secrets |
| **`/supabase/` folder** | Supabase migrations & schemas | Database schema definitions (if you create this folder) |

### ⚠️ **EDIT IN GITHUB WITH CAUTION** (Shared Types)

| File Path | Purpose | Coordination Needed |
|-----------|---------|---------------------|
| **`/lib/types.ts`** | TypeScript type definitions | If you add new database fields, coordinate with UI team |

**How to safely edit:**
1. Add new types at the bottom of the file
2. Don't remove existing types without checking with UI team
3. Document new fields with comments

### 🚫 **DO NOT EDIT IN GITHUB** (UI Layer - Figma Make Only)

These files will be edited in Figma Make. If you edit them in GitHub, changes WILL be overwritten:

| Files/Folders | Purpose |
|---------------|---------|
| **`/App.tsx`** | Main application entry point |
| **`/components/**`** | All React UI components |
| **`/styles/globals.css`** | Styling and design tokens |
| All `.tsx` files in `/components/` | UI components |

### 🔒 **NEVER TOUCH** (System Files)

| File | Reason |
|------|--------|
| `/lib/dataService.ts` | Auto-routing layer - manages mock vs Supabase switching |
| `/components/figma/ImageWithFallback.tsx` | Figma Make system component |

---

## 🔄 How the Data Flow Works

```
┌─────────────────────────────────────────────────────────┐
│                     React Components                     │
│              (Edited in Figma Make)                      │
│   /components/PeerSupportSection.tsx                     │
│   /components/AcademicActivitiesSection.tsx              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ imports from
                      ▼
┌─────────────────────────────────────────────────────────┐
│              /lib/dataService.ts                         │
│                 🔒 DON'T TOUCH                           │
│   (Automatically routes to mock or Supabase)             │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
    if USE_SUPABASE = false    if USE_SUPABASE = true
             │                          │
             ▼                          ▼
┌────────────────────────┐  ┌──────────────────────────┐
│   /data/mockData.ts    │  │   /lib/supabase.ts       │
│   ✅ Edit in GitHub    │  │   ✅ Edit in GitHub      │
│   (during development) │  │   (for production)       │
└────────────────────────┘  └──────────────────────────┘
```

---

## 🛠️ Your Supabase Integration Workflow

### Step 1: Set Up Supabase Project
1. Create tables in Supabase dashboard:
   - `peer_support`
   - `activities`  
   - `resource_categories`
   - `resource_items`

### Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 3: Add Environment Variables

Create `.env` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Uncomment Supabase Client in `/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
```

### Step 5: Implement Data Functions in `/lib/supabase.ts`

Example implementation:

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

// ... implement other CRUD functions
```

### Step 6: Switch to Supabase in `/lib/config.ts`

```typescript
export const USE_SUPABASE = true; // Change this when ready
```

### Step 7: Test & Deploy

The UI will automatically use your Supabase data!

---

## 🚀 Testing Your Changes

### Test with Mock Data First
```typescript
// In /lib/config.ts
export const USE_SUPABASE = false;
```

### Test with Supabase
```typescript
// In /lib/config.ts
export const USE_SUPABASE = true;
```

### Both modes should work identically to the UI!

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T DO THIS:
```typescript
// In a React component file
import { supabase } from '../lib/supabase'; // WRONG!
const data = await supabase.from('peer_support').select('*');
```

### ✅ DO THIS INSTEAD:
```typescript
// In a React component file
import { getPeerSupportData } from '../lib/dataService'; // CORRECT!
const data = await getPeerSupportData();
```

**Why?** The dataService automatically handles mock vs real data switching.

---

## 🔀 Merge Conflict Prevention

### If You Need to Add New Fields to Data:

1. **First**: Update `/lib/types.ts`
   ```typescript
   export interface PeerSupportItem {
     id: string;
     blockName: string;
     // ... existing fields
     newField: string; // ✅ Add here
   }
   ```

2. **Second**: Update `/data/mockData.ts`
   ```typescript
   export const mockPeerSupportData: PeerSupportItem[] = [
     {
       id: "1",
       blockName: "Block 1",
       newField: "sample value" // ✅ Add to mock data
     }
   ];
   ```

3. **Third**: Implement in `/lib/supabase.ts`
   ```typescript
   // Your Supabase queries will now include newField
   ```

4. **Coordinate**: Tell UI team about new field so they can use it in Figma Make

---

## 📊 Database Schema Recommendation

### Table: `peer_support`
```sql
CREATE TABLE peer_support (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_name TEXT NOT NULL,
  block_code TEXT,
  thumbnail TEXT,
  drive_link TEXT NOT NULL,
  generation TEXT NOT NULL,
  block TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `activities`
```sql
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `resource_categories`
```sql
CREATE TABLE resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `resource_items`
```sql
CREATE TABLE resource_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL
);
```

---

## 🎨 When to Coordinate with UI Team (Figma Make)

Notify the UI team when you:
- ✅ Add new fields to types
- ✅ Change API response structure
- ✅ Add new data relationships
- ✅ Change authentication flow
- ✅ Are ready to switch `USE_SUPABASE = true`

They will notify you when they:
- ✅ Add new UI sections that need data
- ✅ Change component structure that affects data flow
- ✅ Add new filters or search features

---

## 📞 Communication Protocol

### Before You Push to GitHub:
1. Check if UI team is currently making changes in Figma Make
2. If yes, coordinate timing
3. If no, push freely to `/lib/` and `/data/` folders

### After You Push:
1. Notify team: "Pushed Supabase updates to `/lib/supabase.ts`"
2. Test in dev environment
3. When stable, announce: "Ready to switch to Supabase (`USE_SUPABASE = true`)"

---

## 🧪 Development Workflow Example

### Week 1: Backend Development
```typescript
// In /lib/config.ts
export const USE_SUPABASE = false; // Stay on mock data

// You work in /lib/supabase.ts
// UI team works in Figma Make on components
// No conflicts! 🎉
```

### Week 2: Integration Testing
```typescript
// In /lib/config.ts  
export const USE_SUPABASE = true; // Switch to test

// Test all CRUD operations
// UI team can still make styling changes in Figma Make
// Still no conflicts! 🎉
```

### Week 3: Production
```typescript
// In /lib/config.ts
export const USE_SUPABASE = true; // Keep enabled

// Deploy to production
// Both teams continue working independently
```

---

## 📝 Checklist Before Going Live

- [ ] All Supabase functions implemented in `/lib/supabase.ts`
- [ ] Environment variables set in `.env`
- [ ] `USE_SUPABASE = true` in `/lib/config.ts`
- [ ] Tested all CRUD operations (Create, Read, Update, Delete)
- [ ] Row Level Security (RLS) policies set in Supabase
- [ ] Admin authentication implemented
- [ ] Database backups configured
- [ ] Error handling added to all API calls
- [ ] Coordinated with UI team on data structure

---

## 🆘 Troubleshooting

### Problem: "Supabase not yet implemented" error
**Solution**: You have `USE_SUPABASE = true` but haven't implemented functions in `/lib/supabase.ts`. Either:
- Set `USE_SUPABASE = false` to use mock data
- Or implement the Supabase functions

### Problem: TypeScript errors about missing fields
**Solution**: Update `/lib/types.ts` to match your database schema

### Problem: UI team says data isn't showing
**Solution**: Check:
1. Is `USE_SUPABASE` set correctly in `/lib/config.ts`?
2. Are Supabase functions returning data in correct format?
3. Check browser console for errors

### Problem: Merge conflicts in `/components/` files
**Solution**: 
1. **Don't panic!** 
2. Accept Figma Make version (theirs)
3. Your data changes in `/lib/` will still work
4. Never resolve by keeping "both"

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- TypeScript Types: See `/lib/types.ts`

---

## 👥 Team Contacts

**Backend/Database Team** (You!)
- Edits: `/lib/supabase.ts`, `/lib/config.ts`, `/data/mockData.ts`
- Tools: GitHub, Supabase Dashboard, VS Code

**Frontend/UI Team**  
- Edits: `/components/`, `/App.tsx`, `/styles/`
- Tools: Figma Make, GitHub (for pulling only)

---

## ✨ Summary: What You Can Edit

| ✅ **EDIT IN GITHUB** | 🚫 **DON'T EDIT** |
|-----------------------|------------------|
| `/lib/config.ts` | `/App.tsx` |
| `/lib/supabase.ts` | `/components/**` |
| `/data/mockData.ts` | `/lib/dataService.ts` |
| `.env` files | `/styles/globals.css` |
| `/lib/types.ts` (carefully) | System files |

**Follow this guide and you'll never have merge conflicts!** 🎉

---

**Last Updated**: Generated for Chulalongkorn Medical Academic Portal
**Questions?** Contact your team lead or refer to project documentation.
