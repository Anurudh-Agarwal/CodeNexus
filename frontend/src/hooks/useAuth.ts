"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginRequest, SignupRequest, User } from "@/types";
import { useRouter } from "next/navigation";
import { login as loginApi, signup as SignupApi } from "@/lib/api";

interface useAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (data: SignupRequest) => Promise<void>;
  logIn: (data: LoginRequest) => Promise<void>;
  logOut: () => void;
  clearError: () => void;
}

function getInitialUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

export function useAuth(): useAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(getInitialUser());
    }

    window.addEventListener("authChange", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("authChange", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const logIn = useCallback(
    async (data: LoginRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await loginApi(data);
        if (!response.success || !response.data) {
          throw new Error(response.error || "Login failed");
        }
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        window.dispatchEvent(new Event("authChange"));

        router.push("/");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const signUp = useCallback(
    async (data: SignupRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!data.email.endsWith("@ietlucknow.ac.in")) {
          throw new Error("Only @ietlucknow.ac.in emails allowed");
        }

        const response = await SignupApi(data);
        if (!response.success || !response.data) {
          throw new Error(response.error || "SignUp failed");
        }
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        window.dispatchEvent(new Event("authChange"));

        router.push("/");
      } catch (err) {
        const message = err instanceof Error ? err.message : "SignUp failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logOut = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    router.push("/login");
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signUp,
    logIn,
    logOut,
    clearError,
  };
}
