"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/authClient";
import { login } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [email] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("resetEmail") || "";
  });

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  async function handleVerifyOtp(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabaseClient.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });
      if (error) throw error;
      setStep("password");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid OTP";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      const response = await login({ email, password });
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Password changed, but profile loading failed",
        );
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("authChange"));

      sessionStorage.removeItem("resetEmail");

      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-md p-8 border border-border">
        <h1 className="text-3xl font-bold mb-2 text-center">CodeNexus</h1>
        <h2 className="text-xl font-bold mb-6 text-center">
          {step === "otp" ? "Enter OTP" : "New Password"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">
            {error}
          </div>
        )}

        {step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-center text-2xl tracking-widest"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/80 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/80 disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Reset & Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
