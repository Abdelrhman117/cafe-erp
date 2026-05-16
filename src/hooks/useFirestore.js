import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { loadLocal, saveLocal } from '../lib/localCache'
import { useStore } from '../store'

const SESSION_KEY = 'erp_session'

// ─── Session helpers ──────────────────────────────────────
// Cashiers use sessionStorage (clears on browser close — intentional).
// Admins/owners use localStorage so sessions survive a full browser restart.
function saveSession(user) {
  try {
    const store = user?.role === 'cashier' ? sessionStorage : localStorage
    store.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {}
}
function loadSession() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY) ||
      'null'
    )
  } catch { return null }
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY) } catch {}
}

export function useFirestore() {
  const {
    currentUser, setCurrentUser,
    setPlatform, setCafeData,
    setIsOnline, setSyncStatus
  } = useStore()

  // ── Online/offline ────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Retry failed sync when connection is restored
      const { syncStatus, _syncBuffer, currentUser: u } = useStore.getState()
      if (syncStatus === 'error' && u?.cafeId && Object.keys(_syncBuffer || {}).length > 0) {
        useStore.getState().sync(_syncBuffer)
      }
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ── Flush pending changes before page closes ─────────────
  useEffect(() => {
    const handleUnload = () => {
      const { _syncTimer, currentUser: u } = useStore.getState()
      if (!u?.cafeId) return
      // If a debounced timer is pending, force-save to localStorage right now
      if (_syncTimer) {
        clearTimeout(_syncTimer)
        const s = useStore.getState()
        saveLocal(u.cafeId, {
          products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
          expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
          activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
          psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
        })
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  // ── Restore session on page refresh ──────────────────────
  // Firebase Auth persists admin sessions automatically.
  // For cashiers (anonymous), we store session in sessionStorage.
  useEffect(() => {
    if (currentUser) return   // already logged in

    const saved = loadSession()
    if (saved?.role === 'cashier') {
      // Restore cashier session — Firebase anonymous session may still be alive
      setCurrentUser(saved)
    }
    // Admin sessions are restored via onAuthStateChanged below
  }, [])

  // ── Firebase Auth state → restore admin/owner session ────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const storeUser = useStore.getState().currentUser

      if (!firebaseUser) {
        // Firebase signed out completely
        // Only force logout if the current user is NOT a cashier
        // (cashier sessions are anonymous and may expire)
        if (storeUser && storeUser.role !== 'cashier') {
          clearSession()
          useStore.getState().setCurrentUser(null)
        } else if (storeUser?.role === 'cashier') {
          // Anonymous session expired — cashier must re-login
          clearSession()
          useStore.getState().setCurrentUser(null)
        }
        return
      }

      // Firebase user exists — skip if already in store
      if (storeUser) return

      // Page refresh for admin/owner — restore from session
      const saved = loadSession()
      if (saved && saved.role !== 'cashier') {
        setCurrentUser(saved)
      }
    })
    return unsub
  }, [])

  // ── Save session whenever currentUser changes ─────────────
  useEffect(() => {
    if (currentUser) {
      saveSession(currentUser)
    } else {
      clearSession()
    }
  }, [currentUser])

  // ── Platform subscription ─────────────────────────────────
  useEffect(() => {
    const unsub = subscribePlatform(
      (snap) => { if (snap.exists()) setPlatform(snap.data()) },
      (err)  => console.error('Platform subscription error:', err)
    )
    return unsub
  }, [])

  // ── Cafe subscription ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.cafeId) return

    // تحميل فوري من localStorage قبل ما Firestore يرد (أوفلاين-فيرست)
    const cached = loadLocal(currentUser.cafeId)
    if (cached) setCafeData(cached)

    const unsub = subscribeCafe(
      currentUser.cafeId,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          // If this is a stale local-cache snapshot (not yet confirmed by server),
          // preserve the current activeTableOrders so paid tables don't get restored.
          // hasPendingWrites=true means it's our own write echoed back — safe to use fully.
          const isStaleCache = snap.metadata.fromCache && !snap.metadata.hasPendingWrites
          const merged = isStaleCache
            ? { ...data, activeTableOrders: useStore.getState().activeTableOrders }
            : data
          setCafeData(merged)
          // حفظ في localStorage فقط لما البيانات تيجي من السيرفر (مش كاش)
          if (!snap.metadata.fromCache) saveLocal(currentUser.cafeId, data)
          if (snap.metadata?.hasPendingWrites) setSyncStatus('saving')
          else setSyncStatus('idle')
        } else {
          // Document doesn't exist yet — create it with current store data
          const { products, rawMaterials, employees, expenses, tables,
                  shifts, orders, activeTableOrders, offers, psDevices,
                  psSessions, isTaxEnabled, isServiceEnabled } = useStore.getState()
          const { saveCafe } = await import('../lib/firestore')
          try {
            await saveCafe(currentUser.cafeId, {
              products, rawMaterials, employees, expenses, tables,
              shifts, orders, activeTableOrders, offers, psDevices,
              psSessions, isTaxEnabled, isServiceEnabled
            })
          } catch (e) {
            console.error('Failed to initialize cafe document:', e)
          }
        }
      },
      (err) => {
        console.error('Cafe subscription error:', err)
        setSyncStatus('error')
      }
    )
    return unsub
  }, [currentUser?.cafeId])
}
