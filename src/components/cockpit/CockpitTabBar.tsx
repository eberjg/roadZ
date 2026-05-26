"use client";

import { cn } from "@/components/ui/theme";

export type CockpitTab = "mission" | "fuel" | "ops" | "gps" | "safety";

type CockpitTabBarProps = {
  activeTab: CockpitTab | null;
  onTabChange: (tab: CockpitTab) => void;
};

const tabs: { id: CockpitTab; label: string }[] = [
  { id: "mission", label: "Mission" },
  { id: "fuel", label: "Fuel" },
  { id: "ops", label: "Ops" },
  { id: "gps", label: "GPS" },
  { id: "safety", label: "Safety" },
];

export function CockpitTabBar({ activeTab, onTabChange }: CockpitTabBarProps) {
  return (
    <nav
      data-testid="cockpit-tab-bar"
      className="pointer-events-auto flex gap-1 border-t border-white/10 bg-slate-950/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-testid={`cockpit-tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-center text-xs font-bold transition-colors",
            activeTab === tab.id
              ? "bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-400/40"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
