import { House, Music, SlidersHorizontal, Plus, Info } from "lucide-react";

import "../styles/components/Icon.css";

const ICONS = {
  "icon-home": House,
  "icon-music": Music,
  "icon-equalizer": SlidersHorizontal,
  "icon-plus": Plus,
  "icon-info": Info,
};

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  divClassList?: string;
  svgClassList?: string;
}

export const Icon = (props: Props) => {
  const IconComponent = ICONS[props.name];

  // guards config-driven callers that bypass the IconName type at runtime
  if (!IconComponent) return null;

  return (
    <div className={props.divClassList}>
      <IconComponent className={props.svgClassList} />
    </div>
  );
};
