---
title: 'Adding Arabic to a Next.js site: RTL, URLs, plurals and SEO'
date: '2026-11-17'
summary: 'What it took to ship a full right-to-left Arabic version of this portfolio with the Next.js App Router, without a translation library.'
draft: true
---

This site has an Arabic version: every page, a full right-to-left layout, Arabic dates and plurals, and a switch that keeps you on the same page. I built it without an i18n library. The App Router plus a few small helpers covered everything, and the code stays easy to follow. Here is what mattered.

## URLs: one address per page per language

I wanted English to keep its existing URLs, so links already shared on LinkedIn keep working, and Arabic to live under `/ar`:

- `/posts/rehlte` is English
- `/ar/posts/rehlte` is Arabic

Inside the app, every public page lives under a `[lang]` segment (`app/[lang]/…`). The proxy (what used to be called middleware) maps the public URLs onto it:

```ts
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/ar' || pathname.startsWith('/ar/')) return NextResponse.next()

  const url = request.nextUrl.clone()
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`
  return NextResponse.rewrite(url)
}
```

Unprefixed URLs are rewritten to the internal `/en` route, Arabic passes through, and anyone who types `/en/…` is redirected to the unprefixed address. Every page ends up with exactly one public URL per language, which matters for SEO.

There is no automatic redirect based on the browser language. English stays the default for everyone, and the switch is one click away.

## Direction starts at the root element

The root layout sets both `lang` and `dir` from the route:

```tsx
<html lang={lang} dir={dirOf(lang)}>
```

`dir="rtl"` on the root flips text alignment, flex rows and grid order for free. Most of the layout needed no changes because of that one attribute.

## Logical CSS instead of left and right

What doesn't flip by itself is anything written with physical directions: `margin-left`, `padding-right`, `left: 1rem`, `border-left`. I replaced those with logical properties:

```css
.toc {
  border-inline-start: 2px solid transparent;
  padding-inline-start: 0.5rem;
}

.backToTop {
  inset-inline-end: 2rem;
}
```

`inline-start` is the left side in English and the right side in Arabic. After the switch, the table of contents border, the language switch and the back-to-top button all land on the correct side in both languages with one rule each.

## Things that must not flip

Some things should stay left-to-right inside an Arabic page:

- **Handles, phone numbers and offsets** like `@ahmadaymana99` or `GMT+2`. Mixed with Arabic text, the bidi algorithm can move the `@` or the `+` to the wrong end. Wrapping them in `dir="ltr"` (or `<bdi>`) fixes it.
- **Physical controls.** On the games page, the arrow buttons for Snake mean screen directions, not reading directions, so the board and its controls are wrapped in `dir="ltr"`.
- **Keyboard navigation that follows reading order.** In a tab list, the right arrow should move to the *previous* tab in Arabic. I check the computed `direction` and swap the step.

Arrows in text are the reverse case: "← Back to home" becomes "→ العودة إلى الصفحة الرئيسية". The arrow is part of the translated string, so each language picks its own.

## Typed dictionaries

All interface text lives in two plain objects, `en.ts` and `ar.ts`. The English file defines the shape, and a small type makes the Arabic file provide every key:

```ts
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> }

export type Dictionary = Widen<typeof en>
```

`ar.ts` is typed as `Dictionary`, so adding a key in English and forgetting the Arabic one fails `tsc`. No missing-translation surprises in production.

## Arabic plurals have six forms

English has "1 view" and "3 views". Arabic has six plural categories: zero, one, two, few, many and other. `Intl.PluralRules` already knows them, so each plural string is an object of forms:

```ts
export function plural(lang: Locale, forms: PluralForms, n: number) {
  const rule = new Intl.PluralRules(lang).select(n)
  return format(forms[rule] ?? forms.other, { n })
}
```

That gives "مشاهدة واحدة" for 1, "مشاهدتان" for 2, "5 مشاهدات" for 5 and "20 مشاهدة" for 20, each one grammatically correct.

## Dates: Arabic months, Western digits

The default Arabic locale formats numbers in Eastern Arabic digits (١٢٣). The rest of the site, including metrics and tech names, uses Western digits, so dates use the `latn` numbering system through a Unicode extension in the locale tag:

```ts
const arabicDate = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
// "1 أكتوبر 2026"
```

## Translated content with a fallback

Case studies and job pages are Markdown files. A translation lives at the same file name under `content/ar/` and only needs the fields that change: title, summary, role and the body. Everything else (dates, stack, links, screenshots) comes from the English file:

```ts
return {
  data: { ...base.data, ...translated.data },
  content: translated.content.trim() ? translated.content : base.content,
}
```

A page without a translation still works in Arabic and shows the English text, so content can be translated gradually.

## Fonts

Arabic text uses IBM Plex Sans Arabic, loaded with `next/font` for the Arabic subset only and not preloaded. Most visitors read the English pages, and the browser only downloads the font when a page contains Arabic glyphs. The font stack lists the Latin font first and the Arabic one second, so mixed lines pick the right font for each script.

## Telling search engines

Each page declares its canonical URL and its other-language version:

```ts
export function alternates(lang: Locale, path: string) {
  return {
    canonical: localePath(lang, path),
    languages: {
      en: localePath('en', path),
      ar: localePath('ar', path),
      'x-default': localePath('en', path),
    },
  }
}
```

The sitemap lists every page in both languages with the same `hreflang` links, and Arabic pages use the `ar_AR` Open Graph locale. Search engines then show the Arabic page to Arabic searchers instead of treating it as a duplicate.

## What I'd tell someone starting out

- Decide the URL scheme first. Everything else (links, sitemap, analytics, view counts) depends on it.
- Put `dir` on `<html>` and switch to logical CSS properties. Most of the RTL work is done after that.
- Look for content that must stay left-to-right: handles, numbers and physical controls.
- Use `Intl` for plurals and dates instead of writing the rules yourself.
- Let TypeScript check that every string is translated.
