import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import { QualityProvider } from './contexts/QualityContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { CartProvider } from './contexts/CartContext'
import Routing from './Routes/Routing'

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <QualityProvider>
          <NotificationProvider>
            <CartProvider>
              <Routing/>
            </CartProvider>
          </NotificationProvider>
        </QualityProvider>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App