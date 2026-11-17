import sql from './db'

export type Network = { asn: string | null; holder: string | null; prefix: string | null }

const RIPESTAT = 'https://stat.ripe.net/data'

async function ripestat(endpoint: string, resource: string) {
  const res = await fetch(
    `${RIPESTAT}/${endpoint}/data.json?resource=${encodeURIComponent(resource)}&sourceapp=portfolio-admin`,
    { signal: AbortSignal.timeout(6000) },
  )
  if (!res.ok) throw new Error(`RIPEstat ${endpoint}: ${res.status}`)
  return (await res.json()).data
}

/**
 * Who owns the network an address belongs to (its ASN, the company holding
 * it, and the announced block), from the public RIPEstat registry. Looked up
 * once per address and kept in ip_networks. Returns null when the address is
 * private or the lookup fails (not stored, so it's retried next time).
 */
export async function lookupNetwork(ip: string): Promise<Network | null> {
  if (!/^[0-9a-f.:]+$/i.test(ip) || ip === '::1' || ip.startsWith('127.')) return null

  const [cached] =
    (await sql`SELECT asn, holder, prefix FROM ip_networks WHERE ip = ${ip}`) as Network[]
  if (cached) return cached

  try {
    const info = await ripestat('network-info', ip)
    const asn: string | null = info.asns?.[0] ?? null
    const holder: string | null = asn
      ? ((await ripestat('as-overview', `AS${asn}`)).holder ?? null)
      : null
    const network = { asn, holder, prefix: info.prefix ?? null }
    await sql`
      INSERT INTO ip_networks (ip, asn, holder, prefix)
      VALUES (${ip}, ${network.asn}, ${network.holder}, ${network.prefix})
      ON CONFLICT (ip) DO NOTHING
    `
    return network
  } catch (err) {
    console.error('Network lookup failed:', (err as Error).message)
    return null
  }
}
