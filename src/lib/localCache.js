const key = (cafeId) => `erp_cafe_${cafeId}`

export function saveLocal(cafeId, data) {
  if (!cafeId || !data) return
  const payload = JSON.stringify({ ...data, _ts: Date.now() })
  try {
    localStorage.setItem(key(cafeId), payload)
  } catch (e) {
    // Storage quota exceeded — try to free space by removing old non-critical keys,
    // then retry once. Orders and shifts must never be lost.
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      try {
        // Remove other app keys that aren't the main cafe data
        const keep = key(cafeId)
        Object.keys(localStorage)
          .filter(k => k.startsWith('erp_') && k !== keep && k !== 'erp_darkMode' && k !== 'erp_session' && k !== 'erp_pending_deletes')
          .forEach(k => localStorage.removeItem(k))
        localStorage.setItem(key(cafeId), payload)
      } catch {
        console.error('localStorage full — offline data may be lost. Clear browser storage.')
      }
    }
  }
}

export function loadLocal(cafeId) {
  if (!cafeId) return null
  try { return JSON.parse(localStorage.getItem(key(cafeId)) || 'null') } catch { return null }
}
