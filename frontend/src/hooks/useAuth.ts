"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { LoginRequest, SignupRequest, User } from "@/types";
import { useRouter } from "next/navigation";
import {
  login as loginApi,
  logout as logoutApi,
  signup as SignupApi,
} from "@/lib/api";

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

function getStoredUserSnapshot(): string | null {
  return localStorage.getItem("user");
}

export function useAuth(): useAuthReturn {
  const router = useRouter();
  const storedUser = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("authChange", onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener("authChange", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    getStoredUserSnapshot,
    () => null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  let user: User | null = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  const logIn = useCallback(
    async (data: LoginRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await loginApi(data);
        if (!response.success || !response.data) {
          throw new Error(response.error || "Login failed");
        }
        localStorage.setItem("user", JSON.stringify(response.data.user));
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
        localStorage.setItem("user", JSON.stringify(response.data.user));
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
    await logoutApi();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
