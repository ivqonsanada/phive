import type { Bindings } from "../env";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Messages sent with MAIL_DRIVER=array, for tests to inspect. */
export const outbox: Mail[] = [];

/** Parses `Name <address>` or a bare address. */
function parseFrom(value: string): string | { email: string; name: string } {
  const match = /^\s*(.+?)\s*<([^>]+)>\s*$/.exec(value);
  return match ? { name: match[1]!, email: match[2]! } : value.trim();
}

/**
 * `log` prints the message (local dev), `array` keeps it in `outbox` (tests), and
 * `cloudflare` sends it through Cloudflare Email Service, whose `from` domain must be
 * onboarded first with `wrangler email sending enable <domain>`.
 *
 * Unlike Laravel, a transport failure is logged rather than failing the request: the
 * account or reset row already exists by then, and a 500 would only hide that.
 */
export async function sendMail(env: Bindings, mail: Mail): Promise<void> {
  try {
    if (env.MAIL_DRIVER === "cloudflare") {
      await env.EMAIL.send({
        to: mail.to,
        from: parseFrom(env.MAIL_FROM),
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } else if (env.MAIL_DRIVER === "array") {
      outbox.push(mail);
    } else {
      console.log(`[mail] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`);
    }
  } catch (error) {
    console.error("[mail] send failed", mail.to, mail.subject, error);
  }
}
