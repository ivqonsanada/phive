import Image from "next/image";
import Link from "next/link";

/**
 * The centred panel the original used for the smaller auth screens — forgot password,
 * reset, verify. Sign-in and register have their own full-width collage layouts, which
 * is why this is a component rather than the route group's layout.
 */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px] px-6 py-12">
      <Link href="/" className="mx-auto mb-8 block w-fit">
        <Image src="/images/logo-blue.svg" alt="PHive" width={95} height={42} priority />
      </Link>

      {children}

      <div className="mt-10 text-center text-[14px]">
        PHive, All Rights Reserved. © {new Date().getFullYear()} . | Created by FILKOM
      </div>
    </div>
  );
}
