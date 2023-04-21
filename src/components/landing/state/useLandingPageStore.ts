import create from "zustand";
import config from "src/app-config.json";
import { Song, SongId } from "src/types/Song";

interface LandingPageState {
  selectedSong: Song | null;
  setSelectedSong: (id: SongId | null) => void;
}

export const useLandingPageStore = create<LandingPageState>((set) => ({
  selectedSong: null,
  setSelectedSong: (id) =>
    set({ selectedSong: id ? config.find(({ id }) => id) : null }),
}));
