import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import type { Produto, FiltrosProduto } from '../types'

export const useProdutosStore = defineStore('produtos', () => {
  const produtos = ref<Produto[]>([])
  const carregando = ref(false)
  const total = ref(0)
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)

  const listarProdutos = async (filtros: FiltrosProduto = {}) => {
    carregando.value = true
    try {
      const params = {
        page: filtros.page || paginaAtual.value,
        per_page: filtros.per_page || itensPorPagina.value,
        search: filtros.search || '',
        categoria_id: filtros.categoria_id || null
      }

      const response = await api.get('/produtos', { params })
      produtos.value = response.data.data
      total.value = response.data.total
      paginaAtual.value = response.data.current_page
    } catch (error) {
      console.error('Erro ao listar produtos:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const obterProduto = async (id: number) => {
    try {
      const response = await api.get(`/produtos/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter produto:', error)
      throw error
    }
  }

  const criarProduto = async (dados: FormData) => {
    try {
      const response = await api.post('/produtos', dados, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await listarProdutos()
      return response.data
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      throw error
    }
  }

  const atualizarProduto = async (id: number, dados: FormData) => {
    try {
      const response = await api.post(`/produtos/${id}`, dados, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await listarProdutos()
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw error
    }
  }

  const excluirProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`)
      await listarProdutos()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      throw error
    }
  }

  return {
    produtos,
    carregando,
    total,
    paginaAtual,
    itensPorPagina,
    listarProdutos,
    obterProduto,
    criarProduto,
    atualizarProduto,
    excluirProduto
  }
})