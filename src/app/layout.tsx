import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SWRegister } from '@/app/components/providers/sw-register'

export const metadata: Metadata = {
  title: 'ZenGarantie',
  description: 'Stockez vos factures de garantie et ne les perdez plus jamais',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZenGarantie',
  },
  formatDetection: { telephone: false },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {/* Capture beforeinstallprompt avant hydration React pour éviter les problèmes de timing */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__pwaInstallPrompt=null;
          window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaInstallPrompt=e;});
        `}} />
        {children}
        <SWRegister />
      </body>
    </html>
  )
}
