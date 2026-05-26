import type { ReactNode } from "react";

type CockpitLayoutProps = {
  tripStrip: ReactNode;
  map: ReactNode;
  hud: ReactNode;
  bottomSheet: ReactNode;
};

export function CockpitLayout({
  tripStrip,
  map,
  hud,
  bottomSheet,
}: CockpitLayoutProps) {
  return (
    <div
      data-testid="cockpit-layout"
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-950"
    >
      {tripStrip}
      <div data-testid="cockpit-map-stage" className="relative min-h-0 flex-1">
        <div className="absolute inset-0">{map}</div>
        {hud}
      </div>
      {bottomSheet}
    </div>
  );
}
