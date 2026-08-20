'use client'

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

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const profileHref = user ? `/profile/${user.id}` : '/login'
  const isProfileActive = pathname === profileHref
  const isSettingsActive = pathname === '/settings'

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-14 bg-background border-t border-border z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center p-2 transition-colors ${
              isActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.4 : 1.8} />
          </Link>
        )
      })}

      <Link
        href="/settings"
        className={`flex items-center justify-center p-2 transition-colors ${
          isSettingsActive ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        <Settings size={24} strokeWidth={isSettingsActive ? 2.4 : 1.8} />
      </Link>

      <Link href={profileHref} className="flex items-center justify-center p-2">
        <Avatar
          size="sm"
          className={isProfileActive ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}
        >
          <AvatarImage src={user?.avatar_url} alt={user?.name ?? 'Profile'} />
          <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
        </Avatar>
      </Link>
    </nav>
  )
}
