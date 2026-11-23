# Portfolio Roadmap

Goal: make the first 30 seconds count for recruiters and clients. Visitors arrive from job posts and LinkedIn.

Traffic note (2026-11-16): the earlier "87% desktop, led by the US" figure was mostly automated traffic. About 200 of ~210 US views came from cloud networks (e-mail link scanners such as Outlook Safe Links, Google fetchers) posing as desktop Chrome, and ~340 "Unknown" views were the dev machine. With those excluded, real visitors are led by Egypt. Re-check the audience once a few weeks of filtered data exist.

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

## Phase 4 — Trust and reach (in progress, 2026-11-17)

- [ ] 2–3 short testimonials from managers or clients (Softera, Bisan Travel, Vidills)
  - Ready to fill: add quotes to `src/lib/content/testimonials.ts` and the home page section appears. Waiting on the quotes themselves (real words, with permission)
- [ ] 2–3 technical posts (e.g. "HyperPay 3-D Secure in Expo", "RTL pitfalls in React Native")
  - Done: a "Writing" section (`content/articles`, pages at `/articles/<id>`, home page list, sitemap, RSS) with drafts visible only in development
  - First draft: "Adding Arabic to a Next.js site: RTL, URLs, plurals and SEO" (`content/articles/bilingual-nextjs-rtl.md`), based on this site's own code. Review it, then remove `draft: true` to publish
  - Still to write: one or two posts from client work (HyperPay, React Native RTL); these need your experience
- [x] A social preview image for each project, so shared links show a picture (first screenshot; KPTC has none)
- [x] Games page (`/games`, both languages, linked from the footer): Stack Match, Snake and Reaction Time, built from scratch for desktop and touch

## Phase 5 — Under the hood ✅ (deployed 2026-11-17)

- [x] Lighthouse pass (2026-11-16). Mobile performance, median of runs: home 78 → 89, Arabic home 77 → 85–89, case study 87 → 90–93; desktop 95–100 → 100. Blocking time on mobile home 784 → ~320 ms, JavaScript 451 → 319 KB
  - framer-motion replaced by CSS-only animations (load "rise" that never starts invisible, scroll-driven reveals); the hero is now the LCP instead of the language switch
  - Home page rendered on the server with small client islands; tilt writes CSS variables instead of re-rendering React
  - Particles and smooth scrolling load after idle; particles use 4 plugins instead of "slim", no collisions, normal resolution on phones; no smooth scrolling on touch screens
  - What's left on mobile is mostly React's own runtime; the remaining simulated LCP (~2.4–2.9 s) is Lighthouse's slow-4G model, real first paint is ~0.35 s
- [x] Analytics count real people only (2026-11-16): a view is sent after the first pointer, touch, key or wheel input; `/api/track` rejects cloud and crawler networks and localhost; the dashboard excludes them from old rows too. Refresh the ranges with `npm run update:datacenters`
- [x] Mobile polish (2026-11-16): two-column skills on phones, pulsing availability dot, background animation visible through translucent cards on phones, Turnstile loaded only when a form is used (clean console), skip link shown only for keyboard users
- [x] Admin session (2026-11-17): an HttpOnly, SameSite=Strict cookie scoped to `/api/admin` replaces the token in `localStorage`; changes from other origins are refused; log out clears it on the server. Existing sessions sign in once more
- [x] Rate limiting (2026-11-17): counts live in a `rate_limits` table (one upsert per request, IPs hashed), shared by every serverless instance; falls back to in-memory if the database is unreachable
- [x] Emails (2026-11-17): one per new guestbook entry (likely spam is skipped), and a weekly summary every Sunday 06:00 UTC via Vercel Cron (`vercel.json`), using `CRON_SECRET` (set in Vercel for Production)
  - Fixed on the way: the guestbook's spam check was never called, so nothing was ever flagged
