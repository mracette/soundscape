import { useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { MenuButtonContentWrapper } from "./MenuButtonContentWrapper";
import { Icon } from "../../components/Icon";
import { ThemeContext } from "../../contexts/contexts";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { menuButtonChild, arrow } from "../../styles/components/MenuButtonChild.css";
import { cx } from "../../utils/cx";

interface Props {
  id?: string;
  autoOpen?: boolean;
  parentIsOpen?: boolean;
  parentWidth: number;
  parentHeight: number;
  width: number;
  height: number;
  separation: number;
  index: number;
  zIndex?: number;
  iconName?: string;
  icon?: ReactNode;
  accentColor?: string;
  accentGlow?: string;
  menuWidth: number;
  content?: ReactNode;
  config?: unknown;
}

export const MenuButtonChild = (props: Props) => {
  const { buttonColor, openButtonColor, contentPanelColor } =
    useContext(ThemeContext)!;

  const [isOpen, setIsOpen] = useState(props.autoOpen);

  const nodeRef = useRef<HTMLDivElement>(null);

  // calculate the margin needed to expand this child to its outward position
  const marginStyle = props.parentIsOpen
    ? (props.parentWidth + props.width) / 2 +
      props.separation +
      2 * props.separation * (props.index - 1)
    : 0;

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
      <div id="test" ref={nodeRef}>
        <button
          id="menu-button-child"
          className={cx(menuButtonChild, "menu-button-child")}
          style={{
            background: isOpen ? openButtonColor : buttonColor,
            borderColor: props.accentColor ?? "white",
            boxShadow: `0 0 ${isOpen ? 16 : 8}px ${props.accentGlow ?? "rgba(255, 255, 255, 0.3)"}`,
            opacity: props.parentIsOpen ? 1 : 0,
            width: props.width,
            height: props.height,
            top: (props.parentHeight - props.height) / 2,
            left: marginStyle + (props.parentWidth - props.width) / 2,
            zIndex: props.zIndex,
          }}
        >
          <Icon
            divClassList={"icon scale-div"}
            svgClassList={"icon menu-button-icon icon-white"}
            name={props.iconName}
          />
        </button>

        {/* Arrow
            - connects button to content
            - size matches button size
            - uses a CSS trick to create an arrow with borders https://css-tricks.com/snippets/css/css-triangle/
            - TODO: implement arrow directionality based on which side the content is display and how the menu opens
            */}
        <div
          className={arrow}
          style={{
            borderBottomColor: contentPanelColor,
            display: (!isOpen && "none") as "none" | undefined,
            top: props.height + (props.parentHeight - props.height) / 2,
            left: marginStyle + (props.parentWidth - props.width) / 2,
            borderLeftWidth: props.width / 2,
            borderRightWidth: props.width / 2,
            borderBottomWidth: props.width / 2,
            borderTopWidth: 0,
          }}
        />
        <MenuButtonContentWrapper
          content={props.content}
          config={props.config}
          minWidth={props.menuWidth + props.width}
          marginTop={
            props.height / 2 +
            props.height +
            (props.parentHeight - props.height) / 2
          }
          parentIsOpen={isOpen}
        />
      </div>
    </>
  );
};
