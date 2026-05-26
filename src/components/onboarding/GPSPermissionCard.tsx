"use client";

import { ui } from "@/components/ui/theme";
import { motion } from "@/components/ui/motion";
import { animations } from "@/components/ui/animations";

export type GpsPermissionStep = "request" | "granted" | "denied" | "unavailable";

type GPSPermissionCardProps = {
  step: GpsPermissionStep;
  message?: string | null;
  isRequesting: boolean;
  onEnableGps: () => void;
  onContinueManual: () => void;
  onRetry?: () => void;
  onBack?: () => void;
};

export function GPSPermissionCard({
  step,
  message,
  isRequesting,
  onEnableGps,
  onContinueManual,
  onRetry,
  onBack,
}: GPSPermissionCardProps) {
  return (
    <section
      data-testid="onboarding-permission"
      className={`${ui.glassShell} ${motion.onboardingStep} p-6`}
    >
      <span className={ui.glassSheen} aria-hidden />
      <h2 className={`relative ${ui.h2}`}>Enable GPS</h2>
      <p className={`relative mt-2 ${ui.body}`}>
        Allow location so we can track trip progress, movement, and driving session time while
        you drive.
      </p>

      {step === "request" ? (
        <div className={`relative mt-6 ${ui.panelInset}`}>
          <p className={ui.bodyMuted}>
            Tap below — Safari will show a system prompt. Choose <strong className="text-white">Allow</strong>.
          </p>
        </div>
      ) : null}

      {step === "granted" ? (
        <div
          data-testid="onboarding-permission-success"
          className={`relative mt-6 ${ui.successBox}`}
        >
          <p className={ui.successText}>Location enabled. You are ready to drive.</p>
        </div>
      ) : null}

      {step === "denied" || step === "unavailable" ? (
        <div
          data-testid="onboarding-permission-denied"
          className={`relative mt-6 ${ui.errorBox} ${animations.pulseAlert}`}
        >
          <p className={ui.errorText}>
            {message ??
              (step === "denied"
                ? "GPS permission denied. You can enable it in Safari settings or continue in manual mode."
                : "GPS unavailable on this device or connection.")}
          </p>
          <ul className={`mt-4 list-disc space-y-2 pl-5 ${ui.bodyMuted}`}>
            <li>Safari → address bar → aA → Website Settings → Location → Allow</li>
            <li>Reload this page after changing that setting (pull to refresh or close the tab)</li>
            <li>Then tap Try again below</li>
            <li>iPhone Settings → Privacy → Location Services → on</li>
          </ul>
        </div>
      ) : null}

      <div className="relative mt-8 flex flex-col gap-3">
        {step === "request" ? (
          <button
            type="button"
            data-testid="onboarding-enable-gps"
            disabled={isRequesting}
            onClick={onEnableGps}
            className={ui.btnPrimaryBlock}
          >
            {isRequesting ? "Requesting…" : "Enable GPS"}
          </button>
        ) : null}

        {step === "granted" ? (
          <button
            type="button"
            data-testid="onboarding-enter-dashboard"
            onClick={onContinueManual}
            className={ui.btnPrimaryBlock}
          >
            Enter dashboard
          </button>
        ) : null}

        {(step === "denied" || step === "unavailable") && onRetry ? (
          <button
            type="button"
            data-testid="onboarding-retry-gps"
            onClick={onRetry}
            className={ui.btnSecondary}
          >
            Try again
          </button>
        ) : null}

        {step === "denied" || step === "unavailable" || step === "request" ? (
          <button
            type="button"
            data-testid="onboarding-continue-manual"
            onClick={onContinueManual}
            className={ui.btnSecondary}
          >
            Continue in manual mode
          </button>
        ) : null}

        {onBack ? (
          <button type="button" onClick={onBack} className={ui.btnGhost}>
            Back
          </button>
        ) : null}
      </div>
    </section>
  );
}
