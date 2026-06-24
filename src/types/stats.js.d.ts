// Minimal shim for stats.js@0.17.0 — package ships no types
declare module "stats.js" {
  class Stats {
    showPanel(panel: number): void;
    begin(): void;
    end(): void;
    dom: HTMLElement;
  }
  export default Stats;
}
