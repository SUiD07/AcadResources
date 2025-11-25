# 📋 File Responsibility Map

## Quick Visual Guide: Who Edits What?

---

## 🟢 GITHUB TEAM (Backend/Database)

```
/lib/
├── ✅ config.ts                 ← YOU: Toggle USE_SUPABASE flag
├── ✅ supabase.ts               ← YOU: All database queries (CRUD operations)
└── ⚠️  types.ts                 ← YOU: Add new types (coordinate with UI team)

/data/
└── ✅ mockData.ts               ← YOU: Update during development

/.env.local                      ← YOU: Supabase credentials
```

**Your tools:** VS Code, GitHub Desktop, Supabase Dashboard

---

## 🔵 FIGMA MAKE TEAM (Frontend/UI)

```
/
├── ⚠️  App.tsx                  ← THEM: Main app structure

/components/
├── ⚠️  LoginPage.tsx            ← THEM: All UI components
├── ⚠️  Sidebar.tsx
├── ⚠️  MobileNav.tsx
├── ⚠️  PeerSupportSection.tsx
├── ⚠️  AcademicActivitiesSection.tsx
├── ⚠️  AcademicResourcesSection.tsx
├── ⚠️  FilterBar.tsx
└── ⚠️  ContentCategory.tsx

/styles/
└── ⚠️  globals.css              ← THEM: All styling
```

**Their tools:** Figma Make AI interface

---

## 🔒 NEVER TOUCH (System Files)

```
/lib/
└── 🚫 dataService.ts            ← AUTO: Switches between mock/Supabase

/components/figma/
└── 🚫 ImageWithFallback.tsx     ← SYSTEM: Protected component
```

---

## 📊 Conflict Risk Matrix

| File | GitHub Edit | Figma Make Edit | Conflict Risk |
|------|-------------|-----------------|---------------|
| `/lib/config.ts` | ✅ Yes | 🚫 No | 🟢 None |
| `/lib/supabase.ts` | ✅ Yes | 🚫 No | 🟢 None |
| `/data/mockData.ts` | ✅ Yes | ✅ Yes | 🟡 Low (coordinate) |
| `/lib/types.ts` | ✅ Yes | ⚠️  Rare | 🟡 Low (coordinate) |
| `/App.tsx` | 🚫 No | ✅ Yes | 🟢 None |
| `/components/**` | 🚫 No | ✅ Yes | 🟢 None |
| `/lib/dataService.ts` | 🚫 No | 🚫 No | 🟢 None (auto-managed) |

---

## 🎯 Decision Tree

### "I want to change how data is fetched from database"
→ **GitHub**: Edit `/lib/supabase.ts`

### "I want to switch between mock and real data"
→ **GitHub**: Edit `/lib/config.ts`

### "I want to add a new field to the data"
1. **GitHub**: Edit `/lib/types.ts`
2. **GitHub**: Update `/lib/supabase.ts`
3. **Coordinate**: Tell UI team about new field
4. **Figma Make**: UI team can now use the field

### "I want to change button colors or layout"
→ **Figma Make**: Edit components

### "I want to add a loading spinner"
→ **Figma Make**: Edit components

### "I want to test with different sample data"
→ **Either**: Edit `/data/mockData.ts` (coordinate if both editing)

---

## 🔄 Typical Workflow

### Week 1: Setup
```
GitHub Team:
  ✅ Create Supabase tables
  ✅ Edit /lib/supabase.ts (implement functions)
  ✅ Keep USE_SUPABASE = false

Figma Make Team:
  ✅ Style components
  ✅ Test with mock data
  ✅ Add new UI features

Conflicts: NONE ✨
```

### Week 2: Integration
```
GitHub Team:
  ✅ Test Supabase functions
  ✅ Set USE_SUPABASE = true
  ✅ Fix any bugs

Figma Make Team:
  ✅ Continue UI work
  ✅ App automatically uses real data now

Conflicts: NONE ✨
```

### Week 3: Production
```
GitHub Team:
  ✅ Monitor database
  ✅ Add new queries as needed
  ✅ Optimize performance

Figma Make Team:
  ✅ Refine UI based on user feedback
  ✅ Add new sections

Conflicts: NONE ✨
```

---

## ⚡ Emergency Conflict Resolution

### If you accidentally edited a component file in GitHub:

```bash
# Reset to remote version (discard your changes)
git checkout origin/main -- components/SomeComponent.tsx

# Or if you need to keep changes
git stash
# Coordinate with UI team to apply changes in Figma Make
```

### If Figma Make accidentally edited a lib file:

Don't panic! Just push your GitHub version and it will be correct.

---

## 📞 Communication Protocols

### GitHub Team should notify UI team when:
- [ ] Adding new fields to `/lib/types.ts`
- [ ] Changing data structure/format
- [ ] Ready to flip `USE_SUPABASE = true`
- [ ] Database schema changes

### UI Team should notify GitHub team when:
- [ ] Need new data fields
- [ ] Need new query functions
- [ ] Adding new sections requiring data
- [ ] About to make major component refactor

---

## 🎓 File Purpose Quick Reference

| File | Purpose | Owner |
|------|---------|-------|
| `config.ts` | Feature flags & env config | Backend |
| `supabase.ts` | Database queries | Backend |
| `types.ts` | Data structure definitions | Shared* |
| `dataService.ts` | Smart router (mock↔Supabase) | System |
| `mockData.ts` | Test data | Shared* |
| `App.tsx` | Main app structure | Frontend |
| `components/*.tsx` | UI components | Frontend |
| `globals.css` | Styling | Frontend |

\* Shared = Coordinate before editing

---

## ✅ Pre-commit Checklist

### For GitHub Team (Backend):
- [ ] Only modified files in `/lib/` or `/data/`
- [ ] Did NOT modify files in `/components/`
- [ ] Did NOT modify `/App.tsx`
- [ ] Updated `/lib/types.ts`? → Told UI team
- [ ] Tested with `USE_SUPABASE = false` first
- [ ] Environment variables documented

### For Figma Make Team (UI):
- [ ] Only modified files in `/components/` or `/App.tsx`
- [ ] Did NOT modify files in `/lib/supabase.ts`
- [ ] Did NOT modify `/lib/config.ts`
- [ ] Need new data field? → Told backend team
- [ ] Tested in browser before pushing

---

## 🏆 Success Metrics

**Zero conflicts achieved when:**
- ✅ Backend team stays in `/lib/` folder
- ✅ UI team stays in `/components/` folder
- ✅ Both teams pull latest before working
- ✅ Communication happens when touching shared files

**This architecture makes it IMPOSSIBLE to have conflicts if you follow the rules!**

---

## 📚 Related Documentation

- **Full details:** `/COLLABORATION_GUIDE.md`
- **Backend guide:** `/GITHUB_WORKFLOW.md`
- **All developers:** `/DEVELOPER_GUIDE.md`
- **Quick tips:** `/QUICK_REFERENCE.md`

---

**Print this page and put it on your desk!** 📌
