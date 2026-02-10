import { z } from 'zod';
import { createEmailAdapter } from '~/server/utils/email/factory';
import type { EmailAdapter } from '~/server/utils/email/types';

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
  console.info('[ContactAPI] [sendEmail]: Request received');

  try {
    // Parse and validate the request body
    const body = await readBody(event);

    // Validate the form data using Zod schema
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(
        '[ContactAPI] [sendEmail]: Validation failed | issues:',
        validationResult.error.errors,
      );
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationResult.error.errors,
      });
    }

    const { fullName, email, phone, message } = validationResult.data;

    // Get runtime config for recipient email
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();
    const recipientEmail = config?.mail?.message?.to || 'info@company.com';

    // Create email adapter (loads config internally, validates, and throws error if invalid)
    let emailAdapter: EmailAdapter;
    try {
      emailAdapter = createEmailAdapter();
    } catch (error: any) {
      console.error(
        '[ContactAPI] [sendEmail]: Adapter creation failed | error:',
        error.message,
      );
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuration Error',
        message: error.message,
      });
    }

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
    console.info(
      '[ContactAPI] [sendEmail]: Sending email | provider:',
      emailAdapter.name,
    );
    await emailAdapter.send({
      to: recipientEmail,
      subject: emailSubject,
      html: emailBody,
      replyTo: email,
      from: {
        email: (config?.mail?.auth?.user as string) || 'noreply@company.com',
        name: (appConfig.companyName as string) || 'Contact Form',
      },
    });

    console.info('[ContactAPI] [sendEmail]: Email sent');

    // Return success response
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error(
      '[ContactAPI] [sendEmail]: Failed to send email | error:',
      error,
    );

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
