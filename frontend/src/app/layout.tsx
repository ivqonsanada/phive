import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
