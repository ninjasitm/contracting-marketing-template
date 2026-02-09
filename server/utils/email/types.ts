// Email adapter types and interfaces

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo: string;
  from: {
    email: string;
    name: string;
  };
}

export interface EmailAdapter {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

export interface EmailAdapterConfig {
  apiKey: string;
  [key: string]: any;
}

export type EmailProvider = 'mailchannels' | 'mailgun' | 'gmail' | 'smtp';
