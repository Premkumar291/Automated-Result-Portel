// DOM Matrix polyfill for Node.js environment
import { DOMMatrix as CanvasDOMMatrix } from 'canvas';

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = CanvasDOMMatrix;
}

export default function setupDOMMatrixPolyfill() {
  // This function is just a marker to ensure the polyfill is loaded
  console.log('DOMMatrix polyfill has been set up');
}