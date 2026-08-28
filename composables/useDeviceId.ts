const DEVICE_KEY = 'etec-library:device-id'

export function useDeviceId() {
  const id = useState<string>('device-id', () => {
    if (!import.meta.client) return ''
    try {
      let value = localStorage.getItem(DEVICE_KEY)
      if (!value) {
        value = crypto.randomUUID()
        localStorage.setItem(DEVICE_KEY, value)
      }
      return value
    } catch {
      return ''
    }
  })

  return id
}
