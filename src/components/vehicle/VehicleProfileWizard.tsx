"use client";

import { useMemo, useState } from "react";
import { glass } from "@/components/ui/glass";
import { gradients } from "@/components/ui/gradients";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";
import { estimateVehicle } from "@/services/vehicle/vehicleEstimator";
import { listModelsForMake, listVehicleMakes } from "@/services/vehicle/vehicleDatabase";
import { setVehicleProfile } from "@/services/vehicle/vehicleStorage";
import type { VehicleDrivetrain, VehicleFuelType, VehicleProfile } from "@/services/vehicle/types";
import { MPGEstimateCard } from "./MPGEstimateCard";

type VehicleProfileWizardProps = {
  onComplete: () => void;
};

export function VehicleProfileWizard({ onComplete }: VehicleProfileWizardProps) {
  const makes = useMemo(() => listVehicleMakes(), []);
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Camry");
  const [year, setYear] = useState("2018");
  const [drivetrain, setDrivetrain] = useState<VehicleDrivetrain | "">("");
  const [fuelType, setFuelType] = useState<VehicleFuelType>("gas");
  const [step, setStep] = useState<"details" | "review">("details");

  const models = useMemo(() => listModelsForMake(make), [make]);

  const draftProfile: VehicleProfile = {
    make,
    model,
    year: Number(year) || 2018,
    drivetrain: drivetrain || undefined,
    fuelType,
    profileComplete: false,
  };

  const estimate = estimateVehicle(draftProfile);

  function saveAndFinish() {
    setVehicleProfile({
      ...draftProfile,
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
            A few details help roadZ estimate MPG, tank size, and range automatically.
          </p>

          {step === "details" ? (
            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                setStep("review");
              }}
            >
              <label className="block">
                <span className={ui.label}>Make</span>
                <select
                  data-testid="wizard-vehicle-make"
                  value={make}
                  onChange={(event) => {
                    setMake(event.target.value);
                    const nextModels = listModelsForMake(event.target.value);
                    setModel(nextModels[0] ?? "");
                  }}
                  className={ui.input}
                >
                  {makes.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={ui.label}>Model</span>
                <select
                  data-testid="wizard-vehicle-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className={ui.input}
                >
                  {models.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={ui.label}>Year</span>
                <input
                  data-testid="wizard-vehicle-year"
                  type="number"
                  min="1990"
                  max="2030"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={ui.input}
                />
              </label>

              <label className="block">
                <span className={ui.label}>Drivetrain (optional)</span>
                <select
                  data-testid="wizard-vehicle-drivetrain"
                  value={drivetrain}
                  onChange={(event) =>
                    setDrivetrain(event.target.value as VehicleDrivetrain | "")
                  }
                  className={ui.input}
                >
                  <option value="">Not sure</option>
                  <option value="fwd">FWD</option>
                  <option value="rwd">RWD</option>
                  <option value="awd">AWD</option>
                  <option value="4wd">4WD</option>
                  <option value="electric">Electric</option>
                </select>
              </label>

              <label className="block">
                <span className={ui.label}>Fuel type (optional)</span>
                <select
                  data-testid="wizard-vehicle-fuel"
                  value={fuelType}
                  onChange={(event) => setFuelType(event.target.value as VehicleFuelType)}
                  className={ui.input}
                >
                  <option value="gas">Gasoline</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                </select>
              </label>

              <button type="submit" data-testid="wizard-vehicle-next" className={ui.btnPrimaryBlock}>
                See fuel estimate
              </button>
            </form>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <MPGEstimateCard estimate={estimate} />
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
