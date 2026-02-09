# 📦 Deepthi Enterprises - Project Structure

Your project is now organized into **Frontend** and **Backend** with clear separation of concerns.

## 📁 Project Structure

```
deepthi-enterprises/
├── 🎨 frontend/                    # React + Vite Application
│   ├── src/
│   │   ├── components/             # React components (20+ components)
│   │   ├── services/               # API and DB services
│   │   ├── App.tsx                 # Main app component
│   │   ├── index.tsx               # Entry point
│   │   └── scr/images/             # Local images
│   ├── public/images/              # Static assets
│   ├── index.html                  # HTML template
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── env.d.ts                    # Type definitions
│   └── package.json                # Frontend dependencies
│
├── ⚙️ backend/                     # Express.js Server
│   ├── server.js                   # Main server file
│   ├── db.js                       # Database utilities
│   ├── server/                     # Server-specific files
│   │   ├── node_modules/
│   │   ├── deepthi.db              # SQLite database
│   │   └── package-lock.json
│   ├── db/                         # Database files
│   │   ├── deepthi.sql             # SQL schema
│   │   └── deepthi.sqlite          # SQLite backup
│   ├── scripts/                    # Utility scripts
│   │   ├── generate_sqlite.js
│   │   ├── inspect_sqlite.js
│   │   └── remove_user_from_sqlite.js
│   └── package.json                # Backend dependencies
│
├── 📝 Root Files
│   ├── package.json                # Root scripts (installs & runs both)
│   ├── GITHUB_SETUP.md             # Git/GitHub guide
│   ├── BACKEND_SETUP.md            # Backend setup guide
│   ├── README.md                   # Project readme
│   ├── vercel.json                 # Vercel deployment config
│   ├── tsconfig.json               # TypeScript root config
│   ├── types.ts                    # Shared types
│   ├── metadata.json               # Project metadata
│   └── push-to-github.bat          # Git push script
│
└── 📂 docs/                        # Documentation
    ├── AUDIT_AND_LOGGING.md
    ├── ID_CONVENTIONS.md
    └── PRODUCTION.md
```

## 🚀 Quick Start Commands

### Install All Dependencies
```bash
npm run install:all
```

### Development (Runs Frontend + Backend)
```bash
npm run dev
```
- Frontend runs on: **http://localhost:3000**
- Backend runs on: **http://localhost:5000**

### Individual Commands

**Frontend Only:**
```bash
cd frontend
npm run dev       # Development
npm run build     # Production build
npm run preview   # Preview build
```

**Backend Only:**
```bash
cd backend
npm run dev       # Development with watch
npm start         # Production
```

### Production Build
```bash
npm run build      # Builds frontend
npm run start      # Starts backend
```

## 📝 Frontend (`frontend/`)

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Main Files:**
  - `src/App.tsx` - Root component
  - `src/index.tsx` - React entry point
  - `src/components/` - All UI components
  - `src/services/` - API calls, database queries

## ⚙️ Backend (`backend/`)

- **Framework:** Express.js
- **Database:** SQLite3
- **Server Port:** 5000
- **Main Files:**
  - `server.js` - Express server setup
  - `db.js` - Database helper functions
  - `db/deepthi.sql` - Database schema
  - `scripts/` - Database utilities

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` (root) | Coordinates both frontend & backend |
| `frontend/package.json` | Frontend dependencies & scripts |
| `backend/package.json` | Backend dependencies & scripts |
| `frontend/vite.config.ts` | Vite build & dev config |
| `frontend/tsconfig.json` | TypeScript config for frontend |
| `vercel.json` | Vercel deployment settings |

## 📚 Available Documentation

- [GITHUB_SETUP.md](GITHUB_SETUP.md) - How to push to GitHub
- [BACKEND_SETUP.md](BACKEND_SETUP.md) - Backend configuration details
- [docs/PRODUCTION.md](docs/PRODUCTION.md) - Production deployment guide
- [docs/AUDIT_AND_LOGGING.md](docs/AUDIT_AND_LOGGING.md) - Logging system
- [docs/ID_CONVENTIONS.md](docs/ID_CONVENTIONS.md) - ID naming conventions

## 💡 Key Points

✅ **Clear Separation** - Frontend and backend are now in separate folders  
✅ **Independent Development** - Each can run independently or together  
✅ **Easy Deployment** - Root package.json coordinates full stack  
✅ **Scalability** - Easy to add more frontend pages or backend services  
✅ **Type Safety** - Full TypeScript support in both frontend and backend  

## 🎯 Next Steps

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Generate the SQLite database:
   ```bash
   cd backend && node scripts/generate_sqlite.js
   ```

3. Start development:
   ```bash
   npm run dev
   ```

---

**Project Name:** Deepthi Enterprises - Caring Environment  
**Type:** Full Stack (React + Express)  
**Database:** SQLite3  
**Deployment:** Vercel-ready
