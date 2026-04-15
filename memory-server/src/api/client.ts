import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export async function bootstrap(): Promise<boolean> {
  try {
    await api.get('/auth/bootstrap')
    return true
  } catch {
    return false
  }
}

export default api
