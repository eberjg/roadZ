import { ui } from "@/components/ui/theme";
import type { WeatherIntelligence } from "@/services/weather/types";

type WeatherTimelineProps = {
  intelligence: WeatherIntelligence;
};

export function WeatherTimeline({ intelligence }: WeatherTimelineProps) {
  return (
    <section data-testid="weather-timeline" className={ui.panel}>
      <h2 className={ui.h2}>Weather Timeline</h2>
      <ol className="mt-5 flex flex-col gap-3">
        {intelligence.timeline.map((entry) => (
          <li
            key={entry.id}
            data-testid={`weather-timeline-${entry.id}`}
            className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 ${
              entry.isSevere
                ? "border-orange-500/50 bg-orange-500/10"
                : "border-white/10 bg-zinc-950/70"
            }`}
          >
            <span className="text-3xl" aria-hidden>
              {entry.icon}
            </span>
            <div>
              <p className={`text-lg font-bold ${entry.isSevere ? "text-orange-200" : "text-white"}`}>
                {entry.label}
              </p>
              <p className={ui.body}>
                Mile {entry.mileMarker.toLocaleString()} · {entry.timeLabel} · {entry.temperatureF}°F
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
