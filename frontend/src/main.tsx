import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {Toaster} from 'react-hot-toast'
import {AuthProvider, useAuth} from '@/context/AuthContext'


import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  </StrictMode>,
)
