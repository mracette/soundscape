// libs
import React, { useState, useContext } from "react";

// components
import { MenuButtonChild } from "./MenuButtonChild";
import { Icon } from "./../Icon";

// contexts
import { ThemeContext } from "../../contexts/contexts";
import { LayoutContext } from "../../contexts/contexts";

// styles
import "../../styles/components/MenuButtonParent.scss";

export const MenuButtonParent = (props) => {
  const { vh } = useContext(LayoutContext);
  const { buttonColor } = useContext(ThemeContext);

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
      className="menu-button"
      style={{
        top,
        left,
        // visibility: isLoading ? "hidden" : "visible",
      }}
    >
      <button
        className={
          isOpen
            ? `menu-button-parent menu-button-parent-open`
            : `menu-button-parent`
        }
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
