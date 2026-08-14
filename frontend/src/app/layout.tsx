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
      <body className="bg-teal-50">
        <Navbar />
        <Sidebar />
        <main className="pt-16 pb-20 lg:ml-18 lg:p-2 border-3 mt-22 rounded-2xl bg-white m-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}