import {
  LeaderboardResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://codenexus-lg9o.onrender.com";

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export const getLeaderboard = async (filters?: {
  year?: number;
  branch?: string;
  platform?: string;
}): Promise<LeaderboardResponse> => {
  const params = new URLSearchParams();
  if (filters?.year) params.append("year", filters.year.toString());
  if (filters?.branch) params.append("branch", filters.branch);
  if (filters?.platform) params.append("platform", filters.platform);
  const queryString = params.toString();
  const endpoint = `/api/leaderboard${queryString ? `?${queryString}` : ""}`;
  return apiCall<LeaderboardResponse>(endpoint);
};

export const login = async (data: LoginRequest) => {
  return apiCall<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const signup = async (data: SignupRequest) => {
  return apiCall<SignupResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
export const verifyOtp = async (data: {
  email: string;
  token: string;
  name: string;
  year?: number;
  branch?: string;
}) => {
  return apiCall<SignupResponse>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const forgotPassword = async (email: string) => {
  return apiCall("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};
