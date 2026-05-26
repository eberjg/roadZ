"use client";

import { useState } from "react";
import { glass } from "@/components/ui/glass";
import { gradients } from "@/components/ui/gradients";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";
import { defaultVehicleProfile } from "@/services/vehicle/vehicleEstimator";
import { setVehicleProfile } from "@/services/vehicle/vehicleStorage";
import type { VehicleProfile } from "@/services/vehicle/types";
import { VehicleSelector } from "./VehicleSelector";

type VehicleProfileWizardProps = {
  onComplete: () => void;
};

export function VehicleProfileWizard({ onComplete }: VehicleProfileWizardProps) {
  const [profile, setProfile] = useState<VehicleProfile>({
    ...defaultVehicleProfile,
    profileComplete: false,
  });
  const [step, setStep] = useState<"details" | "review">("details");

  function saveAndFinish() {
    setVehicleProfile({
      ...profile,
      profileComplete: true,
    });
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
          <p className={`mt-2 ${ui.body}`}>
            Choose make, model, year, and trim — roadZ fills MPG and range from EPA data.
          </p>

          {step === "details" ? (
            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                setStep("review");
              }}
            >
              <VehicleSelector value={profile} onChange={setProfile} />
              <button type="submit" data-testid="wizard-vehicle-next" className={ui.btnPrimaryBlock}>
                Continue
              </button>
            </form>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <VehicleSelector value={profile} onChange={setProfile} showEstimate />
              <button
                type="button"
                data-testid="wizard-vehicle-save"
                onClick={saveAndFinish}
                className={ui.btnPrimaryBlock}
              >
                Save vehicle & continue
              </button>
              <button
                type="button"
                data-testid="wizard-vehicle-back"
                onClick={() => setStep("details")}
                className={ui.btnSecondary}
              >
                Back
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
