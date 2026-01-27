// Shared worker reference that is set by the test setup file
// This is set by test-setup-browser.ts (mock mode) or test-setup-browser-live.ts (live mode)
export let worker: any = undefined;

export function setWorker(w: any) {
  worker = w;
}
