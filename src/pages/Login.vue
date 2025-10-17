<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <h2>{{ isRegister ? '用户注册' : '用户登录' }}</h2>
      </div>
      
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="请输入密码"
              required
              minlength="6"
            />
          </div>
          
          <div v-if="isRegister" class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-control"
              placeholder="请再次输入密码"
              required
              minlength="6"
            />
          </div>
          
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <div v-if="emailConfirmationRequired" class="alert alert-info">
            <p>我们已经向您的邮箱 {{ form.email }} 发送了一封确认邮件。</p>
            <p>请检查您的邮箱并点击确认链接完成注册。</p>
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="resendConfirmation"
              :disabled="resendLoading"
            >
              {{ resendLoading ? '发送中...' : '重新发送确认邮件' }}
            </button>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
            </button>
          </div>
        </form>
        
        <div class="toggle-form">
          <p>
            {{ isRegister ? '已有账户?' : '没有账户?' }}
            <a href="#" @click.prevent="toggleForm">
              {{ isRegister ? '立即登录' : '立即注册' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const isRegister = ref(false)
const loading = ref(false)
const resendLoading = ref(false)
const error = ref('')
const emailConfirmationRequired = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

// 监听认证状态变化
onMounted(() => {
  // 监听认证状态变化
  supabase.auth.onAuthStateChange((_event, session) => {
    // 如果用户已登录且在登录页面，则跳转到首页
    if (session?.user && router.currentRoute.value.path === '/login') {
      router.push('/');
    }
  });
});

const toggleForm = () => {
  isRegister.value = !isRegister.value
  error.value = ''
  emailConfirmationRequired.value = false
}

const resendConfirmation = async () => {
  if (!form.email) {
    error.value = '请输入邮箱地址'
    return
  }
  
  resendLoading.value = true
  error.value = ''
  
  try {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: form.email
    })
    
    if (resendError) {
      error.value = resendError.message
      return
    }
    
    // 重新发送成功提示
    error.value = '确认邮件已重新发送，请检查您的邮箱'
  } catch (err) {
    console.error('重新发送确认邮件失败:', err)
    error.value = '发送确认邮件失败，请稍后重试'
  } finally {
    resendLoading.value = false
  }
}

const handleSubmit = async () => {
  if (isRegister.value && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  loading.value = true
  error.value = ''
  emailConfirmationRequired.value = false
  
  try {
    if (isRegister.value) {
      // 注册
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      })
      
      if (signUpError) {
        error.value = signUpError.message
        return
      }
      
      // 检查是否需要邮箱确认
      if (data.user && !data.user.identities?.length) {
        // 用户已存在，但邮箱未确认
        emailConfirmationRequired.value = true
        return
      }
      
      // 注册成功，提示用户检查邮箱
      emailConfirmationRequired.value = true
    } else {
      // 登录
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      
      if (signInError) {
        // 检查是否是邮箱未确认的错误
        if (signInError.message.includes('Email not confirmed')) {
          emailConfirmationRequired.value = true
          return
        }
        error.value = signInError.message
        return
      }
      
      // 登录成功，跳转到首页
      router.push('/')
    }
  } catch (err) {
    console.error('操作失败:', err)
    error.value = '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  background: white;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  background: #f8f9fa;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.alert-info {
  color: #0c5460;
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0069d9;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-form {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.toggle-form a {
  color: #007bff;
  text-decoration: none;
}

.toggle-form a:hover {
  text-decoration: underline;
}
</style>