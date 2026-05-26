import { ui } from "@/components/ui/theme";

type BroadcastPreviewProps = {
  preview: string | null;
  eventLabel?: string;
};

export function BroadcastPreview({ preview, eventLabel }: BroadcastPreviewProps) {
  return (
    <section data-testid="broadcast-preview" className={ui.panelInset}>
      <p className={ui.statLabel}>SMS preview</p>
      {eventLabel ? (
        <p className={`mt-1 text-xs font-semibold uppercase tracking-wide text-sky-400`}>
          {eventLabel}
        </p>
      ) : null}
      <pre
        data-testid="broadcast-preview-body"
        className={`mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-200`}
      >
        {preview ?? "Enable relay and add contacts to preview trip updates."}
      </pre>
    </section>
  );
}
