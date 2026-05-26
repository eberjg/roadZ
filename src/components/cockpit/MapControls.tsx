import { cockpitGlassCompact } from "./cockpitStyles";

type MapControlsProps = {
  onRecenter?: () => void;
};

export function MapControls({ onRecenter }: MapControlsProps) {
  return (
    <div
      data-testid="cockpit-map-controls"
      className="pointer-events-auto flex flex-col gap-2"
    >
      <button
        type="button"
        aria-label="Compass"
        className={`${cockpitGlassCompact} flex h-10 w-10 items-center justify-center text-lg text-white`}
      >
        ⊕
      </button>
      <button
        type="button"
        aria-label="Recenter map"
        data-testid="cockpit-recenter"
        onClick={onRecenter}
        className={`${cockpitGlassCompact} flex h-10 w-10 items-center justify-center text-lg text-cyan-300`}
      >
        ⌖
      </button>
      <div className={`${cockpitGlassCompact} flex flex-col overflow-hidden`}>
        <button type="button" className="px-3 py-2 text-lg font-bold text-white">
          +
        </button>
        <button type="button" className="border-t border-white/10 px-3 py-2 text-lg font-bold text-white">
          −
        </button>
      </div>
    </div>
  );
}
