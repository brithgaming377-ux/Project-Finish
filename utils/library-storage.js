export function getLegacyLibraryStorageKey() {
  return 'marginalia:library'
}

export function getLibraryStorageKey(email) {
  const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : 'guest'
  return `marginalia:library:${normalizedEmail}`
}

export function getAllReaderSavedBookCount() {
  if (!import.meta.client) return 0

  let total = 0

  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('marginalia:library:')) continue

      const raw = localStorage.getItem(key)
      if (!raw) continue

      const state = JSON.parse(raw)
      if (Array.isArray(state?.saved)) {
        total += state.saved.length
      }
    }
  } catch {
    return 0
  }

  return total
}

export function migrateLegacyLibraryState(email) {
  if (!import.meta.client) return null

  const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : ''
  if (!normalizedEmail) return null

  const legacyKey = getLegacyLibraryStorageKey()
  const targetKey = getLibraryStorageKey(normalizedEmail)

  try {
    const raw = localStorage.getItem(legacyKey)
    if (!raw) return null

    const legacyState = JSON.parse(raw)
    const migratedState = {
      saved: Array.isArray(legacyState?.saved) ? legacyState.saved : [],
      borrowed: Array.isArray(legacyState?.borrowed) ? legacyState.borrowed : []
    }

    const currentRaw = localStorage.getItem(targetKey)
    if (currentRaw) {
      const currentState = JSON.parse(currentRaw)
      migratedState.saved = Array.isArray(currentState?.saved) && currentState.saved.length
        ? currentState.saved
        : migratedState.saved
      migratedState.borrowed = Array.isArray(currentState?.borrowed) && currentState.borrowed.length
        ? currentState.borrowed
        : migratedState.borrowed
    }

    localStorage.setItem(targetKey, JSON.stringify(migratedState))
    localStorage.removeItem(legacyKey)
    return migratedState
  } catch {
    return null
  }
}
