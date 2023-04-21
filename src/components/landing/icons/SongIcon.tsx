import { SxProps, Theme } from "@mui/material";
import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ComponentType, memo, useState } from "react";
import { useLandingPageStore } from "src/components/landing/state/useLandingPageStore";
import { MuiBox } from "src/components/shared/MuiBox";
import { ThreeCanvasCoordinates } from "src/components/shared/ThreeCanvasCoordinates";
import { SongId } from "src/types/Song";
import { Link } from "react-router-dom";

const rootStyles: SxProps<Theme> = {
  display: "block",
  margin: "0",
  width: "250px",
  height: "250px",
  transition: "300ms",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(3px)",
  },
  borderRadius: "50%",
};

interface Props {
  id: SongId;
  IconComponent: ComponentType<{ hovering: boolean }>; // (props: { hovering: boolean }) => JSX.Element;
}

export const SongIcon = memo(({ id, IconComponent }: Props) => {
  const setSelectedSong = useLandingPageStore((state) => state.setSelectedSong);

  const [hovering, setHovering] = useState(false);

  const handleMouseOver = () => {
    setHovering(true);
    setSelectedSong(id);
  };
  const handleMouseOut = () => {
    setHovering(false);
    setSelectedSong(null);
  };

  return (
    <Link style={{ display: "inline-block" }} to={`/play/${id}`}>
      <MuiBox sx={rootStyles}>
        <Canvas onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          <OrthographicCamera makeDefault position-z={100} />
          <ThreeCanvasCoordinates options={{ padding: 0.05 }}>
            <IconComponent hovering={hovering} />
          </ThreeCanvasCoordinates>
        </Canvas>
      </MuiBox>
    </Link>
  );
});

SongIcon.displayName = "SongIcon";
