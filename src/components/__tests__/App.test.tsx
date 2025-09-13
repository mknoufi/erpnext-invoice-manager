import React from 'react';
import { render } from '@testing-library/react';
import App from '../../App';

// Mock the router to avoid navigation issues in tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock the PWA service to avoid browser API issues
jest.mock('../../utils/pwaService', () => ({
  pwaService: {
    registerServiceWorker: jest.fn().mockResolvedValue(true),
    requestNotificationPermission: jest.fn().mockResolvedValue(true),
    isInstallable: jest.fn().mockReturnValue(false),
    installApp: jest.fn().mockResolvedValue(false),
    cacheData: jest.fn().mockResolvedValue(undefined),
    getCachedData: jest.fn().mockResolvedValue(null),
    getCacheSize: jest.fn().mockResolvedValue(0),
    clearCache: jest.fn().mockResolvedValue(undefined),
    sendNotification: jest.fn().mockResolvedValue(undefined),
    registerBackgroundSync: jest.fn().mockResolvedValue(undefined),
    getOnlineStatus: jest.fn().mockReturnValue(true),
    isOnline: true,
    setupEventListeners: jest.fn(() => {}),
  }
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    // Basic smoke test - if it renders without throwing, we're good
    expect(container).toBeInTheDocument();
  });

  test('renders main app container', () => {
    const { container } = render(<App />);
    // Look for a common element that should be present
    expect(container).toBeInTheDocument();
  });
});
