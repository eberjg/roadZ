type ErrorStateProps = {
  message: string;
  testId?: string;
};

export function ErrorState({ message, testId = "route-error" }: ErrorStateProps) {
  return (
    <div
      data-testid={testId}
      className="rounded-2xl border-2 border-red-700 bg-red-50 px-5 py-4"
      role="alert"
    >
      <p className="text-lg font-semibold text-red-900">{message}</p>
    </div>
  );
}
