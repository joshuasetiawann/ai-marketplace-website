export default function Home() {
  return (
    <main className="grid flex-1 place-items-center px-6">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Precision Luxury · AI Marketplace
        </p>
        <h1 className="mt-4 font-geist text-5xl font-bold tracking-tight">
          Nexora <span className="text-accent">AI</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Fondasi produksi: Next.js 16 + Supabase. Login asli, database asli,
          akses berbasis role.
        </p>
        <div className="mx-auto mt-8 h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent" />
      </div>
    </main>
  );
}
