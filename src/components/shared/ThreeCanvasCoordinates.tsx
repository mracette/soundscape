import { useThree } from "@react-three/fiber";
import { CanvasCoordinates } from "crco-utils";
import { createContext, ReactNode, useMemo } from "react";

// @ts-ignore
export const ThreeCanvasCoordinatesContext = createContext<CanvasCoordinates>();

interface ThreeCanvasCoordinatesProps {
  children?: ReactNode;
  options?: Partial<CanvasCoordinates>;
}

export const ThreeCanvasCoordinates = ({
  children,
  options,
}: ThreeCanvasCoordinatesProps) => {
  const { size } = useThree();

  const coords = useMemo(() => {
    /**
     * It doesn't matter if the coords system doesn't use the DPR
     * using client dimensions keeps it inline with the default
     * \@react-three/fiber camera settings.
     */
    return new CanvasCoordinates({
      ...options,
      baseWidth: size.width,
      baseHeight: size.height,
      offsetX: size.width / -2,
      offsetY: size.height / -2,
    });
  }, [size, options]);

  if (!coords) return null;

  return (
    <ThreeCanvasCoordinatesContext.Provider value={coords}>
      {children}
    </ThreeCanvasCoordinatesContext.Provider>
  );
};
