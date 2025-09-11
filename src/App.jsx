import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import { QualityProvider } from './contexts/QualityContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Routing from './Routes/Routing'

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <QualityProvider>
          <NotificationProvider>
            <Routing/>
          </NotificationProvider>
        </QualityProvider>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App