'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, registerUser } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()

  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if admin exists
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-exists`)
      .then(r => r.json())
      .then(data => {
        setAdminExists(data.exists)
        setMode(data.exists ? 'login' : 'register')
      })
      .catch(() => setAdminExists(true)) // safe fallback
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let data

      if (mode === 'register') {
        data = await registerUser(name, email, password, 'admin')
      } else {
        data = await loginUser(email, password)
      }

      if (data?.user?.role !== 'admin') {
        setError('Admin access only')
        return
      }

      setUser(data.user)
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {mode === 'login' ? 'Admin Login' : 'Setup Admin Account'}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === 'login'
              ? 'Art Fusion Admin Panel'
              : 'No admin found — create the first admin account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name — sirf register mode mein */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white"
            disabled={loading}
          >
            {loading
              ? mode === 'login' ? 'Logging in...' : 'Creating account...'
              : mode === 'login' ? 'Login as Admin' : 'Create Admin Account'}
          </Button>

        </form>
      </div>
    </div>
  )
}