export const cx = (...classes: (string | false | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
