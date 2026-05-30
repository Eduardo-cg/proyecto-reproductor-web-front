import { API_URL, authHeaders, handleResponse } from './utils.js'

export const getStorageUsage = async () => {
  const res = await fetch(`${API_URL}/auth/storage`, { headers: authHeaders() })
  return handleResponse(res, 'Error al obtener el uso de almacenamiento')
}
