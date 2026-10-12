import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';
import { loadNodemailer } from '../load-nodemailer';

export class MailgunAdapter implements EmailAdapter {
  name = 'Mailgun';
  private apiKey?: string;
  private domain: string;
  private region: string;
  private smtpHost?: string;
  private smtpPort?: number;
  private smtpSecure?: boolean;
  private smtpUser?: string;
  private smtpPassword?: string;

  constructor(config: EmailAdapterConfig) {
    this.apiKey = config.apiKey;
    this.domain = config.domain || '';
    this.region = config.region || 'us'; // 'us' or 'eu'
    this.smtpHost = config.host;
    this.smtpPort = config.port;
    this.smtpSecure = config.secure;
    this.smtpUser = config.user;
    this.smtpPassword = config.password;

    if (!this.domain) {
      throw new Error('Mailgun domain is required');
    }

    // Validate that at least one method is available
    const hasApiKey = !!this.apiKey;
    const hasSmtpCredentials = !!(this.smtpUser && this.smtpPassword);

    if (!hasApiKey && !hasSmtpCredentials) {
      throw new Error('Mailgun requires either an API key or SMTP credentials');
    }
  }

  send(message: EmailMessage): Promise<void> {
    // Prefer API if available, otherwise use SMTP
    if (this.apiKey) {
      return this.sendViaAPI(message);
    } else if (this.smtpUser && this.smtpPassword) {
      return this.sendViaSMTP(message);
    } else {
      return Promise.reject(new Error('No valid credentials available for Mailgun'));
    }
  }

  private async sendViaAPI(message: EmailMessage): Promise<void> {
    console.log('[MailgunAdapter]: Sending email via API...');

    // Determine API endpoint based on region
    const baseUrl =
      this.region === 'eu'
        ? 'https://api.eu.mailgun.net'
        : 'https://api.mailgun.net';
    const url = `${baseUrl}/v3/${this.domain}/messages`;

    // Create form data for Mailgun API
    const formData = new URLSearchParams();
    formData.append('from', `${message.from.name} <${message.from.email}>`);
    formData.append('to', message.to);
    formData.append('subject', message.subject);
    formData.append('html', message.html);
    formData.append('h:Reply-To', message.replyTo);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mailgun API error: ${response.status} - ${errorText}`,
      );
    }

    console.log('[MailgunAdapter]: Email sent successfully via API');
  }

  private async sendViaSMTP(message: EmailMessage): Promise<void> {
    console.log('[MailgunAdapter]: Sending email via SMTP...');

    try {
      const nodemailer = await loadNodemailer();

      if (!nodemailer) {
        throw new Error(
          'SMTP support requires nodemailer. Install it with: pnpm add nodemailer'
        );
      }

      // Determine SMTP host based on region (use custom host if provided)
      const smtpHost = this.smtpHost ||
        (this.region === 'eu' ? 'smtp.eu.mailgun.org' : 'smtp.mailgun.org');

      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: this.smtpPort || 587,
        secure: this.smtpSecure || false,
        auth: {
          user: this.smtpUser!,
          pass: this.smtpPassword!,
        },
      });

      await transporter.sendMail({
        from: `${message.from.name} <${message.from.email}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        replyTo: message.replyTo,
      });

      console.log('[MailgunAdapter]: Email sent successfully via SMTP');
    } catch (error: any) {
      // If we're in a Cloudflare environment, provide helpful error
      if (error.message?.includes('nodemailer')) {
        throw new Error(
          'SMTP is not available in Cloudflare Workers/Pages. ' +
          'Use Mailgun API mode instead by setting useSmtp=false or omitting it.'
        );
      }
      throw error;
    }
  }
}
