# ZenGarantie — Guide de développement

## État du projet (mis à jour le 2026-04-26)

### ✅ Complété — Application 100% opérationnelle
- Repo GitHub : **https://github.com/davidb-wq/zen-garantie** · Vercel : **https://zen-garantie.vercel.app**
- Supabase : table `warranties`, RLS, Storage bucket `warranty-images` (privé, signed URLs), OTP activé
- Variables d'environnement : 8 variables sur Vercel (`BREVO_API_KEY`, `CRON_SECRET` 64 chars hex, etc.)
- **Auth OTP** — code 8 chiffres via Brevo SMTP (pas de magic link) — compatible iOS Safari + tous navigateurs
- **Auth OAuth** — Google + Microsoft (Azure), flux PKCE → `/auth/callback`
- **Auth rate limit** — countdown 60s, erreurs traduites en français
- **Brevo** — SMTP pour OTP Supabase + API transactionnelle pour les rappels cron (300 emails/jour, envoie à tous)
- **Cron quotidien** — 9h UTC (5h heure Québec EDT), logique roulante ancrée sur `purchase_date`, logs d'erreur Brevo
- **Landing page** — `/` publique avec présentation + bouton connexion ; redirige vers `/warranties` si connecté
- **Upload photo** — deux boutons (caméra + galerie), compression 800px, photo obligatoire à la création
- **Recadrage photo** — `ImageCropModal` (z-9999, react-image-crop) → canvas WebP ; visionneuse `ImageLightbox` sur détail
- **Édition photo** — DELETE + INSERT (pas upsert — pas de policy UPDATE Storage Supabase)
- **Erreur mémoire compression** — message amber 30s avec solutions si canvas OOM
- **Photos privées** — bucket privé, signed URLs 1h côté serveur ; `image_url` en BDD = chemin relatif `{user_id}/{warranty_id}.webp`
- **PWA** — install sheet (1ère visite), icônes dynamiques via `/api/pwa-icon/[size]` (ImageResponse, edge runtime)
- **Audit sécurité** — aucune clé secrète dans git, double vérification cron (`x-vercel-cron` + Bearer), security headers HTTP
- **Wording email rappel** — neutre : "Rappel de garantie — X" (cohérent avec rappels roulants ET ponctuels)
- **Conformité Loi 25** — `/confidentialite` publique, avis login, export JSON, suppression compte, photos privées, bannière changement politique
- **Scanner code-barres** — dans le dashboard (`/warranties`), caméra `@zxing/browser`, UPCitemdb + fallback Open Food Facts, analyse garantie probable/peu probable/inconnue en français, 3 scans/jour par appareil (localStorage), `davidblouin03@gmail.com` illimité
- **Politique mise à jour (2026-04-23)** — code-barres ajouté (Loi 25) ; UPCitemdb + Open Food Facts comme sous-traitants ; `CURRENT_POLICY_VERSION = '2026-04-23'`

### 🔧 Reste à faire (optionnel)
- Aucun — conformité Loi 25 complète ✅

---

## Décisions prises
- **Auth :** OTP 8 chiffres + OAuth Google + OAuth Microsoft — compatible tous navigateurs incluant Safari iOS
- **Email auth :** Brevo SMTP (`smtp-relay.brevo.com:587`) — 300 emails/jour, sans limite Supabase
- **Email rappels :** Brevo API transactionnelle — envoie à tous les utilisateurs
- **Nom :** ZenGarantie · **Utilisateurs :** Multi-utilisateurs avec RLS Supabase
- **Scanner code-barres :** `@zxing/browser` (import dynamique `useEffect`), UPCitemdb 100 req/jour, cache CDN 24h, 3 scans/jour localStorage

