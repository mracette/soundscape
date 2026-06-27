export const cx = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
