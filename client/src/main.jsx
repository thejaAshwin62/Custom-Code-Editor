import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';

const clerkPubKey = "pk_test_Y29tcG9zZWQtdGVycmFwaW4tNzEuY2xlcmsuYWNjb3VudHMuZGV2JA"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </ClerkProvider>
  </StrictMode>,
)
