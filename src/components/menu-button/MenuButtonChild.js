// libs
import React from "react";

// components
import { MenuButtonContentWrapper } from "./MenuButtonContentWrapper";
import { Icon } from "../../components/Icon";

// contexts
import { ThemeContext } from "../../contexts/contexts";

// hooks
import { useOutsideClick } from "../../hooks/useOutsideClick";

// styles
import "../../styles/components/MenuButtonChild.scss";

export const MenuButtonChild = (props) => {
  const { buttonColor, openButtonColor, contentPanelColor } = React.useContext(
    ThemeContext
  );

  const [isOpen, setIsOpen] = React.useState(props.autoOpen);

  const nodeRef = React.useRef();

  // calculate the margin needed to expand this child to its outward position
  const marginStyle = props.parentIsOpen
    ? (props.parentWidth + props.width) / 2 +
      props.separation +
      2 * props.separation * (props.index - 1)
    : 0;

  useOutsideClick(
    nodeRef,
    React.useCallback(() => {
      if (!isOpen) setIsOpen(true);
    }, [isOpen]),
    React.useCallback(() => {
      if (isOpen) setIsOpen(false);
    }, [isOpen]),
    ["menu-button-child"]
  );

  return (
    <>
      <div id="test" ref={nodeRef}>
        <button
          id="menu-button-child"
          className="menu-button-child"
          style={{
            background: isOpen ? openButtonColor : buttonColor,
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
          className="arrow"
          style={{
            borderBottomColor: contentPanelColor,
            display: !isOpen && "none",
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
