export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Memuat">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary-container" />
    </div>
  );
}
