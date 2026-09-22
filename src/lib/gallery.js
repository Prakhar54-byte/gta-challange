const STORAGE_KEY = 'vicepd.wanted-gallery.v1'
const MAX_ITEMS = 12

export function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToGallery(dataUrl, label) {
  const gallery = loadGallery()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    label: label || 'UNKNOWN SUSPECT',
    createdAt: new Date().toISOString(),
  }
  const next = [entry, ...gallery].slice(0, MAX_ITEMS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage full or unavailable — fail silently, in-memory state still works
  }
  return next
}

export function removeFromGallery(id) {
  const next = loadGallery().filter((entry) => entry.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}
