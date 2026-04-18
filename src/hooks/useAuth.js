import { useState } from 'react'
import { signInWithEmailAndPassword, signOut as fbSignOut, signInAnonymously } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useStore } from '../store'
import { savePlatform } from '../lib/firestore'

// ─── SHA-256 ──────────────────────────────────────────────
async function hashPassword(password) {
  if (!password) return null
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

// ─── Rate limiter: 5 attempts / 60s ──────────────────────
const _attempts = {}
function checkRateLimit(key) {
  const now = Date.now()
  _attempts[key] = (_attempts[key] || []).filter(t => now - t < 60_000)
  if (_attempts[key].length >= 5) return false
  _attempts[key].push(now)
  return true
}

// ─── Always read latest platform from store ───────────────
// بدل ما نقرأ من closure، نقرأ من getState() مباشرة
function getLatestPlatform() {
  return useStore.getState().platform
}

export function useAuth() {
  const { setCurrentUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const resolveAdmin = (email) => {
    const platform = getLatestPlatform()
    const em = email.toLowerCase()
    if (em === (import.meta.env.VITE_OWNER_EMAIL || 'owner@coffeeerp.app'))
      return { role: 'super_admin', cafeId: null, cafeName: null, displayName: 'مالك المنصة' }
    for (const t of (platform?.tenants || []))
      if (t.adminEmail?.toLowerCase() === em)
        return { role: 'admin', cafeId: t.id, cafeName: t.name, displayName: `مدير — ${t.name}` }
    return null
  }

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(''); setLoading(true)
    const em = email.trim().toLowerCase()

    if (!checkRateLimit(em)) {
      setError('محاولات كثيرة. انتظر دقيقة ثم حاول.')
      setLoading(false)
      return false
    }

    try {
      // 1. Admin / Owner
      const adminMeta = resolveAdmin(em)
      if (adminMeta) {
        const cred = await signInWithEmailAndPassword(auth, em, password)
        if (adminMeta.cafeId) {
          const platform = getLatestPlatform()
          const t = platform?.tenants?.find(t => t.id === adminMeta.cafeId)
          if (t?.status !== 'active') {
            await fbSignOut(auth); setError('اشتراك الكافيه موقوف.'); return false
          }
          if (t?.subscriptionEnds && new Date(t.subscriptionEnds) < new Date()) {
            await fbSignOut(auth); setError('انتهى اشتراك الكافيه.'); return false
          }
        }
        setCurrentUser({ uid: cred.user.uid, email: em, ...adminMeta })
        return true
      }

      // 2. Cashier — always read fresh from store
      const hashed = await hashPassword(password)
      const platform = getLatestPlatform()
      for (const t of (platform?.tenants || [])) {
        const found = (t.cashiers || []).find(c =>
          c.email?.toLowerCase() === em &&
          c.passwordHash === hashed &&
          c.active !== false
        )
        if (found) {
          if (t.status !== 'active') { setError('اشتراك الكافيه موقوف.'); return false }
          if (t.subscriptionEnds && new Date(t.subscriptionEnds) < new Date()) {
            setError('انتهى اشتراك الكافيه.'); return false
          }
          await signInAnonymously(auth)
          setCurrentUser({
            uid: found.id, email: em, role: 'cashier',
            cafeId: t.id, cafeName: t.name,
            displayName: `${found.name} — ${t.name}`,
            cashierId: found.id,
          })
          return true
        }
      }

      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      return false

    } catch (e) {
      const msgs = {
        'auth/wrong-password':         'كلمة المرور غير صحيحة.',
        'auth/invalid-credential':     'البريد أو كلمة المرور غير صحيحة.',
        'auth/user-not-found':         'البريد الإلكتروني غير مسجل.',
        'auth/too-many-requests':      'محاولات كثيرة. انتظر ثم حاول.',
        'auth/network-request-failed': 'تحقق من الاتصال بالإنترنت.',
        'auth/invalid-email':          'صيغة البريد غير صحيحة.',
      }
      setError(msgs[e.code] || 'حدث خطأ. حاول مرة أخرى.')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    try { await fbSignOut(auth) } catch {}
    setCurrentUser(null)
  }

  // ── Cashier management ────────────────────────────────────
  // دايماً بيقرأ أحدث نسخة من platform من الـ store
  const saveCashier = async ({ tenantId, cashier }) => {
    // اقرأ أحدث platform من store (مش من closure)
    const platform = getLatestPlatform()
    const tenants  = platform?.tenants || []
    const tenant   = tenants.find(t => t.id === tenantId)
    if (!tenant) return { ok: false, error: 'الكافيه غير موجود' }

    const cashiers  = tenant.cashiers || []
    const duplicate = cashiers.find(c =>
      c.email?.toLowerCase() === cashier.email?.toLowerCase() && c.id !== cashier.id
    )
    if (duplicate) return { ok: false, error: 'هذا الإيميل مسجل لكاشير آخر' }

    const hashed = cashier.password ? await hashPassword(cashier.password) : null

    const updated = cashier.id
      ? cashiers.map(c => c.id === cashier.id
          ? { ...c, name: cashier.name, email: cashier.email.toLowerCase(),
              employeeId: cashier.employeeId,
              ...(hashed ? { passwordHash: hashed } : {}) }
          : c)
      : [...cashiers, {
          id: `csh_${Date.now()}`,
          name: cashier.name,
          email: cashier.email.toLowerCase(),
          passwordHash: hashed,
          employeeId: cashier.employeeId,
          active: true,
          createdAt: new Date().toISOString(),
        }]

    // حفظ مباشر لـ Firestore بدون اعتماد على store intermediate
    const newTenants = tenants.map(t => t.id === tenantId ? { ...t, cashiers: updated } : t)
    try {
      await savePlatform({ tenants: newTenants })
      // حدّث الـ store محلياً فوراً
      useStore.getState().setPlatform({ ...platform, tenants: newTenants })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: 'فشل الحفظ. تحقق من الاتصال.' }
    }
  }

  const deleteCashier = async ({ tenantId, cashierId }) => {
    const platform   = getLatestPlatform()
    const tenants    = platform?.tenants || []
    const newTenants = tenants.map(t =>
      t.id === tenantId
        ? { ...t, cashiers: (t.cashiers || []).filter(c => c.id !== cashierId) }
        : t
    )
    await savePlatform({ tenants: newTenants })
    useStore.getState().setPlatform({ ...platform, tenants: newTenants })
  }

  const toggleCashier = async ({ tenantId, cashierId, active }) => {
    const platform   = getLatestPlatform()
    const tenants    = platform?.tenants || []
    const newTenants = tenants.map(t =>
      t.id === tenantId
        ? { ...t, cashiers: (t.cashiers || []).map(c => c.id === cashierId ? { ...c, active } : c) }
        : t
    )
    await savePlatform({ tenants: newTenants })
    useStore.getState().setPlatform({ ...platform, tenants: newTenants })
  }

  return { login, logout, loading, error, setError, saveCashier, deleteCashier, toggleCashier }
}
