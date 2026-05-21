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
          This email was sent by ChaiForms.
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
          This confirmation was sent by ChaiForms.
        </p>
      </div>
    `,
  });
}
