import { Icon } from "../../components/Icon";
import * as styles from "./IconGalleryStory.css";

const ICON_NAMES = [
  "icon-home", "icon-music", "icon-equalizer", "icon-plus", "icon-info",
];

export const IconGalleryStory = () => (
  <div className={styles.galleryWrap}>
    <div className={styles.iconGrid}>
      {ICON_NAMES.map((name) => (
        <div key={name} className={styles.iconCell}>
          <Icon
            divClassList={styles.iconCellSvg}
            svgClassList="icon icon-white"
            name={name}
          />
          <span>{name}</span>
        </div>
      ))}
    </div>
  </div>
);
