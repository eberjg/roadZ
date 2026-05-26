import { ui } from "@/components/ui/theme";

type DashboardCardProps = {
  title: string;
  testId: string;
  children: React.ReactNode;
};

export function DashboardCard({ title, testId, children }: DashboardCardProps) {
  return (
    <section data-testid={testId} className={ui.panel}>
      <h2 className={`mb-4 ${ui.h2}`}>{title}</h2>
      {children}
    </section>
  );
}
