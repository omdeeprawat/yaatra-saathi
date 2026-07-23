import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  RegisterOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UpdateProfileRequest,
  User,
  PaginatedResponse,
  Post,
  ChatSession,
  ChatHistoryResponse,
  CreateChatSessionRequest,
  PostComment,
  CommentThreadResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, // httponly refresh cookie is sent automatically
});

// Attach JWT token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Global 401 handler
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const res = await apiClient.post<TokenResponse>("/auth/refresh");
        const newToken = res.data.access_token;
        localStorage.setItem("access_token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem("access_token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth API

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterOtpResponse> => {
    const res = await apiClient.post<RegisterOtpResponse>(
      "/auth/register",
      data,
    );
    return res.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const res = await apiClient.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      data,
    );
    return res.data;
  },

  resendOtp: async (userId: number): Promise<VerifyOtpResponse> => {
    const res = await apiClient.post<VerifyOtpResponse>("/auth/resend-otp", {
      user_id: userId,
    });
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/login", data);
    return res.data;
  },

  refresh: async (): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/refresh");
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("access_token");
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const res = await apiClient.patch<User>("/auth/profile", data);
    return res.data;
  },

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
};

// Posts API

export const postsApi = {
  getPosts: async (page = 1, size = 10): Promise<PaginatedResponse<Post>> => {
    const res = await apiClient.get<PaginatedResponse<Post>>(
      `/posts/?page=${page}&size=${size}`,
    );
    return res.data;
  },

  createPost: async (content: string, imageUrl?: string): Promise<Post> => {
    const res = await apiClient.post<Post>("/posts/", {
      content,
      image_url: imageUrl ?? null,
    });
    return res.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },
};

// Health API

export interface HealthReadinessChecks {
  database: boolean;
  redis: boolean;
  vector_store: boolean;
  groq_key_configured: boolean;
  vector_chunk_count: number;
}

export interface HealthReadinessResponse {
  status: "ready" | "not_ready";
  checks: HealthReadinessChecks;
}

export const healthApi = {
  check: async () => {
    const res = await apiClient.get("/health");
    return res.data;
  },

  ready: async (): Promise<HealthReadinessResponse> => {
    const res = await apiClient.get<HealthReadinessResponse>("/health/ready", {
      validateStatus: () => true,
    });
    return res.data;
  },
};

export default apiClient;

// Upload API

export interface UploadResponse {
  url: string;
  public_id: string;
  width: number | null;
  height: number | null;
  format: string | null;
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<UploadResponse>(
      "/upload/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },
};

// Chat API

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStreamRequest {
  message: string;
  history: ChatHistoryItem[];
  image_url?: string | null;
}

export interface ChatStatusResponse {
  ready: boolean;
  chunk_count: number;
  message: string;
}

export interface ChatIngestResponse {
  success: boolean;
  filename: string;
  chunk_count: number;
  message: string;
}

export interface AdminIngestionStatusResponse {
  status: string;
  chunk_count: number;
  message: string;
}

export interface AdminDocumentInfo {
  filename: string;
  size: number;
  extension: string;
}

export interface AdminDocumentListResponse {
  documents: AdminDocumentInfo[];
  total: number;
}

export interface AdminIngestTriggerResponse {
  success: boolean;
  message: string;
  task_id: string;
  force: boolean;
}

export const chatApi = {
  getStatus: async (): Promise<ChatStatusResponse> => {
    const res = await apiClient.get<ChatStatusResponse>("/chat/status");
    return res.data;
  },

  uploadDocument: async (file: File): Promise<ChatIngestResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ChatIngestResponse>(
      "/chat/ingest-document",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      },
    );
    return res.data;
  },

  /**
   * Opens a fetch stream to /chat/stream.
   * Returns the raw Response — the caller reads it with a ReadableStream.
   * Using fetch directly (not axios) because axios doesn't support streaming.
   */
  openStream: (
    request: ChatStreamRequest,
    token: string,
  ): Promise<Response> => {
    return fetch(`${import.meta.env.VITE_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });
  },
};

// Chat History API

export const chatHistoryApi = {
  createSession: async (
    request: CreateChatSessionRequest,
  ): Promise<ChatSession> => {
    const res = await apiClient.post<ChatSession>("/chat/session", request);
    return res.data;
  },

  getSessions: async (limit = 20, offset = 0): Promise<ChatSession[]> => {
    const res = await apiClient.get<ChatSession[]>(
      `/chat/sessions?limit=${limit}&offset=${offset}`,
    );
    return res.data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const res = await apiClient.get<ChatSession>(`/chat/session/${sessionId}`);
    return res.data;
  },

  getHistory: async (
    sessionId: string,
    limit = 12,
    offset = 0,
  ): Promise<ChatHistoryResponse> => {
    const res = await apiClient.get<ChatHistoryResponse>(
      `/chat/history/${sessionId}?limit=${limit}&offset=${offset}`,
    );
    return res.data;
  },

  updateSession: async (
    sessionId: string,
    title?: string,
    archived?: boolean,
  ): Promise<ChatSession> => {
    const res = await apiClient.put<ChatSession>(`/chat/session/${sessionId}`, {
      title,
      archived,
    });
    return res.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/session/${sessionId}`);
  },
};

