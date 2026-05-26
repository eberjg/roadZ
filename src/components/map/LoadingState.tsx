export function LoadingState() {
  return (
    <div
      data-testid="route-loading"
      className="flex items-center gap-3 rounded-2xl border-2 border-zinc-300 bg-zinc-50 px-5 py-4"
      role="status"
      aria-live="polite"
    >
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      <p className="text-lg font-semibold text-zinc-800">Calculating route…</p>
    </div>
  );
}
