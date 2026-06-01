import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' })
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env

  const diagnostics = {
    host: SMTP_HOST ? '✓ set' : '✗ missing',
    port: SMTP_PORT || '587',
    user: SMTP_USER ? '✓ set' : '✗ missing',
    pass: SMTP_PASS ? `✓ set (${SMTP_PASS.length} chars)` : '✗ missing',
    contactEmail: CONTACT_EMAIL ? '✓ set' : '✗ missing',
    steps: [] as string[],
  }

  const port = parseInt(SMTP_PORT || '587')

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: SMTP_USER || '', pass: SMTP_PASS || '' },
    requireTLS: port === 587,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  })

  // Step 1: Try to verify connection
  try {
    await new Promise((resolve, reject) => {
      transporter.verify((err) => {
        if (err) reject(err)
        else resolve(true)
      })
    })
    diagnostics.steps.push('✓ SMTP connection verified')
  } catch (err: any) {
    diagnostics.steps.push(`✗ SMTP verify failed: ${err.message}`)
  }

  // Step 2: Try to send a test email
  try {
    const info = await transporter.sendMail({
      from: `"Test" <${SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: '[Portfolio] SMTP Test',
      text: 'If you receive this, the email config works!',
    })
    diagnostics.steps.push(`✓ Test email sent (id: ${info.messageId})`)
  } catch (err: any) {
    diagnostics.steps.push(`✗ Send failed: ${err.message}`)
    if (err.code) diagnostics.steps.push(`  Code: ${err.code}`)
    if (err.command) diagnostics.steps.push(`  Command: ${err.command}`)
  }

  res.status(200).json(diagnostics)
}
