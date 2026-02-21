import { AuthGuard } from '@/components/layout/auth-guard'
import { Sidebar } from '@/components/layout/sidebar'

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}