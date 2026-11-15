# Ahmad Ayman — Portfolio

Personal portfolio of **Ahmad Ayman Elsaeid**, Frontend & Mobile Engineer (React, React Native, Next.js, TypeScript).

**Live:** [ahmad-ayman.vercel.app](https://ahmad-ayman.vercel.app)

## Features

- **Bento-style home page:** hero with availability and CV download, skills with brand logos, projects with tag filters, experience timeline and contact form
- **Project and experience pages** written in Markdown, with table of contents, view counter, share buttons and screenshot lightbox
- **Guestbook** with moderation and spam filtering
- **Admin dashboard** (`/admin`):
  - **Analytics:** real visitors only (bots, crawlers and admin visits excluded), change vs the previous period, traffic sources, countries, devices and CSV export
  - **Messages inbox:** read/unread, reply by email, bulk actions
  - **Guestbook moderation:** pending, likely spam and approved views
- **Integrations:** live GitHub activity and Spotify "recently played"
- **Light/dark theme,** smooth scrolling, `prefers-reduced-motion` support, RSS feed, sitemap and robots.txt

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | CSS Modules, framer-motion, tsParticles, Lenis |
| Data | Neon Postgres (serverless HTTP driver) |
| Content | Markdown with gray-matter and remark/rehype |
| Security | Cloudflare Turnstile, HMAC admin tokens, rate limiting |
| Testing | Vitest, Testing Library, PGlite (in-memory Postgres for API tests) |
| Hosting | Vercel, with GitHub Actions CI |

## Getting started

Requires **Node.js 24**.

```bash
npm install
cp .env.example .env   # or create .env yourself (see below)
npm run dev            # http://localhost:3000
```

> **Note:** if `.env` points at the production database, the admin dashboard in dev shows real data, and approving or deleting changes it for real. Page views are never tracked in development.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | Yes | Neon Postgres connection string. Tables are created automatically on first use. |
| `ADMIN_SECRET` | Yes | Admin dashboard password; also signs admin session tokens |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | For email | SMTP server for contact-form notifications |
| `CONTACT_EMAIL` | For email | Address that receives contact-form messages |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Recommended | Cloudflare Turnstile bot protection for the contact form and guestbook. The forms work without it. |
| `GITHUB_TOKEN` | Optional | Raises the GitHub API rate limit for the activity widget |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Optional | "Recently played" widget |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint and Prettier check |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit and API tests (Vitest) |

CI runs lint, typecheck, tests and build on every push to `main`.

## Project structure

```
content/
  experience/        # one .md file per job
  posts/             # one .mdx file per project
public/              # CV PDF, images, logos, service worker
src/
  app/               # routes: pages, API route handlers, sitemap, RSS
    admin/           # dashboard and login
    api/             # contact, guestbook, track, views, github, spotify, admin/*
  components/
    admin/           # dashboard panels
    detail/          # project/experience page parts
    home/            # home page sections
    layout/          # footer, page layout, background, smooth scroll
    ui/              # shared primitives
  lib/
    content/         # Markdown loading, tags, skills, FAQ
    server/          # database, auth, rate limiting, analytics helpers
    site.ts          # site URL, name, description, CV path
  styles/            # global styles
tests/               # Vitest tests
```

## Editing content

**Add a project:** create `content/posts/<id>.mdx`. Every project is a short case study with the same fields and three sections:

```markdown
---
title: 'Project Name'
date: '2026-01-31'
summary: 'One line: what it is and who it is for.'   # home page list and meta description
company: 'Employer or client'
role: 'Front-end developer'
platform: 'Web'                     # or 'iOS & Android'
status: 'In QA'                     # optional
stack: ['Next.js', 'TypeScript']
metrics:                            # optional
  - { value: '10K+', label: 'Active users' }
link: 'https://example.com'         # optional live site
screenshots:                        # optional; first one is the home page thumbnail
  - '/images/projects/<id>-desktop.webp'
---

## The problem
## What I did
• Bullet
## The result
```

Then add its tags in `src/lib/content/tags.ts` (`postTags`). Put screenshots in `public/images/projects/` as WebP (about 1440×900 for desktop, 780 wide for mobile). The body is plain Markdown; raw HTML is stripped.

**Add a job:** create `content/experience/<id>.md` with `title`, `date` and `till` (`'now'` for a current role), and add tags in `experienceTags`.

**Other content:**
- **Skills:** `src/lib/content/skills.ts`; logos in `src/components/home/SkillIcon.tsx`
- **FAQ:** `src/lib/content/faq.ts`
- **Hero text:** `src/components/home/BentoHome.tsx`
- **CV:** replace `public/Ahmad_Ayman_CV.pdf`

## Deployment

Pushes to `main` deploy automatically to Vercel. The Node version is pinned to 24.x in `package.json` (`engines`). Set the environment variables above in the Vercel project settings.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned improvements.
