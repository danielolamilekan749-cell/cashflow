import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import FloatingAIButton from './FloatingAIButton'
import MobileWatermark from './MobileWatermark'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface-off">
      <Sidebar />

      <div className="relative flex min-h-screen flex-1 flex-col">
        <MobileWatermark />

        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <TopNav />

          <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
            <div className="w-full px-4 py-5 lg:px-6 lg:py-6">
              <Outlet />
            </div>
          </main>

          <BottomNav />
          <FloatingAIButton />
        </div>
      </div>
    </div>
  )
}
