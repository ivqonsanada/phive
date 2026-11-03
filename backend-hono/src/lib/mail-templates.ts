/**
 * Laravel's stock VerifyEmail and ResetPassword notifications, same copy and links.
 */
import { frontendOrigins } from "./cors";
import type { Mail } from "./mail";

const APP_NAME = "PHive";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(to: string, subject: string, intro: string, button: string, url: string, outro: string[]): Mail {
  const subcopy = `If you're having trouble clicking the "${button}" button, copy and paste the URL below\ninto your web browser:`;
  const text = [
    "Hello!",
    "",
    intro,
    "",
    `${button}: ${url}`,
    "",
    ...outro.flatMap((line) => [line, ""]),
    "Regards,",
    APP_NAME,
    "",
    `${subcopy} ${url}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1f2937;line-height:1.5">
<h1 style="font-size:18px">${APP_NAME}</h1>
<p>Hello!</p>
<p>${escape(intro)}</p>
<p><a href="${escape(url)}" style="display:inline-block;padding:8px 18px;background:#1f2937;color:#fff;border-radius:4px;text-decoration:none">${escape(button)}</a></p>
${outro.map((line) => `<p>${escape(line)}</p>`).join("\n")}
<p>Regards,<br>${APP_NAME}</p>
<hr><p style="font-size:12px;color:#6b7280">${escape(subcopy)} <a href="${escape(url)}">${escape(url)}</a></p>
<p style="font-size:12px;color:#6b7280">© ${new Date().getUTCFullYear()} ${APP_NAME}. All rights reserved.</p>
</body></html>`;

  return { to, subject, text, html };
}

/** The link goes to the frontend, which calls the signed API URL itself. */
export function verifyEmailMail(frontendUrl: string, to: string, signedApiUrl: string): Mail {
  const link = `${frontendOrigins(frontendUrl)[0]}/email/verify?${new URLSearchParams({ url: signedApiUrl })}`;
  return render(
    to,
    "Verify your email address",
    "Please click the button below to verify your email address.",
    "Verify Email Address",
    link,
    ["If you did not create an account, no further action is required."],
  );
}

export function resetPasswordMail(frontendUrl: string, to: string, token: string): Mail {
  const link = `${frontendOrigins(frontendUrl)[0]}/password/reset?${new URLSearchParams({ token, email: to })}`;
  return render(
    to,
    "Reset your password",
    "You are receiving this email because we received a password reset request for your account.",
    "Reset Password",
    link,
    [
      "This password reset link will expire in 60 minutes.",
      "If you did not request a password reset, no further action is required.",
    ],
  );
}
