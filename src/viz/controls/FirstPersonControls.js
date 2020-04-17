import * as THREE from "three";

export default class FirstPersonControls {
  constructor(object) {
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);

    this.enabled = true;

    this.movementSpeed = 200;
    this.lookSpeed = 200;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightLock = false;

    this.constrainVertical = true;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.lat = 0;
    this.lon = -90;
    this.phi = 0;
    this.theta = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.lookUp = false;
    this.lookDown = false;
    this.lookLeft = false;
    this.lookRight = false;

    this._onKeyDown = this.bind(this, this.onKeyDown);
    this._onKeyUp = this.bind(this, this.onKeyUp);
    window.addEventListener("keydown", this._onKeyDown, false);
    window.addEventListener("keyup", this._onKeyUp, false);
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 87:
        /*W*/ this.moveForward = true;
        break;
      case 65:
        /*A*/ this.moveLeft = true;
        break;
      case 83:
        /*S*/ this.moveBackward = true;
        break;
      case 68:
        /*D*/ this.moveRight = true;
        break;
      case 38:
        /*up*/ this.lookUp = true;
        break;
      case 37:
        /*left*/ this.lookLeft = true;
        break;
      case 40:
        /*down*/ this.lookDown = true;
        break;
      case 39:
        /*right*/ this.lookRight = true;
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 87:
        /*W*/ this.moveForward = false;
        break;
      case 65:
        /*A*/ this.moveLeft = false;
        break;
      case 83:
        /*S*/ this.moveBackward = false;
        break;
      case 68:
        /*D*/ this.moveRight = false;
        break;
      case 38:
        /*up*/ this.lookUp = false;
        break;
      case 37:
        /*left*/ this.lookLeft = false;
        break;
      case 40:
        /*down*/ this.lookDown = false;
        break;
      case 39:
        /*right*/ this.lookRight = false;
        break;
      default:
        break;
    }
  }

  update(delta, yClamp) {
    if (this.enabled === false) return;

    var actualMoveSpeed = delta * this.movementSpeed;

    // translate by key press
    if (this.moveForward || (this.autoForward && !this.moveBackward))
      this.object.translateZ(-actualMoveSpeed);
    if (this.moveBackward) this.object.translateZ(actualMoveSpeed);
    if (this.moveLeft) this.object.translateX(-actualMoveSpeed);
    if (this.moveRight) this.object.translateX(actualMoveSpeed);

    // enforce height lock
    if (this.heightLock) this.object.position.y = yClamp || 1;

    var actualLookSpeed = delta * this.lookSpeed;

    if (this.lookUp) this.lat += actualLookSpeed;
    if (this.lookDown) this.lat -= actualLookSpeed;
    if (this.lookRight) this.lon += actualLookSpeed; // * verticalLookRatio;
    if (this.lookLeft) this.lon -= actualLookSpeed; // * verticalLookRatio;

    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.Math.degToRad(90 - this.lat);
    this.theta = THREE.Math.degToRad(this.lon);

    if (this.constrainVertical) {
      this.phi = THREE.Math.mapLinear(
        this.phi,
        0,
        Math.PI,
        this.verticalMin,
        this.verticalMax
      );
    }

    let targetPosition = this.target;
    let position = this.object.position;

    targetPosition.x =
      position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
    targetPosition.y = position.y + 100 * Math.cos(this.phi);
    targetPosition.z =
      position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

    this.object.lookAt(targetPosition);
  }

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown, false);
    window.removeEventListener("keyup", this._onKeyUp, false);
  }

  bind(scope, fn) {
    return function () {
      fn.apply(scope, arguments);
    };
  }
}
