"use client";

import { useState } from "react";

import { Icon } from "@/lib/icons";

/**
 * The original's share row: copy the link, or hand it to one of five networks. Each is
 * a plain share URL, so nothing here loads a third-party script or lets those networks
 * see who is reading the page.
 */
export function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    // Read at click time: this component is rendered on the server first, where there
    // is no location to read.
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function share(template: (url: string, text: string) => string) {
    const url = encodeURIComponent(window.location.href);
    window.open(template(url, encodeURIComponent(title)), "_blank", "noopener,noreferrer");
  }

  const button =
    "flex items-center justify-center gap-2 rounded-[10px] bg-navy px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-navy/90";

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <button type="button" onClick={copy} className={button}>
        <Icon icon="ic:round-link" className="size-[18px]" aria-hidden />
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={() => share((url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`)}
        className={button}
      >
        <Icon icon="la:facebook-f" className="size-[18px]" aria-hidden />
        Facebook
      </button>
      <button
        type="button"
        onClick={() => share((url, text) => `https://t.me/share/url?url=${url}&text=${text}`)}
        className={button}
      >
        <Icon icon="si-glyph:paper-plane" className="size-[18px]" aria-hidden />
        Telegram
      </button>
      <button
        type="button"
        onClick={() =>
          share((url, text) => `https://twitter.com/intent/tweet?url=${url}&text=${text}`)
        }
        className={button}
      >
        <Icon icon="ant-design:twitter-outlined" className="size-[18px]" aria-hidden />
        Twitter
      </button>
      <button
        type="button"
        onClick={() => share((url) => `https://social-plugins.line.me/lineit/share?url=${url}`)}
        className={button}
      >
        <Icon icon="dashicons:share" className="size-[18px]" aria-hidden />
        Line
      </button>
      <button
        type="button"
        onClick={() => share((url, text) => `https://wa.me/?text=${text}%20${url}`)}
        className={button}
      >
        <Icon icon="mdi:whatsapp" className="size-[18px]" aria-hidden />
        Whatsapp
      </button>
    </div>
  );
}
