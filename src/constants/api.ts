export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8000/api/v1',
  MEDIA_BASE_URL: 'http://10.0.2.2:8000',
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
  
  if (imageUrl.includes('127.0.0.1:8000') || imageUrl.includes('localhost:8000')) {
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
  CLASSES: {
    LIST: '/classes',
    DETAILS: (id: number) => `/classes/${id}`,
  },
  SERVICES: {
    LIST: '/services',
    DETAILS: (id: number) => `/services/${id}`,
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
    LIST: `${gymSlug}/memberships`,
    DETAILS: (id: number) => `${gymSlug}/memberships/${id}`,
  },
  CLASSES: {
    LIST: `${gymSlug}/classes`,
    DETAILS: (id: number) => `${gymSlug}/classes/${id}`,
  },
  SERVICES: {
    LIST: `${gymSlug}/services`,
    DETAILS: (id: number) => `${gymSlug}/services/${id}`,
  },
});
