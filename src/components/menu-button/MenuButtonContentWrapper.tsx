import { useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import { LayoutContext } from "../../contexts/contexts";
import { menuButtonContent } from "../../styles/components/MenuButtonContentWrapper.css";

/**
 * The Voices panel is the largest panel that must never scroll. Its footprint
 * in vh design units (content plus panel padding), assuming the app-config
 * maxima: 5 voice orbs per row (6 units each + 3-unit gaps) and 5 groups
 * (8-unit header + 6-unit orb row each).
 */
const PANEL_UNITS_W = 50;
const PANEL_UNITS_H = 92;

interface Props {
  content?: ReactNode;
  config?: unknown;
  minWidth?: number;
  /** Distance from the menu cluster's anchored edge to the panel's near edge */
  offset?: number;
  parentIsOpen?: boolean;
}

export const MenuButtonContentWrapper = (props: Props) => {
  const { vw, vh, isMobile } = useContext(LayoutContext)!;

  // vertical room between a 2.5vh top screen inset and the radial fan
  const availableHeight = 95 * vh - (props.offset ?? 0);

  // Panel content is designed in vh units; on mobile, shrink the unit until
  // the no-scroll footprint fits the panel's width and height. On desktop the
  // pure vh unit always fits, as it always has.
  const unit = isMobile
    ? Math.min(vh, (95 * vw) / PANEL_UNITS_W, availableHeight / PANEL_UNITS_H)
    : vh;

  // content reads the unit two ways: JS sizes via LayoutContext (the voice
  // orbs) and stylesheet sizes via the --vh custom property
  const scaledLayout = useMemo(
    () => ({ vw, vh: unit, isMobile }),
    [vw, unit, isMobile]
  );

  return (
    <div
      className={menuButtonContent}
      style={
        {
          visibility: (!props.parentIsOpen && "hidden") as
            | "hidden"
            | undefined,
          // the cluster is bottom-center on mobile: the panel opens upward
          // and fills all the space the fan leaves free
          ...(isMobile
            ? {
                bottom: props.offset,
                left: "50%",
                transform: "translateX(-50%)",
                width: 95 * vw,
                boxSizing: "border-box" as const,
                maxHeight: availableHeight,
              }
            : {
                top: props.offset,
                minWidth: props.minWidth,
                maxHeight: 82 * vh,
              }),
          maxWidth: 95 * vw,
          padding: 4 * unit,
          ["--vh" as string]: `${unit}px`,
        } as CSSProperties
      }
    >
      <LayoutContext.Provider value={scaledLayout}>
        {props.content}
      </LayoutContext.Provider>
    </div>
  );
};
