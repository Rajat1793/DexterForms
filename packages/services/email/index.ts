import nodemailer from "nodemailer";
import { env } from "../env";

function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT ?? "587"),
    secure: parseInt(env.SMTP_PORT ?? "587") === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const transporter = createTransport();

export async function sendNewResponseNotification(opts: {
  creatorEmail: string;
  formTitle: string;
  formId: string;
  responseId: string;
}) {
  if (!transporter) return;

  const dashboardUrl = `${env.FRONTEND_URL}/dashboard/forms/${opts.formId}/responses`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: opts.creatorEmail,
    subject: `New response to "${opts.formTitle}"`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">You have a new form response! 🎉</h2>
        <p>Someone just submitted a response to your form <strong>${opts.formTitle}</strong>.</p>
        <a href="${dashboardUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 16px;
        ">View Response</a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          This email was sent by DexterForms.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(opts: {
  email: string;
  fullName: string;
  token: string;
}) {
  if (!transporter) return;

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${opts.token}`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: opts.email,
    subject: "Reset your DexterForms password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fffde7; border: 3px solid #000;">
        <h2 style="font-family: Bangers, sans-serif; color: #cc0000; font-size: 28px; letter-spacing: 2px;">🔑 RESET YOUR PASSWORD</h2>
        <p>Hey ${opts.fullName},</p>
        <p>Someone requested a password reset for your DexterForms account. If this wasn't you, you can safely ignore this email.</p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #cc0000;
          color: white;
          text-decoration: none;
          font-weight: 800;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000;
          margin-top: 16px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
        ">RESET PASSWORD</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px; font-family: monospace;">
          DexterForms · If you did not request this, no action is required.
        </p>
      </div>
    `,
  });
}

export async function sendResponseConfirmation(opts: {
  respondentEmail: string;
  formTitle: string;
  successMessage?: string;
}) {
  if (!transporter) return;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: opts.respondentEmail,
    subject: `Your response to "${opts.formTitle}" was received`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Response Received ✅</h2>
        <p>${opts.successMessage ?? "Thank you for your response!"}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          This confirmation was sent by DexterForms.
        </p>
      </div>
    `,
  });
}
