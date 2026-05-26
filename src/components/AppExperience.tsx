"use client";

import { useSyncExternalStore } from "react";
import { PermissionFlow } from "@/components/onboarding/PermissionFlow";
import { HomeDashboard } from "@/components/trip/HomeDashboard";
import { VehicleProfileWizard } from "@/components/vehicle/VehicleProfileWizard";
import { motion } from "@/components/ui/motion";
import {
  isOnboardingComplete,
  subscribeAppStorage,
} from "@/services/preferences/appStorage";
import {
  isVehicleProfileComplete,
  subscribeVehicleProfile,
} from "@/services/vehicle/vehicleStorage";

export function AppExperience() {
  const onboardingComplete = useSyncExternalStore(
    subscribeAppStorage,
    () => isOnboardingComplete(),
    () => false,
  );

  const vehicleProfileComplete = useSyncExternalStore(
    subscribeVehicleProfile,
    () => isVehicleProfileComplete(),
    () => false,
  );

  if (!onboardingComplete) {
    return <PermissionFlow onComplete={() => {}} />;
  }

  if (!vehicleProfileComplete) {
    return <VehicleProfileWizard onComplete={() => {}} />;
  }

  return (
    <div data-testid="app-dashboard" className={motion.dashboard}>
      <HomeDashboard />
    </div>
  );
}
