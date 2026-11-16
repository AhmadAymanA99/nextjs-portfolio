#!/usr/bin/env node
/**
 * Downloads the published IP ranges of the big cloud and crawler networks and
 * writes them, merged and compacted, to src/lib/server/datacenter-ranges.json.
 * Page views from these addresses are scanners, crawlers and link checkers,
 * not people (see src/lib/server/datacenters.ts).
 *
 * Run now and then: node scripts/update-datacenter-ranges.mjs
 */
import { writeFileSync } from 'node:fs'

const get = async (url) => {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res
}
const json = async (url) => (await get(url)).json()

const sources = {
  // Official lists
  'Amazon AWS': async () => {
    const d = await json('https://ip-ranges.amazonaws.com/ip-ranges.json')
    return [...d.prefixes.map((p) => p.ip_prefix), ...d.ipv6_prefixes.map((p) => p.ipv6_prefix)]
  },
  Google: async () => {
    const lists = await Promise.all([
      json('https://www.gstatic.com/ipranges/goog.json'), // Google's own networks (crawlers, services)
      json('https://www.gstatic.com/ipranges/cloud.json'), // Google Cloud customers
      json('https://developers.google.com/static/search/apis/ipranges/googlebot.json'),
      json('https://developers.google.com/static/search/apis/ipranges/special-crawlers.json'),
      json(
        'https://developers.google.com/static/search/apis/ipranges/user-triggered-fetchers.json',
      ),
    ])
    return lists.flatMap((d) => d.prefixes.map((p) => p.ipv4Prefix || p.ipv6Prefix))
  },
  Oracle: async () => {
    const d = await json('https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json')
    return d.regions.flatMap((r) => r.cidrs.map((c) => c.cidr))
  },
  DigitalOcean: async () =>
    (await (await get('https://digitalocean.com/geo/google.csv')).text())
      .split('\n')
      .map((l) => l.split(',')[0])
      .filter(Boolean),
  // Microsoft publishes Azure ranges behind a download page with a changing
  // URL; this repository mirrors the official file daily.
  'Microsoft Azure': async () => {
    const d = await json(
      'https://raw.githubusercontent.com/femueller/cloud-ip-ranges/master/microsoft-azure-ip-ranges.json',
    )
    return d.values.flatMap((v) => v.properties.addressPrefixes)
  },
  // Meta (AS32934) publishes no list; these are its main announced ranges
  Meta: async () => [
    '31.13.24.0/21',
    '31.13.64.0/18',
    '45.64.40.0/22',
    '57.141.0.0/16',
    '66.220.144.0/20',
    '69.63.176.0/20',
    '69.171.224.0/19',
    '74.119.76.0/22',
    '102.132.96.0/20',
    '103.4.96.0/22',
    '129.134.0.0/16',
    '147.75.208.0/20',
    '157.240.0.0/16',
    '173.252.64.0/18',
    '179.60.192.0/22',
    '185.60.216.0/22',
    '185.89.216.0/22',
    '204.15.20.0/22',
    '2a03:2880::/32',
  ],
}

// --- CIDR to merged [start, end] ranges ---
function v4(cidr) {
  const [ip, bits] = cidr.split('/')
  const n = ip.split('.').reduce((a, o) => a * 256 + Number(o), 0)
  const size = 2 ** (32 - Number(bits))
  const start = n - (n % size)
  return [start, start + size - 1]
}
function v6(cidr) {
  const [ip, bits] = cidr.split('/')
  const [head, tail = ''] = ip.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const groups = [...h, ...Array(8 - h.length - t.length).fill('0'), ...t]
  const n = groups.reduce((a, g) => (a << 16n) + BigInt(parseInt(g || '0', 16)), 0n)
  const host = 128n - BigInt(bits)
  const start = (n >> host) << host
  return [start, start + (1n << host) - 1n]
}
function merge(ranges) {
  ranges.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  const out = []
  for (const r of ranges) {
    const last = out[out.length - 1]
    if (last && r[0] <= last[1] + (typeof r[0] === 'bigint' ? 1n : 1)) {
      if (r[1] > last[1]) last[1] = r[1]
    } else out.push([...r])
  }
  return out
}

const ipv4 = []
const ipv6 = []
const counts = {}
for (const [name, load] of Object.entries(sources)) {
  try {
    const cidrs = (await load()).filter(Boolean)
    counts[name] = cidrs.length
    for (const c of cidrs) (c.includes(':') ? ipv6 : ipv4).push(c.includes(':') ? v6(c) : v4(c))
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`)
    process.exitCode = 1
  }
}
if (process.exitCode) {
  console.error('Not writing a partial list.')
  process.exit()
}

const hex = (n) => n.toString(16)
const v4m = merge(ipv4)
const v6m = merge(ipv6)
writeFileSync(
  new URL('../src/lib/server/datacenter-ranges.json', import.meta.url),
  JSON.stringify({
    updated: new Date().toISOString().slice(0, 10),
    sources: Object.keys(sources),
    // [start, end] as numbers (IPv4) and hex strings (IPv6), sorted and merged
    ipv4: v4m,
    ipv6: v6m.map(([a, b]) => [hex(a), hex(b)]),
  }) + '\n',
)
console.log(counts)
console.log(`Wrote ${v4m.length} IPv4 and ${v6m.length} IPv6 ranges`)
