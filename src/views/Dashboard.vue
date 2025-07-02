<template>
  <div class="page-container">
    <LayoutPrincipal>
      <div class="dashboard-content">
        <h1>Dashboard</h1>
        
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card card-shadow">
              <div class="stat-content">
                <div class="stat-icon produtos">
                  <el-icon size="24"><Box /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalProdutos }}</h3>
                  <p>Produtos</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card card-shadow">
              <div class="stat-content">
                <div class="stat-icon categorias">
                  <el-icon size="24"><Grid /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalCategorias }}</h3>
                  <p>Categorias</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card card-shadow">
              <div class="stat-content">
                <div class="stat-icon vendas">
                  <el-icon size="24"><TrendCharts /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>R$ 12.540</h3>
                  <p>Vendas do Mês</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card card-shadow">
              <div class="stat-content">
                <div class="stat-icon usuarios">
                  <el-icon size="24"><User /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ authStore.usuario?.nome || 'Usuário' }}</h3>
                  <p>Bem-vindo!</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="content-row">
          <el-col :xs="24" :lg="16">
            <el-card class="card-shadow">
              <template #header>
                <h3>Produtos Recentes</h3>
              </template>
              <el-table v-loading="produtosStore.carregando" :data="produtosRecentes" stripe>
                <el-table-column prop="nome" label="Nome" />
                <el-table-column prop="categoria.nome" label="Categoria" />
                <el-table-column prop="preco" label="Preço">
                  <template #default="{ row }">
                    R$ {{ row.preco.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="data_validade" label="Validade">
                  <template #default="{ row }">
                    {{ formatarData(row.data_validade) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :lg="8">
            <el-card class="card-shadow">
              <template #header>
                <h3>Ações Rápidas</h3>
              </template>
              <div class="quick-actions">
                <el-button type="primary" size="large" @click="$router.push('/produtos')">
                  <el-icon><Plus /></el-icon>
                  Novo Produto
                </el-button>
                <el-button size="large" @click="$router.push('/categorias')">
                  <el-icon><Grid /></el-icon>
                  Gerenciar Categorias
                </el-button>
                <el-button size="large" @click="$router.push('/produtos')">
                  <el-icon><Search /></el-icon>
                  Buscar Produtos
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </LayoutPrincipal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Box, Grid, TrendCharts, User, Plus, Search } from '@element-plus/icons-vue'
import LayoutPrincipal from '../components/LayoutPrincipal.vue'
import { useAuthStore } from '../stores/auth'
import { useProdutosStore } from '../stores/produtos'
import { useCategoriasStore } from '../stores/categorias'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const produtosStore = useProdutosStore()
const categoriasStore = useCategoriasStore()

const totalProdutos = computed(() => produtosStore.total)
const totalCategorias = computed(() => categoriasStore.categorias.length)
const produtosRecentes = computed(() => produtosStore.produtos.slice(0, 5))

const formatarData = (data: string) => {
  return dayjs(data).format('DD/MM/YYYY')
}

onMounted(async () => {
  await produtosStore.listarProdutos({ per_page: 5 })
  await categoriasStore.listarCategorias()
})
</script>

<style scoped>
.dashboard-content {
  padding: 20px;
}

.dashboard-content h1 {
  color: white;
  font-size: 32px;
  margin-bottom: 30px;
  text-align: center;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.produtos {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stat-icon.categorias {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.stat-icon.vendas {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.stat-icon.usuarios {
  background: linear-gradient(45deg, #43e97b, #38f9d7);
}

.stat-info h3 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-row {
  margin-top: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quick-actions .el-button {
  justify-content: flex-start;
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-content h1 {
    font-size: 24px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>