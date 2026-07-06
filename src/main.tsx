import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './ui/theme.css';

// Ask the browser not to evict this origin's IndexedDB data under storage pressure.
// Best-effort only — doesn't protect against the user manually clearing site data.
if (navigator.storage?.persist) {
    navigator.storage.persist();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
