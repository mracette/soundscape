import { House, Music, SlidersHorizontal, Plus, Info } from "lucide-react";

import "../styles/components/Icon.css";

interface Props {
  name: string;
  divClassList?: string;
  svgClassList?: string;
}

const ICONS = {
  "icon-home": House,
  "icon-music": Music,
  "icon-equalizer": SlidersHorizontal,
  "icon-plus": Plus,
  "icon-info": Info,
};

export const Icon = (props: Props) => {
  const IconComponent = ICONS[props.name as keyof typeof ICONS];

  return (
    <div className={props.divClassList}>
      <IconComponent className={props.svgClassList} />
    </div>
  );
};
