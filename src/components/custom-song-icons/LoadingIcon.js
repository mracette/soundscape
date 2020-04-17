// libs
import React from "react";
import { boundedSin, TAU } from "crco-utils";

// components
import { CustomSongIcon } from "./CustomSongIcon";

// styles
import "../../styles/components/CustomSongIcons.scss";

const period = 2;
const bsin = boundedSin(period, 0, 1, 0);
const gridSize = 16;

const animateLoading = (context, cycle, coords) => {
  const r = coords.getHeight() / 64;

  context.fillStyle = "#f6f2d5";
  context.globalCompositeOperation = "source-over";

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const p = [
        -1 + (2 * (i + 0.5)) / gridSize,
        -1 + (2 * (j + 0.5)) / gridSize,
      ];

      context.beginPath();
      context.arc(
        coords.nx(p[0]),
        coords.ny(p[1]),
        bsin(cycle - 1.75 * (i / gridSize) * (j / gridSize) * period) * r,
        0,
        TAU
      );
      context.fill();
    }
  }

  context.globalCompositeOperation = "destination-atop";
  context.beginPath();
  context.fillStyle = "#1f262f";
  context.arc(coords.nx(0), coords.ny(0), coords.getHeight() / 2.5, 0, TAU);
  context.fill();

  context.globalCompositeOperation = "source-over";
  context.stroke();
};

const animateReady = (context, cycle, coords) => {
  context.fillStyle = "#1f262f";
  context.globalCompositeOperation = "source-over";
  context.beginPath();
  context.arc(coords.nx(0), coords.ny(0), coords.getHeight() / 2.5, 0, TAU);
  context.fill();
  context.stroke();
};

export function LoadingIcon(props) {
  return (
    <div id="loading-button-wrapper">
      {!props.isLoading && (
        <button
          id="loading-button"
          disabled={props.isLoading}
          style={{
            cursor: props.isLoading ? "none" : "pointer",
          }}
        >
          {" "}
          <h2>Enter</h2>{" "}
        </button>
      )}
      <CustomSongIcon
        name={props.name}
        id="custom-loading-icon"
        animate={props.isLoading ? animateLoading : animateReady}
      />
    </div>
  );
}
