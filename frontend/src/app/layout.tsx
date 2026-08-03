import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'CodeNexus',
  description: 'Competitive Programming Social Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Navbar />
        <Sidebar />
        <main className="pt-16 pb-20 lg:ml-17 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}