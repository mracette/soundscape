import { useCallback, useRef, useState, type ReactNode } from "react";

import { MenuButtonContentWrapper } from "./MenuButtonContentWrapper";
import { Icon, type IconName } from "../../components/Icon";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import {
  menuButtonChild,
  menuButtonChildOpen,
} from "../../styles/components/MenuButtonChild.css";
import { cx } from "../../utils/cx";

interface Props {
  id?: string;
  autoOpen?: boolean;
  parentIsOpen?: boolean;
  parentWidth: number;
  parentHeight: number;
  width: number;
  height: number;
  /** Center-to-center offset from the parent when the menu is expanded */
  openOffset: { x: number; y: number };
  /** Distance from the cluster's anchored edge to the panel's near edge */
  contentOffset: number;
  zIndex?: number;
  iconName?: IconName;
  icon?: ReactNode;
  menuWidth: number;
  content?: ReactNode;
  config?: unknown;
}

export const MenuButtonChild = (props: Props) => {
  const [isOpen, setIsOpen] = useState(props.autoOpen);

  const nodeRef = useRef<HTMLDivElement>(null);

  // collapsed children sit centered under the parent; expanded ones move to
  // their formation position
  const dx = props.parentIsOpen ? props.openOffset.x : 0;
  const dy = props.parentIsOpen ? props.openOffset.y : 0;

  // 4th arg is passed but useOutsideClick only accepts 3; the extra arg is ignored at runtime
  (useOutsideClick as (...args: unknown[]) => void)(
    nodeRef,
    useCallback(() => {
      if (!isOpen) setIsOpen(true);
    }, [isOpen]),
    useCallback(() => {
      if (isOpen) setIsOpen(false);
    }, [isOpen]),
    [menuButtonChild]
  );

  return (
    <>
      <div ref={nodeRef}>
        <button
          className={cx(menuButtonChild, isOpen && menuButtonChildOpen)}
          data-testid="menu-button-child"
          style={{
            opacity: props.parentIsOpen ? 1 : 0,
            width: props.width,
            height: props.height,
            top: (props.parentHeight - props.height) / 2 + dy,
            left: (props.parentWidth - props.width) / 2 + dx,
            zIndex: props.zIndex,
          }}
        >
          <Icon
            divClassList={"icon scale-div"}
            svgClassList={"icon menu-button-icon icon-line"}
            name={props.iconName!}
          />
        </button>

        <MenuButtonContentWrapper
          content={props.content}
          config={props.config}
          minWidth={props.menuWidth + props.width}
          offset={props.contentOffset}
          parentIsOpen={isOpen}
        />
      </div>
    </>
  );
};
