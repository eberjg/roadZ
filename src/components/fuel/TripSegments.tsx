import type { FuelIntelligence } from "@/services/fuel/types";

type TripSegmentsProps = {
  intelligence: FuelIntelligence;
};

export function TripSegments({ intelligence }: TripSegmentsProps) {
  if (intelligence.segments.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="trip-segments"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Trip Segments</h2>
      <p className="mt-2 text-lg text-zinc-700">Optimized legs with stop timing</p>

      <ol className="mt-5 flex flex-col gap-4">
        {intelligence.segments.map((segment) => (
          <li
            key={segment.id}
            data-testid={`trip-segment-${segment.id}`}
            className="rounded-xl border-2 border-zinc-300 bg-zinc-50 p-4"
          >
            <p className="text-lg font-bold text-zinc-900">{segment.label}</p>
            <p className="text-lg text-zinc-700">
              Miles {segment.startMile.toLocaleString()} → {segment.endMile.toLocaleString()} (
              {segment.distanceMiles.toLocaleString()} mi)
            </p>
            <p className="text-lg text-zinc-700">Drive time: {segment.estimatedDriveTimeLabel}</p>
            {segment.endsAtStop ? (
              <p className="mt-1 font-semibold text-zinc-900">Ends at: {segment.endsAtStop}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
