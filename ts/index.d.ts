export {};

declare global {
  interface Window {
      ULONG_MAX: number;
      updateProgress: Function;
  }
}
