import type { PointerEvent } from "react";
import { cockpitGlassCompact } from "./cockpitStyles";

type MapControlsProps = {
  onRecenter?: () => void;
  onResetNorth?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

function tapHandler(action?: () => void) {
  return (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    action?.();
  };
}

export function MapControls({ onRecenter, onResetNorth, onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div
      data-testid="cockpit-map-controls"
      className="pointer-events-auto flex flex-col gap-2"
      style={{ touchAction: "manipulation" }}
    >
      <button
        type="button"
        aria-label="Reset map north"
        data-testid="cockpit-map-north"
        onPointerUp={tapHandler(onResetNorth)}
        className={`${cockpitGlassCompact} flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-lg text-white`}
      >
        ⊕
      </button>
      <button
        type="button"
        aria-label="Recenter map on route"
        data-testid="cockpit-recenter"
        onPointerUp={tapHandler(onRecenter)}
        className={`${cockpitGlassCompact} flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-lg text-cyan-300`}
      >
        ⌖
      </button>
      <div className={`${cockpitGlassCompact} flex flex-col overflow-hidden`}>
        <button
          type="button"
          aria-label="Zoom in"
          data-testid="cockpit-map-zoom-in"
          onPointerUp={tapHandler(onZoomIn)}
          className="min-h-[44px] px-3 py-2 text-lg font-bold text-white"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          data-testid="cockpit-map-zoom-out"
          onPointerUp={tapHandler(onZoomOut)}
          className="min-h-[44px] border-t border-white/10 px-3 py-2 text-lg font-bold text-white"
        >
          −
        </button>
      </div>
    </div>
  );
}
