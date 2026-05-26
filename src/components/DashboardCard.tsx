type DashboardCardProps = {
  title: string;
  testId: string;
  children: React.ReactNode;
};

export function DashboardCard({ title, testId, children }: DashboardCardProps) {
  return (
    <section
      data-testid={testId}
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
