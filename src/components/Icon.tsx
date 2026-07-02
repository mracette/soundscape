import { ComponentType } from "react";
import { House, Music, SlidersHorizontal, Plus, Info } from "lucide-react";

import "../styles/components/Icon.css";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "icon-home": House,
  "icon-music": Music,
  "icon-equalizer": SlidersHorizontal,
  "icon-plus": Plus,
  "icon-info": Info,
};

interface Props {
  name?: string;
  divClassList?: string;
  svgClassList?: string;
  link?: string;
}

export const Icon = (props: Props) => {
  const IconComponent = props.name ? ICONS[props.name] : null;
  const content = IconComponent && <IconComponent className={props.svgClassList} />;

  return (
    <div className={props.divClassList}>
      {content}
    </div>
  );
};
