import apiInstance from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  admin: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export interface AdminProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  /**
   * Lấy API Key (từ env hoặc mặc định)
   */
  private getApiKey(): string {
    return import.meta.env.VITE_API_KEY || "freshshop@2025";
  }

  /**
   * Đăng nhập
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Tạo request với API Key trong header (vì login endpoint yêu cầu API Key)
    const apiKey = this.getApiKey();
    const response = await apiInstance.post<LoginResponse>(
      "/auth/login",
      credentials,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    // Lưu token và API Key vào localStorage
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("api_key", apiKey);
      localStorage.setItem("user", JSON.stringify(response.data.admin));
    }

    return response.data;
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await apiInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Xóa token và user info
      localStorage.removeItem("access_token");
      localStorage.removeItem("api_key");
      localStorage.removeItem("user");
    }
  }

  /**
   * Lấy thông tin profile admin hiện tại
   */
  async getProfile(): Promise<AdminProfile> {
    const response = await apiInstance.get<AdminProfile>("/auth/profile");
    return response.data;
  }

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  getCurrentUser(): AdminProfile | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Lấy token
   */
  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  /**
   * Set API Key
   */
  setApiKey(apiKey: string): void {
    localStorage.setItem("api_key", apiKey);
  }
}

export default new AuthService();
