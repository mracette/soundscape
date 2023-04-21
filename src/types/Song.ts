import config from "src/app-config.json";

export type Song = (typeof config)[number];
export type SongId = "moonrise" | "mornings" | "swamp" | "lullaby";
