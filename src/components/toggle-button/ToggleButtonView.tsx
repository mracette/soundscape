import {
  useRef,
  useState,
  useContext,
  useEffect,
  useImperativeHandle,
  type Ref,
} from "react";
import { gsap } from "gsap";
import { LayoutContext } from "../../contexts/contexts";
import "../../styles/components/Icon.css";
import {
  toggleButton,
  toggleButtonActive,
  svgCircle,
} from "../../styles/components/ToggleButton.css";
import { glassLight } from "../../styles/settings";
import { cx } from "../../utils/cx";

const START_PARAMS = {
  backgroundColor: glassLight.tintActive,
  points:
    "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188",
};

const STOP_PARAMS = {
  // resting stopped fill matches the class's glass tint so gsap's inline
  // value never strips the resting look
  backgroundColor: glassLight.tint,
  points:
    "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100",
};

export interface ToggleButtonViewHandle {
  runAnimation: (type: "start" | "stop", durationMs: number) => void;
  /**
   * Rescale any in-flight toggle animation to finish in `remainingMs` — called
   * when a Time Warp change moves the pending commit's boundary time.
   */
  retimeAnimation: (remainingMs: number) => void;
  getButton: () => HTMLButtonElement | null;
}

interface Props {
  initialActive: boolean;
  /** committed live state — drives the glassy-white active treatment */
  active: boolean;
  onClick: () => void;
  ref?: Ref<ToggleButtonViewHandle>;
}

export const ToggleButtonView = ({
  initialActive,
  active,
  onClick,
  ref,
}: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<SVGSVGElement>(null);
  const iconDivRef = useRef<HTMLDivElement>(null);
  const iconPolyRef = useRef<SVGPolygonElement>(null);

  const { vh } = useContext(LayoutContext)!;
  // 6vh diameter, matching the radial-menu child buttons
  const buttonRadius = vh ? vh * 3 : 0;
  const buttonBorder = vh ? (vh * 3) / 15 : 0;

  // The ring's resting offset is seeded once from initialActive; gsap owns
  // strokeDashoffset thereafter (each animation ends at the correct resting
  // value). The prop is read only at mount by design: re-reading a live value on
  // every render would let the active->stopped re-render reset the offset out
  // from under gsap, snapping or flashing the ring instead of letting it animate.
  const [restingActive] = useState(initialActive);

  const circumference = 2 * Math.PI * (buttonRadius - buttonBorder / 2);
  // Latest geometry for gsap callbacks, which capture values at tween creation.
  const circumferenceRef = useRef(circumference);
  // The state the ring rests at once tweens settle — active means full offset.
  const restingActiveRef = useRef(initialActive);

  // Because gsap owns strokeDashoffset (see restingActive above), React never
  // rewrites it — but the "active" resting value depends on the circumference,
  // which changes with the viewport. On resize, rewrite the DOM value to the
  // new circumference when the ring is resting active; mid-sweep, the start
  // tween's onComplete settles it instead.
  useEffect(() => {
    const prev = circumferenceRef.current;
    circumferenceRef.current = circumference;
    const circleSvg = circleRef.current;
    if (!circleSvg || prev === circumference) return;
    if (restingActiveRef.current && !gsap.isTweening(circleSvg)) {
      gsap.set(circleSvg, { strokeDashoffset: circumference });
    }
  }, [circumference]);

  useImperativeHandle(
    ref,
    () => ({
      getButton: () => buttonRef.current,
      retimeAnimation: (remainingMs) => {
        const remaining = Math.max(remainingMs, 1) / 1000;
        const iconDiv = iconDivRef.current!;
        const targets = [
          circleRef.current!,
          iconPolyRef.current!,
          iconDiv,
          ...iconDiv.children,
          buttonRef.current!,
        ];
        // timeScale rescales a tween's remaining local time onto the new real
        // remaining time, preserving each tween's ease and end values.
        gsap.getTweensOf(targets).forEach((tween) => {
          const left = tween.duration() - tween.time();
          if (left > 0) tween.timeScale(left / remaining);
        });
      },
      runAnimation: (type, durationMs) => {
        const seconds = durationMs / 1000;
        const circleSvg = circleRef.current!;
        const iconDiv = iconDivRef.current!;
        const iconPoly = iconPolyRef.current!;
        const button = buttonRef.current!;

        // clear queue
        gsap.killTweensOf(circleSvg);
        gsap.killTweensOf(iconPoly);
        gsap.killTweensOf(iconDiv);
        gsap.killTweensOf([...iconDiv.children]);
        gsap.killTweensOf(button);

        let points: string;
        let backgroundColor: string;
        let rotateZ: number;

        restingActiveRef.current = type === "start";

        if (type === "start") {
          rotateZ = -180;
          backgroundColor = START_PARAMS.backgroundColor;
          points = START_PARAMS.points;

          // sweep always begins from a 0 offset regardless of current value
          gsap.fromTo(
            circleSvg,
            { strokeDashoffset: 0 },
            {
              strokeDashoffset: 2 * Math.PI * (buttonRadius - buttonBorder / 2),
              duration: seconds,
              ease: "none",
              // settle to the latest circumference — a resize mid-sweep would
              // otherwise leave the ring at the stale pre-resize target
              onComplete: () => {
                gsap.set(circleSvg, {
                  strokeDashoffset: circumferenceRef.current,
                });
              },
            }
          );
        } else {
          rotateZ = 0;
          backgroundColor = STOP_PARAMS.backgroundColor;
          points = STOP_PARAMS.points;

          gsap.to(circleSvg, {
            strokeDashoffset: 0,
            duration: seconds,
            ease: "none",
          });
        }

        // run icon animation (morph polygon points)
        gsap.to(iconPoly, {
          attr: { points },
          duration: seconds,
          ease: "none",
        });

        // run rotate animation
        gsap.to([iconDiv, ...iconDiv.children], {
          rotation: rotateZ,
          duration: seconds,
          ease: "none",
        });

        // run button animation
        gsap.to(button, {
          backgroundColor,
          duration: seconds,
          ease: "power2.in",
        });
      },
    }),
    [buttonRadius, buttonBorder]
  );

  return (
    <button
      className={cx(toggleButton, active && toggleButtonActive)}
      data-testid="toggle-button"
      ref={buttonRef}
      onClick={onClick}
      style={{
        cursor: "pointer",
        height: buttonRadius * 2,
        width: buttonRadius * 2,
      }}
    >
      <svg
        className="svg"
        ref={circleRef}
        width={2 * buttonRadius}
        height={2 * buttonRadius}
        style={{
          strokeDashoffset: restingActive
            ? 2 * Math.PI * (buttonRadius - buttonBorder / 2)
            : 0,
        }}
      >
        <circle
          className={svgCircle}
          cx={buttonRadius}
          cy={buttonRadius}
          r={buttonRadius - buttonBorder / 2}
          style={{
            strokeWidth: buttonBorder,
            strokeDasharray: 2 * Math.PI * (buttonRadius - buttonBorder / 2),
          }}
        />
      </svg>

      <div className="scale-div-morph toggle-icon" ref={iconDivRef}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="toggle-icon icon-white"
        >
          <polygon
            id="icon-play3-poly"
            className="icon icon-white"
            points={STOP_PARAMS.points}
            ref={iconPolyRef}
          />
        </svg>
      </div>
    </button>
  );
};
