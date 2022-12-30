export {};

declare global {
  interface Window {
      ULONG_MAX: number;
      _EM_seekSamples: number;
      _EM_signalStop: number;
      updateProgress: Function;
      Github: any;
  }
}
