import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
console.log('Google Maps API Key in index.tsx:', apiKey);


function injectGoogleMaps(apiKey: string, libraries: string[] = ['places']): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('google-maps-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    const libs = libraries.length ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}${libs}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const render = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (apiKey) {
  injectGoogleMaps(apiKey, ['places', 'marker']).then(render).catch((e) => {
    console.error('Google Maps failed to load', e);
    render();
  });
} else {
  console.warn('REACT_APP_GOOGLE_MAPS_API_KEY is missing in .env');
  render();
}