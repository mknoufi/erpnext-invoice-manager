// Mock PWA service for Jest tests
const mockPWAService = {
  registerServiceWorker: jest.fn().mockResolvedValue(true),
  requestNotificationPermission: jest.fn().mockResolvedValue(true),
  isInstallable: jest.fn().mockReturnValue(false),
  installApp: jest.fn().mockResolvedValue(false),
  cacheData: jest.fn().mockResolvedValue(),
  getCachedData: jest.fn().mockResolvedValue(null),
  getCacheSize: jest.fn().mockResolvedValue(0),
  clearCache: jest.fn().mockResolvedValue(),
  sendNotification: jest.fn(),
  registerBackgroundSync: jest.fn(),
  getOnlineStatus: jest.fn().mockReturnValue(true),
  isOnline: true,
  setupEventListeners: jest.fn(),
};

module.exports = {
  pwaService: mockPWAService,
};
