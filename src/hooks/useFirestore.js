import { useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { loadLocal, saveLocal } from '../lib/localCache'
import { useStore } from '../store'

const SESSION_KEY = 'erp_session'
// Cashier sessions survive browser close for 24 hours (covers a full work day + overnight).
// Admin sessions have no TTL (Firebase Auth handles expiry for email/password accounts).
const CASHIER_SESSION_TTL = 24 * 3600 * 1000

// ─── Session helpers ──────────────────────────────────────
function saveSession(user) {
  if (!user || user.role === 'customer') return
  try {
    if (user?.role === 'cashier') {
      // Cashier: save to BOTH storages.
      // sessionStorage = current tab (instant restore on refresh)
      // localStorage   = crash/close recovery (survives browser close mid-shift)
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

    // Enforce 24h TTL on cashier sessions recovered from localStorage
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
      // Whatever is in the store (loaded from localStorage) is sent to Firestore.
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
      // Cancel debounce timer — Firestore writes won't complete on an unloading page.
      // localStorage is the safety net: it was already updated before the timer was set,
      // but we write again here to capture any state changes in the last few milliseconds.
      if (_syncTimer) clearTimeout(_syncTimer)
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
  // Runs before Firebase Auth initialises so the UI doesn't flicker.
  useEffect(() => {
    if (currentUser) return
    const saved = loadSession()
    if (saved) setCurrentUser(saved)
  }, [])

  // ── Firebase Auth state ───────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const storeUser = useStore.getState().currentUser

      if (!firebaseUser) {
        // Firebase reports no authenticated user.
        // For cashiers (anonymous auth), Firebase IndexedDB may have been cleared
        // (browser data wipe, mobile crash, etc.) while our localStorage session is
        // still valid. Re-issue anonymous auth silently instead of forcing logout.
        if (storeUser?.role === 'cashier') {
          signInAnonymously(auth).catch(() => {
            // Re-auth failed (offline + cleared storage).
            // Keep the session — cashier can still operate from localStorage.
            // Firestore reads/writes will queue and retry when connectivity returns.
          })
          return
        }
        // Admin/owner: if Firebase says logged out, that's authoritative.
        if (storeUser) {
          clearSession()
          useStore.getState().setCurrentUser(null)
        }
        return
      }

      // Firebase confirmed a user is signed in — skip if already restored.
      if (storeUser) return

      // Mount effect may have run before Firebase initialised; try again here.
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

    // Load from localStorage immediately — gives the UI instant data before
    // any Firestore response arrives (works offline too).
    // Track the localStorage timestamp so we can detect when our local data
    // is newer than the Firestore cache (e.g. last 300ms before browser close).
    let localCacheTs = 0
    const cached = loadLocal(currentUser.cafeId)
    if (cached) {
      setCafeData(cached)
      localCacheTs = cached._ts || 0
    }

    const unsub = subscribeCafe(
      currentUser.cafeId,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          const isFromCache      = snap.metadata.fromCache
          const hasPendingWrites = snap.metadata.hasPendingWrites
          const isStaleCache     = isFromCache && !hasPendingWrites

          // Guard: if our localStorage write is strictly newer than what Firestore
          // knows about (server timestamp), don't overwrite it.
          //
          // This handles the "last-300ms" scenario: beforeunload cancels the debounce
          // timer so the final changes are in localStorage but NOT in Firebase's queue.
          // The reconnect handler (handleOnline) will upload localStorage to Firestore
          // when connectivity is restored.
          if (localCacheTs > (data.updatedAt || 0)) {
            setSyncStatus('idle')
            return
          }

          // isStaleCache: snapshot from Firestore's local IndexedDB with no pending
          // writes — it's old server data. Keep activeTableOrders from the store
          // (already loaded from localStorage) so paid tables don't get restored.
          const merged = isStaleCache
            ? { ...data, activeTableOrders: useStore.getState().activeTableOrders }
            : data
          setCafeData(merged)

          // On server-confirmed snapshots: save the post-filter store state so
          // localStorage stays in sync with the server, and reset the local guard.
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
