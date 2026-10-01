import React from 'react';
import ReactDOM from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import rtlCache from './rtlCache';
import { UserProvider } from './context/UserContext';
import AppThemeProvider from './AppThemeProvider';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <UserProvider>
        <AppThemeProvider>
          <App />
        </AppThemeProvider>
      </UserProvider>
    </CacheProvider>
  </React.StrictMode>
);
