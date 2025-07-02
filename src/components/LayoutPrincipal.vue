<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>Sistema de Produtos</h2>
        </div>
        
        <div class="header-actions">
          <el-dropdown @command="handleDropdown">
            <span class="user-dropdown">
              {{ authStore.usuario?.nome || 'Usuário' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">Perfil</el-dropdown-item>
                <el-dropdown-item command="logout" divided>Sair</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    
    <el-container>
      <el-aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          @select="handleMenuSelect"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          
          <el-menu-item index="/produtos">
            <el-icon><Box /></el-icon>
            <span>Produtos</span>
          </el-menu-item>
          
          <el-menu-item index="/categorias">
            <el-icon><Grid /></el-icon>
            <span>Categorias</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Fold, Expand, House, Box, Grid } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const activeMenu = computed(() => route.path)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const handleDropdown = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        'Tem certeza que deseja sair?',
        'Confirmar Saída',
        {
          confirmButtonText: 'Sair',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        }
      )
      
      authStore.logout()
      router.push('/login')
    } catch {
      // Usuário cancelou
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.sidebar {
  background: white;
  border-right: 1px solid #e4e7ed;
  width: 250px;
  transition: width 0.3s;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: #f5f5f5;
}

.main-content {
  background: #f0f2f5;
  padding: 0;
}

.el-menu {
  border-right: none;
  margin-top: 50px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .logo h2 {
    font-size: 18px;
  }
}
</style>