"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/lib/api";

type SignupData = {
  email: string;
  name: string;
  year: string;
  branch: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userData] = useState<SignupData | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const data = sessionStorage.getItem("signupData");

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as SignupData;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!userData) {
      router.push("/signup");
    }
  }, [userData, router]);

  async function handleVerify(e: React.SubmitEvent) {
    e.preventDefault();

    if (!userData) {
      setError("Signup data not found. Please sign up again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOtp({
        email: userData.email,
        token: otp,
        name: userData.name,
        year: parseInt(userData.year, 10),
        branch: userData.branch,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Verification failed");
      }

      sessionStorage.removeItem("signupData");

      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.dispatchEvent(new Event("authChange"));

      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const email = userData?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">CodeNexus</h1>

        <h2 className="text-xl font-bold mb-2 text-center">
          Verify your email
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">OTP Code</label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Didn&apos;t receive OTP?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    </div>
  );
}
