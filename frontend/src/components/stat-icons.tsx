"use client";

import { Icon } from "@/lib/icons";

/**
 * The three home-page fact icons, at the Iconify names the original used.
 */
const SIZE = "size-[50px] xl:size-[72px]";

export function BrainIcon() {
  return <Icon icon="bx:bxs-brain" className={SIZE} aria-hidden />;
}

export function PaperPlaneIcon() {
  return <Icon icon="entypo:paper-plane" className={SIZE} aria-hidden />;
}

export function CheckOutlineIcon() {
  return <Icon icon="ant-design:check-circle-outlined" className={SIZE} aria-hidden />;
}
