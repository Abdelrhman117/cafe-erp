const key = (cafeId) => `erp_cafe_${cafeId}`

export function saveLocal(cafeId, data) {
  if (!cafeId || !data) return
  try { localStorage.setItem(key(cafeId), JSON.stringify({ ...data, _ts: Date.now() })) } catch {}
}

export function loadLocal(cafeId) {
  if (!cafeId) return null
  try { return JSON.parse(localStorage.getItem(key(cafeId)) || 'null') } catch { return null }
}