// Comments API

export const commentsApi = {
  getComments: async (
    postId: number,
    sort: "recent" | "top" = "recent",
  ): Promise<CommentThreadResponse> => {
    const res = await apiClient.get<CommentThreadResponse>(
      `/posts/${postId}/comments?sort=${sort}`,
    );
    return res.data;
  },

  getComment: async (
    postId: number,
    commentId: number,
  ): Promise<PostComment> => {
    const res = await apiClient.get<PostComment>(
      `/posts/${postId}/comments/${commentId}`,
    );
    return res.data;
  },

  createComment: async (
    postId: number,
    request: CreateCommentRequest,
  ): Promise<PostComment> => {
    const res = await apiClient.post<PostComment>(
      `/posts/${postId}/comments`,
      request,
    );
    return res.data;
  },

  updateComment: async (
    postId: number,
    commentId: number,
    request: UpdateCommentRequest,
  ): Promise<PostComment> => {
    const res = await apiClient.put<PostComment>(
      `/posts/${postId}/comments/${commentId}`,
      request,
    );
    return res.data;
  },

  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  likeComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
  },

  unlikeComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}/like`);
  },
};

// Admin API

export const adminApi = {
  uploadDocument: async (
    file: File,
  ): Promise<{
    success: boolean;
    filename: string;
    size: number;
    message: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<{
      success: boolean;
      filename: string;
      size: number;
      message: string;
    }>("/admin/upload-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },

  triggerIngestion: async (
    force = false,
  ): Promise<AdminIngestTriggerResponse> => {
    const res = await apiClient.post<AdminIngestTriggerResponse>(
      "/admin/ingest",
      { force },
    );
    return res.data;
  },

  getIngestionStatus: async (): Promise<AdminIngestionStatusResponse> => {
    const res = await apiClient.get<AdminIngestionStatusResponse>(
      "/admin/ingestion-status",
    );
    return res.data;
  },

  listDocuments: async (): Promise<AdminDocumentListResponse> => {
    const res =
      await apiClient.get<AdminDocumentListResponse>("/admin/documents");
    return res.data;
  },

  deleteDocument: async (
    filename: string,
  ): Promise<{ success: boolean; filename: string; message: string }> => {
    const encoded = encodeURIComponent(filename);
    const res = await apiClient.delete<{
      success: boolean;
      filename: string;
      message: string;
    }>(`/admin/documents/${encoded}`);
    return res.data;
  },
};

// Map API

export const mapApi = {
  getStops: async (): Promise<import("@/types").YatraStop[]> => {
    const res =
      await apiClient.get<import("@/types").YatraStop[]>("/map/stops");
    return res.data;
  },

  getStop: async (id: number): Promise<import("@/types").YatraStop> => {
    const res = await apiClient.get<import("@/types").YatraStop>(
      `/map/stops/${id}`,
    );
    return res.data;
  },
};

// story API

export interface StoryTeaser {
  id: number;
  slug: string;
  title: string;
  category: string;
  teaser: string;
  cover_image_url: string | null;
  read_time_minutes: number;
  view_count: number;
  is_featured: boolean;
}

export interface StoryDetail extends StoryTeaser {
  full_content: string;
  created_at: string;
}

export const storiesApi = {
  getAllStories: async (
    featuredOnly: boolean = false,
  ): Promise<StoryTeaser[]> => {
    const params = featuredOnly ? "?featured_only=true" : "";
    const res = await apiClient.get<StoryTeaser[]>(`/stories/${params}`);
    return res.data;
  },

  getStoryBySlug: async (slug: string): Promise<StoryDetail> => {
    const res = await apiClient.get<StoryDetail>(`/stories/${slug}`);
    return res.data;
  },

  getStoryPreview: async (slug: string): Promise<StoryTeaser> => {
    const res = await apiClient.get<StoryTeaser>(`/stories/preview/${slug}`);
    return res.data;
  },
};
