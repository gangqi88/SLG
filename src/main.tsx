import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { UniSatProvider } from './web3/providers/UniSatProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <UniSatProvider>
            <App />
        </UniSatProvider>
    </React.StrictMode>,
)