- [x] Leave out the owner's own visits on every device (2026-11-17): signed-in browsers report the current address (`owner_ips`, by day), which hides views from that connection from the day before to the day after, phone included. Sign in once on each device you use
- [x] Leaseweb added to the cloud networks left out of the analytics (2026-11-17): two "United States" visitors were its servers posing as desktop Chrome. Its ranges come from the networks it announces (RIPEstat)
- [x] Cleaned the page views (2026-11-17): deleted 195 of the owner's own views and 11 bot or owner views (Leaseweb, a Level 3 scanner block now filtered as "Known scanners", one owner session on Linux). Backups of the deleted rows are in the owner's home folder
- [x] Visit details in the admin (2026-11-17): full IP addresses, and a Details view per recent visit with the network owner (RIPEstat, cached in `ip_networks`), city, device model, system, browser, in-app browser, all visits from that address and a plain-language guess
  - Recent visits uses fixed column widths so it never overflows its card (long values end in "…", full text on hover) and lists the latest 10 visits with a "Show all" button
- [x] End-to-end tests in CI (2026-11-17): Playwright, desktop and mobile Chrome, covering the contact form, admin sign-in/out with the cookie, and the games. No real database or emails involved

Decisions:
- Visitors stay anonymous: no fingerprinting, no paid "identify the visitor" services, and no per-recipient tracking links (considered and declined, 2026-11-17). The admin shows network, location and device only.

## Phase 6 — Turn visits into contacts (in progress, 2026-11-23)

Visitors read several case studies and leave (e.g. the Jordan visitor in September: 20 views over 4 days, no message). This phase makes the next step obvious and measures it.

- [x] Search engines: structured data (JSON-LD) on the home page (a profile page about the Person: name in both languages, role, Cairo, GitHub and LinkedIn), each case study and each article, all pointing at the same Person (2026-11-23)
- [x] Google Search Console: the site is verified, and Google has recorded search impressions since 2026-06-30 (confirmed by Google's email, 2026-11-23)
- [ ] After this deploy, in Search Console: submit `https://ahmad-ayman.vercel.app/sitemap.xml` under Sitemaps if it isn't listed yet; check the home page with the Rich Results Test (should show "Profile page" and "Breadcrumbs"); then watch Performance → Queries for which searches bring visitors in
- [x] A "Need something similar? Get in touch" prompt at the end of every case study, with a CV download, in both languages; arriving at `/#contact` from another page now scrolls to the form (2026-11-23)
- [x] Count actions, not just pages, still anonymously (2026-11-23): CV downloads, "Contact me"/"Get in touch" clicks, email/WhatsApp/Telegram links and live-site links, in an `actions` table with the same real-visitor filter as page views. Shown in the admin ("Actions", "Live sites opened") and the weekly summary. Links opt in with `data-track` (see `src/lib/actions.ts`)
- [x] Generated preview images (Open Graph) for the home page and articles, in both languages (`/api/og`), with the site's fonts in `assets/fonts`. The renderer has no right-to-left support, so Arabic is joined and ordered in code (`src/lib/arabicShape.ts`). Case studies keep their screenshot; one without (KPTC) gets the home card (2026-11-23)
- [x] GitHub Dependabot (2026-11-23): weekly npm updates (minor and patch grouped in one pull request), monthly GitHub Actions updates
- [x] Accessibility checks (axe, WCAG 2.1 A/AA) in the end-to-end tests, for the main pages in both themes and languages (2026-11-23). Fixed what they found: unreadable code blocks in light mode, white text on the light-blue buttons in dark mode (now dark text), light-mode blue darkened to #0062d6 for contrast on grey, code blocks reachable by keyboard
- [x] Arabic RSS feed (`/ar/rss.xml`); each language's pages link their own feed (2026-11-23)

Content (needs the owner; see Phase 3 and 4 for details):
- [ ] Review and publish the draft article; write one or two posts from client work (HyperPay, React Native RTL)
- [ ] Testimonials (LinkedIn recommendations are a good source, with permission)
- [ ] Result numbers in case studies where they can be shared; Rehlte app screens at launch
- [ ] Review the Arabic copy, especially brand names

Also shipped (2026-11-23): card shadows no longer cut off, a smoother tilt on the home cards (capped by card size), and a light/dark switch next to the language switch.

Decisions:
- No custom domain for now; the site stays at ahmad-ayman.vercel.app (2026-11-17)

## Notes

- Commit and push as **AhmadAymanA99**. The repo's `.git/config` pins the identity and credentials.
- Pushes to `main` auto-deploy to Vercel.
- `npm run dev` connects to the production database: admin actions there change real data.
- Phase 5 is live: sign in to the admin once on each device you use (the old token in `localStorage` no longer works, and signing in is what keeps your own visits out of the analytics). The first weekly summary email arrives Sunday 08:00 Cairo time.
