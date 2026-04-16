#!/usr/bin/env node

/**
 * Backend Recovery Manager
 * Monitors the backend server and automatically restarts it if it crashes
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_PREFIX = '🔄 [Recovery Manager]';
let serverProcess = null;
let restartCount = 0;
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_COOLDOWN = 2000; // 2 seconds between restarts
let inRestartCooldown = false;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
    restart: '🔄'
  }[type] || 'ℹ️';

  console.log(`[${timestamp}] ${emoji} ${LOG_PREFIX} ${message}`);
}

function startServer() {
  if (inRestartCooldown) {
    log('Still in cooldown period, waiting before restart...', 'warn');
    return;
  }

  if (restartCount >= MAX_RESTART_ATTEMPTS) {
    log(`❌ Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached. Server will not restart automatically.`, 'error');
    log('Please investigate the issue and restart manually.', 'warn');
    process.exit(1);
  }

  restartCount++;
  log(`Starting server (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})...`, 'restart');

  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
  });

  serverProcess.on('exit', (code, signal) => {
    if (code === 0) {
      log('Server exited gracefully', 'success');
      process.exit(0);
    } else {
      log(`Server crashed with code ${code} (signal: ${signal})`, 'error');
      
      if (restartCount < MAX_RESTART_ATTEMPTS) {
        inRestartCooldown = true;
        log(`Restarting server in ${RESTART_COOLDOWN}ms...`, 'warn');
        
        setTimeout(() => {
          inRestartCooldown = false;
          startServer();
        }, RESTART_COOLDOWN);
      } else {
        log(`Failed to restart server after ${MAX_RESTART_ATTEMPTS} attempts`, 'error');
        process.exit(1);
      }
    }
  });

  serverProcess.on('error', (err) => {
    log(`Failed to start server: ${err.message}`, 'error');
  });
}

// Handle termination signals
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down...', 'warn');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down...', 'warn');
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  process.exit(0);
});

// Start the server
log('Backend Recovery Manager started', 'success');
log(`Max restart attempts: ${MAX_RESTART_ATTEMPTS}`, 'info');
log(`Restart cooldown: ${RESTART_COOLDOWN}ms`, 'info');
startServer();
