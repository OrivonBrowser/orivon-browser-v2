import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

localStorage.clear();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("[Orivon] Root element '#root' not found in index.html");
}

const root = createRoot(rootEl);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
