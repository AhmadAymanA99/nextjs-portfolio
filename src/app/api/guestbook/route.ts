import { ensureDB } from '@/lib/server/db'
import { escapeHtml, sendToOwner } from '@/lib/server/mail'
import rateLimit from '@/lib/server/rateLimit'
import { verifyTurnstileToken } from '@/lib/server/turnstile'
import { siteUrl } from '@/lib/site'

const limiter = rateLimit({ windowMs: 60000, max: 10 })

const SPAM_WORDS =
  /\b(casino|crypto|bitcoin|forex|viagra|cialis|loan|seo services|backlinks?|porn|escort|betting)\b/i

/** Heuristic flag shown in the admin; flagged entries still need manual review. */
function looksLikeSpam(name: string, message: string, website: string) {
  const links = (message.match(/https?:\/\/|www\./gi) || []).length
  return links >= 2 || SPAM_WORDS.test(`${name} ${message} ${website}`) || /https?:\/\//i.test(name)
}

const ADMIN_URL = `${siteUrl}/admin/analytics#guestbook`

/** Tells the owner a new entry is waiting for approval. */
function notifyOwner(name: string, message: string, website: string) {
  return sendToOwner({
    fromName: 'Portfolio Guestbook',
    subject: `[Portfolio] New guestbook entry from ${name}`,
    text: `${name}${website ? ` (${website})` : ''} wrote:\n\n${message}\n\nApprove or delete it: ${ADMIN_URL}`,
    html: `<p><strong>${escapeHtml(name)}</strong>${website ? ` (${escapeHtml(website)})` : ''} wrote:</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><p><a href="${ADMIN_URL}">Approve or delete it</a></p>`,
  })
}

export async function GET() {
  try {
    const sql = await ensureDB()
    const entries = await sql`
      SELECT id, name, message, website, created_at
      FROM guestbook_entries
      WHERE approved = true
      ORDER BY created_at DESC
      LIMIT 100
    `
    return Response.json({ entries })
  } catch (err) {
    console.error('Guestbook GET error:', err)
    return Response.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const limited = await limiter(req)
  if (limited) return limited

  const { name, message, website, company, turnstileToken } = await req.json().catch(() => ({}))

  // Honeypot: the hidden "company" field is only filled in by bots. Pretend success.
  if (company) return Response.json({ success: true })

  if (typeof name !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Name and message are required' }, { status: 400 })
  }

  if (turnstileToken) {
    const valid = await verifyTurnstileToken(turnstileToken)
    if (!valid) {
      return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
    }
  }

  const trimmedName = name.trim().slice(0, 100)
  const trimmedMessage = message.trim().slice(0, 2000)
  const trimmedWebsite = (typeof website === 'string' ? website : '').trim().slice(0, 500)

  if (!trimmedName || !trimmedMessage) {
    return Response.json({ error: 'Name and message are required' }, { status: 400 })
  }

  try {
    const sql = await ensureDB()
    const flagged = looksLikeSpam(trimmedName, trimmedMessage, trimmedWebsite)
    await sql`
      INSERT INTO guestbook_entries (name, message, website, approved, flagged, created_at)
      VALUES (${trimmedName}, ${trimmedMessage}, ${trimmedWebsite}, false, ${flagged}, NOW())
    `
    // Likely spam waits quietly in the admin; real entries send an email
    if (!flagged) {
      await notifyOwner(trimmedName, trimmedMessage, trimmedWebsite).catch((err) => {
        console.error('Guestbook email failed:', err?.message || err)
      })
    }
    return Response.json({ success: true })
  } catch (err) {
    console.error('Guestbook POST error:', err)
    return Response.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}
