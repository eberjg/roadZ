import { ui } from "@/components/ui/theme";
import type { WeatherIntelligence } from "@/services/weather/types";

type WeatherPanelProps = {
  intelligence: WeatherIntelligence;
};

export function WeatherPanel({ intelligence }: WeatherPanelProps) {
  const { current } = intelligence;

  return (
    <section data-testid="weather-panel" className={ui.panel}>
      <h2 className={ui.h2}>Weather Intelligence</h2>
      <p className={`mt-2 ${ui.body}`}>
        Source: {intelligence.source === "mock" ? "Deterministic route forecast" : "OpenWeather live"}
      </p>

      <div
        data-testid="weather-current"
        className={`mt-5 flex items-center gap-4 ${ui.panelInset}`}
      >
        <span className="text-5xl" aria-hidden>
          {current.icon}
        </span>
        <div>
          <p className={ui.valueXl}>{current.summary}</p>
          <p className="text-xl text-zinc-400">{current.city}</p>
          <p data-testid="weather-temperature" className={`mt-2 ${ui.valueLg}`}>
            {current.temperatureF}°F
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div data-testid="weather-precipitation" className={`${ui.chip} text-center`}>
          <p className={ui.statLabel}>Rain</p>
          <p className={`${ui.value} mt-1`}>{current.precipitationMm} mm</p>
        </div>
        <div data-testid="weather-wind" className={`${ui.chip} text-center`}>
          <p className={ui.statLabel}>Wind</p>
          <p className={`${ui.value} mt-1`}>{current.windMph} mph</p>
        </div>
        <div data-testid="weather-visibility" className={`${ui.chip} text-center`}>
          <p className={ui.statLabel}>Visibility</p>
          <p className={`${ui.value} mt-1`}>{current.visibilityMiles} mi</p>
        </div>
      </div>
    </section>
  );
}
