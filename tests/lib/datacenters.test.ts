// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isDatacenterIp } from '@/lib/server/datacenters'
import { isAutomated } from '@/lib/server/analytics'

describe('isDatacenterIp', () => {
  it('matches cloud and crawler networks', () => {
    expect(isDatacenterIp('66.249.66.1')).toBe(true) // Googlebot
    expect(isDatacenterIp('20.40.1.1')).toBe(true) // Microsoft Azure
    expect(isDatacenterIp('3.80.0.1')).toBe(true) // AWS
    expect(isDatacenterIp('35.190.0.1')).toBe(true) // Google Cloud
    expect(isDatacenterIp('173.252.70.1')).toBe(true) // Meta
    expect(isDatacenterIp('2a03:2880:f000::1')).toBe(true) // Meta IPv6
    expect(isDatacenterIp('2001:4860:4801:10::1')).toBe(true) // Googlebot IPv6
    expect(isDatacenterIp('::ffff:66.249.66.1')).toBe(true) // IPv4-mapped
  })

  it('matches the development machine', () => {
    expect(isDatacenterIp('::1')).toBe(true)
    expect(isDatacenterIp('127.0.0.1')).toBe(true)
  })

  it('leaves ordinary and invalid addresses alone', () => {
    expect(isDatacenterIp('192.0.2.1')).toBe(false) // documentation range
    expect(isDatacenterIp('41.33.0.1')).toBe(false) // Egyptian ISP (TE Data)
    expect(isDatacenterIp('2001:db8::1')).toBe(false)
    expect(isDatacenterIp('unknown')).toBe(false)
    expect(isDatacenterIp('999.1.1.1')).toBe(false)
    expect(isDatacenterIp('')).toBe(false)
    expect(isDatacenterIp(null)).toBe(false)
  })
})

describe('isAutomated', () => {
  const chrome =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'

  it('catches Google fetchers without "bot" in their name', () => {
    expect(isAutomated(`${chrome} (compatible; GoogleOther)`)).toBe(true)
    expect(isAutomated(`${chrome} (compatible; Google-Read-Aloud)`)).toBe(true)
  })

  it('catches real-looking browsers on cloud networks', () => {
    expect(isAutomated(chrome, '20.40.1.1')).toBe(true)
    expect(isAutomated(chrome, '192.0.2.1')).toBe(false)
  })
})
