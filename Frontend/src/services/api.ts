import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// API Base URL - có thể lấy từ env hoặc mặc định
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Tạo axios instance
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - thêm token vào header
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("access_token");
    const apiKey = localStorage.getItem("api_key");

    // Thêm JWT token nếu có
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Thêm API Key nếu có
    if (apiKey && config.headers) {
      config.headers["X-API-Key"] = apiKey;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (error.response?.status === 401) {
      // Xóa token và redirect về login
      localStorage.removeItem("access_token");
      localStorage.removeItem("api_key");
      localStorage.removeItem("user");

      // Chỉ redirect nếu không phải đang ở trang login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Xử lý lỗi 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    // Xử lý lỗi 500 (Server Error)
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
