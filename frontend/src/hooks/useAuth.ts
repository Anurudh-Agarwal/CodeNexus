"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { LoginRequest, SignupRequest, User } from "@/types";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser) {
          setUser(parsedUser);
        }

        const response = await getCurrentUser();
        if (response && response.success && response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
          return;
        }

        localStorage.removeItem("user");
        setUser(null);
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();
  }, [storedUser]);

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
    await logoutApi();
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
