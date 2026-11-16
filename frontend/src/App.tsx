import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { OfflineProvider } from './context/OfflineContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <OfflineProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }
                }}
              />
              <AppRoutes />
            </OfflineProvider>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
