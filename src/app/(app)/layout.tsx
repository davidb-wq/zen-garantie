import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/app/components/ui/bottom-nav'
import { PWAInstallProvider } from '@/app/components/providers/pwa-install-provider'
import { PolicyBanner } from '@/app/components/ui/policy-banner'
import { CURRENT_POLICY_VERSION } from '@/lib/policy-version'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const needsPolicyAcceptance =
    user.user_metadata?.policy_version_accepted !== CURRENT_POLICY_VERSION

  async function acceptPolicy() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.updateUser({
      data: { policy_version_accepted: CURRENT_POLICY_VERSION },
    })
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      <BottomNav />
      {needsPolicyAcceptance && <PolicyBanner acceptAction={acceptPolicy} />}
      <PWAInstallProvider />
    </div>
  )
}
