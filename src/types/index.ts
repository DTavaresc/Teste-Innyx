export interface Usuario {
  id: number
  nome: string
  email: string
  role?: string
  created_at?: string
  updated_at?: string
}

export interface Categoria {
  id: number
  nome: string
  created_at?: string
  updated_at?: string
}

export interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  data_validade: string
  imagem?: string
  categoria_id: number
  categoria?: Categoria
  created_at?: string
  updated_at?: string
}

export interface FiltrosProduto {
  page?: number
  per_page?: number
  search?: string
  categoria_id?: number | null
}

export interface PaginacaoResposta<T> {
  data: T[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}