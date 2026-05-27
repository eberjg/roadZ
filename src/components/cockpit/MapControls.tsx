import { cockpitGlassCompact } from "./cockpitStyles";

type MapControlsProps = {
  onRecenter?: () => void;
  onResetNorth?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

export function MapControls({ onRecenter, onResetNorth, onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div
      data-testid="cockpit-map-controls"
      className="pointer-events-auto flex flex-col gap-2"
    >
      <button
        type="button"
        aria-label="Reset map north"
        data-testid="cockpit-map-north"
        onClick={onResetNorth}
        className={`${cockpitGlassCompact} flex h-10 w-10 items-center justify-center text-lg text-white`}
      >
        ⊕
      </button>
      <button
        type="button"
        aria-label="Recenter map on route"
        data-testid="cockpit-recenter"
        onClick={onRecenter}
        className={`${cockpitGlassCompact} flex h-10 w-10 items-center justify-center text-lg text-cyan-300`}
      >
        ⌖
      </button>
      <div className={`${cockpitGlassCompact} flex flex-col overflow-hidden`}>
        <button
          type="button"
          aria-label="Zoom in"
          data-testid="cockpit-map-zoom-in"
          onClick={onZoomIn}
          className="px-3 py-2 text-lg font-bold text-white"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          data-testid="cockpit-map-zoom-out"
          onClick={onZoomOut}
          className="border-t border-white/10 px-3 py-2 text-lg font-bold text-white"
        >
          −
        </button>
      </div>
    </div>
  );
}
