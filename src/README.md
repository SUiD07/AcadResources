# 🎓 Academic Resources Portal
### Chulalongkorn University Faculty of Medicine

A web application for managing and accessing academic resources, peer support materials, and academic activities for medical students.

---

## 🎯 Project Overview

This portal provides three main sections:
1. **Peer Support Resources** - Student-created materials with filtering by generation (MDCU 81-76) and block
2. **Academic Activities** - Events, workshops, and collaborative learning opportunities
3. **Academic Resources** - Official materials, textbooks, videos, and external resources

### Key Features
- ✅ Full responsive design (desktop, tablet, mobile)
- ✅ Admin functionality with edit/delete/add controls
- ✅ Clean academic UI with Chulalongkorn University pink (#E5007D)
- ✅ Sidebar navigation (desktop) and hamburger menu (mobile)
- ✅ Ready for Supabase integration

---

## 🏗 Architecture

This project uses a **conflict-free architecture** designed for dual development:
- **GitHub**: Data layer and Supabase integration
- **Figma Make**: UI components and design

```
UI Components (Figma Make)
         ↓
   Data Service (Auto)
         ↓
Mock Data ←→ Supabase (GitHub)
```

**See detailed documentation:**
- 📖 **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Complete guide for team collaboration
- 📖 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick lookup for file permissions
- 📖 **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Folder organization and data flow

---

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone [your-repo-url]
cd academic-resources-portal
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Login to App
- **Student Mode:** Any username/password (not "admin")
- **Admin Mode:** Username: `admin`, Password: `admin`

---

## 📋 For GitHub Developers (Backend)

### Your Responsibilities:
- Implement Supabase integration in `/lib/supabase.ts`
- Toggle data source in `/lib/config.ts`
- Define data types in `/lib/types.ts`

### Files You Edit:
```
✅ /lib/config.ts
✅ /lib/supabase.ts
✅ /lib/types.ts
✅ .env.local
```

### Files You DON'T Edit:
```
❌ /App.tsx
❌ /components/**/*.tsx
❌ /lib/dataService.ts
```

**👉 Read:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for Supabase integration steps

---

## 🎨 For Figma Make Developers (Frontend)

### Your Responsibilities:
- Update UI components and styling
- Add new features and interactions
- Manage mock data for testing

### Files You Edit:
```
✅ /App.tsx
✅ /components/**/*.tsx
✅ /data/mockData.ts
✅ /styles/globals.css
```

### Files You DON'T Edit:
```
❌ /lib/config.ts
❌ /lib/supabase.ts
❌ /lib/dataService.ts
```

**👉 Read:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for fast lookup

---

## 🔄 Current Status

### ✅ Completed
- [x] Full responsive UI with mobile support
- [x] Authentication system (mock login)
- [x] Admin mode with edit/delete/add controls
- [x] Three main sections with proper routing
- [x] Data abstraction layer for easy Supabase integration
- [x] Mock data for all sections
- [x] Chulalongkorn University branding and theming

### 🚧 In Progress
- [ ] Supabase database setup
- [ ] Real authentication system
- [ ] CRUD operations implementation
- [ ] Image upload functionality
- [ ] Google Drive integration

### 📅 Future Enhancements
- [ ] Real-time updates
- [ ] User profiles
- [ ] Content approval workflow
- [ ] Advanced search and filtering
- [ ] Analytics dashboard

---

## 🗄️ Supabase Integration

### Step 1: Create Tables
```sql
-- peer_support table
-- activities table
-- resource_categories table
```

See full SQL in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

### Step 2: Install Supabase
```bash
npm install @supabase/supabase-js
```

### Step 3: Configure Environment
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Step 4: Implement Functions
Edit `/lib/supabase.ts` - All TODOs are marked

### Step 5: Switch to Real Data
```typescript
// /lib/config.ts
export const USE_SUPABASE = true; // Change from false to true
```

---

## 📂 Project Structure

```
academic-resources-portal/
├── lib/               ← Backend (GitHub)
│   ├── config.ts      → Toggle mock/real data
│   ├── supabase.ts    → Database functions
│   ├── types.ts       → TypeScript types
│   └── dataService.ts → Auto-managed
│
├── components/        ← Frontend (Figma Make)
│   ├── *Section.tsx   → Main sections
│   └── ui/            → Reusable components
│
├── data/              ← Mock data
│   └── mockData.ts    → Test data
│
├── styles/            ← Styling
│   └── globals.css    → Global styles
│
├── App.tsx            ← Main application
│
└── Documentation/
    ├── DEVELOPER_GUIDE.md
    ├── QUICK_REFERENCE.md
    └── PROJECT_STRUCTURE.md
```

---

## 🎨 Design System

### Colors
- **Primary:** #E5007D (Chulalongkorn Pink)
- **Hover:** #c00069 (Darker Pink)
- **Background:** #f8fafc (Slate 50)
- **Text:** #0f172a (Slate 900)
- **Secondary:** #64748b (Slate 600)

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Components
All components use shadcn/ui with Tailwind CSS v4

---

## 🔐 Authentication

### Current (Mock)
- Student login: Any non-admin credentials
- Admin login: username=`admin`, password=`admin`

### Future (Supabase Auth)
- Email/password authentication
- Role-based access control
- Session management
- Password reset flow

---

## 🤝 Team Workflow

### Avoiding Conflicts

✅ **Safe Simultaneous Work:**
```
GitHub Dev:  Edit /lib/supabase.ts
Figma Dev:   Edit /components/PeerSupportSection.tsx
Result:      No conflict! Different files ✓
```

❌ **Conflict Scenario:**
```
GitHub Dev:  Edit /components/PeerSupportSection.tsx
Figma Dev:   Edit /components/PeerSupportSection.tsx
Result:      Merge conflict! ✗
```

### Best Practices
1. **GitHub devs:** Stay in `/lib/` folder
2. **Figma devs:** Stay in `/components/` folder
3. **Always pull** latest changes before working
4. **Communicate** about any cross-boundary changes
5. **Use feature branches** for all work

---

## 📞 Contact & Support

**Academic & IT Division**  
Student Union, Faculty of Medicine  
Chulalongkorn University

📧 Email: it@docchula.com

---

## 📄 License

© 2025 Chulalongkorn University Faculty of Medicine  
All rights reserved.

---

## 🎓 Contributors

- **UI/UX Design**: Figma Make + Design Team
- **Backend Integration**: [Your Team]
- **Project Lead**: Academic & IT Division

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Last Updated:** November 25, 2025  
**Version:** 1.0.0  
**Status:** Ready for Supabase Integration
