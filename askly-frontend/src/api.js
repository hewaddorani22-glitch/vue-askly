// Zentrale Stelle für ALLE Anfragen ans Laravel-Backend (REST).
// Statt Firebase-SDK sprechen wir jetzt per HTTP (fetch) mit unserer eigenen API.

// Basis-URL des Backends. Kommt aus der .env-Datei (VITE_API_URL),
// Fallback ist der lokale Laravel-Dev-Server.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Sanctum-Token des eingeloggten Hosts (im Browser gespeichert).
export const getToken = () => localStorage.getItem('askly_token')
export const setToken = (t) => localStorage.setItem('askly_token', t)
export const clearToken = () => localStorage.removeItem('askly_token')

// Kleine Helfer-Funktion, die eine HTTP-Anfrage baut, den Token anhängt
// und die JSON-Antwort zurückgibt. Bei Fehlern (Status >= 400) wirft sie
// einen Error mit der Server-Nachricht – das fangen die Views ab.
async function request(method, path, body = null) {
  const headers = { 'Accept': 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  // 204 (No Content) hat keinen Body
  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || `Fehler ${res.status}`
    throw new Error(message)
  }
  return data
}

// Bequeme Kurzformen für die vier HTTP-Verben:
export const api = {
  get:   (path)       => request('GET', path),
  post:  (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del:   (path)       => request('DELETE', path),
}
