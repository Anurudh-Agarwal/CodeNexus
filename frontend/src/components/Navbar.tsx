'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between h-16 bg-background border-b border-border px-4 md:px-6 z-50">
      <Link href="/">
        <h1 className="text-2xl font-bold italic tracking-tight">CodeNexus</h1>
      </Link>

      <Link href="/notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={24} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            5
          </span>
        </Button>
      </Link>
    </nav>
  )
}
