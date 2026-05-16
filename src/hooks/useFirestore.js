import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { loadLocal, saveLocal } from '../lib/localCache'
import { useStore } from '../store'

const SESSION_KEY = 'erp_session'
// Cashier sessions in localStorage expire after 12 hours (covers one work day).
// This lets the cashier reopen the browser mid-shift without losing their session,
// while ensuring the next day starts clean.
const CASHIER_SESSION_TTL = 12 * 3600 * 1000

// ─── Session helpers ──────────────────────────────────────
function saveSession(user) {
  try {
    if (user?.role === 'cashier') {
      // Cashier: save to BOTH storages.
      // sessionStorage = current tab (instant restore on refresh)
      // localStorage   = crash recovery (survives browser close mid-shift)
      const payload = JSON.stringify({ ...user, _savedAt: Date.now() })
      sessionStorage.setItem(SESSION_KEY, payload)
      localStorage.setItem(SESSION_KEY, payload)
    } else {
      // Admin/owner: localStorage only (persists across browser restarts, no TTL)
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  } catch {}
}

function loadSession() {
  try {
    // sessionStorage is preferred — it's the current active tab's session
    const fromSession = sessionStorage.getItem(SESSION_KEY)
    if (fromSession) return JSON.parse(fromSession)

    // Fallback to localStorage (admin persistent session, or cashier crash recovery)
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)

    // Enforce 12h TTL on cashier sessions recovered from localStorage
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
      // One authoritative upload of the full current state when going online.
      // This is the end-of-day sync: whatever is in localStorage (already loaded
      // into the store) is sent to Firestore in a single write.
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

  // ── Flush state to localStorage before page closes ────────
  useEffect(() => {
    const handleUnload = () => {
      const { _syncTimer, currentUser: u } = useStore.getState()
      if (!u?.cafeId) return
      // Cancel debounce timer — no point firing a Firestore write on an unloading page
      if (_syncTimer) clearTimeout(_syncTimer)
      // Always write the final store state regardless of whether a timer was pending.
      // This is the last safety net: even if saveLocal was already called moments ago,
      // we capture any state changes that happened in the intervening microseconds.
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

  // ── Restore session immediately on mount ──────────────────
  // Runs synchronously before Firebase Auth initialises, so the UI doesn't
  // flicker on page load. Handles both cashiers (localStorage crash-recovery)
  // and admins (localStorage persistent).
  useEffect(() => {
    if (currentUser) return
    const saved = loadSession()
    if (saved) setCurrentUser(saved)
  }, [])

  // ── Firebase Auth state ───────────────────────────────────
  // Secondary restore: if Firebase Auth fires after the mount effect and
  // currentUser is still null (very first load, or mount effect found nothing),
  // try to restore from storage. Also handles forced logout when Firebase
  // revokes the token (e.g. password change, manual revoke in console).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const storeUser = useStore.getState().currentUser

      if (!firebaseUser) {
        // Firebase says no authenticated user — force logout for all roles
        if (storeUser) {
          clearSession()
          useStore.getState().setCurrentUser(null)
        }
        return
      }

      // Firebase confirmed a user is logged in — skip if already restored
      if (storeUser) return

      // Mount effect may have run before Firebase initialised; try again here
      const saved = loadSession()
      if (saved) setCurrentUser(saved)
    })
    return unsub
  }, [])

  // ── Persist session on every currentUser change ───────────
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

  // ── Cafe data subscription ────────────────────────────────
  useEffect(() => {
    if (!currentUser?.cafeId) return

    // Load from localStorage immediately — gives the UI instant data
    // before any Firestore response (works offline too)
    const cached = loadLocal(currentUser.cafeId)
    if (cached) setCafeData(cached)

    const unsub = subscribeCafe(
      currentUser.cafeId,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          // isStaleCache: snapshot came from Firestore's local IndexedDB cache
          // with no pending writes — it's old server data, not ours.
          // In this case, keep the in-memory activeTableOrders (already loaded
          // from localStorage) so paid/cleared tables don't get restored.
          const isStaleCache = snap.metadata.fromCache && !snap.metadata.hasPendingWrites
          const merged = isStaleCache
            ? { ...data, activeTableOrders: useStore.getState().activeTableOrders }
            : data
          setCafeData(merged)

          // On server-confirmed snapshots, save the post-filter store state
          // (not the raw server data) so localStorage never has stale tables
          if (!snap.metadata.fromCache) {
            const s = useStore.getState()
            saveLocal(currentUser.cafeId, {
              products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
              expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
              activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
              psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
            })
          }

          if (snap.metadata?.hasPendingWrites) setSyncStatus('saving')
          else setSyncStatus('idle')
        } else {
          // Document doesn't exist yet — initialise it with current store data
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
            console.error('Failed to initialise cafe document:', e)
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
