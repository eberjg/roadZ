import { ui } from "@/components/ui/theme";

export function LoadingState() {
  return (
    <div
      data-testid="route-loading"
      className={`flex items-center gap-3 ${ui.panelInset}`}
      role="status"
    >
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      <span className={`${ui.body} font-semibold`}>Loading route…</span>
    </div>
  );
}
