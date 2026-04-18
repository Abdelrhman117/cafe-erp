import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { useStore } from '../store'

const SESSION_KEY = 'erp_session'

// ─── Session helpers ──────────────────────────────────────
function saveSession(user) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch {}
}
function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

export function useFirestore() {
  const {
    currentUser, setCurrentUser,
    setPlatform, setCafeData,
    setIsOnline, setSyncStatus
  } = useStore()

  // ── Online/offline ────────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
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
    const unsub = subscribeCafe(
      currentUser.cafeId,
      async (snap) => {
        if (snap.exists()) {
          setCafeData(snap.data())
          if (snap.metadata?.hasPendingWrites) setSyncStatus('saving')
          else setSyncStatus('idle')
        } else {
          // Document doesn't exist yet — create it with current store data
          const { products, rawMaterials, employees, expenses, tables,
                  shifts, orders, activeTableOrders, offers, psDevices,
                  psSessions, isTaxEnabled } = useStore.getState()
          const { saveCafe } = await import('../lib/firestore')
          try {
            await saveCafe(currentUser.cafeId, {
              products, rawMaterials, employees, expenses, tables,
              shifts, orders, activeTableOrders, offers, psDevices,
              psSessions, isTaxEnabled
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
