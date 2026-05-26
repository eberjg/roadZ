import { ui } from "@/components/ui/theme";
import { motion } from "@/components/ui/motion";

const bullets = [
  {
    title: "Local-only tracking",
    body: "GPS stays on your device during the trip. We do not send your live location to our servers.",
  },
  {
    title: "No external telemetry storage",
    body: "No third-party tracking pixels or location databases for your drive history.",
  },
  {
    title: "Trip assistance only",
    body: "Location is used for progress, fatigue awareness, and operational alerts while you drive.",
  },
] as const;

type PrivacySummaryProps = {
  onContinue: () => void;
  onBack?: () => void;
};

export function PrivacySummary({ onContinue, onBack }: PrivacySummaryProps) {
  return (
    <section
      data-testid="onboarding-privacy"
      className={`${ui.glassShell} ${motion.onboardingStep} p-6`}
    >
      <span className={ui.glassSheen} aria-hidden />
      <h2 className={`relative ${ui.h2}`}>Your privacy</h2>
      <p className={`relative mt-2 ${ui.body}`}>
        roadZ uses GPS only to help you on this trip — nothing more.
      </p>

      <ul className="relative mt-6 flex flex-col gap-4">
        {bullets.map((item, index) => (
          <li
            key={item.title}
            className={`${ui.panelInset} ${motion.cardEnter}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="font-semibold text-white">{item.title}</p>
            <p className={`mt-1 ${ui.bodyMuted}`}>{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 flex flex-col gap-3">
        <button
          type="button"
          data-testid="onboarding-privacy-continue"
          onClick={onContinue}
          className={ui.btnPrimaryBlock}
        >
          Continue to GPS
        </button>
        {onBack ? (
          <button type="button" onClick={onBack} className={ui.btnGhost}>
            Back
          </button>
        ) : null}
      </div>
    </section>
  );
}
