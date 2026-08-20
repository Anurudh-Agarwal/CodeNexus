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
      <body className="bg-background text-foreground">
        <Navbar />
        <Sidebar />
        <main className="pt-16 pb-14 lg:pb-6 lg:pl-16">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