## Stack technologique
- **Framework :** Next.js (App Router, TypeScript) · **Styles :** Tailwind CSS + Lucide-React
- **Recadrage photo :** react-image-crop (^11.x) · **Scanner :** @zxing/browser (^0.1.x)
- **Auth & BDD :** Supabase · **Stockage :** Supabase Storage 1GB · **Hébergement :** Vercel
- **Emails :** Brevo SMTP (auth) + Brevo API (rappels) — login Brevo : `a805df001@smtp-brevo.com`

## Structure des fichiers

```
warranty-keep/
├── .env.local / .env.example      # Jamais commité — 8 variables
├── next.config.ts                 # Headers SW + security headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)
├── vercel.json                    # Cron : 0 9 * * * (tous les jours, 9h UTC)
├── public/sw.js                   # Service worker (network-first, prod uniquement)
├── emails/warranty-reminder.tsx   # Template React Email français
└── src/
    ├── middleware.ts              # Refresh token + redirect si non-auth ; / et /login → /warranties si connecté
    ├── lib/
    │   ├── supabase/{client,server}.ts
    │   ├── image-compression.ts   # browser-image-compression → 0.5MB max, WebP
    │   ├── policy-version.ts      # CURRENT_POLICY_VERSION — changer pour déclencher la bannière chez tous
    │   └── warranty-utils.ts      # getExpiryDate, getWarrantyStatus, STATUS_STYLES
    ├── types/
    │   ├── warranty.ts            # interface Warranty, WarrantyStatus
    │   └── barcode.ts             # interface BarcodeResult, type WarrantyLikelihood
    └── app/
        ├── layout.tsx             # Root layout, PWA metadata, <SWRegister>, capture beforeinstallprompt
        ├── manifest.ts            # PWA manifest — icônes via /api/pwa-icon/[size]
        ├── globals.css            # Tailwind + .input + pb-safe
        ├── page.tsx               # Landing page publique, redirige si connecté
        ├── confidentialite/page.tsx  # Politique Loi 25, 10 sections, sans auth requise
        ├── (auth)/
        │   ├── login/page.tsx     # OAuth (Google, Microsoft) + OTP 2 étapes (email → code → verifyOtp)
        │   └── auth/callback/route.ts  # Gère ?code= (PKCE) et ?token_hash= (confirm signup)
        ├── (app)/
        │   ├── layout.tsx         # Auth guard (getUser) + BottomNav + PolicyBanner
        │   ├── warranties/page.tsx  # Liste triée + <DashboardScanner />
        │   ├── warranties/[id]/page.tsx  # Détail + Server Action suppression + ImageLightbox
        │   ├── warranties/[id]/edit/page.tsx
        │   ├── add/page.tsx
        │   └── settings/page.tsx  # Déconnexion + rappels + install PWA + Confidentialité
        ├── api/
        │   ├── cron/route.ts      # Cron quotidien : scan + envoi Brevo API
        │   ├── export/route.ts    # GET — JSON warranties (droit portabilité Loi 25)
        │   ├── barcode/[upc]/route.ts  # GET — UPCitemdb + Open Food Facts, auth, cache 24h
        │   └── pwa-icon/[size]/route.tsx  # Icônes PWA dynamiques (ImageResponse, edge)
        └── components/
            ├── ui/
            │   ├── bottom-nav.tsx / warranty-card.tsx / expiry-badge.tsx
            │   ├── dashboard-scanner.tsx   # Bouton + modal + résultat scan — dans /warranties
            │   ├── install-sheet.tsx / install-settings-row.tsx  # PWA install
            │   ├── delete-account-button.tsx  # Suppression 2 étapes, nettoie Storage + BDD + auth
            │   ├── policy-banner.tsx       # Bannière Loi 25 si version politique non acceptée
            │   ├── image-crop-modal.tsx    # z-9999, react-image-crop, auto-init 96%, canvas → WebP
            │   └── image-lightbox.tsx      # Plein écran, pinch-zoom natif, Escape pour fermer
            ├── forms/
            │   ├── warranty-form.tsx       # Add/edit — DELETE+INSERT pour upload photo
            │   ├── image-upload.tsx        # Camera/galerie → ImageCropModal → compression
            │   ├── barcode-scanner-modal.tsx  # z-9999, @zxing/browser, facingMode env, guard hasScanned
            │   └── product-result-card.tsx    # Résultat scan : nom/marque + bloc garantie coloré + disclaimer
            └── providers/
                ├── sw-register.tsx / auth-hash-handler.tsx / pwa-install-provider.tsx
    └── hooks/use-pwa-install.ts   # beforeinstallprompt, Android/iOS, localStorage dismissed
```

