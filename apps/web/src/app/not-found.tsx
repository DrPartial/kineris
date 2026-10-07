import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover">
        Back to home
      </Link>
    </div>
  )
}
