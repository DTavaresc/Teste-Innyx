<template>
  <el-dialog
    v-model="visible"
    :title="produto ? 'Editar Produto' : 'Novo Produto'"
    width="800px"
    @close="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      v-loading="carregando"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Nome do Produto" prop="nome">
            <el-input
              v-model="form.nome"
              placeholder="Digite o nome do produto"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="Categoria" prop="categoria_id">
            <el-select
              v-model="form.categoria_id"
              placeholder="Selecione uma categoria"
              style="width: 100%"
            >
              <el-option
                v-for="categoria in categoriasStore.categorias"
                :key="categoria.id"
                :label="categoria.nome"
                :value="categoria.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="Descrição" prop="descricao">
        <el-input
          v-model="form.descricao"
          type="textarea"
          :rows="3"
          placeholder="Digite a descrição do produto"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Preço (R$)" prop="preco">
            <el-input-number
              v-model="form.preco"
              :min="0.01"
              :precision="2"
              placeholder="0.00"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="Data de Validade" prop="data_validade">
            <el-date-picker
              v-model="form.data_validade"
              type="date"
              placeholder="Selecione a data"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="Imagem do Produto">
        <el-upload
          ref="uploadRef"
          :file-list="fileList"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          list-type="picture-card"
          :limit="1"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        
        <div v-if="produto?.imagem && !fileList.length" class="current-image">
          <span>Imagem atual:</span>
          <el-image
            :src="produto.imagem"
            style="width: 100px; height: 100px"
            fit="cover"
          />
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">Cancelar</el-button>
        <el-button type="primary" @click="salvar" :loading="carregando">
          {{ produto ? 'Atualizar' : 'Criar' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProdutosStore } from '../stores/produtos'
import { useCategoriasStore } from '../stores/categorias'
import type { Produto } from '../types'
import dayjs from 'dayjs'

interface Props {
  modelValue: boolean
  produto?: Produto | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'salvo'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const produtosStore = useProdutosStore()
const categoriasStore = useCategoriasStore()

const formRef = ref<FormInstance>()
const uploadRef = ref()
const carregando = ref(false)
const fileList = ref<UploadFile[]>([])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  nome: '',
  descricao: '',
  preco: 0,
  data_validade: '',
  categoria_id: null as number | null,
  imagem: null as File | null
})

const rules = {
  nome: [
    { required: true, message: 'Nome é obrigatório', trigger: 'blur' },
    { max: 50, message: 'Nome deve ter no máximo 50 caracteres', trigger: 'blur' }
  ],
  descricao: [
    { required: true, message: 'Descrição é obrigatória', trigger: 'blur' },
    { max: 200, message: 'Descrição deve ter no máximo 200 caracteres', trigger: 'blur' }
  ],
  preco: [
    { required: true, message: 'Preço é obrigatório', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Preço deve ser maior que zero', trigger: 'blur' }
  ],
  data_validade: [
    { required: true, message: 'Data de validade é obrigatória', trigger: 'blur' }
  ],
  categoria_id: [
    { required: true, message: 'Categoria é obrigatória', trigger: 'blur' }
  ]
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // Não permite datas anteriores a hoje
}

const handleFileChange = (file: UploadFile) => {
  form.imagem = file.raw as File
}

const handleFileRemove = () => {
  form.imagem = null
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Apenas arquivos de imagem são permitidos!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('Tamanho da imagem deve ser menor que 5MB!')
    return false
  }
  return false // Previne upload automático
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.nome = ''
  form.descricao = ''
  form.preco = 0
  form.data_validade = ''
  form.categoria_id = null
  form.imagem = null
  fileList.value = []
}

const salvar = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    carregando.value = true
    
    const formData = new FormData()
    formData.append('nome', form.nome)
    formData.append('descricao', form.descricao)
    formData.append('preco', form.preco.toString())
    formData.append('data_validade', form.data_validade)
    formData.append('categoria_id', form.categoria_id!.toString())
    
    if (form.imagem) {
      formData.append('imagem', form.imagem)
    }
    
    if (props.produto) {
      formData.append('_method', 'PUT')
      await produtosStore.atualizarProduto(props.produto.id, formData)
      ElMessage.success('Produto atualizado com sucesso!')
    } else {
      await produtosStore.criarProduto(formData)
      ElMessage.success('Produto criado com sucesso!')
    }
    
    emit('salvo')
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
  } finally {
    carregando.value = false
  }
}

// Preencher formulário quando produto for editado
watch(() => props.produto, (produto) => {
  if (produto) {
    form.nome = produto.nome
    form.descricao = produto.descricao
    form.preco = produto.preco
    form.data_validade = produto.data_validade
    form.categoria_id = produto.categoria_id
    form.imagem = null
    fileList.value = []
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.current-image {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}
</style>