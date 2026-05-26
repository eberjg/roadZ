"use client";

import { useState } from "react";
import { glass } from "@/components/ui/glass";
import { gradients } from "@/components/ui/gradients";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";
import { defaultVehicleProfile } from "@/services/vehicle/vehicleEstimator";
import { setVehicleProfile } from "@/services/vehicle/vehicleStorage";
import type { VehicleProfile } from "@/services/vehicle/types";
import { VehicleForm } from "./VehicleForm";

type VehicleProfileWizardProps = {
  onComplete: () => void;
};

export function VehicleProfileWizard({ onComplete }: VehicleProfileWizardProps) {
  const [profile, setProfile] = useState<VehicleProfile>({
    ...defaultVehicleProfile,
    profileComplete: false,
  });

  function saveAndFinish() {
    setVehicleProfile({ ...profile, profileComplete: true });
    onComplete();
  }

  return (
    <div
      data-testid="vehicle-profile-wizard"
      className={`${glass.immersive} ${gradients.page}`}
    >
      <div className={`mx-auto w-full max-w-xl flex-1 ${motion.pageEnter}`}>
        <section className={ui.panel}>
          <h2 className={ui.h2}>Your vehicle</h2>
          <p className={`mt-2 text-sm ${ui.bodyMuted}`}>
            EPA MPG plus your usual fill amount. Live fuel updates from how you actually drive.
          </p>

          <div className="mt-6 space-y-4">
            <VehicleForm
              value={profile}
              onChange={setProfile}
              defaultExpanded
              showGasPrice
              gasPrice="3.85"
              onGasPriceChange={() => {}}
            />
            <button
              type="button"
              data-testid="wizard-vehicle-save"
              onClick={saveAndFinish}
              className={ui.btnPrimaryBlock}
            >
              Save & continue
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
