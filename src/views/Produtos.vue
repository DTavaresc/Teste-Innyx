<template>
  <div class="page-container">
    <LayoutPrincipal>
      <div class="content-wrapper">
        <div class="page-header">
          <h1>Gerenciamento de Produtos</h1>
          <el-button type="primary" @click="abrirModalProduto()">
            <el-icon><Plus /></el-icon>
            Novo Produto
          </el-button>
        </div>
        
        <!-- Filtros -->
        <el-card class="filtros-card card-shadow">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-input
                v-model="filtros.search"
                placeholder="Buscar por nome ou descrição..."
                clearable
                @input="buscarProdutos"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-select
                v-model="filtros.categoria_id"
                placeholder="Filtrar por categoria"
                clearable
                @change="buscarProdutos"
                style="width: 100%"
              >
                <el-option
                  v-for="categoria in categoriasStore.categorias"
                  :key="categoria.id"
                  :label="categoria.nome"
                  :value="categoria.id"
                />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8">
              <el-button @click="limparFiltros">Limpar Filtros</el-button>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- Tabela de Produtos -->
        <el-card class="tabela-card card-shadow">
          <el-table
            v-loading="produtosStore.carregando"
            :data="produtosStore.produtos"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="imagem" label="Imagem" width="80">
              <template #default="{ row }">
                <el-avatar
                  :src="row.imagem || '/placeholder-product.jpg'"
                  shape="square"
                  size="medium"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="nome" label="Nome" min-width="150" />
            
            <el-table-column prop="descricao" label="Descrição" min-width="200">
              <template #default="{ row }">
                <el-tooltip :content="row.descricao" placement="top">
                  <span>{{ row.descricao.substring(0, 50) }}...</span>
                </el-tooltip>
              </template>
            </el-table-column>
            
            <el-table-column prop="categoria.nome" label="Categoria" width="120" />
            
            <el-table-column prop="preco" label="Preço" width="100">
              <template #default="{ row }">
                R$ {{ row.preco.toFixed(2) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="data_validade" label="Validade" width="120">
              <template #default="{ row }">
                {{ formatarData(row.data_validade) }}
              </template>
            </el-table-column>
            
            <el-table-column label="Ações" width="120">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="abrirModalProduto(row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmarExclusao(row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- Paginação -->
          <div class="paginacao">
            <el-pagination
              v-model:current-page="produtosStore.paginaAtual"
              v-model:page-size="produtosStore.itensPorPagina"
              :page-sizes="[5, 10, 20, 50]"
              :total="produtosStore.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="buscarProdutos"
              @current-change="buscarProdutos"
            />
          </div>
        </el-card>
        
        <!-- Modal do Produto -->
        <ModalProduto
          v-model="modalProdutoVisivel"
          :produto="produtoEdicao"
          @salvo="onProdutoSalvo"
        />
      </div>
    </LayoutPrincipal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import LayoutPrincipal from '../components/LayoutPrincipal.vue'
import ModalProduto from '../components/ModalProduto.vue'
import { useProdutosStore } from '../stores/produtos'
import { useCategoriasStore } from '../stores/categorias'
import type { Produto } from '../types'
import dayjs from 'dayjs'

const produtosStore = useProdutosStore()
const categoriasStore = useCategoriasStore()

const modalProdutoVisivel = ref(false)
const produtoEdicao = ref<Produto | null>(null)

const filtros = reactive({
  search: '',
  categoria_id: null as number | null
})

const formatarData = (data: string) => {
  return dayjs(data).format('DD/MM/YYYY')
}

const buscarProdutos = async () => {
  await produtosStore.listarProdutos({
    page: produtosStore.paginaAtual,
    per_page: produtosStore.itensPorPagina,
    search: filtros.search,
    categoria_id: filtros.categoria_id
  })
}

const limparFiltros = () => {
  filtros.search = ''
  filtros.categoria_id = null
  buscarProdutos()
}

const abrirModalProduto = (produto?: Produto) => {
  produtoEdicao.value = produto || null
  modalProdutoVisivel.value = true
}

const onProdutoSalvo = () => {
  modalProdutoVisivel.value = false
  produtoEdicao.value = null
  buscarProdutos()
}

const confirmarExclusao = async (produto: Produto) => {
  try {
    await ElMessageBox.confirm(
      `Tem certeza que deseja excluir o produto "${produto.nome}"?`,
      'Confirmar Exclusão',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      }
    )
    
    await produtosStore.excluirProduto(produto.id)
    ElMessage.success('Produto excluído com sucesso!')
  } catch (error) {
    // Usuário cancelou a exclusão
  }
}

onMounted(async () => {
  await categoriasStore.listarCategorias()
  await buscarProdutos()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  color: white;
  font-size: 28px;
  margin: 0;
}

.filtros-card {
  margin-bottom: 20px;
}

.tabela-card {
  margin-bottom: 20px;
}

.paginacao {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .page-header h1 {
    font-size: 24px;
    text-align: center;
  }
}
</style>