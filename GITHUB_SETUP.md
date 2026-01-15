# GitHub Push Commands

## Prerequisites
Before running these commands, make sure you have:
1. Your GitHub repository URL (e.g., https://github.com/yourusername/your-repo.git)
2. Git installed and configured with your credentials

## Step 1: Configure Git User (if not already done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## Step 2: Add GitHub Remote
Replace `YOUR_GITHUB_REPO_URL` with your actual repository URL:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
```

Example:
```bash
git remote add origin https://github.com/yourusername/deepthi-enterprises.git
```

## Step 3: Stage All Files
```bash
git add .
```

## Step 4: Commit Changes
```bash
git commit -m "Initial commit: Full stack app with frontend and backend"
```

## Step 5: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Complete Command Sequence (Run All at Once)
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git add .
git commit -m "Initial commit: Full stack app with frontend and backend"
git branch -M main
git push -u origin main
```

---

## Usage Instructions

### Local Development
Now you can simply run:
```bash
npm run dev
```
This will automatically start BOTH:
- Frontend: Vite dev server on http://localhost:3000
- Backend: Express server on http://localhost:5000

### For Production Build
```bash
npm run build
```

### Vercel Deployment
The `vercel.json` file has been configured to:
1. Build the frontend with Vite
2. Install backend dependencies
3. Run the development command on Vercel

Simply commit and push to GitHub, and Vercel will automatically deploy!

---

## Changes Made
✅ Modified `package.json` - `npm run dev` now runs both frontend and backend
✅ Created `vercel.json` - Vercel configuration for full-stack deployment
✅ Created `.gitignore` - Excludes node_modules, databases, and build files

## Important Notes
- The database file (deepthi.db) should be generated on first run
- Make sure your GitHub repository already exists
- Vercel will auto-deploy when you push to the main branch
