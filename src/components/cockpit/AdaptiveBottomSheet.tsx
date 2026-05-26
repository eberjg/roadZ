"use client";

import { useState, type ReactNode } from "react";
import { ui, cn } from "@/components/ui/theme";
import { motion } from "@/components/ui/motion";

type SheetTab = "mission" | "fuel" | "ops" | "gps";

type AdaptiveBottomSheetProps = {
  missionPanel: ReactNode;
  fuelPanel: ReactNode;
  opsPanel: ReactNode;
  gpsPanel: ReactNode;
  summaryLine: string;
};

const tabs: { id: SheetTab; label: string }[] = [
  { id: "mission", label: "Mission" },
  { id: "fuel", label: "Fuel" },
  { id: "ops", label: "Ops" },
  { id: "gps", label: "GPS" },
];

export function AdaptiveBottomSheet({
  missionPanel,
  fuelPanel,
  opsPanel,
  gpsPanel,
  summaryLine,
}: AdaptiveBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<SheetTab>("mission");

  const panel =
    tab === "mission"
      ? missionPanel
      : tab === "fuel"
        ? fuelPanel
        : tab === "ops"
          ? opsPanel
          : gpsPanel;

  return (
    <section
      data-testid="cockpit-bottom-sheet"
      className={cn(
        "relative z-30 shrink-0 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl transition-[max-height] duration-300",
        expanded ? "max-h-[55vh]" : "max-h-[11rem]",
      )}
    >
      <button
        type="button"
        data-testid="cockpit-sheet-toggle"
        className="flex w-full flex-col items-center gap-1 px-4 py-2"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="h-1 w-10 rounded-full bg-white/30" />
        <span data-testid="cockpit-sheet-summary" className={`${ui.bodyMuted} text-center`}>
          {summaryLine}
        </span>
        <span className="text-xs font-semibold text-sky-400">
          {expanded ? "Collapse" : "Expand intelligence"}
        </span>
      </button>

      <div className={`px-3 pb-3 ${motion.cardEnter}`}>
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`cockpit-tab-${item.id}`}
              onClick={() => {
                setTab(item.id);
                setExpanded(true);
              }}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                tab === item.id
                  ? "bg-sky-500/25 text-sky-200 ring-1 ring-sky-500/40"
                  : "bg-white/5 text-zinc-400",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          data-testid="cockpit-sheet-content"
          className={cn("overflow-y-auto", expanded ? "max-h-[42vh]" : "max-h-[5rem]")}
        >
          {panel}
        </div>
      </div>
    </section>
  );
}
