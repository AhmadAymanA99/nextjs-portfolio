import nodemailer from 'nodemailer'
import { ensureDB } from '@/lib/server/db'
import rateLimit from '@/lib/server/rateLimit'
import { verifyTurnstileToken } from '@/lib/server/turnstile'

const limiter = rateLimit({ windowMs: 60000, max: 5 })

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  const port = parseInt(SMTP_PORT || '465')

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendEmailNotification({ name, email, subject, message }) {
  const { CONTACT_EMAIL, SMTP_USER } = process.env
  if (!CONTACT_EMAIL || !SMTP_USER) {
    console.error('Missing CONTACT_EMAIL or SMTP_USER')
    return
  }

  const transporter = createTransporter()
  if (!transporter) {
    console.error('Failed to create transporter')
    return
  }

  await transporter.sendMail({
    from: `"Portfolio Contact" <${SMTP_USER}>`,
    replyTo: email,
    to: CONTACT_EMAIL,
    subject: `[Portfolio] ${subject || 'New Message'} from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject || 'N/A')}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  })
}

export async function POST(req: Request) {
  const limited = limiter(req)
  if (limited) return limited

  const { name, email, subject, message, turnstileToken } = await req.json().catch(() => ({}))

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (turnstileToken) {
    const valid = await verifyTurnstileToken(turnstileToken)
    if (!valid) {
      return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
    }
  }

  try {
    const sql = await ensureDB()

    await sql`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES (${name}, ${email}, ${subject || ''}, ${message}, NOW())
    `

    await sendEmailNotification({ name, email, subject, message }).catch((err) => {
      console.error('Email send failed:', err?.message || err)
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
