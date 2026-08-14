'use client'
import { useState } from 'react'
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

export default function Sidebar() {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {  
    setPrevPathname(pathname)
    if (isHovered) setIsHovered(false)
  }

  const handleEnter = () => {
    setIsHovered(true)
  }

  const handleLeave = () => {
      setIsHovered(false)
  }

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`hidden lg:flex fixed left-0 pt-40 h-screen bg-teal-50 flex-col p-1 z-50 mt-0 transition-[width] duration-100 ease-in-out ${
        isHovered ? 'w-64' : 'w-16'
      }`}
    >
      <nav className="flex-1 space-y-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors overflow-hidden whitespace-nowrap bg-teal-100 ${
                isActive
                  ? 'bg-teal-200 text-black font-semibold'
                  : 'text-gray-700 hover:bg-teal-200'
              }`}
            >
              <Icon size={26} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              <span
                className={`text-base transition-opacity duration-200 ${
                  isHovered ? 'opacity-100 delay-100' : 'opacity-0'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}