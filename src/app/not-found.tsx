import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/workflows"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Workflows
        </Link>
      </div>
    </div>
  )
}
