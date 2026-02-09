import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';

export class MailChannelsAdapter implements EmailAdapter {
  name = 'MailChannels';
  private apiKey: string;

  constructor(config: EmailAdapterConfig) {
    this.apiKey = config.apiKey;
  }

  async send(message: EmailMessage): Promise<void> {
    console.log('[MailChannelsAdapter]: Sending email...');

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

    console.log('[MailChannelsAdapter]: Email sent successfully');
  }
}
