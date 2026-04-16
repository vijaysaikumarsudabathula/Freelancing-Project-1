# 🚀 Deepthi Enterprises - Complete Startup Guide

## Overview

Your application has a **two-part architecture**:
- **Frontend**: React + TypeScript (runs on port 3000)
- **Backend**: Node.js + Express + SQLite (runs on port 5001)

Both must be running for the application to work correctly.

---

## ⚡ Quick Start (Recommended)

### Step 1: Open Terminal in Project Root
```bash
cd c:\Users\vk768\OneDrive\Desktop\DeepthiEnterprise\Freelancing-Project-1-main
```

### Step 2: Start Backend (in a Terminal)
Navigate to backend directory and start with auto-recovery:
```bash
cd backend
node recovery.js
```

**Expected Output:**
```
✅ Deepthi Server running on http://localhost:5001
```

If the backend crashes, the recovery manager will automatically restart it.

### Step 3: Start Frontend (in a SEPARATE Terminal)
Navigate to frontend directory and start development server:
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v6.4.1 ready in 284 ms
➜ Local: http://localhost:3000/
```

### Step 4: Open in Browser
Visit: **http://localhost:3000**

---

## 🏗️ Architecture Explanation

### Frontend → Backend Communication
The frontend (port 3000) proxies all `/api/*` requests to the backend (port 5001).

**Proxy Configuration** (in `frontend/vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true
    }
  }
}
```

**How it works:**
1. Frontend makes request to `/api/products`
2. Vite proxy intercepts and forwards to `http://localhost:5001/api/products`
3. Backend responds with JSON
4. Proxy sends response back to frontend

---

## 🔄 Auto-Recovery System

### How It Works
The backend uses a **recovery manager** (`backend/recovery.js`) that:
- ✅ Monitors the Node.js server process
- 🔄 Automatically restarts if it crashes
- 📊 Logs all restart attempts
- 🛑 Stops after 5 failed attempts to prevent infinite loops

### Starting with Recovery
```bash
cd backend
node recovery.js        # Start with auto-recovery
# OR
npm run safe-start      # Same as above
```

### Disabled Recovery (Manual Mode)
If you need to debug without auto-restart:
```bash
cd backend
npm run start           # Direct start without recovery
# OR
node server.js          # Start server directly
```

---

## 🗄️ Database Setup

The backend uses **SQLite** with a local database file:

**Database Location:**
```
backend/deepthi.db
```

### Database Initialization
- Automatically creates on first run
- Auto-creates all required tables:
  - `users`
  - `products`
  - `orders`
  - `addresses`
  - `login_history`
  - `activity_log`
  - `transaction_log`
  - `bulk_requests`

### Reset Database
To reset the database, delete the file:
```bash
cd backend
rm deepthi.db              # On PowerShell: Remove-Item deepthi.db
```

The next startup will create a fresh database.

---

## ✅ Health Checks

### Backend Health Endpoints
Test backend connectivity:

**Simple health check:**
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T18:36:23.589Z",
  "uptime": 36.8035826
}
```

**Detailed health check with database:**
```bash
curl http://localhost:5001/api/health/detailed
```

### Check via PowerShell
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing
$response.Content | ConvertFrom-Json
```

---

## 🔍 Troubleshooting

### Issue: "Backend is not running"
**Error in browser:** `Failed to fetch /api/...` or HTML error page

**Solution:**
```bash
# Check if port 5001 is in use
netstat -ano | findstr :5001

# If needed, kill the process
taskkill /PID <process_id> /F

# Restart backend
cd backend && node recovery.js
```

### Issue: "API returning HTML instead of JSON"
**Error:** `Unexpected token '<', "<!DOCTYPE"...`

**Cause:** Frontend and backend are not connected properly

**Solution:**
1. Verify backend is running on port 5001: `http://localhost:5001/api/health`
2. Verify frontend has proper proxy in `vite.config.ts`
3. Restart frontend: `npm run dev`

### Issue: "Port 3000 already in use"
**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Restart frontend
cd frontend && npm run dev
```

### Issue: "Database errors on startup"
**Error:** Database initialization failures

**Solution:**
1. Delete the database: `rm backend/deepthi.db`
2. Ensure database file path exists
3. Restart backend with recovery: `node recovery.js`

---

## 📱 Frontend Features

The frontend includes:
- ✅ Health monitoring service
- ✅ Automatic API retry logic (up to 2 attempts with exponential backoff)
- ✅ Backend status banner
- ✅ Graceful error handling

### Auto-Retry Logic
All API calls are wrapped with automatic retry:
```
Request → Fails → Wait 500ms → Retry → Fails → Wait 1000ms → Retry
```

### Status Banner
When backend is down, a red banner appears with:
- ⚠️ Warning message
- 🔄 Retry button
- 📊 Failure count

---

## 🛠️ Development Tips

### Useful Commands

**Backend:**
```bash
cd backend
npm run dev         # Development mode with auto-reload
npm run start       # Production mode
npm run recovery    # Or: node recovery.js (auto-restart)
```

**Frontend:**
```bash
cd frontend
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
```

### Monitoring Logs
Check the terminal output for:
- Backend startup messages
- Recovery manager restart attempts
- Database initialization logs
- API request/response logs

---

## 🚀 Production Setup

### Build Frontend
```bash
cd frontend
npm run build
```

This creates `frontend/dist` which the backend serves as static files.

### Start Backend Only (Production)
The backend serves the built frontend:
```bash
cd backend
npm run safe-start    # With recovery for production
```

Visit: `http://localhost:5001`

---

## 📋 Checklist

Before reporting an issue, ensure:
- [ ] Both backend and frontend terminals are open
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 3000
- [ ] No other process is using these ports
- [ ] Database file exists: `backend/deepthi.db`
- [ ] All dependencies are installed: `npm install` in both directories

---

## 🆘 Quick Support

### Everything isn't working?
1. Kill all Node processes: `Get-Process node | Stop-Process -Force`
2. Delete database: `Remove-Item backend/deepthi.db` (optional)
3. Start fresh:
   - Terminal 1: `cd backend && node recovery.js`
   - Terminal 2: `cd frontend && npm run dev`
4. Open browser: `http://localhost:3000`

### Check System Status
```powershell
# Check running processes
Get-Process node

# Check ports
netstat -ano | findstr :5001
netstat -ano | findstr :3000

# Test backend
$(Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing).Content | ConvertFrom-Json
```

---

## 📞 Key Information

- **Frontend Port:** 3000
- **Backend Port:** 5001
- **Database:** SQLite (local file: `backend/deepthi.db`)
- **API Prefix:** `/api`
- **Recovery Manager:** `backend/recovery.js`
- **Vite Proxy:** Configured in `frontend/vite.config.ts`

---

## ✨ System Features

Your application now includes:
1. **Auto-Recovery:** Backend auto-restarts on crash
2. **Health Monitoring:** Frontend monitors backend status
3. **API Retry Logic:** Automatic retries for network failures
4. **Frontend Proxy:** Seamless API communication
5. **Status Banner:** User-friendly backend status indicator
6. **Error Logging:** Comprehensive error tracking

Nothing more to do! Just follow the quick start steps above. 🎉
