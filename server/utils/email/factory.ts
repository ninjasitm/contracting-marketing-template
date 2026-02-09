import type { EmailAdapter, EmailAdapterConfig, EmailProvider } from './types';
import { MailChannelsAdapter } from './adapters/mailchannels';
import { MailgunAdapter } from './adapters/mailgun';
import { GmailAdapter } from './adapters/gmail';
import { SMTPAdapter } from './adapters/smtp';

export function createEmailAdapter(
  provider: EmailProvider,
  config: EmailAdapterConfig,
): EmailAdapter {
  console.log(`[EmailFactory]: Creating ${provider} adapter`);

  switch (provider) {
    case 'mailchannels':
      return new MailChannelsAdapter(config);
    case 'mailgun':
      return new MailgunAdapter(config);
    case 'gmail':
      return new GmailAdapter(config);
    case 'smtp':
      return new SMTPAdapter(config);
    default:
      throw new Error(`Unknown email provider: ${provider}`);
  }
}
