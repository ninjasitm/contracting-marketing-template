import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';

export class SMTPAdapter implements EmailAdapter {
  name = 'SMTP';
  private host: string;
  private port: number;
  private secure: boolean;
  private user: string;
  private password: string;

  constructor(config: EmailAdapterConfig) {
    this.host = config.host || 'smtp.gmail.com';
    this.port = config.port || 587;
    this.secure = config.secure || false;
    this.user = config.user || '';
    this.password = config.password || '';

    if (!this.user || !this.password) {
      throw new Error('SMTP user and password are required');
    }
  }

  async send(message: EmailMessage): Promise<void> {
    console.log('[SMTPAdapter]: Sending email via SMTP...');

    // For Cloudflare Workers/Pages, we need to use a fetch-based SMTP implementation
    // or proxy through an API. Direct SMTP connections aren't available in Workers.

    // Option 1: Use a service like https://ethereal.email for development
    // Option 2: Use nodemailer in Node.js environments
    // Option 3: Proxy through a serverless function

    // Since this is Cloudflare Pages, we'll use nodemailer with node compatibility
    // This will work in development but may need adjustments for production

    try {
      // Dynamic import to avoid issues if nodemailer isn't available
      const nodemailer = await import('nodemailer').catch(() => null);

      if (!nodemailer) {
        throw new Error(
          'SMTP support requires nodemailer. Install it with: pnpm add nodemailer'
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

      console.log('[SMTPAdapter]: Email sent successfully');
    } catch (error: any) {
      // If we're in a Cloudflare environment, provide helpful error
      if (error.message?.includes('nodemailer')) {
        throw new Error(
          'SMTP is not available in Cloudflare Workers/Pages. ' +
          'Please use an API-based provider (mailchannels or mailgun) instead, ' +
          'or configure EMAIL_API_KEY to enable API-based sending.'
        );
      }
      throw error;
    }
  }
}
