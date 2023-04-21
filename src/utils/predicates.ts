import {
  BufferGeometry,
  DirectionalLight,
  Group,
  Mesh,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
} from "three";

export const isPerspectiveCamera = (
  object: any | PerspectiveCamera
): object is PerspectiveCamera =>
  "isPerspectiveCamera" in object && object.isPerspectiveCamera;

export const isOrthographicCamera = (
  object: any | OrthographicCamera
): object is OrthographicCamera =>
  "isOrthographicCamera" in object && object.isOrthographicCamera;

export const isObject3d = (object: any | Object3D): object is Object3D =>
  "isObject3D" in object && object.isObject3D;

export const isGroup = (object: any | Group): object is Group =>
  "isGroup" in object && object.isGroup;

export const isMesh = (object: any | Mesh): object is Mesh => {
  return "isMesh" in object && object.isMesh;
};

export const isBufferGeometry = (
  object: any | Mesh
): object is BufferGeometry => {
  return "isBufferGeometry" in object && object.isBufferGeometry;
};

export const isDirectionalLight = (
  object: any | DirectionalLight
): object is DirectionalLight =>
  "isDirectionalLight" in object && object.isDirectionalLight;
