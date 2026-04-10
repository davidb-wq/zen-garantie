import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-slate-200 dark:text-slate-800 mb-4">404</p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/warranties"
          className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          Retour à mes garanties
        </Link>
      </div>
    </div>
  )
}
