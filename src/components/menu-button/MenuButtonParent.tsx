import { useState, useContext, type ReactNode } from "react";

import { MenuButtonChild } from "./MenuButtonChild";
import { Icon, type IconName } from "./../Icon";
import { LayoutContext } from "../../contexts/contexts";
import { menuButton, menuButtonParent } from "../../styles/components/MenuButtonParent.css";
import { cx } from "../../utils/cx";

interface ChildButtonProp {
  id: string;
  autoOpen?: boolean;
  iconName?: IconName;
  icon?: ReactNode;
  content?: ReactNode;
}

interface Props {
  childButtonProps: ChildButtonProp[];
}

export const MenuButtonParent = (props: Props) => {
  const { vw, vh, isMobile } = useContext(LayoutContext)!;

  // parent button dimensions
  const height = 7 * vh;
  const width = height;

  // div position: top-left on desktop, bottom-center on mobile (thumb reach)
  const inset = 2.5 * vh;

  const childHeight = 6 * vh;
  const childWidth = childHeight;

  const separation = childWidth;

  // set state
  const [isOpen, setIsOpen] = useState(true);
  const numOfChildren = props.childButtonProps.length;

  // mobile: children fan out radially above the parent. The radius scales with
  // the viewport but is capped so the formation never feels sparse, and is
  // width-bound so the outermost orbs always stay on screen.
  const radius = Math.min(9 * vh, (100 * vw) / 2 - childWidth / 2 - inset);

  // center-to-center offset from the parent for each expanded child:
  // a horizontal row on desktop, an arc from due-left to due-right on mobile
  const childOffset = (index: number) => {
    if (!isMobile) {
      return {
        x: (width + childWidth) / 2 + separation + 2 * separation * index,
        y: 0,
      };
    }
    const angle =
      Math.PI * (numOfChildren === 1 ? 0.5 : 1 - index / (numOfChildren - 1));
    return { x: radius * Math.cos(angle), y: -radius * Math.sin(angle) };
  };

  // distance from the cluster's anchored edge to the panel's near edge; on
  // mobile the panel opens upward and must clear the radial fan
  const contentOffset = isMobile
    ? height / 2 + radius + childHeight / 2 + 1.5 * vh
    : childHeight / 2 + childHeight + (height - childHeight) / 2;

  return (
    <div
      className={menuButton}
      style={
        isMobile
          ? { bottom: inset, left: "50%", marginLeft: -width / 2 }
          : { top: inset, left: inset }
      }
    >
      <button
        className={menuButtonParent}
        style={{
          zIndex: numOfChildren + 1,
          width,
          height,
        }}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <Icon
          divClassList={cx(
            "scale-div",
            "menu-button-icon",
            isOpen && "rotate45"
          )}
          svgClassList={"icon menu-button-icon icon-line"}
          name="icon-plus"
        />
      </button>

      {props.childButtonProps.map((child, index) => (
        <MenuButtonChild
          // button content
          id={child.id}
          key={child.id}
          content={props.childButtonProps[index].content}
          // button behavior
          parentIsOpen={isOpen}
          autoOpen={child.autoOpen}
          // button appearance
          iconName={child.iconName}
          icon={child.icon}
          zIndex={numOfChildren - index}
          openOffset={childOffset(index)}
          contentOffset={contentOffset}
          width={childWidth}
          height={childHeight}
          parentWidth={width}
          parentHeight={height}
          menuWidth={width + (childWidth + separation) * (numOfChildren - 1)}
        />
      ))}
    </div>
  );
};
