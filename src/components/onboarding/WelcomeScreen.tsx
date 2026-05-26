import { gradients } from "@/components/ui/gradients";
import { glass } from "@/components/ui/glass";
import { motion } from "@/components/ui/motion";
import { ui } from "@/components/ui/theme";

type WelcomeScreenProps = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <section
      data-testid="onboarding-welcome"
      className={`${glass.shell} ${motion.onboardingStep} p-8`}
    >
      <span className={ui.glassSheen} aria-hidden />
      <div
        className={`relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${gradients.heroGlow} ring-1 ring-sky-400/30`}
        aria-hidden
      >
        <span className="text-3xl">🛣️</span>
      </div>
      <p className={`relative ${ui.eyebrow}`}>Welcome</p>
      <h1 className={`relative mt-2 text-4xl font-bold tracking-tight text-white`}>
        Road Companion
      </h1>
      <p className={`relative mt-4 ${ui.body}`}>
        Your premium in-car co-pilot for fuel, stops, fatigue, weather, and trip progress —
        built for night driving and one-thumb use on iPhone.
      </p>
      <ul className={`relative mt-6 space-y-2 ${ui.bodyMuted}`}>
        <li>· Glanceable operational dashboard</li>
        <li>· Live GPS with manual fallback</li>
        <li>· Dark, low-glare interface</li>
      </ul>
      <button
        type="button"
        data-testid="onboarding-welcome-continue"
        onClick={onContinue}
        className={`relative mt-8 ${ui.btnPrimaryBlock}`}
      >
        Get started
      </button>
    </section>
  );
}
