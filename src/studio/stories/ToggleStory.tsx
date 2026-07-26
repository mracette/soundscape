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
      active={active}
      onClick={() => {
        const next = !active;
        viewRef.current?.runAnimation(next ? "start" : "stop", 600);
        // mirror the app's boundary-commit semantics: the class flips when
        // the fade lands, not when the animation is queued
        setTimeout(() => setActive(next), 600);
      }}
    />
  );
};
