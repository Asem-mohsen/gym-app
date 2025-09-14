// Base API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  status?: 'success' | 'error';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Gym Types
export interface Gym {
  id: number;
  gym_name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  contact_email?: string;
  logo?: string;
  site_url?: string;
  site_map?: string;
  facebook_url?: string;
  x_url?: string;
  instagram_url?: string;
  redirection_url?: string;
  branches?: any[];
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends User {
  token: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

// Membership Types
export interface Membership {
  id: number;
  name: string;
  general_description: string;
  price: number;
  period: string;
  duration_days: number;
  features: any[]; // Changed to any[] to handle different feature formats
  created_at: string;
  updated_at: string;
}

// Class Types
export interface Class {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: string;
  image: string;
  trainers?: any[]; 
  pricings?: any[];
  schedules?: any[]; 
  branches?: any[];
}

// Service Types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number | null;
  duration: number;
  requires_payment: boolean;
  booking_type: 'unbookable' | 'paid_booking' | 'free_booking';
  is_available: boolean;
  sort_order: number;
  image: string;
  branches: any[];
  offers: any[];
}

export interface ServiceApiResponse {
  status: boolean;
  message: string;
  data: {
    services: Service[];
    booking_types: string[];
  };
}

// Contact Types
export interface ContactData {
  id: number;
  gym_name: string;
  slug: string;
  address: string;
  description: string;
  contact_email: string;
  phone: string;
  site_url: string | null;
  is_website_visible: number;
  logo: string;
  site_map: string;
  facebook_url: string;
  x_url: string;
  instagram_url: string;
}

export interface ContactApiResponse {
  status: boolean;
  message: string;
  data: ContactData;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Navigation Types

export type MembershipStackParamList = {
  MembershipList: undefined;
  MembershipDetails: { id: number };
};

export type ClassStackParamList = {
  ClassList: undefined;
  ClassDetails: { id: number };
};

export type ServiceStackParamList = {
  ServiceList: undefined;
  ServiceDetails: { id: number };
};

export type ContactStackParamList = {
  ContactUs: undefined;
};

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: boolean;
}
