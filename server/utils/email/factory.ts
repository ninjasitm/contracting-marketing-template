import type { EmailAdapter, EmailAdapterConfig, EmailProvider } from './types';
import { MailChannelsAdapter } from './adapters/mailchannels';
import { MailgunAdapter } from './adapters/mailgun';
import { GmailAdapter } from './adapters/gmail';
import { SMTPAdapter } from './adapters/smtp';

export function createEmailAdapter(provider?: EmailProvider): EmailAdapter {
  // Load runtime config
  const config = useRuntimeConfig();
  const mailConfig = config?.mail;

  if (!mailConfig) {
    throw new Error('Mail configuration is missing');
  }

  const emailProvider = String(
    provider || (mailConfig.provider as EmailProvider) || 'smtp',
  ).toLowerCase() as EmailProvider;

  console.info(
    '[EmailFactory] [createEmailAdapter]: Creating adapter | provider:',
    emailProvider,
  );

  // Build adapter config from runtime config
  const smtpConfig = mailConfig.smtp ?? {};
  const authConfig = mailConfig.auth ?? {};
  const mailgunConfig = mailConfig.mailgun ?? {};
  const adapterConfig: EmailAdapterConfig = {
    // API credentials
    apiKey: mailConfig.apiKey,
    // SMTP credentials (standard for all providers)
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure,
    user: authConfig.user,
    password: authConfig.pass,
    // Mailgun-specific config
    domain: mailgunConfig.domain,
    region: mailgunConfig.region || 'us',
  };

  switch (emailProvider) {
    case 'mailchannels':
      return new MailChannelsAdapter(adapterConfig);
    case 'mailgun':
      return new MailgunAdapter(adapterConfig);
    case 'gmail':
      return new GmailAdapter(adapterConfig);
    case 'smtp':
      return new SMTPAdapter(adapterConfig);
    default:
      throw new Error(`Unknown email provider: ${emailProvider}`);
  }
}
