# Urban Standz Legal Case Tracker

A dedicated, community-accessible legal action portal and case tracker for tenants and house owners affected by **M/S Urban Standz Private Limited**.

---

## 🏛️ Application Overview

This application manages and displays all cases filed in Bengaluru civil and criminal courts involving Urban Standz Pvt Ltd, property owners, and tenants.

- **Public View (Free Access, No Login Required):** Anyone can access the portal, search cases by party name, court hall, advocate, or case number, view hearing countdowns, examine daily court order sheets (*Last Business*), and download Excel/CSV reports.
- **Admin Management (Protected by Admin Passcode):** Only authorized administrators can:
  - Add new cases with all 19 standard fields.
  - **Quick Update Hearing Details** (New hearing date + today's court order / adjournment reason) with 1 click.
  - Edit full case metadata and party details.
  - Delete or archive cases.
  - Import / Export data backups.

---

## 📋 The 19 Case Fields Supported

1. **Court Name** – Drop Down (*Chief Judicial Magistrate, Principal City Civil & Sessions Court, Mayo Hall - CCH21, etc.*)
2. **CCH (Hall Number)** – e.g. `1031-XIX`, `17-CCH12 XVI`, `8-CCH19 VII`, `1034-XXII`
3. **Judge** – Bench / Presiding Officer designation
4. **CNR Number** – Official 16-character eCourts CNR (with 1-click copy & direct eCourts verification link)
5. **Registration Number** – Case No. (e.g. `O.S./7280/2026`, `C.C./64822/2026`, `P.C.R./8205/2026`)
6. **Plaintiff 1** – Primary Complainant / Plaintiff
7. **Plaintiff 2** – Optional Co-plaintiff
8. **Plaintiff 3** – Optional Co-plaintiff
9. **Defendant 1** – Primary Accused / Defendant (`URBAN STANDZ PRIVATE LIMITED`)
10. **Defendant 2** – Optional Defendant (Landlord, Director, or Tenant)
11. **Defendant 3** – Optional Defendant
12. **Defendant 4** – Optional Defendant
13. **Advocate Name** – Legal Counsel representing complainant
14. **Current Status** – `Pending`, `Disposed`, `Stayed`
15. **Stage** – `Summons`, `Written Statement`, `Evidence`, `Notice`, `Orders`, `SWORN STATEMENT`, `Call On`, etc.
16. **Filing Date** – Date of institution
17. **Next Hearing** – Date of next scheduled appearance with smart urgency badges (*Today*, *Tomorrow*, *In 3 days*, *Past*)
18. **Last Business** – Running court proceedings log recording orders passed on each hearing date (viewable as interactive chronological timeline or raw text)
19. **Linked Case** – Cross-suit reference (clickable to jump directly to the linked case)

---

## ⚡ Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# http://localhost:3000 (or http://localhost:3001)
```

### Admin Access
- Click **Admin Login** in the top navigation bar.
- Default Admin Passcode: `admin123`
- *(You can change this password at any time in the Cloud Settings modal).*

---

## 🚀 Free Cloud Deployment (Zero Cost Forever)

Since there is no confidential data in court cause lists, this tracker is architected to run **100% free forever** on public cloud platforms.

### Method 1: Vercel / Netlify + Supabase (Recommended)

1. **Free Database Setup (Supabase)**:
   - Create a free account at [supabase.com](https://supabase.com).
   - Create a new project (choose Mumbai / Singapore region for lowest latency).
   - In Supabase, go to the **SQL Editor**, paste the contents of [`supabase_schema.sql`](./supabase_schema.sql), and click **Run**.
   - Copy your **Project URL** and **Anon Public API Key** from *Project Settings > API*.

2. **Free Hosting (Vercel or Netlify)**:
   - Push this repository to GitHub.
   - Go to [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com) and click **Import Repository**.
   - Add the two Environment Variables:
     - `VITE_SUPABASE_URL` = your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - Click **Deploy**. Your site will be live with a free SSL domain (e.g. `urban-standz-tracker.vercel.app`)!

> **Note:** Even without setting environment variables ahead of time, the application works immediately out-of-the-box using local storage pre-seeded with all 69 cases, and an admin can paste the Supabase credentials directly through the web UI's **Settings** panel!

---

## 🛠️ Features Included

- **Multi-View Interface**:
  - **All Cases Table View**: High-density sortable table with status badges and quick action buttons.
  - **Cards View**: Mobile-first card grid optimized for viewing on smartphones during court visits.
  - **Hearings Calendar View**: Chronological hearing agenda grouped by date with days remaining countdown.
  - **Analytics View**: Visual distribution charts by Court forum, Legal Stage, and Advocates.
- **Deep Case Inspector**:
  - View full parties breakdown (Plaintiffs 1-3 vs Defendants 1-4).
  - Search inside orders / proceedings history.
  - 1-click jump to cross-linked cases.
  - Direct link to official Indian eCourts services.
- **Quick Hearing Update Modal**:
  - Purpose-built for litigators: after a hearing, update the next hearing date, stage, and order note in seconds without opening a complex form.
  - Preset date shortcuts: `+7 days`, `+14 days`, `+21 days`, `+30 days`, `+60 days`.
  - Common Bengaluru court order phrases auto-fill.
- **Data Export & Import**:
  - 1-click export of filtered or all cases to Excel (`.xlsx`) or CSV.
  - 1-click JSON backup download and file restore.
  - Reset to original spreadsheet seed data at any time.
