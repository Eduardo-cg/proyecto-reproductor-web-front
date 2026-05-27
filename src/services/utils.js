const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getToken = () => localStorage.getItem('token')

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
})

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...authHeaders()
})

const handleResponse = async (res, errorMessage = 'Error en la petición') => {
  if (!res.ok) {
    let msg = errorMessage
    try {
      const body = await res.json()
      if (body?.message) msg = body.message
    } catch {
      msg = res.statusText || errorMessage
    }
    throw new Error(msg)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json()
  }
  return res.blob()
}

const downloadBlob = async (url, defaultFilename) => {
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al descargar')
  const disposition = res.headers.get('Content-Disposition')
  let filename = defaultFilename
  if (disposition) {
    const rfc5987 = disposition.match(/filename\*=UTF-8''([^;\s]+)/i)
    if (rfc5987) {
      filename = decodeURIComponent(rfc5987[1])
    } else {
      const fallback = disposition.match(/filename="?(.+?)"?\s*(?:;|$)/)
      if (fallback) filename = fallback[1]
    }
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
}

export { API_URL, getToken, authHeaders, jsonHeaders, handleResponse, downloadBlob }
