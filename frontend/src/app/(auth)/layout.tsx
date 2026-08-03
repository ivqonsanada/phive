import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-bold text-navy">
          PH<span className="text-glow">ive</span>
        </Link>
        <div className="rounded-2xl border border-navy/10 bg-white p-7 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
