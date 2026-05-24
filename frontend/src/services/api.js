const BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path, opts = {}, token = null) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Error ' + res.status)
  }
  return res.status === 204 ? null : res.json()
}