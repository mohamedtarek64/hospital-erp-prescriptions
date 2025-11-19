import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const loading = ref(false)
  const error = ref('')
  const success = ref('')
  
  const formData = reactive({
    email: '',
    password: ''
  })

  const validateForm = () => {
    if (!formData.email) {
      error.value = 'البريد الإلكتروني مطلوب'
      return false
    }
    
    if (!formData.password) {
      error.value = 'كلمة المرور مطلوبة'
      return false
    }
    
    if (!isValidEmail(formData.email)) {
      error.value = 'البريد الإلكتروني غير صحيح'
      return false
    }
    
    return true
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const clearMessages = () => {
    error.value = ''
    success.value = ''
  }

  const login = async () => {
    if (!validateForm()) {
      return false
    }

    loading.value = true
    clearMessages()

    try {
      // Use real API call
      const userData = await authStore.login({
        email: formData.email,
        password: formData.password
      })
      
      success.value = 'تم تسجيل الدخول بنجاح! جاري التوجيه...'
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'بيانات الدخول غير صحيحة'
      console.error('Login error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await login()
  }

  const resetForm = () => {
    formData.email = ''
    formData.password = ''
    clearMessages()
  }

  return {
    loading,
    error,
    success,
    formData,
    login,
    handleSubmit,
    resetForm,
    clearMessages,
    validateForm
  }
}