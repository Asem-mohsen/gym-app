import { Platform } from 'react-native';

// Platform-specific API configuration
const getBaseUrl = () => {
  if (Platform.OS === 'ios') {
    // iOS simulator uses localhost
    return 'http://localhost:8000/api/v1';
  } else {
    // Android emulator uses 10.0.2.2 to access host machine
    return 'http://10.0.2.2:8000/api/v1';
  }
};

const getMediaBaseUrl = () => {
  if (Platform.OS === 'ios') {
    return 'http://localhost:8000';
  } else {
    return 'http://10.0.2.2:8000';
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  MEDIA_BASE_URL: getMediaBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'en',
  },
} as const;

// Helper function to get API URL with gym slug
export const getGymApiUrl = (gymSlug: string, endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/${gymSlug}${endpoint}`;
};

export const fixImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // Handle different localhost formats for both platforms
  if (imageUrl.includes('127.0.0.1:8000') || 
      imageUrl.includes('localhost:8000') || 
      imageUrl.includes('10.0.2.2:8000')) {
    return imageUrl.replace(/https?:\/\/[^\/]+/, API_CONFIG.MEDIA_BASE_URL);
  }
  
  return imageUrl;
};

export const API_ENDPOINTS = {
  GYMS: {
    LIST: '/',
  },
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    LOGOUT: '/logout/current',
    LOGOUT_ALL: '/logout/all',
    LOGOUT_OTHERS: '/logout/others',
    PROFILE: '/profile',
    REFRESH: '/auth/refresh',
  },
  MEMBERSHIPS: {
    LIST: '/memberships',
    DETAILS: (id: number) => `/memberships/${id}`,
  },
  SERVICES: {
    LIST: '/services',
    DETAILS: (id: number) => `/services/${id}`,
  },
  CONTACT: {
    INFO: '/contact',
    SUBMIT: '/contact',
  },
} as const;

// Gym-specific API endpoints
export const getGymApiEndpoints = (gymSlug: string) => ({
  AUTH: {
    LOGIN: `${gymSlug}/login`,
    SIGNUP: `${gymSlug}/signup`,
    LOGOUT: `${gymSlug}/logout/current`,
    PROFILE: `${gymSlug}/profile`,
    REFRESH: `${gymSlug}/auth/refresh`,
  },
  MEMBERSHIPS: {
    LIST: `/memberships`,
    DETAILS: (id: number) => `/memberships/${id}`,
  },
  CLASSES: {
    LIST: `/classes`,
    DETAILS: (id: number) => `/classes/${id}`,
  },
  SERVICES: {
    LIST: `/services`,
    DETAILS: (id: number) => `/services/${id}`,
  },
  CONTACT: {
    INFO: `/contact`,
    SUBMIT: `/contact`,
  },
});
