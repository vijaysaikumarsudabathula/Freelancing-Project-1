/**
 * Backend Recovery Service
 * Automatically detects when backend is down and attempts recovery
 */

let healthCheckInterval: NodeJS.Timeout | null = null;
let isBackendHealthy = true;
let failureCount = 0;
let lastHealthCheckTime = 0;
let isFirstCheck = true;

const HEALTH_CHECK_INTERVAL = 10_000; // Check every 10 seconds
const FAILURE_THRESHOLD = 2; // Show warning after 2 failures
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface BackendStatus {
  isHealthy: boolean;
  failureCount: number;
  message?: string;
}

/**
 * Perform a quick health check on the backend
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000 // 5 second timeout
    } as any);

    if (response.ok) {
      const data = await response.json();
      failureCount = 0;
      isBackendHealthy = true;
      lastHealthCheckTime = Date.now();

      // Log recovery if it was previously down
      if (!isFirstCheck && failureCount > 0) {
        console.log('✅ Backend recovered and is healthy again');
        window.dispatchEvent(
          new CustomEvent('backend-recovered', {
            detail: { message: 'Connection restored' }
          })
        );
      }

      isFirstCheck = false;
      return { isHealthy: true, failureCount: 0 };
    } else {
      throw new Error(`Health check returned ${response.status}`);
    }
  } catch (error) {
    failureCount++;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Backend health check failed (attempt ${failureCount}):`, message);

    if (failureCount >= FAILURE_THRESHOLD && isBackendHealthy) {
      isBackendHealthy = false;
      console.error(`❌ Backend appears to be down after ${failureCount} failed attempts`);
      
      // Notify frontend about backend being down
      window.dispatchEvent(
        new CustomEvent('backend-down', {
          detail: { 
            message: 'Backend server is unreachable. Some features may be limited.',
            failureCount,
            timestamp: new Date().toISOString()
          }
        })
      );
    }

    return {
      isHealthy: isBackendHealthy,
      failureCount,
      message: `Backend unavailable (${failureCount} failures)`
    };
  }
}

/**
 * Perform detailed health check including database connectivity
 */
export async function checkDetailedHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health/detailed`, {
      method: 'GET',
      timeout: 5000
    } as any);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Detailed health check returned ${response.status}`);
    }
  } catch (error) {
    console.error('Detailed health check failed:', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Start automatic health checking
 */
export function startHealthCheck() {
  if (healthCheckInterval) {
    console.log('Health check already running');
    return;
  }

  console.log('🏥 Starting backend health check service');
  
  // Do initial check immediately
  checkBackendHealth();

  // Then check periodically
  healthCheckInterval = setInterval(() => {
    checkBackendHealth();
  }, HEALTH_CHECK_INTERVAL);
}

/**
 * Stop automatic health checking
 */
export function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('Health check stopped');
  }
}

/**
 * Get current backend status
 */
export function getBackendStatus(): BackendStatus {
  return {
    isHealthy: isBackendHealthy,
    failureCount: failureCount,
    message: isBackendHealthy ? 'Backend is healthy' : 'Backend is unavailable'
  };
}

/**
 * Attempt to recover backend by retrying with exponential backoff
 */
export async function attemptRecovery(maxAttempts = 5): Promise<boolean> {
  console.log('🔄 Attempting backend recovery...');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await checkBackendHealth();
      
      if (status.isHealthy) {
        console.log('✅ Backend recovery successful!');
        return true;
      }

      // Exponential backoff: wait 1s, 2s, 4s, 8s, etc.
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Recovery attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      console.error(`Recovery attempt ${attempt} error:`, error);
      
      if (attempt === maxAttempts) {
        console.error('❌ Backend recovery failed after all attempts');
        return false;
      }
    }
  }

  return false;
}

/**
 * Listen to backend recovery events
 */
export function onBackendRecovered(callback: (detail: any) => void) {
  window.addEventListener('backend-recovered', (event: any) => {
    callback(event.detail);
  });
}

/**
 * Listen to backend down events
 */
export function onBackendDown(callback: (detail: any) => void) {
  window.addEventListener('backend-down', (event: any) => {
    callback(event.detail);
  });
}

/**
 * Reset health check state (useful for testing)
 */
export function resetHealthCheckState() {
  failureCount = 0;
  isBackendHealthy = true;
  isFirstCheck = true;
}
