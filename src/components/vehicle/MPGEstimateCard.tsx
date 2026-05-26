"use client";

import { ui } from "@/components/ui/theme";
import type { VehicleEstimate } from "@/services/vehicle/types";

type MPGEstimateCardProps = {
  estimate: VehicleEstimate;
};

export function MPGEstimateCard({ estimate }: MPGEstimateCardProps) {
  return (
    <section data-testid="mpg-estimate-card" className={ui.panelNested}>
      <h3 className={ui.h3}>Fuel estimate</h3>
      <p className={`mt-2 ${ui.body}`} data-testid="vehicle-estimate-summary">
        {estimate.summary}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <p className={ui.body} data-testid="vehicle-estimate-mpg">
          {estimate.isElectric ? "Electric" : `${estimate.highwayMpg} MPG`}
        </p>
        <p className={ui.body} data-testid="vehicle-estimate-tank">
          {estimate.isElectric ? "Battery" : `${estimate.tankGallons} gal tank`}
        </p>
        <p className={ui.body} data-testid="vehicle-estimate-range">
          ~{estimate.rangeMiles.toLocaleString()} mi range
        </p>
      </div>
    </section>
  );
}
