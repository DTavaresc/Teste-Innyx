<template>
  <div class="page-container">
    <LayoutPrincipal>
      <div class="content-wrapper">
        <div class="page-header">
          <h1>Gerenciamento de Categorias</h1>
          <el-button type="primary" @click="abrirModalCategoria()">
            <el-icon><Plus /></el-icon>
            Nova Categoria
          </el-button>
        </div>
        
        <el-card class="card-shadow">
          <el-table
            v-loading="categoriasStore.carregando"
            :data="categoriasStore.categorias"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="nome" label="Nome" />
            <el-table-column prop="created_at" label="Criado em" width="150">
              <template #default="{ row }">
                {{ formatarData(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="Ações" width="120">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="abrirModalCategoria(row)"
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
        </el-card>
        
        <!-- Modal da Categoria -->
        <el-dialog
          v-model="modalCategoriaVisivel"
          :title="categoriaEdicao ? 'Editar Categoria' : 'Nova Categoria'"
          width="500px"
        >
          <el-form
            ref="formRef"
            :model="formCategoria"
            :rules="rules"
            label-position="top"
          >
            <el-form-item label="Nome da Categoria" prop="nome">
              <el-input
                v-model="formCategoria.nome"
                placeholder="Digite o nome da categoria"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="modalCategoriaVisivel = false">Cancelar</el-button>
              <el-button type="primary" @click="salvarCategoria">
                {{ categoriaEdicao ? 'Atualizar' : 'Criar' }}
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </LayoutPrincipal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage, type FormInstance } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import LayoutPrincipal from '../components/LayoutPrincipal.vue'
import { useCategoriasStore } from '../stores/categorias'
import type { Categoria } from '../types'
import dayjs from 'dayjs'

const categoriasStore = useCategoriasStore()
const formRef = ref<FormInstance>()

const modalCategoriaVisivel = ref(false)
const categoriaEdicao = ref<Categoria | null>(null)

const formCategoria = reactive({
  nome: ''
})

const rules = {
  nome: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { max: 100, message: 'Nome deve ter no máximo 100 caracteres', trigger: 'blur' }
  ]
}

const formatarData = (data: string) => {
  return dayjs(data).format('DD/MM/YYYY HH:mm')
}

const abrirModalCategoria = (categoria?: Categoria) => {
  categoriaEdicao.value = categoria || null
  formCategoria.nome = categoria?.nome || ''
  modalCategoriaVisivel.value = true
}

const salvarCategoria = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (categoriaEdicao.value) {
      await categoriasStore.atualizarCategoria(categoriaEdicao.value.id, {
        nome: formCategoria.nome
      })
      ElMessage.success('Categoria atualizada com sucesso!')
    } else {
      await categoriasStore.criarCategoria({
        nome: formCategoria.nome
      })
      ElMessage.success('Categoria criada com sucesso!')
    }
    
    modalCategoriaVisivel.value = false
    categoriaEdicao.value = null
    formCategoria.nome = ''
  } catch (error) {
    console.error('Erro ao salvar categoria:', error)
  }
}

const confirmarExclusao = async (categoria: Categoria) => {
  try {
    await ElMessageBox.confirm(
      `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      'Confirmar Exclusão',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      }
    )
    
    await categoriasStore.excluirCategoria(categoria.id)
    ElMessage.success('Categoria excluída com sucesso!')
  } catch (error) {
    // Usuário cancelou a exclusão
  }
}

onMounted(() => {
  categoriasStore.listarCategorias()
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