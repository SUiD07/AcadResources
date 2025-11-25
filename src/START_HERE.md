# 👋 START HERE - For Backend Developer

## Welcome to the Chulalongkorn Medical Academic Portal Project!

This document is your **quick start guide** to working on this project without causing conflicts with the UI team who uses Figma Make.

---

## 🎯 Your Role: Backend/Database Integration

Your job is to:
1. ✅ Set up Supabase database
2. ✅ Implement data fetching functions
3. ✅ Test and deploy

**You will ONLY edit files in the `/lib/` folder.**

---

## 📁 Your Workspace

```
/lib/
  ├── config.ts       ← START HERE: Toggle mock/real data
  ├── supabase.ts     ← MAIN WORK: Write all database queries here
  └── types.ts        ← RARELY: Add new data fields (coordinate with UI team)

/data/
  └── mockData.ts     ← OPTIONAL: Update test data during development
```

**That's it!** Don't touch any other files.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Read the Architecture (2 minutes)

The project has a **smart data router** that switches between mock data and Supabase:

```
Component → dataService → checks config → mock OR Supabase
```

- **Mock data**: Used for testing/development
- **Supabase**: Used in production
- **Switch**: Just change one flag in `/lib/config.ts`

### Step 2: Set Up Supabase (15 minutes)

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Create tables** (copy SQL from `/GITHUB_WORKFLOW.md`):
   - `peer_support`
   - `activities`
   - `resource_categories`

3. **Install Supabase client**:
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Add credentials** to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 3: Implement Functions (30-60 minutes)

1. **Open `/lib/supabase.ts`**

2. **Uncomment the Supabase client** (lines 10-16)

3. **Replace all `throw new Error` lines** with real Supabase queries

4. **Example** (copy this pattern):
   ```typescript
   export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
     const { data, error } = await supabase
       .from('peer_support')
       .select('*')
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data || [];
   }
   ```

5. **Test with mock data first**:
   - Keep `USE_SUPABASE = false` in `/lib/config.ts`
   - Run `npm run dev`
   - Everything should work with mock data

6. **Switch to Supabase**:
   - Change `USE_SUPABASE = true` in `/lib/config.ts`
   - Refresh browser
   - Should now use real database!

---

## ✅ Success Checklist

After 1 hour of work, you should have:

- [ ] Supabase project created
- [ ] Database tables created with SQL
- [ ] `.env.local` file with credentials
- [ ] Supabase client installed (`npm install @supabase/supabase-js`)
- [ ] Functions in `/lib/supabase.ts` implemented
- [ ] Tested with `USE_SUPABASE = false` (mock data works)
- [ ] Tested with `USE_SUPABASE = true` (real data works)

---

## 📚 Full Documentation

If you need more details, read these files **in this order**:

1. **`/FILE_RESPONSIBILITY_MAP.md`** ← Visual guide (2 min read)
2. **`/GITHUB_WORKFLOW.md`** ← Your complete workflow (10 min read)
3. **`/COLLABORATION_GUIDE.md`** ← Full team guide (15 min read)
4. **`/DEVELOPER_GUIDE.md`** ← Technical deep dive (20 min read)

---

## 🚨 Critical Rules (Read This!)

### ✅ DO:
- Edit files in `/lib/` folder
- Commit changes to `/lib/` files
- Pull latest code before working
- Test with mock data first
- Communicate when adding new data fields

### 🚫 DON'T:
- Edit `/App.tsx` - UI team owns this
- Edit `/components/**` - UI team owns these
- Edit `/lib/dataService.ts` - System file (never touch!)
- Commit changes to component files
- Remove existing fields from types without asking

**If you follow these rules, you will NEVER have merge conflicts!**

---

## 💡 Common Questions

### Q: "How do I add a new data field?"

**A:** Follow these steps:

1. **Add to `/lib/types.ts`**:
   ```typescript
   export interface PeerSupportItem {
     // ... existing fields
     newField: string; // ← Add here
   }
   ```

2. **Update database** (Supabase dashboard):
   ```sql
   ALTER TABLE peer_support ADD COLUMN new_field TEXT;
   ```

3. **Tell UI team**: "Hey, added `newField` to PeerSupportItem"

4. **Done!** Supabase queries automatically include new field.

---

### Q: "How do I test without breaking production?"

**A:** Use the config flag:

```typescript
// In /lib/config.ts

// For development/testing
export const USE_SUPABASE = false; // Uses mock data

// For production
export const USE_SUPABASE = true; // Uses real database
```

---

### Q: "UI team made changes. How do I sync?"

**A:** Just pull from GitHub:

```bash
git pull origin main
```

Since you only edit `/lib/` and they only edit `/components/`, there won't be conflicts!

---

### Q: "What if I accidentally edited a component file?"

**A:** Reset it:

```bash
# Reset single file
git checkout origin/main -- components/SomeComponent.tsx

# Or reset all component changes
git checkout origin/main -- components/
```

---

### Q: "How do I know if Supabase is working?"

**A:** Check these:

1. **Browser console**: Should not show errors
2. **Supabase dashboard**: Check "Table Editor" for data
3. **App**: Should load and display data correctly
4. **Network tab**: Should see requests to Supabase API

---

## 🎓 Architecture in 30 Seconds

```
┌─────────────────────────────────────────────┐
│         React Components (UI Team)          │
│    ← THEY edit in Figma Make                │
└─────────────────┬───────────────────────────┘
                  │ imports
                  ↓
┌─────────────────────────────────────────────┐
│     /lib/dataService.ts (DON'T TOUCH)       │
│     Automatically routes to mock or Supabase│
└─────────────┬───────────────────────────────┘
              │ checks config
              ↓
┌─────────────────────────────────────────────┐
│        /lib/config.ts (YOU edit)            │
│        USE_SUPABASE = true/false            │
└─────┬───────────────────────────────────┬───┘
      │ if false                          │ if true
      ↓                                   ↓
┌──────────────┐                 ┌────────────────┐
│ /data/       │                 │ /lib/          │
│ mockData.ts  │                 │ supabase.ts    │
│              │                 │ ← YOU edit     │
└──────────────┘                 └────────────────┘
```

**Key insight**: Components never directly call Supabase. They always go through dataService, which checks the config flag.

---

## 🔥 Most Important Thing

**Your changes to `/lib/supabase.ts` will work automatically when you flip the `USE_SUPABASE` flag.**

The UI team doesn't need to change ANYTHING in their components. That's the magic of this architecture!

---

## 🆘 Need Help?

1. **Check browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Read `/GITHUB_WORKFLOW.md`** for detailed examples
4. **Contact team lead** if stuck

---

## 🎉 You're Ready!

**Time to start:** ~15 minutes to read this + ~1 hour to implement

**Next step:** Open `/lib/supabase.ts` and start coding!

**Good luck!** 🚀

---

**P.S.** After you finish, update this checklist:

- [ ] Supabase integrated
- [ ] All functions implemented
- [ ] Tested in development
- [ ] Tested in production
- [ ] Documented any special setup needed
- [ ] Notified UI team that Supabase is ready

---

**File created**: November 25, 2025  
**Project**: Academic Resources Portal - Chulalongkorn University  
**For**: Backend Developer onboarding
