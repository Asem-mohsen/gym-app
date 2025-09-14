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
  created_at: string;
  updated_at: string;
  owner_id?: number;
  size?: number;
  site_url?: string;
  is_website_visible?: number;
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
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Class Types
export interface Class {
  id: number;
  name: string;
  description: string;
  instructor: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  price: number;
  is_active: boolean;
  image: string;
}

// Service Types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  image: string;
}

// Navigation Types
export type RootStackParamList = {
  GymSelection: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Memberships: undefined;
  Classes: undefined;
  Services: undefined;
  Profile: undefined;
};

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

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
