import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';

export class MailChannelsAdapter implements EmailAdapter {
  name = 'MailChannels';
  private apiKey: string;

  constructor(config: EmailAdapterConfig) {
    this.apiKey = config.apiKey;

    if (!this.apiKey) {
      throw new Error('MailChannels requires EMAIL_API_KEY');
    }
  }

  async send(message: EmailMessage): Promise<void> {
    console.info('[MailChannelsAdapter]: Sending email');

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: message.to }],
            reply_to: [{ email: message.replyTo }],
          },
        ],
        from: {
          email: message.from.email,
          name: message.from.name,
        },
        subject: message.subject,
        content: [
          {
            type: 'text/html',
            value: message.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `MailChannels API error: ${response.status} - ${errorText}`,
      );
    }

    console.info('[MailChannelsAdapter]: Email sent successfully');
  }
}
