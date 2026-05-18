// ============================================================
// localCache.js — نظام تخزين محلي محسّن
// يستخدم IndexedDB أولاً ثم localStorage كـ fallback
// ============================================================

const DB_NAME    = 'erp_offline_db'
const DB_VERSION = 2
const STORE_CAFE = 'cafe_data'
const STORE_QUEUE = 'sync_queue'  // طابور العمليات المعلقة

// ─── فتح IndexedDB ────────────────────────────────────────
let _db = null

function openDB() {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => { _db = req.result; resolve(_db) }
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_CAFE)) {
        db.createObjectStore(STORE_CAFE, { keyPath: 'cafeId' })
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const qs = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true })
        qs.createIndex('cafeId', 'cafeId', { unique: false })
        qs.createIndex('ts', 'ts', { unique: false })
      }
    }
  })
}

// ─── حفظ بيانات الكافيه (IndexedDB + localStorage) ───────
export async function saveLocal(cafeId, data) {
  if (!cafeId || !data) return
  const payload = { cafeId, ...data, _ts: Date.now() }

  // 1. محاولة IndexedDB أولاً (سعة أكبر، أسرع)
  try {
    const db = await openDB()
    await new Promise((res, rej) => {
      const tx  = db.transaction(STORE_CAFE, 'readwrite')
      const req = tx.objectStore(STORE_CAFE).put(payload)
      req.onsuccess = res
      req.onerror   = () => rej(req.error)
    })
  } catch (e) {
    console.warn('IndexedDB save failed, falling back to localStorage:', e)
    _saveLocalStorage(cafeId, payload)
  }

  // 2. دايماً احفظ في localStorage كـ backup (بدون الصور الكبيرة)
  _saveLocalStorage(cafeId, _stripLargeFields(payload))
}

function _saveLocalStorage(cafeId, data) {
  const key = `erp_cafe_${cafeId}`
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      try {
        // تفريغ مفاتيح قديمة
        Object.keys(localStorage)
          .filter(k => k.startsWith('erp_') && k !== key &&
                       k !== 'erp_darkMode' && k !== 'erp_session' &&
                       k !== 'erp_pending_deletes')
          .forEach(k => localStorage.removeItem(k))
        localStorage.setItem(key, JSON.stringify(data))
      } catch {
        console.error('localStorage full — offline backup may be lost.')
      }
    }
  }
}

// إزالة صور base64 الكبيرة من localStorage (توفير مساحة)
function _stripLargeFields(data) {
  if (!data?.products) return data
  return {
    ...data,
    products: data.products.map(p =>
      p.image?.startsWith('data:') ? { ...p, image: null } : p
    )
  }
}

// ─── تحميل بيانات الكافيه ─────────────────────────────────
export async function loadLocal(cafeId) {
  if (!cafeId) return null

  // 1. جرب IndexedDB أولاً (البيانات الكاملة)
  try {
    const db = await openDB()
    const result = await new Promise((res, rej) => {
      const tx  = db.transaction(STORE_CAFE, 'readonly')
      const req = tx.objectStore(STORE_CAFE).get(cafeId)
      req.onsuccess = () => res(req.result || null)
      req.onerror   = () => rej(req.error)
    })
    if (result) return result
  } catch (e) {
    console.warn('IndexedDB load failed, trying localStorage:', e)
  }

  // 2. fallback إلى localStorage
  try {
    return JSON.parse(localStorage.getItem(`erp_cafe_${cafeId}`) || 'null')
  } catch { return null }
}

// ─── طابور العمليات المعلقة (للعمل أوفلاين) ──────────────
export async function enqueueOperation(cafeId, operation) {
  try {
    const db = await openDB()
    await new Promise((res, rej) => {
      const tx  = db.transaction(STORE_QUEUE, 'readwrite')
      const req = tx.objectStore(STORE_QUEUE).add({
        cafeId,
        operation,
        ts: Date.now(),
        retries: 0
      })
      req.onsuccess = res
      req.onerror   = () => rej(req.error)
    })
  } catch (e) {
    console.warn('Failed to enqueue operation:', e)
  }
}

export async function getPendingOperations(cafeId) {
  try {
    const db = await openDB()
    return await new Promise((res, rej) => {
      const tx    = db.transaction(STORE_QUEUE, 'readonly')
      const index = tx.objectStore(STORE_QUEUE).index('cafeId')
      const req   = index.getAll(cafeId)
      req.onsuccess = () => res(req.result || [])
      req.onerror   = () => rej(req.error)
    })
  } catch { return [] }
}

export async function clearPendingOperation(id) {
  try {
    const db = await openDB()
    await new Promise((res, rej) => {
      const tx  = db.transaction(STORE_QUEUE, 'readwrite')
      const req = tx.objectStore(STORE_QUEUE).delete(id)
      req.onsuccess = res
      req.onerror   = () => rej(req.error)
    })
  } catch (e) {
    console.warn('Failed to clear operation:', e)
  }
}

// ─── معلومات التخزين ──────────────────────────────────────
export async function getStorageInfo() {
  const info = { indexedDB: false, localStorage: false, quota: null, usage: null }

  try {
    await openDB()
    info.indexedDB = true
  } catch {}

  try {
    const key = '__erp_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    info.localStorage = true
  } catch {}

  if (navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate()
      info.quota = est.quota
      info.usage = est.usage
    } catch {}
  }

  return info
}

// ─── مسح بيانات كافيه معين ───────────────────────────────
export async function clearCafeData(cafeId) {
  try {
    const db = await openDB()
    await new Promise((res, rej) => {
      const tx  = db.transaction(STORE_CAFE, 'readwrite')
      const req = tx.objectStore(STORE_CAFE).delete(cafeId)
      req.onsuccess = res
      req.onerror   = () => rej(req.error)
    })
  } catch {}
  try { localStorage.removeItem(`erp_cafe_${cafeId}`) } catch {}
}
