import nodemailer from 'nodemailer'

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

/** True when SMTP and CONTACT_EMAIL are configured. */
export const mailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.CONTACT_EMAIL,
  )

/**
 * Emails the site owner (CONTACT_EMAIL). Returns false, without throwing,
 * when email isn't configured.
 */
export async function sendToOwner(mail: {
  fromName: string
  subject: string
  text: string
  html: string
  replyTo?: string
}) {
  const transporter = createTransporter()
  if (!transporter || !process.env.CONTACT_EMAIL) {
    console.error('Email not configured: set SMTP_HOST, SMTP_USER, SMTP_PASS and CONTACT_EMAIL')
    return false
  }
  await transporter.sendMail({
    from: `"${mail.fromName}" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  })
  return true
}
