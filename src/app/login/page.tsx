'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/workflows')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Anchor
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI workflow automation where you can see everything
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={['google', 'github']}
            redirectTo={origin ? `${origin}/workflows` : '/workflows'}
          />
        </div>
      </div>
    </div>
  )
}