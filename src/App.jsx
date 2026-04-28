import { useState, useEffect, lazy, Suspense } from 'react'
import { Menu, LogOut, Moon, Sun, Power, Loader2 } from 'lucide-react'
import { useStore } from './store'
import { useFirestore } from './hooks/useFirestore'
import { useAuth } from './hooks/useAuth'

import StatusBar        from './components/StatusBar'
import Sidebar          from './components/Sidebar'
import InstallBanner    from './components/InstallBanner'
import LoginPage        from './pages/LoginPage'

const CustomerMenuPage  = lazy(() => import('./pages/CustomerMenuPage'))
const DashboardPage     = lazy(() => import('./pages/DashboardPage'))
const POSPage           = lazy(() => import('./pages/POSPage'))
const ReportsPage       = lazy(() => import('./pages/ReportsPage'))
const ShiftsPage        = lazy(() => import('./pages/ShiftsPage'))
const InventoryPage     = lazy(() => import('./pages/InventoryPage'))
const ProductsPage      = lazy(() => import('./pages/ProductsPage'))
const OffersPage        = lazy(() => import('./pages/OffersPage'))
const TablesPage        = lazy(() => import('./pages/TablesPage'))
const PlayStationPage   = lazy(() => import('./pages/PlayStationPage'))
const HRPage            = lazy(() => import('./pages/HRPage'))
const ExpensesPage      = lazy(() => import('./pages/ExpensesPage'))
const SuperAdminPage    = lazy(() => import('./pages/SuperAdminPage'))
const SettingsPage      = lazy(() => import('./pages/SettingsPage'))

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2 size={32} className="animate-spin text-indigo-500" />
  </div>
)

export default function App() {
  const { currentUser, isDarkMode, setIsDarkMode, platform } = useStore()
  const { logout } = useAuth()
  useFirestore()

  const [route,          setRoute]          = useState('dashboard')
  const [sidebarOpen,    setSidebarOpen]    = useState(false)

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark')
    else            document.documentElement.classList.remove('dark')
  }, [isDarkMode])

  // Default route based on role
  useEffect(() => {
    if (!currentUser) return
    if (currentUser.role === 'cashier')     setRoute('pos')
    if (currentUser.role === 'admin')       setRoute('dashboard')
    if (currentUser.role === 'super_admin') setRoute('saas')
  }, [currentUser?.role])

  const activeShift = useStore(s => s.shifts.find(sh => sh.status === 'open' && sh.cashierName === s.currentUser?.displayName))

  // ── Not logged in ──────────────────────────────────────
  if (!currentUser) return (
    <div className="pt-7">
      <StatusBar />
      <LoginPage />
    </div>
  )

  // ── Customer menu ──────────────────────────────────────
  if (currentUser.role === 'customer') return (
    <div className="pt-7">
      <StatusBar />
      <Suspense fallback={<PageLoader />}>
        <CustomerMenuPage />
      </Suspense>
    </div>
  )

  // ── Cashier: must open shift first ─────────────────────
  if (currentUser.role === 'cashier' && !activeShift && route !== 'shifts') {
    return (
      <div className="pt-7">
        <StatusBar />
        <Suspense fallback={<PageLoader />}>
          <ShiftsPage />
        </Suspense>
      </div>
    )
  }

  // ── Admin / Cashier layout ─────────────────────────────
  const renderPage = () => {
    if (currentUser.role === 'super_admin') {
      if (route === 'settings') return <SettingsPage />
      return <SuperAdminPage />
    }
    switch (route) {
      case 'dashboard':   return <DashboardPage   onNavigate={setRoute} />
      case 'pos':         return <POSPage />
      case 'reports':     return <ReportsPage />
      case 'shifts':      return <ShiftsPage />
      case 'inventory':   return <InventoryPage />
      case 'products':    return <ProductsPage />
      case 'offers':      return <OffersPage />
      case 'tables':      return <TablesPage />
      case 'playstation': return <PlayStationPage />
      case 'hr':          return <HRPage />
      case 'expenses':    return <ExpensesPage />
      case 'settings':    return <SettingsPage />
      default:            return <DashboardPage onNavigate={setRoute} />
    }
  }

  return (
    <div dir="rtl" className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 overflow-hidden w-full pt-7">
      <StatusBar onNavigate={setRoute} />
      <InstallBanner />

      {/* Sidebar (admin only) */}
      {currentUser.role === 'admin' && (
        <>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}
          <div className={`fixed inset-y-0 right-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 w-64 md:w-72 shrink-0 pt-7`}>
            <Sidebar
              currentRoute={route}
              onNavigate={setRoute}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Top header */}
        <header className="px-4 md:px-6 py-3 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-3">
            {currentUser.role === 'admin' && (
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white">
                <Menu size={19} />
              </button>
            )}
            <h1 className="font-black text-sm md:text-lg truncate max-w-[180px] md:max-w-xs text-slate-800 dark:text-white">
              {currentUser.role === 'super_admin' ? (platform?.appName) :
               currentUser.role === 'cashier'     ? `كاشير — ${currentUser.cafeName}` :
               currentUser.cafeName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Super admin: settings + back to dashboard */}
            {currentUser.role === 'super_admin' && (
              <>
                <button onClick={() => setRoute(route === 'settings' ? 'saas' : 'settings')}
                  className={`p-2 rounded-xl text-slate-500 dark:text-slate-300 transition-colors text-xs font-bold flex items-center gap-1 px-3
                    ${route === 'settings' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <span className="hidden sm:inline">{route === 'settings' ? 'لوحة المنصة' : 'الإعدادات'}</span>
                </button>
              </>
            )}
            {currentUser.role === 'cashier' && activeShift && (
              <button onClick={() => setRoute('shifts')}
                className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                <Power size={14} /> <span className="hidden sm:inline">إنهاء الوردية</span>
              </button>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors">
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="hidden md:block text-sm font-black text-slate-600 dark:text-slate-300 max-w-[140px] truncate">
              {currentUser.displayName}
            </span>
            <button onClick={logout} className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
