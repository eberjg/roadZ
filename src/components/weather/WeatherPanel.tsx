import type { WeatherIntelligence } from "@/services/weather/types";

type WeatherPanelProps = {
  intelligence: WeatherIntelligence;
};

export function WeatherPanel({ intelligence }: WeatherPanelProps) {
  const { current } = intelligence;

  return (
    <section
      data-testid="weather-panel"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Weather Intelligence</h2>
      <p className="mt-2 text-lg text-zinc-700">
        Source: {intelligence.source === "mock" ? "Deterministic route forecast" : "OpenWeather live"}
      </p>

      <div
        data-testid="weather-current"
        className="mt-5 flex items-center gap-4 rounded-xl border-2 border-zinc-900 bg-zinc-50 p-5"
      >
        <span className="text-5xl" aria-hidden>
          {current.icon}
        </span>
        <div>
          <p className="text-3xl font-bold text-zinc-900">{current.summary}</p>
          <p className="text-xl text-zinc-700">{current.city}</p>
          <p data-testid="weather-temperature" className="mt-2 text-2xl font-semibold text-zinc-900">
            {current.temperatureF}°F
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div data-testid="weather-precipitation" className="rounded-lg bg-zinc-100 p-3 text-center">
          <p className="text-sm font-semibold text-zinc-600">Rain</p>
          <p className="text-xl font-bold">{current.precipitationMm} mm</p>
        </div>
        <div data-testid="weather-wind" className="rounded-lg bg-zinc-100 p-3 text-center">
          <p className="text-sm font-semibold text-zinc-600">Wind</p>
          <p className="text-xl font-bold">{current.windMph} mph</p>
        </div>
        <div data-testid="weather-visibility" className="rounded-lg bg-zinc-100 p-3 text-center">
          <p className="text-sm font-semibold text-zinc-600">Visibility</p>
          <p className="text-xl font-bold">{current.visibilityMiles} mi</p>
        </div>
      </div>
    </section>
  );
}
