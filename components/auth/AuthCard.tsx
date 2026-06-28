import Link from "next/link";

/** Shared field styling for auth forms. */
export const fieldClass =
  "w-full rounded-lg border border-line bg-base px-4 py-3 text-sm text-ink " +
  "placeholder:text-muted outline-none transition focus:border-accent/60 " +
  "focus:ring-2 focus:ring-accent/20";

/** Branded glass card wrapper for all auth screens. */
export function AuthCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center font-geist text-lg font-bold tracking-tight"
        >
          Nexora <span className="text-accent">AI</span>
        </Link>
        <div className="rounded-2xl border border-line bg-base-2/60 p-8 shadow-[0_0_60px_-15px] shadow-accent/10 backdrop-blur">
          <h1 className="font-geist text-2xl font-bold tracking-tight">{title}</h1>
          {sub && <p className="mt-1.5 text-sm text-muted">{sub}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
