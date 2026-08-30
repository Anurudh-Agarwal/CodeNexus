"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function HomePage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  if (!user) {
    return <div className="text-center p-8">Redirecting to login...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
      <p className="mb-6">You&apos;re logged in as {user.email}</p>

      <div className="space-y-4">
        <Link
          href="/leaderboard"
          className="block bg-blue-600 text-white p-4 rounded"
        >
          View Leaderboard
        </Link>
        <Link
          href={`/profile/${user.id}`}
          className="block bg-green-600 text-white p-4 rounded"
        >
          Your Profile
        </Link>
      </div>
    </div>
  );
}
