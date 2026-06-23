import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Script error.')
  ) {
    return;
  }
  if (args[0] && args[0].message === 'Script error.') {
    return;
  }
  originalConsoleError(...args);
};

window.onerror = function(message, source, lineno, colno, error) {
  if (message === 'Script error.' || (error && error.message === 'Script error.')) {
    return true;
  }
};

window.addEventListener('error', (e) => {
  if (e.message === 'Script error.' || (e.error && e.error.message === 'Script error.')) {
     e.preventDefault();
     e.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
