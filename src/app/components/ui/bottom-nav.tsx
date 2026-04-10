'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Plus, Settings } from 'lucide-react'

const tabs = [
  { href: '/warranties', label: 'Garanties', icon: Shield },
  { href: '/add', label: 'Ajouter', icon: Plus },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-md mx-auto flex pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/warranties'
              ? pathname === '/warranties' || pathname.startsWith('/warranties/')
              : pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.8}
                fill={href === '/add' && isActive ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
