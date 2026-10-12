import { Resend } from "resend";

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export const sendSignInCode = async (email: string, otp: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Resend email delivery is not configured.");

  const resend = new Resend(apiKey);
  const safeCode = escapeHtml(otp);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `${otp} is your Make My Font sign-in code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#171717">
        <p style="font-size:14px;margin:0 0 24px">Make My Font</p>
        <h1 style="font-size:24px;margin:0 0 12px">Your sign-in code</h1>
        <p style="font-size:16px;line-height:1.5;margin:0 0 24px">Enter this code to sign in. It expires in five minutes.</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:0 0 24px">${safeCode}</p>
        <p style="font-size:13px;line-height:1.5;color:#666;margin:0">If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
};
