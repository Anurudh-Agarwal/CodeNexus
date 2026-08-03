'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between h-16 bg-white  px-4 md:px-6 z-50">

      <Link href="/" className="flex-1 text-center">
        <h1 className="text-2xl font-bold italic text-black">
          CodeNexus
        </h1>
      </Link>

      <Link href="/notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={24} className="text-gray-800" />
          <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-3 h-3 text-sm flex items-center justify-center font-semibold">
            5
          </span>
        </Button>
      </Link>

    </nav>
  )
}