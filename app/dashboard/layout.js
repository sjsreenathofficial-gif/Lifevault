 import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../hooks/useAuth';

export const metadata = {
  title: 'LifeVault — Secure Digital Document Vault',
  description: 'Store every important document from birth to death in your secure digital vault.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#050810" />
      </head>
      <body className="antialiased min-h-screen bg-vault-darker">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0a0f1e',
                color: '#e2e8f0',
                border: '1px solid #1a2444',
                fontFamily: 'var(--font-body)',
              },
              success: {
                iconTheme: { primary: '#00f5ff', secondary: '#050810' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#050810' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
