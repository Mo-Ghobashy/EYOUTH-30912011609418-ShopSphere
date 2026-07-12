import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface WelcomeEmailInput {
  to: string;
  name: string;
}

export async function sendWelcomeEmail({ to, name }: WelcomeEmailInput): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('SMTP not configured — skipping welcome email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM ?? 'noreply@store.local',
    to,
    subject: 'Welcome to Store!',
    text: `Hi ${name},\n\nWelcome to Store! Your account has been created successfully.\n\nHappy shopping!`,
    html: `<p>Hi ${name},</p><p>Welcome to <strong>Store</strong>! Your account has been created successfully.</p><p>Happy shopping!</p>`,
  });
}
