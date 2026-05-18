import { useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { loadLocal, saveLocal } from '../lib/localCache'
import { useStore } from '../store'

const SESSION_KEY = 'erp_session'
const CASHIER_SESSION_TTL = 24 * 3600 * 1000

// ─── Session helpers ──────────────────────────────────────
// Cashiers use sessionStorage (clears on browser close — intentional).
// Admins/owners use localStorage so sessions survive a full browser restart.
function saveSession(user) {
  if (!user || user.role === 'customer') return
  try {
    if (user?.role === 'cashier') {
      const payload = JSON.stringify({ ...user, _savedAt: Date.now() })
      sessionStorage.setItem(SESSION_KEY, payload)
      localStorage.setItem(SESSION_KEY, payload)
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  } catch {}
}
function loadSession() {
  try {
    const fromSession = sessionStorage.getItem(SESSION_KEY)
    if (fromSession) return JSON.parse(fromSession)
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (parsed?.role === 'cashier') {
      const age = Date.now() - (parsed._savedAt || 0)
      if (age > CASHIER_SESSION_TTL) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
    }
    return parsed
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
    let reconnectSyncing = false
    const handleOnline = () => {
      setIsOnline(true)
      if (reconnectSyncing) return
      const { currentUser: u } = useStore.getState()
      if (!u?.cafeId) return
      reconnectSyncing = true
      // Upload complete current state when going online.
      // This covers the all-day offline scenario: one authoritative write at reconnect
      // overwrites any intermediate queued writes with the definitive final state.
      const s = useStore.getState()
      useStore.getState().sync({
        products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
        expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
        activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
        psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
      }, { immediate: true })
      setTimeout(() => { reconnectSyncing = false }, 5000)
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
      // Cancel any pending debounce timer to avoid incomplete Firestore write on unloading page
      if (_syncTimer) clearTimeout(_syncTimer)
      // Always write the absolute latest store state to localStorage —
      // this is the last safety net regardless of whether a timer was pending
      const s = useStore.getState()
      saveLocal(u.cafeId, {
        products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
        expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
        activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
        psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
      })
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
        if (storeUser?.role === 'cashier') {
          signInAnonymously(auth).catch(() => {
            // Re-auth failed (offline). Keep session — cashier operates from localStorage.
          })
          return
        }
        if (storeUser) {
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

    let localCacheTs = 0
    let unsub = () => {}
    let cancelled = false

    loadLocal(currentUser.cafeId).then(cached => {
      if (cancelled || !cached) return
      setCafeData(cached)
      localCacheTs = cached._ts || 0
    })

    unsub = subscribeCafe(
      currentUser.cafeId,
      async (snap) => {
        if (snap.exists()) {
          const data             = snap.data()
          const isFromCache      = snap.metadata.fromCache
          const hasPendingWrites = snap.metadata.hasPendingWrites
          const isStaleCache     = isFromCache && !hasPendingWrites

          if (localCacheTs > (data.updatedAt || 0)) {
            setSyncStatus('idle')
            return
          }

          const merged = isStaleCache
            ? { ...data, activeTableOrders: useStore.getState().activeTableOrders }
            : data
          setCafeData(merged)

          if (!isFromCache) {
            localCacheTs = 0
            const s = useStore.getState()
            saveLocal(currentUser.cafeId, {
              products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
              expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
              activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
              psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
            })
          }

          if (hasPendingWrites) setSyncStatus('saving')
          else setSyncStatus('idle')
        } else {
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

    return () => { cancelled = true; unsub() }
  }, [currentUser?.cafeId])
}
