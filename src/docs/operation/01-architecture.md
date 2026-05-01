# Architecture Map

## Layered diagram

```mermaid
graph TB
  subgraph Browser["🌐 Browser"]
    UI["React UI<br/>(pages + shadcn components)"]
    Z["Zustand<br/>auth + UI state"]
    RQ["TanStack Query<br/>server cache"]
  end

  subgraph Cloud["☁️ Lovable Cloud (Supabase)"]
    Auth["Auth<br/>JWT + sessions"]
    DB[("Postgres<br/>105 tables · RLS")]
    Storage["Storage Buckets<br/>avatars · signatures<br/>resources · documents"]
    EF["Edge Functions<br/>26 deployed"]
    RT["Realtime<br/>postgres_changes"]
  end

  subgraph External["🔌 External Services"]
    Resend["Resend<br/>transactional email"]
    Twilio["Twilio<br/>SMS / WhatsApp"]
    LovAI["Lovable AI Gateway<br/>Gemini · GPT"]
    GFit["Google Fit<br/>health sync"]
  end

  UI --> Z
  UI --> RQ
  RQ -->|select / insert / update| DB
  RQ -->|signed URLs| Storage
  UI -->|invoke| EF
  Z --> Auth
  RT -->|stream| RQ

  EF -->|service role| DB
  EF -->|send| Resend
  EF -->|send| Twilio
  EF -->|generate| LovAI
  UI -->|REST sync| GFit
```

## Key principles

- **Frontend-first**: business logic in React + RPCs; no Node/Express server.
- **Edge functions** handle privileged operations (admin user creation, password reset, OTP verification, scheduled jobs, document signing, AI calls).
- **RLS everywhere**: every table is row-level secured; admins bypass via `is_admin(auth.uid())` SECURITY DEFINER.
- **Zustand + TanStack Query**: Zustand stores auth identity and UI flags only. All server data flows through React Query for cache + invalidation.
- **Mobile-first PWA**: installable; works on phone and tablet primarily; admin views are responsive desktop-friendly.

## Folder layout

```text
src/
├── pages/
│   ├── admin/        ← 79 admin pages
│   ├── seeker/       ← 75 seeker pages
│   ├── coaching/     ← 45 coach pages
│   └── public/       ← landing, login, register
├── components/
│   ├── ui/           ← shadcn primitives
│   ├── dashboard/    ← seeker home widgets
│   ├── admin/        ← admin shared widgets
│   └── docs/         ← Operation Docs viewer
├── hooks/            ← reusable data hooks (useDbSessions, useStreakCount...)
├── store/            ← Zustand stores (authStore, ...)
├── lib/              ← pure utilities (date, audio, validation)
├── data/             ← static seed data, mock content
├── docs/operation/   ← THIS docs bundle
└── integrations/supabase/ ← AUTO-GENERATED client + types

supabase/
├── functions/        ← 26 edge functions (Deno)
└── migrations/       ← versioned SQL schema
```
