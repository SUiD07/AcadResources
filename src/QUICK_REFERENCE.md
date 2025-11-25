# 🚀 Quick Reference - Edit Permissions

## For Your Coworker

### ✅ EDIT IN GITHUB (Data Layer)

```
📁 /lib/
  ├── config.ts          ← Toggle USE_SUPABASE flag
  ├── supabase.ts        ← Implement all database functions
  └── types.ts           ← Add new TypeScript interfaces

📁 Root
  └── .env.local         ← Supabase credentials
```

**Your Job:** Implement Supabase integration here!

---

### ✅ EDIT IN FIGMA MAKE (UI Layer)

```
📁 /components/
  ├── PeerSupportSection.tsx
  ├── AcademicActivitiesSection.tsx
  ├── AcademicResourcesSection.tsx
  ├── Sidebar.tsx
  ├── MobileNav.tsx
  └── ... all other components

📁 /data/
  └── mockData.ts        ← Add test data

📁 Root
  └── App.tsx            ← Main app logic
```

**Our Job:** UI changes and design updates!

---

### ❌ DON'T TOUCH

```
📁 /lib/
  └── dataService.ts     ← Auto-managed abstraction layer

📁 /components/figma/
  └── ImageWithFallback.tsx  ← System file
```

---

## 🎯 Common Tasks

| Task | Where to Edit | File(s) |
|------|---------------|---------|
| Add Supabase integration | **GitHub** | `/lib/supabase.ts` |
| Switch data source | **GitHub** | `/lib/config.ts` |
| Add new database field | **GitHub** | `/lib/types.ts`, `/lib/supabase.ts` |
| Change UI layout | **Figma Make** | `/components/*.tsx` |
| Update styling | **Figma Make** | `/components/*.tsx`, `/styles/globals.css` |
| Add test data | **Figma Make** | `/data/mockData.ts` |

---

## 📋 Supabase Integration Checklist

1. ✅ Create Supabase tables (peer_support, activities, resource_categories)
2. ✅ Set up RLS policies
3. ✅ Add credentials to `.env.local`
4. ✅ Run `npm install @supabase/supabase-js`
5. ✅ Implement functions in `/lib/supabase.ts`
6. ✅ Test with `USE_SUPABASE = false` first
7. ✅ Switch to `USE_SUPABASE = true`
8. ✅ Deploy with environment variables

---

## 🔄 Workflow to Avoid Conflicts

### GitHub Dev:
```bash
git checkout -b feature/supabase
# Edit /lib/supabase.ts
# Edit /lib/config.ts
git commit -m "Add Supabase"
git push
```

### Figma Make Dev:
```
Pull latest from GitHub first!
Then ask AI: "Add a search feature to Peer Support"
AI will edit /components/PeerSupportSection.tsx only
No conflict! ✅
```

---

## 📞 Questions?

Read full guide: `/DEVELOPER_GUIDE.md`
