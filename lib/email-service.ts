/**
 * Email Service
 * Handles email sending via SendGrid/Resend
 */

import { captureError } from "@/lib/sentry";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

/**
 * Send email using SendGrid
 */
async function sendViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured");
      return false;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || "noreply@litlabs.ai",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    return true;
  } catch (error) {
    captureError("Failed to send email via Resend", { error });
    return false;
  }
}

/**
 * Get email template
 */
function getTemplate(templateName: string, variables: Record<string, any> = {}): EmailTemplate | null {
  const templates: Record<string, EmailTemplate> = {
    payment_confirmation: {
      name: "payment_confirmation",
      subject: "Payment Confirmation",
      html: `
        <h1>Thank you for your payment!</h1>
        <p>Your payment of $${variables.amount} has been received.</p>
        <p>Transaction ID: ${variables.transactionId}</p>
        <p>Amount: $${variables.amount}</p>
        <p>Date: ${variables.date}</p>
      `,
    },
    payment_failed: {
      name: "payment_failed",
      subject: "Payment Failed",
      html: `
        <h1>Payment Failed</h1>
        <p>Your payment attempt failed.</p>
        <p>Error: ${variables.error}</p>
        <p>Please try again or contact support.</p>
        <a href="https://litlabs.ai/billing">Update Payment Method</a>
      `,
    },
    subscription_canceled: {
      name: "subscription_canceled",
      subject: "Subscription Canceled",
      html: `
        <h1>Your subscription has been canceled</h1>
        <p>Your ${variables.tier} subscription has been canceled.</p>
        <p>You will have access until ${variables.endDate}.</p>
        <p>We'd love to see you back!</p>
      `,
    },
    welcome_email: {
      name: "welcome_email",
      subject: "Welcome to LitLabs!",
      html: `
        <h1>Welcome, ${variables.displayName}!</h1>
        <p>We're excited to have you on board.</p>
        <p>Get started by:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore AI generation features</li>
          <li>Connect social media accounts</li>
        </ul>
        <a href="https://litlabs.ai/dashboard">Go to Dashboard</a>
      `,
    },
    verification_email: {
      name: "verification_email",
      subject: "Verify Your Email Address",
      html: `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${variables.verificationLink}">Verify Email</a>
        <p>Or paste this code: ${variables.code}</p>
      `,
    },
    password_reset: {
      name: "password_reset",
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${variables.resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    },
  };

  return templates[templateName] || null;
}

/**
 * Send templated email
 */
export async function sendTemplatedEmail(
  to: string,
  templateName: string,
  variables: Record<string, any> = {},
  options?: Partial<EmailOptions>
): Promise<boolean> {
  try {
    const template = getTemplate(templateName, variables);
    if (!template) {
      console.warn(`Template not found: ${templateName}`);
      return false;
    }

    const emailOptions: EmailOptions = {
      to,
      subject: template.subject,
      html: template.html,
      ...options,
    };

    return await sendViaResend(emailOptions);
  } catch (error) {
    captureError("Failed to send templated email", { error, templateName });
    return false;
  }
}

/**
 * Send custom email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    return await sendViaResend(options);
  } catch (error) {
    captureError("Failed to send email", { error });
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  amount: number,
  transactionId: string
): Promise<boolean> {
  return sendTemplatedEmail(to, "payment_confirmation", {
    amount: amount.toFixed(2),
    transactionId,
    date: new Date().toLocaleDateString(),
  });
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(to: string, error: string): Promise<boolean> {
  return sendTemplatedEmail(to, "payment_failed", { error });
}

/**
 * Send subscription canceled email
 */
export async function sendSubscriptionCanceledEmail(
  to: string,
  tier: string,
  endDate: string
): Promise<boolean> {
  return sendTemplatedEmail(to, "subscription_canceled", {
    tier,
    endDate,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, displayName: string): Promise<boolean> {
  return sendTemplatedEmail(to, "welcome_email", { displayName });
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  verificationLink: string,
  code: string
): Promise<boolean> {
  return sendTemplatedEmail(to, "verification_email", {
    verificationLink,
    code,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  return sendTemplatedEmail(to, "password_reset", { resetLink });
}

export default {
  sendEmail,
  sendTemplatedEmail,
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
