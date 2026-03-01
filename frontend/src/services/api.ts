import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  PaginatedResponse,
  Post,
} from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
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
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/register", data);
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
    window.location.href = "http://127.0.0.1:8000/auth/google";
  },
};

// Posts API

export const postsApi = {
  getPosts: async (page = 1, size = 10): Promise<PaginatedResponse<Post>> => {
    const res = await apiClient.get<PaginatedResponse<Post>>(
      `/posts?page=${page}&size=${size}`,
    );
    return res.data;
  },

  createPost: async (content: string): Promise<Post> => {
    const res = await apiClient.post<Post>("/posts", {
      content,
    });
    return res.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },
};

// Health API

export const healthApi = {
  check: async () => {
    const res = await apiClient.get("/health");
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

export const chatApi = {
  getStatus: async (): Promise<ChatStatusResponse> => {
    const res = await apiClient.get<ChatStatusResponse>("/chat/status");
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
    return fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });
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
