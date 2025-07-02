<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Sistema de Produtos</h1>
        <p>Faça login para continuar</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="realizarLogin"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="Digite seu email"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="Senha" prop="senha">
          <el-input
            v-model="form.senha"
            type="password"
            placeholder="Digite sua senha"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="realizarLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.carregando"
            @click="realizarLogin"
            style="width: 100%"
          >
            Entrar
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>Usuário demo: admin@innyx.com</p>
        <p>Senha demo: 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const form = reactive({
  email: 'admin@innyx.com',
  senha: '123456'
})

const rules = {
  email: [
    { required: true, message: 'Email é obrigatório', trigger: 'blur' },
    { type: 'email', message: 'Email inválido', trigger: 'blur' }
  ],
  senha: [
    { required: true, message: 'Senha é obrigatória', trigger: 'blur' },
    { min: 6, message: 'Senha deve ter no mínimo 6 caracteres', trigger: 'blur' }
  ]
}

const realizarLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await authStore.login(form.email, form.senha)
    ElMessage.success('Login realizado com sucesso!')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Erro no login:', error)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer p {
  margin: 4px 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>