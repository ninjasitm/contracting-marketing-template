import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';
import { loadNodemailer } from '../load-nodemailer';

export class GmailAdapter implements EmailAdapter {
  name = 'Gmail';
  private host: string;
  private port: number;
  private secure: boolean;
  private user: string;
  private password: string;

  constructor(config: EmailAdapterConfig) {
    // Gmail-specific defaults
    this.host = config.host || 'smtp.gmail.com';
    this.port = config.port || 587;
    this.secure = config.secure || false; // Use STARTTLS
    this.user = config.user || '';
    this.password = config.password || '';

    if (!this.user || !this.password) {
      throw new Error('Gmail requires SMTP_USER and SMTP_PASSWORD (use App Password for Gmail)');
    }
  }

  async send(message: EmailMessage): Promise<void> {
    console.log('[GmailAdapter]: Sending email via Gmail SMTP...');

    try {
      const nodemailer = await loadNodemailer();

      if (!nodemailer) {
        throw new Error(
          'Gmail adapter requires nodemailer. Install it with: pnpm add nodemailer'
        );
      }

      const transporter = nodemailer.default.createTransport({
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.password,
        },
      });

      await transporter.sendMail({
        from: `${message.from.name} <${message.from.email}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        replyTo: message.replyTo,
      });

      console.log('[GmailAdapter]: Email sent successfully via Gmail');
    } catch (error: any) {
      // Provide helpful error messages for common Gmail issues
      if (error.message?.includes('nodemailer')) {
        throw new Error(
          'Gmail SMTP is not available in Cloudflare Workers/Pages. ' +
          'Use an API-based provider (mailchannels or mailgun) for production deployments.'
        );
      }

      if (error.message?.includes('Invalid login')) {
        throw new Error(
          'Gmail authentication failed. Make sure you are using an App Password, not your regular Gmail password. ' +
          'Generate one at: https://myaccount.google.com/apppasswords'
        );
      }

      throw error;
    }
  }
}
