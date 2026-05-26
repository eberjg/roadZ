"use client";

import { useSyncExternalStore } from "react";
import { PermissionFlow } from "@/components/onboarding/PermissionFlow";
import { HomeDashboard } from "@/components/trip/HomeDashboard";
import { motion } from "@/components/ui/motion";
import {
  isOnboardingComplete,
  subscribeAppStorage,
} from "@/services/preferences/appStorage";

export function AppExperience() {
  const onboardingComplete = useSyncExternalStore(
    subscribeAppStorage,
    () => isOnboardingComplete(),
    () => false,
  );

  if (!onboardingComplete) {
    return <PermissionFlow onComplete={() => {}} />;
  }

  return (
    <div data-testid="app-dashboard" className={motion.dashboard}>
      <HomeDashboard />
    </div>
  );
}
