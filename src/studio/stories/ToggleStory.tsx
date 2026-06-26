import { useRef, useState } from "react";
import {
  ToggleButtonView,
  type ToggleButtonViewHandle,
} from "../../components/toggle-button/ToggleButtonView";

export const ToggleStory = () => {
  const viewRef = useRef<ToggleButtonViewHandle>(null);
  const [active, setActive] = useState(false);
  return (
    <ToggleButtonView
      ref={viewRef}
      initialActive={false}
      onClick={() => {
        const next = !active;
        setActive(next);
        viewRef.current?.runAnimation(next ? "start" : "stop", 600);
      }}
    />
  );
};
