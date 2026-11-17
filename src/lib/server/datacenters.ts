import ranges from './datacenter-ranges.json'

/**
 * Cloud, crawler and link-checker networks (AWS, Google, Azure, Oracle,
 * DigitalOcean, Leaseweb, Meta) and known scanner blocks. Page views from them are automated: e-mail link
 * scanners such as Outlook Safe Links, search crawlers, uptime monitors.
 * Refresh the list with `node scripts/update-datacenter-ranges.mjs`.
 */
const ipv4 = ranges.ipv4 as [number, number][]
const ipv6 = ranges.ipv6.map(([a, b]) => [BigInt(`0x${a}`), BigInt(`0x${b}`)] as const)

function parseV4(ip: string) {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    const o = Number(p)
    if (!/^\d{1,3}$/.test(p) || o > 255) return null
    n = n * 256 + o
  }
  return n
}

function parseV6(ip: string) {
  if (!/^[0-9a-f:]+$/i.test(ip) || ip.split('::').length > 2) return null
  const [head, tail = ''] = ip.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const fill = 8 - h.length - t.length
  if (fill < 0 || (fill > 0 && !ip.includes('::'))) return null
  const groups = [...h, ...Array(fill).fill('0'), ...t]
  let n = BigInt(0)
  for (const g of groups) {
    if (g.length > 4) return null
    n = (n << BigInt(16)) + BigInt(parseInt(g || '0', 16))
  }
  return n
}

function inRanges<T extends number | bigint>(sorted: readonly (readonly [T, T])[], n: T) {
  let lo = 0
  let hi = sorted.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [start, end] = sorted[mid]
    if (n < start) hi = mid - 1
    else if (n > end) lo = mid + 1
    else return true
  }
  return false
}

/** True for addresses that never belong to a real visitor's connection. */
export function isDatacenterIp(ip: string | null | undefined) {
  if (!ip) return false
  const addr = ip
    .trim()
    .toLowerCase()
    .replace(/^::ffff:(?=\d+\.)/, '')
  // The development machine
  if (addr === '::1' || addr.startsWith('127.')) return true

  const n4 = parseV4(addr)
  if (n4 !== null) return inRanges(ipv4, n4)
  const n6 = parseV6(addr)
  return n6 !== null && inRanges(ipv6, n6)
}
