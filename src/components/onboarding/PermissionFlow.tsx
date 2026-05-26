"use client";

import { useCallback, useState } from "react";
import { glass } from "@/components/ui/glass";
import { gradients } from "@/components/ui/gradients";
import { motion } from "@/components/ui/motion";
import { requestLocationAccess, supportsGeolocation } from "@/services/location/gpsClient";
import {
  setOnboardingComplete,
  setStoredPermissionState,
} from "@/services/preferences/appStorage";
import { GPSPermissionCard, type GpsPermissionStep } from "./GPSPermissionCard";
import { PrivacySummary } from "./PrivacySummary";
import { WelcomeScreen } from "./WelcomeScreen";

type FlowStep = "welcome" | "privacy" | "permission";

type PermissionFlowProps = {
  onComplete: () => void;
};

export function PermissionFlow({ onComplete }: PermissionFlowProps) {
  const [flowStep, setFlowStep] = useState<FlowStep>("welcome");
  const [permissionStep, setPermissionStep] = useState<GpsPermissionStep>("request");
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const finishOnboarding = useCallback(
    (permission: "granted" | "denied" | "skipped" | "unsupported") => {
      setStoredPermissionState(permission);
      setOnboardingComplete(true);
      onComplete();
    },
    [onComplete],
  );

  const requestGps = useCallback(async (recovery = false) => {
    if (!supportsGeolocation()) {
      setPermissionStep("unavailable");
      setPermissionMessage("GPS is not supported on this browser.");
      return;
    }

    setIsRequesting(true);
    setPermissionMessage(null);
    setStoredPermissionState("prompt");

    const result = await requestLocationAccess({ recovery });
    setIsRequesting(false);

    if (result.ok) {
      setPermissionStep("granted");
      setStoredPermissionState("granted");
      return;
    }

    setPermissionStep(result.code === "denied" ? "denied" : "unavailable");
    setPermissionMessage(result.message);
  }, []);

  return (
    <div
      data-testid="onboarding-flow"
      className={`${glass.immersive} ${gradients.page}`}
    >
      <div className={`mx-auto w-full max-w-xl flex-1 ${motion.pageEnter}`}>
        <div className="flex flex-col gap-6">
          {flowStep === "welcome" ? (
            <WelcomeScreen onContinue={() => setFlowStep("privacy")} />
          ) : null}

          {flowStep === "privacy" ? (
            <PrivacySummary
              onContinue={() => setFlowStep("permission")}
              onBack={() => setFlowStep("welcome")}
            />
          ) : null}

          {flowStep === "permission" ? (
            <GPSPermissionCard
              step={permissionStep}
              message={permissionMessage}
              isRequesting={isRequesting}
              onEnableGps={() => void requestGps(false)}
              onRetry={() => {
                setPermissionStep("request");
                setPermissionMessage(null);
                void requestGps(true);
              }}
              onBack={() => setFlowStep("privacy")}
              onContinueManual={() => {
                if (permissionStep === "granted") {
                  finishOnboarding("granted");
                  return;
                }
                finishOnboarding(
                  permissionStep === "denied" ? "denied" : "skipped",
                );
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
