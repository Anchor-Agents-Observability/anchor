'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  FileText,
  BarChart3,
  Key,
  LogOut,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'All Workflows', href: '/workflows', icon: FileText },
  { name: 'Executions', href: '/executions', icon: BarChart3 },
  { name: 'Credentials', href: '/credentials', icon: Key },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Anchor</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User menu */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}