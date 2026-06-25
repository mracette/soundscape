import { useContext, type ReactNode } from "react";

import { LayoutContext } from "../../contexts/contexts";
import { ThemeContext } from "../../contexts/contexts";
import { menuButtonContent } from "../../styles/components/MenuButtonContentWrapper.css";

interface Props {
  content?: ReactNode;
  config?: unknown;
  minWidth?: number;
  marginTop?: number;
  parentIsOpen?: boolean;
}

export const MenuButtonContentWrapper = (props: Props) => {
  const { vw, vh } = useContext(LayoutContext)!;
  const { contentPanelColor } = useContext(ThemeContext)!;

  return (
    <div
      className={menuButtonContent}
      style={{
        visibility: (!props.parentIsOpen && "hidden") as "hidden" | undefined,
        background: contentPanelColor,
        top: props.marginTop,
        minWidth: props.minWidth,
        maxHeight: 82 * vh,
        maxWidth: 95 * vw,
        padding: 4 * vh,
      }}
    >
      {props.content}
    </div>
  );
};
