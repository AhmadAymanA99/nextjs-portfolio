import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import {
  alternates,
  getDictionary,
  localePath,
  plural,
  publicPath,
  splitLocale,
  switchLocalePath,
} from '@/i18n'
import { proxy } from '@/proxy'

describe('locale paths', () => {
  it('keeps English unprefixed and puts Arabic under /ar', () => {
    expect(localePath('en', '/')).toBe('/')
    expect(localePath('en', '/posts/rehlte')).toBe('/posts/rehlte')
    expect(localePath('ar', '/')).toBe('/ar')
    expect(localePath('ar', '/posts/rehlte')).toBe('/ar/posts/rehlte')
  })

  it('splits a URL path into language and page', () => {
    expect(splitLocale('/ar')).toEqual({ lang: 'ar', path: '/' })
    expect(splitLocale('/ar/faq')).toEqual({ lang: 'ar', path: '/faq' })
    expect(splitLocale('/faq')).toEqual({ lang: 'en', path: '/faq' })
    // Not a language prefix
    expect(splitLocale('/archive')).toEqual({ lang: 'en', path: '/archive' })
  })

  it('switches to the same page in the other language', () => {
    expect(switchLocalePath('/')).toBe('/ar')
    expect(switchLocalePath('/posts/kptc')).toBe('/ar/posts/kptc')
    expect(switchLocalePath('/ar/posts/kptc')).toBe('/posts/kptc')
    expect(switchLocalePath('/ar')).toBe('/')
    // Pre-rendered English pages report their internal /en path
    expect(switchLocalePath('/en')).toBe('/ar')
    expect(switchLocalePath('/en/posts/kptc')).toBe('/ar/posts/kptc')
  })

  it('maps internal paths to public ones', () => {
    expect(publicPath('/en')).toBe('/')
    expect(publicPath('/en/faq')).toBe('/faq')
    expect(publicPath('/ar/faq')).toBe('/ar/faq')
    expect(publicPath('/faq')).toBe('/faq')
  })

  it('links both language versions for search engines', () => {
    expect(alternates('ar', '/faq')).toEqual({
      canonical: '/ar/faq',
      languages: { en: '/faq', ar: '/ar/faq', 'x-default': '/faq' },
    })
  })
})

describe('plural', () => {
  it('uses Arabic plural forms', () => {
    const views = getDictionary('ar').common.views
    expect(plural('ar', views, 1)).toBe('مشاهدة واحدة')
    expect(plural('ar', views, 2)).toBe('مشاهدتان')
    expect(plural('ar', views, 5)).toBe('5 مشاهدات')
    expect(plural('ar', views, 20)).toBe('20 مشاهدة')
  })

  it('uses English plural forms', () => {
    const views = getDictionary('en').common.views
    expect(plural('en', views, 1)).toBe('1 view')
    expect(plural('en', views, 3)).toBe('3 views')
  })
})

describe('dictionaries', () => {
  it('translate every FAQ item', () => {
    expect(getDictionary('ar').faq.items).toHaveLength(getDictionary('en').faq.items.length)
  })
})

describe('proxy', () => {
  const run = (path: string) => proxy(new NextRequest(new URL(path, 'https://example.com')))

  it('serves English pages from the internal /en routes', () => {
    expect(run('/').headers.get('x-middleware-rewrite')).toBe('https://example.com/en')
    expect(run('/posts/rehlte?x=1').headers.get('x-middleware-rewrite')).toBe(
      'https://example.com/en/posts/rehlte?x=1',
    )
  })

  it('passes Arabic pages through', () => {
    const res = run('/ar/faq')
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects /en URLs to the unprefixed address', () => {
    const res = run('/en/faq')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://example.com/faq')
    expect(run('/en').headers.get('location')).toBe('https://example.com/')
  })
})
