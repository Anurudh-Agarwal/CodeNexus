import {
  LeaderboardResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  SignupRequest,
  SignupResponse,
  CodeforcesSyncStatusResponse,
} from "@/types";
import { RequestVerificationResponse, SyncCodeforcesResponse } from "@/types/api";

const API_BASE_URL ="http://localhost:5000";

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = response.status === 204 ? undefined : await response.json();
    if (!response.ok) {
      const message =
        data && typeof data === "object" && "error" in data
          ? String(data.error)
          : `API error: ${response.status}`;
      throw new Error(message);
    }
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

export const logout = async () => {
  return apiCall<void>("/api/auth/logout", { method: "POST" });
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

export const getUser = async (userId: string): Promise<ProfileResponse> => {
  return apiCall<ProfileResponse>(`/api/users/${userId}`);
};

export const requestCodeforcesVerification = async (handle: string)=>{
  return apiCall<RequestVerificationResponse>("/api/sync/codeforces/request", {
    method: 'POST',
    body: JSON.stringify({handle})
  })
}

export const verifyCodeforcesSync= async ()=>{
  return apiCall<SyncCodeforcesResponse>("/api/sync/codeforces/verify", {
    method: 'POST'
  })
}
export const getCodeforcesSyncStatus = async () => {
  return apiCall<CodeforcesSyncStatusResponse>('/api/sync/codeforces/status')
}

export const refreshCodeforcesSync = async () => {
  return apiCall<SyncCodeforcesResponse>('/api/sync/codeforces/refresh', { method: 'POST' })
}