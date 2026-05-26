import type { ReactNode } from "react";
import { cn } from "@/components/ui/theme";

type OverlayPosition = "top" | "bottom" | "left" | "right";

type SmartOverlayProps = {
  position: OverlayPosition;
  children: ReactNode;
  className?: string;
  testId?: string;
};

const positionClasses: Record<OverlayPosition, string> = {
  top: "top-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md",
  bottom: "bottom-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-lg",
  left: "left-3 top-1/2 -translate-y-1/2 max-w-[10rem] sm:max-w-[12rem]",
  right: "right-3 top-1/2 -translate-y-1/2 max-w-[10rem] sm:max-w-[12rem]",
};

export function SmartOverlay({ position, children, className, testId }: SmartOverlayProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "pointer-events-none absolute z-20",
        positionClasses[position],
        className,
      )}
    >
      {children}
    </div>
  );
}
