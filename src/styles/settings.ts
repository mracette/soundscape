export const fontColor = "#ffffff";
export const lightGrey = "#d8d8d8";
export const offBlack = "#1f262f";
export const offBlack2 = "#141b24";
export const menuContentColor = "rgba(255,255,255,0.2)";
export const moonYellow = "#f6f2d5";
export const hotPink = "rgb(255, 76, 122)";
export const hotGreen = "rgb(0, 225, 158)";
export const hotBlue = "rgb(0, 249, 255)";

export const sSize = "0.8rem";
export const mSize = "1.6rem";
export const lSize = "3.2rem";
export const xlSize = "4.8rem";
export const xxlSize = "10.5rem";

// mock viewport units for mobile corner cases
// see https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export const vh = (quantity: number) => `calc(var(--vh, 1vh) * ${quantity})`;
export const vw = (quantity: number) => `calc(var(--vw, 1vw) * ${quantity})`;
