import { getEnvironment } from './environment';

export const serviceWorkerConfig = {
  // Enable service worker in production only
  enable: getEnvironment().ENABLE_SERVICE_WORKER && getEnvironment().isProduction,
  
  // Cache configuration
  cacheConfig: {
    // API cache duration in seconds
    apiCacheDuration: 10 * 60, // 10 minutes
    
    // Static assets cache duration in seconds
    staticCacheDuration: 24 * 60 * 60, // 24 hours
    
    // Maximum number of cached items
    maxCacheItems: {
      api: 100,
      images: 60,
      fonts: 30,
    },
  },
  
  // Offline support configuration
  offlineConfig: {
    // Enable offline support
    enable: true,
    
    // Routes that should work offline
    offlineRoutes: [
      '/',
      '/dashboard',
      '/profile',
      '/settings',
    ],
    
    // Assets that should be available offline
    offlineAssets: [
      '/offline.html',
      '/static/css/main.css',
      '/static/js/main.js',
      '/logo.png',
    ],
  },
  
  // Update notification configuration
  updateConfig: {
    // Show notification when new version is available
    showNotification: true,
    
    // Auto update when new version is available
    autoUpdate: false,
    
    // Custom update notification message
    updateMessage: 'A new version is available. Please refresh to update.',
  },
}; 