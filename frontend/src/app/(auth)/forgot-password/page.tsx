'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/authClient'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email)
      if (resetError) throw resetError

      sessionStorage.setItem('resetEmail', email)
      setSent(true)
      setTimeout(() => router.push('/reset-password'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-md p-8 border border-border">
        <h1 className="text-3xl font-bold mb-2 text-center">CodeNexus</h1>
        <h2 className="text-xl font-bold mb-2 text-center">Forgot Password</h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Enter your college email
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>
        )}

        {sent ? (
          <p className="text-center text-sm">OTP sent! Redirecting...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@ietlucknow.ac.in"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/80 disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
