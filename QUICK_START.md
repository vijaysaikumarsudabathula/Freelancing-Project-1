# 🎯 QUICK REFERENCE - Start Your Application

## ⚡ Fastest Way to Start (One Command)

**Option A - Batch File (Windows):**
```bash
START_APP.bat
```

**Option B - PowerShell:**
```powershell
.\START_APP.ps1
```

---

## 📺 Two Terminal Method (Recommended for Development)

**Terminal 1:**
```bash
cd backend
node recovery.js
```

**Terminal 2:**
```bash
cd frontend  
npm run dev
```

**Then visit:** http://localhost:3000

---

## ✅ Verify Everything is Working

```powershell
# Run system check
.\CHECK_SYSTEM.ps1
```

Should show:
- ✅ Node.js installed
- ✅ Port 5001 available
- ✅ Port 3000 available
- ✅ Backend running
- ✅ Frontend proxy working

---

## 🏗️ What's Running

| Component | Port | Status |
|-----------|------|--------|
| Backend | 5001 | Running (auto-recovery enabled) |
| Frontend | 3000 | Running (proxies API to 5001) |
| Database | Local | SQLite (backend/deepthi.db) |

---

## 🔗 API Requests Flow

```
Browser Request
    ↓
http://localhost:3000/api/products
    ↓
Vite Proxy (on port 3000)
    ↓
http://localhost:5001/api/products
    ↓
Express Backend
    ↓
SQLite Database
    ↓
JSON Response back to Browser
```

---

## 🆘 Something Broke?

### Backend not responding?
```bash
cd backend
node recovery.js
```

### Frontend not loading?
```bash
cd frontend
npm run dev
```

### Database error?
```bash
# Delete database (it will recreate)
rm backend/deepthi.db
# Then restart backend
```

### Port already in use?
```powershell
# Find what's using the port
netstat -ano | findstr :5001

# Kill the process
taskkill /PID <process_id> /F
```

---

## 📚 Full Documentation

- [STARTUP_GUIDE.md](STARTUP_GUIDE.md) - Complete setup guide
- [SYSTEM_FIXED.md](SYSTEM_FIXED.md) - What was fixed & why
- [BACKEND_RECOVERY_GUIDE.md](BACKEND_RECOVERY_GUIDE.md) - Recovery system details

---

## ✨ Key Features

✅ **Auto-Recovery** - Backend restarts automatically if it crashes
✅ **Health Monitoring** - Frontend detects when backend goes down
✅ **API Retry Logic** - Requests retry on failure
✅ **Status Banner** - User sees backend status in app
✅ **Zero Configuration** - Just run the startup script!

---

## 🎉 You're All Set!

Everything is configured and ready. Just run one of the startup commands above and open http://localhost:3000 in your browser.

**The database automatically initializes on first run.**

Need help? Check `STARTUP_GUIDE.md` or run `.\CHECK_SYSTEM.ps1`
