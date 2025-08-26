import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { UserProvider } from './UserContext'

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <App />
  </UserProvider>
)
