import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'email and name are required' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP not configured — skipping welcome email');
    return res.status(200).json({ message: 'Email skipped — SMTP not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Welcome to ShopSphere!',
      text: `Hi ${name},\n\nWelcome to ShopSphere! Your account has been created successfully.\n\nHappy shopping!`,
      html: `<p>Hi ${name},</p><p>Welcome to <strong>ShopSphere</strong>! Your account has been created successfully.</p><p>Happy shopping!</p>`,
    });

    return res.status(200).json({ message: 'Welcome email sent' });
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
