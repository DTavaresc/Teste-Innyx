import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'
import type { Usuario } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const usuario = ref<Usuario | null>(null)
  const carregando = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, senha: string) => {
    carregando.value = true
    try {
      const response = await api.post('/auth/login', { email, senha })
      token.value = response.data.token
      usuario.value = response.data.usuario
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      throw error
    } finally {
      carregando.value = false
    }
  }

  const logout = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
  }

  const verificarToken = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.get('/auth/me')
      usuario.value = response.data
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    token,
    usuario,
    carregando,
    isAuthenticated,
    login,
    logout,
    verificarToken
  }
})