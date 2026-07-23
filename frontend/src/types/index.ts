//  Auth

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  auth_provider: "email" | "google";
  role: "user" | "admin";
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

export interface RegisterOtpResponse {
  user_id: number;
  message: string;
}

export interface VerifyOtpRequest {
  user_id: number;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
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
  distance_from_previous_km: number;
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

// chat history and session
export interface PersistentChatMessage {
  id: number;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  message_order: number;
  agent_name?: string;
  verified: boolean;
  confidence_score: number;
  sources?: Array<{ source: string; score: number }>;
  route?: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  session_id: string;
  user_id: number;
  title?: string;
  topic?: string;
  is_active: boolean;
  total_messages: number;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  archived: boolean;
  messages?: PersistentChatMessage[];
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: PersistentChatMessage[];
  total_count: number;
  has_more: boolean;
}

export interface CreateChatSessionRequest {
  title?: string;
}

// Comments
export interface PostCommentUser {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_comment_id?: number;
  content: string;
  depth: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  edited_at?: string;
  user: PostCommentUser;
  replies?: PostComment[];
  user_liked?: boolean;
}

export interface CommentThreadResponse {
  post_id: number;
  comments: PostComment[];
  total_count: number;
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: number;
}

export interface UpdateCommentRequest {
  content: string;
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
