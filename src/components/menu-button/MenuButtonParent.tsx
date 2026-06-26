import { useState, useContext, type ReactNode } from "react";

import { MenuButtonChild } from "./MenuButtonChild";
import { Icon } from "./../Icon";
import { ThemeContext } from "../../contexts/contexts";
import { LayoutContext } from "../../contexts/contexts";
import { menuButton, menuButtonParent } from "../../styles/components/MenuButtonParent.css";
import { cx } from "../../utils/cx";

interface ChildButtonProp {
  id: string;
  autoOpen?: boolean;
  iconName?: string;
  icon?: ReactNode;
  content?: ReactNode;
}

interface Props {
  childButtonProps: ChildButtonProp[];
}

export const MenuButtonParent = (props: Props) => {
  const { vh } = useContext(LayoutContext)!;
  const { buttonColor } = useContext(ThemeContext)!;

  // parent button dimensions
  const height = 7 * vh;
  const width = height;

  // div position
  const top = 2.5 * vh;
  const left = top;

  const childHeight = 0.7 * height;
  const childWidth = childHeight;

  const separation = childWidth;

  // set state
  const [isOpen, setIsOpen] = useState(true);
  const numOfChildren = props.childButtonProps.length;

  return (
    <div
      className={menuButton}
      style={{
        top,
        left,
      }}
    >
      <button
        className={cx(menuButtonParent, isOpen && "menu-button-parent-open")}
        style={{
          zIndex: numOfChildren + 1,
          width,
          height,
          background: buttonColor,
        }}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <Icon
          divClassList={`scale-div menu-button-icon icon-white ${
            isOpen ? "rotate45" : ""
          }`}
          svgClassList={"icon menu-button-icon icon-white"}
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
          index={index + 1}
          parentIsOpen={isOpen}
          autoOpen={child.autoOpen}
          // button appearance
          iconName={child.iconName}
          icon={child.icon}
          zIndex={numOfChildren - index}
          separation={separation}
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
