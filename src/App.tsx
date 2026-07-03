import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { NombaConnectionProvider } from './context/NombaConnectionContext'
import AIAssistant from './pages/AIAssistant'
import BusinessInsights from './pages/BusinessInsights'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import DebtTracker from './pages/DebtTracker'
import NotificationsPage from './pages/Notifications'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <NombaConnectionProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="insights" element={<BusinessInsights />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="debts" element={<DebtTracker />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </NombaConnectionProvider>
  )
}
