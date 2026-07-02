import { ComponentType, CSSProperties } from "react";
import { House, Music, SlidersHorizontal, Plus, Info } from "lucide-react";

import "../styles/components/Icon.css";

const ICONS: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
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
}

// Lucide icons are stroke-based (fill="none" by default) — .icon-white/.icon-moon
// set `fill` as well as `stroke` for the old filled-shape sprite artwork, and
// since fill/stroke are inheritable, that fill would otherwise flow down and
// solid-fill Lucide's outline paths. Force fill back to none here rather than
// touching those shared classes, which ToggleButtonView.tsx also depends on.
const iconStyle: CSSProperties = { fill: "none" };

export const Icon = (props: Props) => {
  const IconComponent = props.name ? ICONS[props.name] : null;
  const content = IconComponent && (
    <IconComponent className={props.svgClassList} style={iconStyle} />
  );

  return (
    <div className={props.divClassList}>
      {content}
    </div>
  );
};
