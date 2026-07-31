import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { clamp } from "../utils/mathUtils";
import { cx } from "../utils/cx";
import {
  lensVar,
  sliderCompact,
  sliderDragging,
  sliderFill,
  sliderRoot,
  sliderThumb,
  sliderTrack,
} from "../styles/components/Slider.css";

/** keyboard steps, in slider units */
const NUDGE: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
};

/** the thumb's left edge for a 0..1 fraction */
const thumbLeft = (fraction: number) =>
  `calc(${fraction} * (100% - ${lensVar}))`;

/**
 * Where the fill stops. Interpolating between the thumb's near and far edge
 * reduces to a flat share of the track, so the fill is flush with the thumb at
 * either end of the range and the channel reads full at the top of it.
 */
const fillEdge = (fraction: number) => `${fraction * 100}%`;

interface Props {
  id?: string;
  /** names the control for assistive tech; the visible heading sits above it */
  label: string;
  /** render at the reduced secondary scale (smaller channel and thumb) */
  compact?: boolean;
  /** fill the track to the right of the thumb, for values that count down */
  reverse?: boolean;
  minValue?: number;
  maxValue?: number;
  value: number;
  handleValue: (value: number) => void;
}

export const Slider = ({
  id,
  label,
  compact = false,
  reverse = false,
  minValue = 1,
  maxValue = 100,
  value,
  handleValue,
}: Props) => {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const fraction = clamp((value - minValue) / (maxValue - minValue), 0, 1);

  // the thumb's centre spans half a thumb in from each end, so pointer
  // positions map onto that inset span rather than the full element
  const valueFromPointer = (root: HTMLDivElement, clientX: number) => {
    const { left, width } = root.getBoundingClientRect();
    const thumb = thumbRef.current!.offsetWidth;
    const travel = width - thumb;
    const pointerFraction =
      travel > 0 ? (clientX - left - thumb / 2) / travel : 0;
    return minValue + clamp(pointerFraction, 0, 1) * (maxValue - minValue);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    setDragging(true);
    handleValue(valueFromPointer(e.currentTarget, e.clientX));
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    handleValue(valueFromPointer(e.currentTarget, e.clientX));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key in NUDGE) {
      handleValue(clamp(value + NUDGE[e.key], minValue, maxValue));
    } else if (e.key === "Home") {
      handleValue(minValue);
    } else if (e.key === "End") {
      handleValue(maxValue);
    } else {
      return;
    }
    e.preventDefault();
  };

  return (
    <div
      id={id}
      className={cx(sliderRoot, compact && sliderCompact, dragging && sliderDragging)}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuenow={Math.round(value)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div className={sliderTrack}>
        <div
          className={sliderFill}
          style={
            reverse
              ? { left: fillEdge(fraction), right: 0 }
              : { left: 0, right: `calc(100% - ${fillEdge(fraction)})` }
          }
        />
      </div>
      <div
        ref={thumbRef}
        className={sliderThumb}
        style={{ left: thumbLeft(fraction) }}
      />
    </div>
  );
};
