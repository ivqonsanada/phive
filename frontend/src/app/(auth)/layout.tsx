/**
 * Auth screens have no site chrome in the original — no nav, no footer. Sign-in and
 * register lay out their own collage across the full width, so this group only
 * provides the flex context; the smaller screens wrap themselves in <AuthCard>.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
