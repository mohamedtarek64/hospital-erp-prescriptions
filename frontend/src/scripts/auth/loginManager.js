import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Login Management Class
export class LoginManager {
  constructor() {
    this.router = useRouter()
    this.authStore = useAuthStore()
    
    // Form state
    this.form = reactive({
      email: '',
      password: ''
    })
    
    // UI state
    this.loading = ref(false)
    this.error = ref('')
  }

  // Methods
  async handleLogin() {
    this.loading.value = true
    this.error.value = ''

    try {
      const result = await this.authStore.login(this.form)
      
      if (result.success) {
        this.router.push('/dashboard')
      } else {
        this.error.value = result.message
      }
    } catch (err) {
      this.error.value = 'حدث خطأ في الاتصال بالخادم'
      console.error('Login error:', err)
    } finally {
      this.loading.value = false
    }
  }

  // Form validation
  validateForm() {
    if (!this.form.email || !this.form.password) {
      this.error.value = 'يرجى ملء جميع الحقول المطلوبة'
      return false
    }

    if (!this.isValidEmail(this.form.email)) {
      this.error.value = 'يرجى إدخال بريد إلكتروني صحيح'
      return false
    }

    if (this.form.password.length < 6) {
      this.error.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      return false
    }

    return true
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Clear error
  clearError() {
    this.error.value = ''
  }

  // Auto-clear error after delay
  autoClearError(delay = 5000) {
    if (this.error.value) {
      setTimeout(() => {
        this.clearError()
      }, delay)
    }
  }

  // Handle input change
  handleInputChange(field, value) {
    this.form[field] = value
    this.clearError()
  }

  // Handle key press (Enter key)
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleLogin()
    }
  }

  // Check if form is valid
  isFormValid() {
    return this.form.email && this.form.password
  }

  // Get loading text
  getLoadingText() {
    return this.loading.value ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'
  }

  // Reset form
  resetForm() {
    this.form.email = ''
    this.form.password = ''
    this.error.value = ''
  }

  // Navigate to register
  goToRegister() {
    this.router.push('/register')
  }

  // Get all reactive references
  getReactiveData() {
    return {
      form: this.form,
      loading: this.loading,
      error: this.error
    }
  }

  // Get all methods
  getMethods() {
    return {
      handleLogin: this.handleLogin.bind(this),
      validateForm: this.validateForm.bind(this),
      isValidEmail: this.isValidEmail.bind(this),
      clearError: this.clearError.bind(this),
      autoClearError: this.autoClearError.bind(this),
      handleInputChange: this.handleInputChange.bind(this),
      handleKeyPress: this.handleKeyPress.bind(this),
      isFormValid: this.isFormValid.bind(this),
      getLoadingText: this.getLoadingText.bind(this),
      resetForm: this.resetForm.bind(this),
      goToRegister: this.goToRegister.bind(this)
    }
  }
}

// Utility functions
export const loginUtils = {
  // Format email for display
  formatEmail(email) {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (username.length > 3) {
      return `${username.substring(0, 3)}***@${domain}`
    }
    return email
  },

  // Get password strength
  getPasswordStrength(password) {
    if (!password) return 0
    
    let strength = 0
    
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    return strength
  },

  // Get password strength text
  getPasswordStrengthText(strength) {
    const texts = {
      0: 'ضعيف جداً',
      1: 'ضعيف',
      2: 'متوسط',
      3: 'جيد',
      4: 'قوي',
      5: 'قوي جداً'
    }
    return texts[strength] || 'غير محدد'
  },

  // Get password strength color
  getPasswordStrengthColor(strength) {
    const colors = {
      0: 'text-red-600',
      1: 'text-orange-600',
      2: 'text-yellow-600',
      3: 'text-blue-600',
      4: 'text-green-600',
      5: 'text-emerald-600'
    }
    return colors[strength] || 'text-gray-600'
  },

  // Sanitize input
  sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '')
  },

  // Check if user is remembered
  isUserRemembered() {
    return localStorage.getItem('rememberUser') === 'true'
  },

  // Remember user
  rememberUser(email) {
    localStorage.setItem('rememberUser', 'true')
    localStorage.setItem('rememberedEmail', email)
  },

  // Get remembered email
  getRememberedEmail() {
    return localStorage.getItem('rememberedEmail') || ''
  },

  // Clear remembered user
  clearRememberedUser() {
    localStorage.removeItem('rememberUser')
    localStorage.removeItem('rememberedEmail')
  }
}

// Export default instance
export default LoginManager
