'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, MessageCircle, User, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: MessageCircle, label: 'Chat', href: '/chat' },
  { icon: User, label: 'Profile', href: '/profile/me' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 bg-white border-t border-gray-200 z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center p-2 transition-colors ${
              isActive 
                ? 'text-black' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={ isActive ? 2 : 1.5} />
          </Link>
        )
      })}
    </nav>
  )
}