---

## Infos de déploiement

| Service | URL / Identifiant |
|---|---|
| App en production | https://zen-garantie.vercel.app |
| Repo GitHub | https://github.com/davidb-wq/zen-garantie |
| Supabase projet | https://djsntrzximssohhluwti.supabase.co |
| Brevo compte | davidblouin03@gmail.com · SMTP login : `a805df001@smtp-brevo.com` |

## Commandes

```bash
# Lancer localement
cd "C:\Users\Utilisateur\OneDrive\Documents\Mes projets\Application-facture-garantie\warranty-keep"
npm run dev   # ou double-cliquer start-dev.bat → http://localhost:3000

# Déployer
git add -p && git commit -m "..." && git push   # Vercel redéploie automatiquement
```

---

## SQL Supabase (copier-coller dans le SQL Editor)

```sql
create table public.warranties (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  purchase_date     date not null,
  warranty_months   int not null default 12,  -- -1 = lifetime
  physical_location text not null default '',
  notes             text,
  image_url         text,
  reminder_interval int not null check (reminder_interval in (1, 3, 12, -3, -6)),
  created_at        timestamptz not null default now()
);
create index warranties_user_id_idx on public.warranties(user_id);

create or replace view public.warranties_with_expiry as
select *, (purchase_date + (warranty_months * interval '1 month'))::date as expiry_date
from public.warranties where warranty_months != -1;

alter table public.warranties enable row level security;
create policy "select own" on public.warranties for select to authenticated using (auth.uid() = user_id);
create policy "insert own" on public.warranties for insert to authenticated with check (auth.uid() = user_id);
create policy "update own" on public.warranties for update to authenticated using (auth.uid() = user_id);
create policy "delete own" on public.warranties for delete to authenticated using (auth.uid() = user_id);

-- Storage RLS (bucket warranty-images privé)
create policy "Users can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'warranty-images' AND (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view their own images"
  on storage.objects for select to authenticated
  using (bucket_id = 'warranty-images' AND (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'warranty-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## Règles de développement importantes

1. **`getUser()` côté serveur** — middleware et app layout (remplace `getClaims()`)
2. **Service Worker** — enregistré uniquement en production (`NODE_ENV === 'production'`)
3. **Path Storage** = `{user_id}/{warranty_id}.webp` — requis pour les policies RLS
4. **`SUPABASE_SERVICE_ROLE_KEY`** — jamais côté client, seulement dans le cron
5. **Cron Vercel Hobby** — max 1x/jour → `0 9 * * *` (tous les jours à 9h UTC = 5h EDT Québec)
6. **`reminder_interval`** — 5 valeurs : `1`/`3`/`12` = roulants (mois/3mois/an depuis `purchase_date`) ; `-3`/`-6` = ponctuels avant expiration. Champ obligatoire, pas de défaut.
7. **Auth OTP** — `signInWithOtp({ email })` sans `emailRedirectTo` → code 8 chiffres. Vérif : `verifyOtp({ email, token, type: 'email' })`.
8. **Auth OAuth** — `signInWithOAuth({ provider, options: { redirectTo: origin + '/auth/callback' } })`. Providers : `google`, `azure`. Secrets dans Supabase dashboard uniquement (jamais dans le code).
9. **Auth callback** — gère `?code=` (PKCE OAuth) et `?token_hash=&type=` (confirm signup). Erreur → `/login?error=auth_failed`.
10. **Templates email Supabase** — Auth > Email Templates, variable `{{ .Token }}`, `user-select:all`. Sources dans `supabase/email-templates/`. OTP expiry = 3600s.
11. **Brevo SMTP** — Supabase → Authentication → SMTP Settings. Host: `smtp-relay.brevo.com:587`. Remplace le serveur intégré Supabase (limité 2/h).
12. **Supabase Redirect URL** — `https://zen-garantie.vercel.app/auth/callback` dans Authentication → URL Configuration.
13. **Upload photo** — deux inputs séparés : `capture="environment"` (caméra) et sans (galerie). Limite 20 Mo avant compression. Photo obligatoire à la création.
14. **Upload photo édition** — pas de policy UPDATE Storage → `remove([path])` silencieux puis `upload(..., { upsert: false })`.
15. **Modals plein écran** — `z-[9999]` (pas `z-50`) pour couvrir la bottom nav.
16. **Scanner (@zxing/browser)** — toujours `await import('@zxing/browser')` dans `useEffect` (accède à `navigator` à l'import → crash SSR si statique). Utiliser `decodeFromConstraints` (pas `decodeFromVideoDevice`) pour iOS Safari. Ignorer `NotFoundException` avec `void error`.
17. **Limite scans** — clé localStorage `scan-usage` = `{ date: 'YYYY-MM-DD', count: number }`. Réinitialisée si date change. Compte `davidblouin03@gmail.com` exempté via `supabase.auth.getUser()` côté client.
18. **Détection garantie** — heuristique marque + mots-clés dans `api/barcode/[upc]/route.ts`. Retourne `warrantyLikelihood: 'probable' | 'peu_probable' | 'inconnue'` + `warrantyMessage` français.
19. **Cache UPCitemdb** — 24h Vercel CDN. Si résultat incorrect, attendre 24h ou passer `revalidate: 0` temporairement.
20. **Bannière politique** — `policy-banner.tsx` + `policy-version.ts`. Compare `user.user_metadata.policy_version_accepted` avec `CURRENT_POLICY_VERSION`. Changer `CURRENT_POLICY_VERSION` pour déclencher chez tous.
21. **Suppression de compte** — ordre : 1) récupérer IDs garanties → 2) supprimer photos Storage → 3) supprimer lignes warranties → 4) `admin.auth.admin.deleteUser(user.id)` (nécessite `SUPABASE_SERVICE_ROLE_KEY`) → 5) redirect `/login`.
22. **Export données** — `/api/export` GET, 401 si non auth. `Content-Disposition: attachment`. Utiliser `<a href="/api/export" download>` (pas Server Action — ne peut pas streamer un fichier).

## Design

- Style ultra-minimaliste, thème clair/sombre automatique (`prefers-color-scheme`)
- Mobile-first, `max-w-md mx-auto` pour desktop
- Bottom nav fixe avec `pb-[env(safe-area-inset-bottom)]` pour iPhone · `viewport-fit=cover`
- Couleurs par statut : vert (actif) / amber (≤90j) / rouge (expiré) / gris (à vie)
- Classe utilitaire `.input` définie dans `globals.css`

---

## Tester le cron manuellement

Remplace `TON_CRON_SECRET` par la valeur de `CRON_SECRET` dans `.env.local` :

```bash
node -e "
const https = require('https');
const req = https.request({
  hostname: 'zen-garantie.vercel.app', path: '/api/cron', method: 'GET',
  headers: { 'Authorization': 'Bearer TON_CRON_SECRET' }
}, (res) => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>console.log(res.statusCode,b)); });
req.on('error', e => console.error(e)); req.end();
"
```

Réponse attendue : `{"sent": N, "attempted": N, "total": N, "errors": N}`
- `sent` = emails envoyés · `attempted` = rappels dus aujourd'hui · `total` = garanties actives · `errors` = échecs Brevo
