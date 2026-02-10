# Email Adapter System

This directory contains the email adapter system that supports multiple email providers with automatic fallback.

## Architecture

```
email/
├── types.ts              # TypeScript interfaces and types
├── factory.ts            # Adapter factory for creating email providers
└── adapters/
    ├── mailchannels.ts   # MailChannels API adapter
    ├── mailgun.ts        # Mailgun API/SMTP adapter
    ├── gmail.ts          # Gmail SMTP adapter
    └── smtp.ts           # Generic SMTP adapter
```

## Supported Providers

### API-Based Providers
- **MailChannels** - Recommended for Cloudflare Pages/Workers
- **Mailgun** - Full-featured email service (API or SMTP mode)

### SMTP Providers
- **Gmail** - SMTP with Gmail-specific defaults and validation
- **SMTP** - Universal support (works with any SMTP provider)
- Automatically used as fallback when no `EMAIL_API_KEY` is set
- **Note:** SMTP doesn't work in Cloudflare Workers/Pages production environments

### Mailgun SMTP Mode
- Mailgun can use either API or SMTP
- Uses standard `SMTP_USER` and `SMTP_PASSWORD` environment variables
- If both API key and SMTP credentials are provided, API is preferred
- SMTP host is auto-detected based on `MAILGUN_REGION` (smtp.mailgun.org or smtp.eu.mailgun.org)
- Can override host by setting `SMTP_HOST` explicitly

## Usage

The adapter system is used automatically by the contact form API endpoint.

### Configuration

Set environment variables in `.env`:

```env
# Choose provider
EMAIL_PROVIDER=gmail  # or 'mailchannels', 'mailgun', or 'smtp'

# Standard SMTP credentials (for Gmail, SMTP, or Mailgun SMTP mode)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API key (for MailChannels or Mailgun API mode)
EMAIL_API_KEY=your-api-key

# Mailgun-specific (if using Mailgun)
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_REGION=us
```

### Automatic Fallback

When `EMAIL_API_KEY` is not configured:
1. System logs: "No API key found, falling back to SMTP"
2. Automatically switches to SMTP adapter
3. Uses SMTP credentials from environment variables

## Adding a New Provider

1. **Create adapter file:**
   ```typescript
   // adapters/your-provider.ts
   import type { EmailAdapter, EmailMessage, EmailAdapterConfig } from '../types';

   export class YourProviderAdapter implements EmailAdapter {
     name = 'YourProvider';

     constructor(config: EmailAdapterConfig) {
       // Initialize with config
     }

     async send(message: EmailMessage): Promise<void> {
       // Implement sending logic
     }
   }
   ```

2. **Add to types:**
   ```typescript
   // types.ts
   export type EmailProvider = 'mailchannels' | 'mailgun' | 'smtp' | 'your-provider';
   ```

3. **Update factory:**
   ```typescript
   // factory.ts
   import { YourProviderAdapter } from './adapters/your-provider';

   export function createEmailAdapter(provider: EmailProvider, config: EmailAdapterConfig) {
     switch (provider) {
       case 'your-provider':
         return new YourProviderAdapter(config);
       // ... other cases
     }
   }
   ```

4. **Add configuration to `nuxt.config.ts`:**
   ```typescript
   runtimeConfig: {
     yourProviderApiKey: process.env.YOUR_PROVIDER_API_KEY || '',
     // ... other config
   }
   ```

## Testing

### Local Development
```bash
# Using SMTP (easiest)
cp .env.example .env
# Edit .env with SMTP credentials
pnpm dev

# Using API provider
# Add EMAIL_API_KEY to .env
pnpm dev
```

### Test Email Endpoint
```bash
curl -X POST "http://localhost:3000/api/contact/send-email" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

## Production Considerations

- **Cloudflare Workers/Pages:** Use API-based providers (MailChannels or Mailgun)
- **Node.js servers:** All providers work, including SMTP
- **DNS Configuration:** Required for MailChannels to avoid spam filtering
- **Rate Limits:** Check your provider's rate limits and plan accordingly
- **Error Handling:** All adapters throw descriptive errors for debugging

## Environment Variables Reference

### Universal
- `EMAIL_PROVIDER` - Provider selection: `mailchannels`, `mailgun`, or `smtp`
- `EMAIL_API_KEY` - API key for MailChannels or Mailgun
- `CONTACT_EMAIL_TO` - Recipient email address

### SMTP
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (usually 587 or 465)
- `SMTP_SECURE` - Use SSL/TLS (true/false)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password or app password

### Mailgun
- `MAILGUN_DOMAIN` - Your Mailgun domain
- `MAILGUN_REGION` - Region: `us` or `eu` (default: `us`)

**Mailgun supports both API and SMTP:**
- Provide `EMAIL_API_KEY` for API mode (preferred)
- Provide `SMTP_USER` and `SMTP_PASSWORD` for SMTP mode
- If both are provided, API is preferred

## Documentation

See [docs/EMAIL_SETUP.md](../../../docs/EMAIL_SETUP.md) for complete setup instructions.
