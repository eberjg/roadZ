import { ui } from "@/components/ui/theme";
import type { FuelIntelligence } from "@/services/fuel/types";

type TripSegmentsProps = {
  intelligence: FuelIntelligence;
};

export function TripSegments({ intelligence }: TripSegmentsProps) {
  if (intelligence.segments.length === 0) {
    return null;
  }

  return (
    <section data-testid="trip-segments" className={ui.panel}>
      <h2 className={ui.h2}>Trip Segments</h2>
      <p className={`mt-2 ${ui.body}`}>Optimized legs with stop timing</p>

      <ol className="mt-5 flex flex-col gap-4">
        {intelligence.segments.map((segment) => (
          <li
            key={segment.id}
            data-testid={`trip-segment-${segment.id}`}
            className={ui.panelInset}
          >
            <p className={`text-lg font-bold text-white`}>{segment.label}</p>
            <p className={ui.body}>
              Miles {segment.startMile.toLocaleString()} → {segment.endMile.toLocaleString()} (
              {segment.distanceMiles.toLocaleString()} mi)
            </p>
            <p className={ui.body}>Drive time: {segment.estimatedDriveTimeLabel}</p>
            {segment.endsAtStop ? (
              <p className="mt-1 font-semibold text-sky-300">Ends at: {segment.endsAtStop}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
