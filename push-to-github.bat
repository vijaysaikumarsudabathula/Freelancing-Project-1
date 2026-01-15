@echo off
REM GitHub Push Script for Windows PowerShell
REM Update the URL below with your actual GitHub repository URL

setlocal enabledelayedexpansion

echo ====================================
echo Deepthi Enterprises - GitHub Push
echo ====================================
echo.

REM Replace this with your GitHub repository URL
set GITHUB_URL=https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

echo Enter your GitHub repository URL (press Enter to use the default):
set /p GITHUB_URL="GitHub URL [%GITHUB_URL%]: "

echo.
echo Step 1: Adding remote origin...
git remote add origin %GITHUB_URL%

echo Step 2: Staging all files...
git add .

echo Step 3: Creating initial commit...
git commit -m "Initial commit: Full stack app with frontend and backend"

echo Step 4: Renaming branch to main...
git branch -M main

echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo ====================================
echo Successfully pushed to GitHub!
echo ====================================
echo.
echo You can now use: npm run dev
echo This will start both frontend and backend automatically!
echo.
