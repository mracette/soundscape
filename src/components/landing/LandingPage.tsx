import { Container, Grid, Typography } from "@mui/material";
import { css } from "src/components/landing/gradient";
import { MoonriseIcon } from "src/components/landing/icons/MoonriseIcon";
import { MorningsIcon } from "src/components/landing/icons/MorningsIcon";
import { SwampIcon } from "src/components/landing/icons/SwampIcon";
import { LandingPageScene } from "src/components/landing/LandingPageScene";
import { useLandingPageStore } from "src/components/landing/state/useLandingPageStore";

export const LandingPage = () => {
  const selectedSong = useLandingPageStore(({ selectedSong }) => selectedSong);

  return (
    <Container
      sx={{
        height: "100%",
        display: "inline-block",
      }}
    >
      <Grid
        container
        sx={{
          height: "100%",
          alignItems: "center",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        <LandingPageScene />
        <Grid item>
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Satisfy",
              mt: 12,
              padding: 2,
              background: css,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Soundscape
          </Typography>
        </Grid>
        <Grid item>
          <Typography textAlign={"center"}>
            This application uses audio.
          </Typography>
          {selectedSong ? (
            <Typography textAlign={"center"}>
              {selectedSong.audio.name} | {`${selectedSong.audio.bpm} bpm`} |{" "}
              {selectedSong.id}
            </Typography>
          ) : (
            <Typography textAlign={"center"}>
              Choose a song to begin.
            </Typography>
          )}
        </Grid>
        <Grid
          item
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            flexDirection: "row",
            flex: "1 1 auto",
            width: "100%",
            minHeight: 0,
          }}
        >
          <SwampIcon />
          <MorningsIcon />
          <MoonriseIcon />
        </Grid>
      </Grid>
    </Container>
  );
};
