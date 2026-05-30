export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const getToken = (): string | null => localStorage.getItem('token')

export const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${getToken()}`
})

export const jsonHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...authHeaders()
})

export async function handleResponse<T>(res: Response, errorMessage?: string): Promise<T>
export async function handleResponse(res: Response, errorMessage?: string): Promise<Blob>
export async function handleResponse<T>(res: Response, errorMessage: string = 'Error en la petición'): Promise<T | Blob> {
  if (!res.ok) {
    let msg = errorMessage
    try {
      const body = await res.json() as { message?: string }
      if (body?.message) msg = body.message
    } catch {
      msg = res.statusText || errorMessage
    }
    throw new Error(msg)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return res.blob()
}

export const downloadBlob = async (url: string, defaultFilename: string): Promise<void> => {
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
