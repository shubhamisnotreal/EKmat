import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

import { Web3Provider } from './context/Web3Context';
import { DemoModeProvider } from './context/DemoModeContext';
import { IdentityProvider } from './context/IdentityContext';
import { OfficialProvider } from './context/OfficialContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DemoModeProvider>
            <Web3Provider>
                <IdentityProvider>
                    <OfficialProvider>
                        <App />
                    </OfficialProvider>
                </IdentityProvider>
            </Web3Provider>
        </DemoModeProvider>
    </React.StrictMode>,
)
