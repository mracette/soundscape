import { Icon } from "../../components/Icon";
import { SocialIcons } from "../../components/iconography/SocialIcons";
import { SharingIcons } from "../../components/iconography/SharingIcons";
import * as styles from "./IconGalleryStory.css";

const ICON_NAMES = [
  "icon-envelope", "icon-equalizer", "icon-github", "icon-home",
  "icon-info", "icon-music", "icon-plus", "icon-twitter",
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
    <div className={styles.iconSection}>Social Icons</div>
    <SocialIcons />
    <div className={styles.iconSection}>Sharing Icons</div>
    <SharingIcons />
  </div>
);
