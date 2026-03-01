//  Auth

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  auth_provider: "email" | "google";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Posts

export interface Post {
  id: number;
  content: string;
  image_url: string | null;
  author: {
    id: number;
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export interface CreatePostRequest {
  content: string;
  image_url?: string;
}

// Map
export interface YatraStop {
  id: number;
  name: string;
  name_hindi: string | null;
  stage_number: number;
  latitude: number;
  longitude: number;
  altitude_meters: number;
  distance_from_prev_km: number;
  cumulative_km: number;
  description: string | null;
  significance: string | null;
  stop_type: "start" | "camp" | "bugyal" | "destination";
  photos: string[];
}

// Chat

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string;
  timestamp: Date;
}

// API

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
