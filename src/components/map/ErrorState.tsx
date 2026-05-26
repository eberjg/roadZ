import { ui } from "@/components/ui/theme";

type ErrorStateProps = {
  message: string;
  testId?: string;
};

export function ErrorState({ message, testId = "route-error" }: ErrorStateProps) {
  return (
    <div data-testid={testId} className={ui.errorBox} role="alert">
      <p className={ui.errorText}>{message}</p>
    </div>
  );
}
