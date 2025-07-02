import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    
    // Exibir mensagem de erro
    const mensagem = error.response?.data?.message || 'Erro interno do servidor'
    ElMessage.error(mensagem)
    
    return Promise.reject(error)
  }
)

export { api }