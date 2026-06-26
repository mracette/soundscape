import type { ComponentType } from "react";
import { SongIconsStory } from "./SongIconsStory";
import { LoadingStory } from "./LoadingStory";
import { ToggleStory } from "./ToggleStory";
import { MenuStory } from "./MenuStory";
import { IconGalleryStory } from "./IconGalleryStory";

export interface Story {
  id: string;
  title: string;
  group: string;
  Component: ComponentType;
}

export const stories: Story[] = [
  { id: "song-icons", title: "Song Icons", group: "Icons", Component: SongIconsStory },
  { id: "loading", title: "Loading Icon", group: "Icons", Component: LoadingStory },
  { id: "toggle", title: "Toggle Button", group: "Buttons", Component: ToggleStory },
  { id: "menu", title: "Menu Button", group: "Buttons", Component: MenuStory },
  { id: "icons", title: "Icon Gallery", group: "Misc", Component: IconGalleryStory },
];
