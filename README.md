# MoreFitLyfe Hub

A fitness & training web app for beginners, focused on helping users follow simple plans and stay consistent.

> Built with the Lovable platform and then refined in code. Frontend: Vite + React + TypeScript. Backend: Supabase (Auth + Postgres).

## Why this exists (problem → solution)
Many beginners quit because they don’t know what to do next. MoreFitLyfe provides a simple, guided experience:
- browse beginner-friendly training content/plans
- (optional) sign in to personalize the experience
- (optional) collect feedback/reviews

## Tech stack
- **Frontend:** Vite, React, TypeScript
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, Postgres)
- **Tooling:** ESLint / Prettier (TODO: keep only if configured)

## What I built / contributed (be honest)
- Prompted and iterated the initial app structure using **Lovable**
- Implemented/refined UI components and page flows in React + TypeScript
- Integrated Supabase client and environment-based configuration
- Repository hygiene improvements: removed committed `.env`, added `.env.example`, updated `.gitignore` (if you did it—otherwise don’t claim it)

## Features (delete anything that’s not implemented)
- [ ] Supabase Auth: sign up / sign in / sign out
- [ ] User profiles (Supabase table: `profiles`)
- [ ] Role-based access (table: `user_roles`)
- [ ] Products / plans listing (table: `products`)
- [ ] Reviews / testimonials (table: `reviews` or `reviews_public`)
- [ ] Analytics events/page views (tables: `analytics_events`, `analytics_page_views`)
- [ ] Payments (Stripe) (tables: `pending_checkouts`, `purchases`)

> IMPORTANT: Only check features you can demonstrate running locally or in production.

## Getting started (local)
### Prerequisites
- Node.js (LTS recommended)
- A Supabase project (or access to the existing one)

### Setup
1) Clone:
```bash
git clone https://github.com/trickefog12/morefit-lyfe-hub.git
cd morefit-lyfe-hub

## Features
- **Authentication:** Full Supabase Auth integration (Sign-up, Login, JWT session persistence).
- **Database:** PostgreSQL (via Supabase) managing user profiles, products, and roles.
- **Payments:** Stripe integration via Lovable managed backend (hosted checkout flow)- **Order Management:** Automated flow to track purchases and pending checkouts in the DB.
- Worked with a managed backend (Lovable Cloud) built on Supabase for authentication, database, and integrations
- Configured application features (auth, database, payments) through platform-level integrations rather than custom backend code
- **Analytics:** Custom event tracking and page view logging within Supabase tables.
- **Responsive UI:** Built with Tailwind CSS and shadcn/ui for a premium mobile-first experience.

## Technical Contribution & Implementation
- **Full-stack Integration:** Managed the data flow between React (frontend), Supabase (database), and Stripe (payments).
- **TypeScript & Schema:** Utilized generated TypeScript types for deep integration with the Supabase PostgreSQL schema.
- **Environment Management:** Secured sensitive configuration using Vite environment variables.
- **Prompt Engineering & Iteration:** Leveraged AI (Lovable) to architect the initial MVP, followed by manual code refinements in TypeScript to fix bugs and polish the Stripe integration.
