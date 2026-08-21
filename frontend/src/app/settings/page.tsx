"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LoginPage from "../(auth)/login/page";
import {
  ChevronRight,
  User,
  Link2,
  Lock,
  Info,
  FileText,
  Shield,
  ScrollText,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type IconType = typeof User;

function SettingsRow({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: IconType;
  label: string;
  description?: string;
}) {

    const { user, isLoading }= useRequireAuth();
    
    if (isLoading) return <div className="text-center p-8">Loading...</div>;
    if (!user) return <LoginPage />;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
    >
      <Icon
        size={20}
        className="text-muted-foreground shrink-0"
        strokeWidth={1.8}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export default function SettingsPage() {
  const { user, logOut } = useAuth();

  function handleLogout() {
    if (window.confirm("Are you sure you want to log out?")) {
      logOut();
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold px-1 pb-4">Settings</h1>

      <section className="mb-6">
        <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <div className="flex flex-col">
          <SettingsRow
            href={user ? `/profile/${user.id}/edit` : "/login"}
            icon={User}
            label="Edit Profile"
            description="Name, bio, branch, year, links"
          />
          <SettingsRow
            href="/sync-platforms"
            icon={Link2}
            label="Sync Platforms"
            description="Connect Codeforces, LeetCode, CodeChef"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Privacy
        </h2>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <Lock
            size={20}
            className="text-muted-foreground shrink-0"
            strokeWidth={1.8}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Private Account</p>
            <p className="text-xs text-muted-foreground">
              Only mutual follows can see your revision questions
            </p>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5 shrink-0">
            Coming soon
          </span>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          About
        </h2>
        <div className="flex flex-col">
          <SettingsRow href="/about" icon={Info} label="About CodeNexus" />
          <SettingsRow
            href="/terms-and-conditions"
            icon={FileText}
            label="Terms & Conditions"
          />
          <SettingsRow
            href="/privacy-policy"
            icon={Shield}
            label="Privacy Policy"
          />
          <SettingsRow
            href="/code-of-conduct"
            icon={ScrollText}
            label="Code of Conduct"
          />
        </div>
      </section>

      <section className="pb-8">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut size={18} strokeWidth={1.8} />
          Log Out
        </Button>
      </section>
    </div>
  );
}
