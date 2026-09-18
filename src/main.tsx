// Suppress benign TensorFlow Lite / MediaPipe info messages emitted to console.error by Emscripten
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  const firstArg = args[0];
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('Created TensorFlow Lite XNNPACK delegate') ||
      firstArg.includes('TensorFlow Lite XNNPACK delegate') ||
      firstArg.includes('XNNPACK delegate') ||
      firstArg.startsWith('INFO:'))
  ) {
    console.info(...args);
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const firstArg = args[0];
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('Created TensorFlow Lite XNNPACK delegate') ||
      firstArg.includes('TensorFlow Lite XNNPACK delegate') ||
      firstArg.includes('XNNPACK delegate') ||
      firstArg.startsWith('INFO:'))
  ) {
    console.info(...args);
    return;
  }
  originalConsoleWarn.apply(console, args);
};

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
