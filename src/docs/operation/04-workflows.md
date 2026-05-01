# Workflows

End-to-end flows that span UI, DB, and edge functions.

## 1) Seeker Registration & Approval

```mermaid
sequenceDiagram
  actor S as Seeker
  participant UI as Register UI
  participant DB as profiles
  participant Q as applications queue
  participant A as Admin
  participant EF as approve-application

  S->>UI: fill /register form
  UI->>DB: check_profile_duplicate(email, phone)
  alt duplicate
    DB-->>UI: 'email' | 'phone'
    UI-->>S: error
  else fresh
    UI->>DB: insert profile (status=pending)
    DB->>Q: queue entry visible at /admin/applications
    A->>EF: click Approve
    EF->>DB: update status=active, send credentials
    EF-->>S: welcome email (Resend)
  end
```

## 2) Onboarding (mandatory 6-step)

1. Welcome + identity confirmation
2. Coaching Agreement (e-signed)
3. Goal Commitment form
4. Personal History intake
5. LGT Initial Goal Setting (IGS) assessment — counts as Session #1
6. Tour the app (OnboardingTour overlay on `/seeker/home`)

Cannot access daily features until all 6 are complete.

## 3) Session Lifecycle

```mermaid
sequenceDiagram
  participant A as Admin
  participant Sess as sessions
  participant Coach
  participant Seeker
  participant EF as send-pre-session-prep-reminder

  A->>Sess: schedule session (status='scheduled')
  Note over Sess: trigger sync_session_time_fields<br/>computes start_at / end_at
  EF-->>Seeker: 10-min-before reminder
  Coach->>Sess: status='in_progress'
  Note over Sess: auto attendance='present'
  Coach->>Sess: fill notes, breakthroughs, next assignments
  Coach->>Sess: status='completed'
  Sess->>Seeker: prompt for feedback
  Seeker->>Sess: rating + comments
  Sess->>Sess: e-signatures from both parties (session_signatures)
  Sess->>Sess: status='signed_off'
```

## 4) Daily Worksheet (Dharmic Worksheet)

```mermaid
graph LR
  Morning["Morning section<br/>mood, energy, sankalp"] --> Day["During-day fields<br/>practices, time sheet"]
  Day --> Evening["Evening section<br/>gratitude, LGT scores"]
  Evening --> Submit["is_submitted=true"]
  Submit --> Streak["streaks updated"]
  Submit --> Points["+10 points (+5 if 100%)"]
  Submit --> Email["daily progress email<br/>(opt-in)"]
```

## 5) Assignment Cycle

```mermaid
sequenceDiagram
  participant Coach
  participant A as assignments
  participant Seeker
  participant Sub as submissions

  Coach->>A: insert assignment (status='assigned')
  A-->>Seeker: notification + appears in tasks
  Seeker->>Sub: submit (status='pending')
  Coach->>Sub: review → status='approved'/'rejected', score 1–10
  Sub-->>Seeker: notification of result
  alt approved
    A->>A: status='completed'
  end
```

## 6) Support Ticket

```mermaid
sequenceDiagram
  participant S as Seeker
  participant UI as /seeker/help
  participant T as support_tickets
  participant RPC as notify_admins_of_ticket
  participant Admins
  participant Inbox as /admin/support

  S->>UI: submit issue or feature request
  UI->>T: insert ticket
  UI->>RPC: invoke
  RPC->>Admins: insert notification rows
  Admins->>Inbox: triage, set status, reply
  Inbox->>S: reply notification
```

## 7) Document Signing (e-signature)

```mermaid
sequenceDiagram
  participant A as Admin
  participant EF1 as request-document-signature
  participant Sig as signature_requests
  participant Signer
  participant EF2 as get-signature-request
  participant EF3 as submit-signature
  participant Doc as document_signatures
  participant Storage as signatures bucket

  A->>EF1: request (doc_id, signer)
  EF1->>Sig: create record + token
  EF1-->>Signer: email magic link
  Signer->>EF2: open link → load doc
  Signer->>EF3: typed name + drawn sig
  EF3->>Storage: upload PNG
  EF3->>Doc: insert with content_hash (SHA-256)
  EF3->>Sig: status='signed'
```

## 8) Daily Cron Jobs

| Time (IST) | Function | Purpose |
|---|---|---|
| 06:00 | `send-daily-seeker-reports` | Yesterday's progress digest to opted-in seekers |
| 09:00 | `process-email-queue` | Drain Resend queue (pgmq) |
| 10:00 | `daily-session-report` | Email admins yesterday's session metrics |
| 20:00 | `send-evening-gratitude-nudge` | Push reminder to log gratitude |
| Continuous | `session-heartbeat` | Keep active sessions alive |
| Pre-session | `send-pre-session-prep-reminder` | 10-min warning to seeker + coach |
| Monthly | `rotate_encryption_keys` | Key rotation for PII encryption |
