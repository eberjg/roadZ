import type { WeatherIntelligence } from "@/services/weather/types";

type WeatherTimelineProps = {
  intelligence: WeatherIntelligence;
};

export function WeatherTimeline({ intelligence }: WeatherTimelineProps) {
  return (
    <section
      data-testid="weather-timeline"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Weather Timeline</h2>
      <ol className="mt-5 flex flex-col gap-3">
        {intelligence.timeline.map((entry) => (
          <li
            key={entry.id}
            data-testid={`weather-timeline-${entry.id}`}
            className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 ${
              entry.isSevere
                ? "border-orange-700 bg-orange-50"
                : "border-zinc-300 bg-zinc-50"
            }`}
          >
            <span className="text-3xl" aria-hidden>
              {entry.icon}
            </span>
            <div>
              <p className="text-lg font-bold text-zinc-900">{entry.label}</p>
              <p className="text-lg text-zinc-700">
                Mile {entry.mileMarker.toLocaleString()} · {entry.timeLabel} · {entry.temperatureF}°F
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
