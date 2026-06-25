import { useRef, useContext, useImperativeHandle, type Ref } from "react";
import { gsap } from "gsap";
import { LayoutContext } from "../../contexts/contexts";
import "../../styles/components/Icon.css";
import "../../styles/components/ToggleButton.css";

const START_PARAMS = {
  rotateZ: "-180",
  backgroundColor: "rgba(255, 255, 255, .3)",
  points:
    "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188",
};

const STOP_PARAMS = {
  rotateZ: "0",
  backgroundColor: "rgba(255, 255, 255, 0)",
  points:
    "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100",
};

export interface ToggleButtonViewHandle {
  runAnimation: (type: "start" | "stop", durationMs: number) => void;
  getButton: () => HTMLButtonElement | null;
}

interface Props {
  active: boolean;
  onClick: () => void;
  ref?: Ref<ToggleButtonViewHandle>;
}

export const ToggleButtonView = ({ active, onClick, ref }: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<SVGSVGElement>(null);
  const iconDivRef = useRef<HTMLDivElement>(null);
  const iconPolyRef = useRef<SVGPolygonElement>(null);

  const { vh } = useContext(LayoutContext)!;
  const buttonRadius = vh ? vh * 3.5 : 0;
  const buttonBorder = vh ? (vh * 3.5) / 15 : 0;

  useImperativeHandle(
    ref,
    () => ({
      getButton: () => buttonRef.current,
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
      className="toggle-button"
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
          strokeDashoffset: active
            ? 2 * Math.PI * (buttonRadius - buttonBorder / 2)
            : 0,
        }}
      >
        <circle
          className="svg-circle"
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
