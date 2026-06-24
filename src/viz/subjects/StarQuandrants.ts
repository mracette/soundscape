import * as THREE from "three";

interface StarQuandrantsParams {
  colorPalette: (t: number) => string | number;
  width: number;
  height: number;
  depth: number;
  center: THREE.Vector3;
  count: number;
}

export class StarQuandrants {
  levels: number;
  colorPalette: (t: number) => string | number;
  width: number;
  height: number;
  depth: number;
  center: THREE.Vector3;
  leftGroup: THREE.Group;
  rightGroup: THREE.Group;
  group: THREE.Group;

  constructor(
    scene: THREE.Scene,
    levels: number,
    skyColor: THREE.Color,
    params: StarQuandrantsParams
  ) {
    this.levels = levels;

    this.colorPalette = params.colorPalette;
    this.width = params.width;
    this.height = params.height;
    this.depth = params.depth;
    this.center = params.center;

    this.leftGroup = new THREE.Group();
    this.rightGroup = new THREE.Group();
    this.group = new THREE.Group();

    for (let i = 0; i < levels; i++) {
      this.createStars(params.count, "left", i, skyColor);
      this.createStars(params.count, "right", i, skyColor);
    }

    this.group.add(this.leftGroup);
    this.group.add(this.rightGroup);
    this.group.position.copy(params.center);
    scene.add(this.group);
  }

  createStars(n: number, channel: string, level: number, skyColor: THREE.Color): void {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    let color: THREE.Color;
    const colors: number[] = [];

    for (let i = 0; i < n; i++) {
      const xBound =
        channel === "left" ? (this.width / -2) * 1.35 : (this.width / 2) * 1.35;
      const x = xBound * Math.random();

      const yMin = (level * this.height) / this.levels;
      const y = yMin + Math.random() * (this.height / this.levels);

      const z = this.depth * Math.random();

      positions.push(x, y, z);

      color = new THREE.Color(this.colorPalette(y / this.height));

      const distanceFromMoon = Math.sqrt(x * x + (y - 15) * (y - 15));

      color.lerp(skyColor, 1 / (distanceFromMoon / 75));

      colors.push(color.r, color.g, color.b);
    }

    geometry.addAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setDrawRange(0, n);

    const material = new THREE.PointsMaterial({
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: 0,
      fog: false,
    });

    if (channel === "left") {
      this.leftGroup.add(new THREE.Points(geometry, material));
    } else {
      this.rightGroup.add(new THREE.Points(geometry, material));
    }
  }
}
