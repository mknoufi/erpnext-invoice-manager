// PWA Service for managing offline functionality and notifications
import logger from './logger';

export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });

    // Service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // Register service worker
  public async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      logger.info('Service Worker registered successfully:', this.registration);

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              this.showUpdateNotification();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Install PWA
  public async installPWA(): Promise<boolean> {
    if (!this.registration || !this.registration.waiting) {
      return false;
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  // Check if app is installable
  public isInstallable(): boolean {
    return !window.matchMedia('(display-mode: standalone)').matches && 
           !(window.navigator as any).standalone;
  }

  // Show install prompt
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.isInstallable()) {
      return false;
    }

    // Check if there's a deferred prompt
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      logger.info(`User response to install prompt: ${outcome}`);
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    }

    return false;
  }

  // Cache data for offline use
  public async cacheData(key: string, data: any): Promise<void> {
    try {
      const cache = await caches.open('invoice-manager-data');
      await cache.put(key, new Response(JSON.stringify(data)));
      logger.debug('Data cached for offline use:', key);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data
  public async getCachedData(key: string): Promise<any> {
    try {
      const cache = await caches.open('invoice-manager-data');
      const response = await cache.match(key);
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      logger.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Send push notification
  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      return;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Sync data when back online
  public async syncWhenOnline(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    try {
      // Sync invoices
      if (this.registration && 'sync' in this.registration) {
        (this.registration as any).sync.register('invoice-sync');
      }

      // Sync payments
      if (this.registration && 'sync' in this.registration) {
        (this.registration as any).sync.register('payment-sync');
      }

      logger.info('Background sync registered');
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  }

  // Handle online status
  private handleOnlineStatus(): void {
    logger.info('App is online');
    this.syncWhenOnline();
    
    // Show online notification
    this.sendNotification('You are back online', {
      body: 'Data will be synchronized automatically',
      tag: 'online-status'
    });
  }

  // Handle offline status
  private handleOfflineStatus(): void {
    console.log('App is offline');
    
    // Show offline notification
    this.sendNotification('You are offline', {
      body: 'Some features may be limited. Data will sync when back online.',
      tag: 'offline-status'
    });
  }

  // Show update notification
  private showUpdateNotification(): void {
    this.sendNotification('Update Available', {
      body: 'A new version is available. Click to update.'
    });
  }

  // Get online status
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get service worker registration
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Clear all caches
  public async clearAllCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  // Get cache size
  public async getCacheSize(): Promise<number> {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();
