import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Logo + titre */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white mb-5">
              <svg
                className="w-8 h-8 text-white dark:text-slate-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              ZenGarantie
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Stockez vos factures garanties,<br />
              ne les perdez plus jamais.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-10">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="mt-0.5 w-2.5 h-2.5 rounded-full bg-warranty-safe shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Toutes vos garanties au même endroit
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Ajoutez une photo de vos factures et retrouvez-les en un instant.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="mt-0.5 w-2.5 h-2.5 rounded-full bg-warranty-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Rappels personnalisé
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Recevez par email des rappels de vos garanties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="mt-0.5 w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Accessible depuis votre téléphone
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Installez l&apos;app sur votre écran d&apos;accueil pour un accès immédiat.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors hover:bg-slate-700 dark:hover:bg-slate-100"
          >
            Créer un compte ou se connecter
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </main>

    </div>
  )
}
