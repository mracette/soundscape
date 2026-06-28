import {
  ColorManagement,
  SRGBColorSpace,
  NoToneMapping,
  WebGLRenderer,
} from "three";

/**
 * Blender-side authoring assumptions this pipeline is matched to:
 *   - Render engine: EEVEE Next
 *   - Color Management > View Transform: Standard
 *
 * "Standard" is a plain linear→sRGB transform with no filmic curve, so the
 * three.js equivalent is sRGB output with tone mapping disabled. Keep these in
 * lockstep with the Blender file's color management or WYSIWYG parity breaks.
 */
export const PARITY = {
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
} as const;

/** Configure a renderer to match the Blender "Standard" view transform. */
export function applyColorParity(renderer: WebGLRenderer): void {
  ColorManagement.enabled = true;
  renderer.outputColorSpace = PARITY.outputColorSpace;
  renderer.toneMapping = PARITY.toneMapping;
}
