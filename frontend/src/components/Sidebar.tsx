'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, MessageCircle, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: MessageCircle, label: 'Chat', href: '/chat' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const profileHref = user ? `/profile/${user.id}` : '/login'
  const isProfileActive = pathname === profileHref
  const isSettingsActive = pathname === '/settings'

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden lg:flex fixed left-0 top-16 bottom-0 bg-background border-r border-border flex-col justify-between py-6 z-40 transition-[width] duration-150 ease-in-out ${
        isHovered ? 'w-64 px-3' : 'w-16 px-2'
      }`}
    >
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl overflow-hidden whitespace-nowrap transition-colors ${
                isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon size={26} className="shrink-0" strokeWidth={isActive ? 2.4 : 1.8} />
              <span
                className={`text-sm transition-opacity duration-150 ${
                  isHovered ? 'opacity-100 delay-75' : 'opacity-0'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <nav className="flex flex-col gap-1">
        <Link
          href={profileHref}
          className={`flex items-center gap-4 px-3 py-3 rounded-xl overflow-hidden whitespace-nowrap transition-colors ${
            isProfileActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Avatar size="sm" className="shrink-0">
            <AvatarImage src={user?.avatar_url} alt={user?.name ?? 'Profile'} />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          <span
            className={`text-sm transition-opacity duration-150 ${
              isHovered ? 'opacity-100 delay-75' : 'opacity-0'
            }`}
          >
            Profile
          </span>
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-4 px-3 py-3 rounded-xl overflow-hidden whitespace-nowrap transition-colors ${
            isSettingsActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Settings size={26} className="shrink-0" strokeWidth={isSettingsActive ? 2.4 : 1.8} />
          <span
            className={`text-sm transition-opacity duration-150 ${
              isHovered ? 'opacity-100 delay-75' : 'opacity-0'
            }`}
          >
            Settings
          </span>
        </Link>
      </nav>
    </aside>
  )
}