import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { connection } from "next/server";

import { Providers } from "@/components/providers";
import { runtimeConfig } from "@/lib/runtime-config";

import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PHive",
    template: "%s · PHive",
  },
  description:
    "A freelancing platform for college: lecturers publish projects, students apply alone or as a team.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Opts this layout into dynamic rendering so API_URL and DEMO_DATA are read at
  // request time. Without it the values would be captured during the build and the
  // deployed Worker would ignore any later change to its variables.
  await connection();

  const config = runtimeConfig();

  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers config={config}>{children}</Providers>
      </body>
    </html>
  );
}
