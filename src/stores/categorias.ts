import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import type { Categoria } from '../types'

export const useCategoriasStore = defineStore('categorias', () => {
  const categorias = ref<Categoria[]>([])
  const carregando = ref(false)

  const listarCategorias = async () => {
    carregando.value = true
    try {
      const response = await api.get('/categorias')
      categorias.value = response.data
    } catch (error) {
      console.error('Erro ao listar categorias:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const criarCategoria = async (dados: { nome: string }) => {
    try {
      const response = await api.post('/categorias', dados)
      await listarCategorias()
      return response.data
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    }
  }

  const atualizarCategoria = async (id: number, dados: { nome: string }) => {
    try {
      const response = await api.put(`/categorias/${id}`, dados)
      await listarCategorias()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      throw error
    }
  }

  const excluirCategoria = async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`)
      await listarCategorias()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      throw error
    }
  }

  return {
    categorias,
    carregando,
    listarCategorias,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria
  }
})