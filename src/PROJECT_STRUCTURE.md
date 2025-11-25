# 📂 Project Structure

## Current Folder Organization

```
academic-resources-portal/
│
├── 📁 lib/                          ← DATA LAYER (Edit in GitHub)
│   ├── config.ts                    ✅ Toggle USE_SUPABASE flag
│   ├── supabase.ts                  ✅ Implement Supabase functions
│   ├── types.ts                     ✅ TypeScript interfaces
│   └── dataService.ts               ❌ DO NOT EDIT (auto-managed)
│
├── 📁 data/                         ← MOCK DATA (Edit in Figma Make)
│   └── mockData.ts                  ✅ Test data for development
│
├── 📁 components/                   ← UI LAYER (Edit in Figma Make)
│   ├── LoginPage.tsx                ✅ Authentication page
│   ├── Sidebar.tsx                  ✅ Desktop navigation
│   ├── MobileNav.tsx                ✅ Mobile menu
│   ├── PeerSupportSection.tsx       ✅ Peer support main view
│   ├── AcademicActivitiesSection.tsx ✅ Activities main view
│   ├── AcademicResourcesSection.tsx ✅ Resources main view
│   ├── FilterBar.tsx                ✅ Filter controls
│   ├── ContentCategory.tsx          ✅ Category display component
│   │
│   ├── 📁 ui/                       ✅ Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (many more)
│   │
│   └── 📁 figma/                    ❌ PROTECTED (system files)
│       └── ImageWithFallback.tsx
│
├── 📁 styles/                       ← STYLING (Edit in Figma Make)
│   └── globals.css                  ✅ Global styles & theme
│
├── 📄 App.tsx                       ✅ Main app (Edit in Figma Make)
│
├── 📄 .env.local                    ✅ Environment variables (Edit in GitHub)
│
└── 📄 Documentation files
    ├── DEVELOPER_GUIDE.md           📖 Full guide (this gets sent to coworker)
    ├── QUICK_REFERENCE.md           📖 Quick lookup table
    └── PROJECT_STRUCTURE.md         📖 This file

```

---

## 🎨 Component Hierarchy

```
App.tsx
│
├── LoginPage.tsx (if not logged in)
│
└── Main App (if logged in)
    ├── Sidebar.tsx (desktop)
    ├── MobileNav.tsx (mobile)
    │
    └── Main Content Area
        ├── PeerSupportSection.tsx
        │   ├── FilterBar.tsx
        │   └── ContentCategory.tsx (multiple)
        │
        ├── AcademicActivitiesSection.tsx
        │   └── Card.tsx (multiple)
        │
        └── AcademicResourcesSection.tsx
            └── Card.tsx (multiple)
```

---

## 🔄 Data Flow

```
User Action (UI)
       ↓
Component calls dataService function
       ↓
dataService.ts checks USE_SUPABASE flag
       ↓
    ┌──────┴──────┐
    ↓             ↓
Mock Data    Supabase API
(/data/)     (/lib/supabase.ts)
    ↓             ↓
    └──────┬──────┘
           ↓
    Data returned to component
           ↓
    UI updates
```

---

## 📋 File Categories

### 🟢 GitHub Files (Data Integration)
- `/lib/config.ts` - 15 lines
- `/lib/supabase.ts` - 100+ lines (when implemented)
- `/lib/types.ts` - 50 lines
- `.env.local` - 2 lines

**Total work:** ~200 lines of code for Supabase integration

---

### 🔵 Figma Make Files (UI)
- `/App.tsx` - 89 lines
- `/components/*.tsx` - 1000+ lines total
- `/data/mockData.ts` - 200+ lines
- `/styles/globals.css` - varies

**Total work:** All UI changes and design updates

---

### 🔴 Protected Files (Do Not Touch)
- `/lib/dataService.ts` - Auto-managed
- `/components/figma/ImageWithFallback.tsx` - System file

---

## 🚦 Traffic Light System

### 🟢 Green (Edit in GitHub Only)
```
lib/config.ts
lib/supabase.ts
lib/types.ts
.env.local
```

### 🟡 Yellow (Edit in Figma Make, but coordinate)
```
data/mockData.ts
```

### 🔵 Blue (Edit in Figma Make Only)
```
App.tsx
components/**/*.tsx
styles/globals.css
```

### 🔴 Red (Never Edit)
```
lib/dataService.ts
components/figma/ImageWithFallback.tsx
```

---

## 📊 Responsibility Matrix

| Area | GitHub Dev | Figma Make Dev |
|------|------------|----------------|
| Database schema | ✅ Design & implement | ❌ Don't touch |
| Supabase functions | ✅ Implement all | ❌ Don't touch |
| API calls | ✅ Handle in supabase.ts | ❌ Don't touch |
| Data types | ✅ Define interfaces | ⚠️ Can use, not modify |
| UI components | ❌ Don't touch | ✅ Design & implement |
| Styling | ❌ Don't touch | ✅ Update freely |
| Mock data | ⚠️ Can add for testing | ✅ Manage for UI dev |
| App routing | ⚠️ Coordinate | ✅ Manage |

**Legend:**
- ✅ = Primary responsibility
- ⚠️ = Can edit but coordinate
- ❌ = Don't edit

---

## 🎯 Integration Points

The two workflows meet at **one single point**:

### The Integration Point: `dataService.ts`

```typescript
// Components import from here (Figma Make)
import { getPeerSupportData } from '../lib/dataService';

// dataService routes to here (GitHub)
import * as supabaseApi from './supabase';
```

This is the **ONLY** connection between the two layers, which is why conflicts are avoided!

---

## 🔧 Technology Stack

### Frontend (Figma Make Territory)
- React 18
- TypeScript
- Tailwind CSS v4
- Lucide React (icons)
- shadcn/ui components

### Backend (GitHub Territory)
- Supabase
  - PostgreSQL database
  - Row Level Security
  - Real-time subscriptions (optional)
  - Authentication (optional)

### Build Tools
- Vite or Next.js (depending on setup)
- ESLint
- TypeScript compiler

---

## 📦 Dependencies to Install (GitHub)

```bash
npm install @supabase/supabase-js
```

Everything else is already installed!

---

## 🌐 Environment Variables

### Development (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

### Production
Add same variables to:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment
- Other: Platform-specific settings

---

## 📈 Next Steps

### For GitHub Developer (Supabase Integration):
1. Read `/DEVELOPER_GUIDE.md` sections on Supabase
2. Create Supabase project & tables
3. Implement functions in `/lib/supabase.ts`
4. Test with `USE_SUPABASE = false` first
5. Switch to `USE_SUPABASE = true` when ready

### For Figma Make Developer (UI):
1. Continue using Figma Make for all UI changes
2. Pull latest from GitHub before making changes
3. Never ask Figma Make to edit `/lib/*` files
4. Focus on components and styling

---

## ✨ Benefits of This Architecture

✅ **No merge conflicts** - Different files being edited  
✅ **Clear ownership** - Everyone knows their domain  
✅ **Easy testing** - Switch between mock/real data instantly  
✅ **Scalable** - Easy to add new features on either side  
✅ **Type-safe** - TypeScript across the entire stack  
✅ **Maintainable** - Clean separation of concerns  

---

**Last Updated:** November 25, 2025  
**Architecture Version:** 1.0
