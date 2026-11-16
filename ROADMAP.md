# Portfolio Roadmap

Goal: make the first 30 seconds count for recruiters and clients. Traffic is mostly desktop (87%), led by the US, and arrives from job posts and LinkedIn.

Phases are ordered by impact. Tick items off as they ship.

## Phase 1 — Quick wins ✅ (shipped 2026-11-04)

- [x] Ship the restructure, package upgrades and admin rework to production
- [x] Remove old projects: Awn App, Covid-19 Dashboard, Would You Rather, Portfolio Website (old URLs redirect to `/`)
- [x] Hero: availability line ("Open to remote roles & freelance · Cairo, Egypt", GMT+2/+3 with summer time) and a **Contact me** button
- [x] Hide the GitHub "Recent activity" block when it is empty
- [x] Skills: official brand logos, names on one line
- [x] Connect card: GitHub and LinkedIn usernames
- [x] Pin Node.js 24.x for Vercel (20.x was discontinued)

Decisions:
- Sakenah Academy metrics (10K+ users, 50+ courses, 99.9% uptime) are kept as accurate.

## Phase 2 — Make projects sell ✅ (2026-11-15)

Every project is now a case study with the same structure.

- [x] Same structure for all projects: summary, role, company, platform, stack, metrics, live link, then **The problem** → **What I did** → **The result**
- [x] Merge Procoor PM and FM into one case study (`/posts/procoor`; old URLs redirect)
- [x] Fresh desktop + mobile screenshots of the live sites, as WebP (replaces 62 MB of full-page PNGs)
- [x] Thumbnails and one-line summaries in the home page project list
- [x] Rewrite generic intros (TryGrip is a QR digital menu; KPTC is Kuwait Public Transport Company)
- [x] Fix: metric cards, callouts and tech badges were silently stripped by the Markdown pipeline; they are now frontmatter rendered by React
- [x] Review drafts and fill gaps (Al Fagala is freelance; KPTC covers both apps)

Open: none. Swap Rehlte's website screenshots for app screens at launch, and add result numbers whenever they become available.

## Phase 3 — Show the differentiator ✅ (2026-11-16)

- [x] Arabic version of the site with an EN/AR switch and full RTL layout, as a live demo of bilingual/RTL skills and to reach Gulf clients
  - English keeps its URLs; Arabic lives under `/ar`. The switch keeps you on the same page
  - All interface text, the FAQ, the 7 case studies and the 5 jobs translated into Modern Standard Arabic
  - Logical CSS (start/end instead of left/right), IBM Plex Sans Arabic, Arabic month names with Western digits, Arabic plural forms
  - SEO: hreflang links on every page and in the sitemap, `ar_AR` Open Graph locale
  - View counts add up both languages; analytics record the public URL
  - Admin stays English-only

Decisions:
- No automatic redirect by browser language: English stays the default for everyone.
- Western digits (1, 2, 3) on Arabic pages, matching the metrics and tech names.

Open: review the Arabic copy (especially Arabic brand names: رحلتي, عيادة عوافي, الفجالة, أكاديمية سكينة, بيسان للسفر, السجلات العسكرية). The RSS feed is English only.

## Phase 4 — Trust and reach

- [ ] 2–3 short testimonials from managers or clients (Softera, Bisan Travel, Vidills)
- [ ] 2–3 technical posts (e.g. "HyperPay 3-D Secure in Expo", "RTL pitfalls in React Native"); the RSS feed is ready
- [x] A social preview image for each project, so shared links show a picture (first screenshot; KPTC has none)

## Phase 5 — Under the hood

- [x] Lighthouse pass (2026-11-16). Mobile performance, median of runs: home 78 → 89, Arabic home 77 → 85–89, case study 87 → 90–93; desktop 95–100 → 100. Blocking time on mobile home 784 → ~320 ms, JavaScript 451 → 319 KB
  - framer-motion replaced by CSS-only animations (load "rise" that never starts invisible, scroll-driven reveals); the hero is now the LCP instead of the language switch
  - Home page rendered on the server with small client islands; tilt writes CSS variables instead of re-rendering React
  - Particles and smooth scrolling load after idle; particles use 4 plugins instead of "slim", no collisions, normal resolution on phones; no smooth scrolling on touch screens
  - What's left on mobile is mostly React's own runtime; the remaining simulated LCP (~2.4–2.9 s) is Lighthouse's slow-4G model, real first paint is ~0.35 s
- [ ] Admin session: move the token from `localStorage` to a secure, script-inaccessible cookie
- [ ] Rate limiting: back it with the database or Upstash (in-memory counts reset constantly on Vercel)
- [ ] Email notification for new guestbook entries; weekly traffic summary
- [ ] End-to-end tests (contact form, admin login) in CI

## Notes

- Commit and push as **AhmadAymanA99**. The repo's `.git/config` pins the identity and credentials.
- Pushes to `main` auto-deploy to Vercel.
- `npm run dev` connects to the production database: admin actions there change real data.
