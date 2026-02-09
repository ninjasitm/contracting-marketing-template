import { z } from 'zod';
import { createEmailAdapter } from '~/server/utils/email/factory';
import type { EmailProvider } from '~/server/utils/email/types';

// Define the contact form schema for validation
const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
});

export default defineEventHandler(async (event) => {
  console.log('[ContactAPI]: Email send request received');

  try {
    // Parse and validate the request body
    const body = await readBody(event);
    console.log('[ContactAPI]: Request body:', body);

    // Validate the form data using Zod schema
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        '[ContactAPI]: Validation failed:',
        validationResult.error.errors,
      );
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationResult.error.errors,
      });
    }

    const { fullName, email, phone, message } = validationResult.data;

    // Get runtime config
    const config = useRuntimeConfig();
    const recipientEmail =
      (config.contactEmailTo as string) || 'info@thedashtigroup.com';
    const emailProvider = (config.emailProvider as EmailProvider) || 'mailchannels';
    const emailApiKey = config.emailApiKey as string;

    // Gather available credentials
    const hasApiKey = !!emailApiKey;
    const hasSmtpCredentials = !!(config.smtpUser && config.smtpPassword);

    // Create adapter config with all available credentials
    const adapterConfig: any = {
      // API credentials
      apiKey: emailApiKey,
      // SMTP credentials (standard for all providers)
      host: config.smtpHost as string,
      port: parseInt(config.smtpPort as string) || 587,
      secure: config.smtpSecure === 'true' || config.smtpSecure === true,
      user: config.smtpUser as string,
      password: config.smtpPassword as string,
    };

    // Add provider-specific config
    if (emailProvider === 'mailgun') {
      adapterConfig.domain = config.mailgunDomain as string;
      adapterConfig.region = (config.mailgunRegion as string) || 'us';

      if (!adapterConfig.domain) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: 'Mailgun domain is not configured',
        });
      }

      // Validate that at least one method is available
      if (!hasApiKey && !hasSmtpCredentials) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: 'Mailgun requires either EMAIL_API_KEY or SMTP credentials (SMTP_USER and SMTP_PASSWORD)',
        });
      }
    } else if (emailProvider === 'mailchannels') {
      if (!hasApiKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: 'MailChannels requires EMAIL_API_KEY',
        });
      }
    } else if (emailProvider === 'gmail') {
      if (!hasSmtpCredentials) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: 'Gmail requires SMTP_USER and SMTP_PASSWORD (use App Password)',
        });
      }
    } else if (emailProvider === 'smtp') {
      if (!hasSmtpCredentials) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: 'SMTP requires SMTP_USER and SMTP_PASSWORD',
        });
      }
    }

    // Create email adapter
    const emailAdapter = createEmailAdapter(emailProvider, adapterConfig);

    // Prepare email content
    const emailSubject = `New Contact Form Submission from ${fullName}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        </div>

        <div style="background-color: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px;">
          <h3 style="color: #495057; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
          <p>This email was sent from the contact form on your website.</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    // Send the email using the configured adapter
    console.log(`[ContactAPI]: Sending email via ${emailAdapter.name}...`);
    await emailAdapter.send({
      to: recipientEmail,
      subject: emailSubject,
      html: emailBody,
      replyTo: email,
      from: {
        email: 'dj@thedashtigroup.com',
        name: 'Dashti Group Contact Form',
      },
    });

    console.log('[ContactAPI]: Email sent successfully');

    // Return success response
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('[ContactAPI]: Error sending email:', error);

    // Handle different types of errors
    if (error.statusCode) {
      // This is already a formatted error (like validation error)
      throw error;
    }

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to send email. Please try again later.',
    });
  }
});
