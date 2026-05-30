import type { StorageUsage } from '../types'
import { API_URL, authHeaders, handleResponse } from './utils'

export const getStorageUsage = async (): Promise<StorageUsage> => {
  const res = await fetch(`${API_URL}/auth/storage`, { headers: authHeaders() })
  return handleResponse<StorageUsage>(res, 'Error al obtener el uso de almacenamiento')
}
