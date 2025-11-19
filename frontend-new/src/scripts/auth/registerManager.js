import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Register Management Class
export class RegisterManager {
  constructor() {
    this.router = useRouter()
    this.authStore = useAuthStore()
    
    // Form state
    this.form = reactive({
      name: '',
      email: '',
      role: '',
      phone: '',
      department: '',
      password: '',
      password_confirmation: ''
    })
    
    // UI state
    this.loading = ref(false)
    this.error = ref('')
    this.showPassword = ref(false)
    this.showConfirmPassword = ref(false)
  }

  // Methods
  async handleRegister() {
    if (!this.validateForm()) {
      return
    }

    this.loading.value = true
    this.error.value = ''

    try {
      const result = await this.authStore.register(this.form)
      
      if (result.success) {
        this.router.push('/dashboard')
      } else {
        this.error.value = result.message
      }
    } catch (err) {
      this.error.value = 'حدث خطأ في الاتصال بالخادم'
      console.error('Register error:', err)
    } finally {
      this.loading.value = false
    }
  }

  // Form validation
  validateForm() {
    // Required fields
    if (!this.form.name || !this.form.email || !this.form.role || !this.form.password || !this.form.password_confirmation) {
      this.error.value = 'يرجى ملء جميع الحقول المطلوبة'
      return false
    }

    // Name validation
    if (this.form.name.length < 3) {
      this.error.value = 'الاسم يجب أن يكون 3 أحرف على الأقل'
      return false
    }

    // Email validation
    if (!this.isValidEmail(this.form.email)) {
      this.error.value = 'يرجى إدخال بريد إلكتروني صحيح'
      return false
    }

    // Role validation
    if (!['admin', 'doctor', 'nurse', 'receptionist'].includes(this.form.role)) {
      this.error.value = 'يرجى اختيار دور صحيح'
      return false
    }

    // Password validation
    if (this.form.password.length < 6) {
      this.error.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      return false
    }

    if (this.form.password !== this.form.password_confirmation) {
      this.error.value = 'كلمة المرور وتأكيدها غير متطابقين'
      return false
    }

    // Phone validation (optional)
    if (this.form.phone && !this.isValidPhone(this.form.phone)) {
      this.error.value = 'يرجى إدخال رقم هاتف صحيح'
      return false
    }

    return true
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/
    return phoneRegex.test(phone) && phone.length >= 8
  }

  // Password strength check
  getPasswordStrength() {
    if (!this.form.password) return 0
    
    let strength = 0
    
    if (this.form.password.length >= 8) strength += 1
    if (/[a-z]/.test(this.form.password)) strength += 1
    if (/[A-Z]/.test(this.form.password)) strength += 1
    if (/[0-9]/.test(this.form.password)) strength += 1
    if (/[^A-Za-z0-9]/.test(this.form.password)) strength += 1
    
    return strength
  }

  // Get password strength text
  getPasswordStrengthText() {
    const strength = this.getPasswordStrength()
    const texts = {
      0: 'ضعيف جداً',
      1: 'ضعيف',
      2: 'متوسط',
      3: 'جيد',
      4: 'قوي',
      5: 'قوي جداً'
    }
    return texts[strength] || 'غير محدد'
  }

  // Get password strength color
  getPasswordStrengthColor() {
    const strength = this.getPasswordStrength()
    const colors = {
      0: 'bg-red-500',
      1: 'bg-orange-500',
      2: 'bg-yellow-500',
      3: 'bg-blue-500',
      4: 'bg-green-500',
      5: 'bg-emerald-500'
    }
    return colors[strength] || 'bg-gray-500'
  }

  // Get password strength width
  getPasswordStrengthWidth() {
    const strength = this.getPasswordStrength()
    return `${(strength / 5) * 100}%`
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

  // Handle role selection
  handleRoleSelection(role) {
    this.form.role = role
    this.clearError()
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword.value = !this.showPassword.value
  }

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.value = !this.showConfirmPassword.value
  }

  // Handle key press (Enter key)
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleRegister()
    }
  }

  // Check if form is valid
  isFormValid() {
    return this.form.name && this.form.email && this.form.role && this.form.password && this.form.password_confirmation
  }

  // Get loading text
  getLoadingText() {
    return this.loading.value ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'
  }

  // Reset form
  resetForm() {
    this.form.name = ''
    this.form.email = ''
    this.form.role = ''
    this.form.phone = ''
    this.form.department = ''
    this.form.password = ''
    this.form.password_confirmation = ''
    this.error.value = ''
    this.showPassword.value = false
    this.showConfirmPassword.value = false
  }

  // Navigate to login
  goToLogin() {
    this.router.push('/login')
  }

  // Get role options
  getRoleOptions() {
    return [
      {
        value: 'receptionist',
        label: 'موظف استقبال',
        description: 'إدارة المواعيد والمرضى',
        icon: '🏥'
      },
      {
        value: 'nurse',
        label: 'ممرض/ممرضة',
        description: 'رعاية المرضى والعلاج',
        icon: '👩‍⚕️'
      },
      {
        value: 'doctor',
        label: 'طبيب',
        description: 'تشخيص وعلاج المرضى',
        icon: '👨‍⚕️'
      },
      {
        value: 'admin',
        label: 'مدير',
        description: 'إدارة النظام بالكامل',
        icon: '👑'
      }
    ]
  }

  // Get all reactive references
  getReactiveData() {
    return {
      form: this.form,
      loading: this.loading,
      error: this.error,
      showPassword: this.showPassword,
      showConfirmPassword: this.showConfirmPassword
    }
  }

  // Get all methods
  getMethods() {
    return {
      handleRegister: this.handleRegister.bind(this),
      validateForm: this.validateForm.bind(this),
      isValidEmail: this.isValidEmail.bind(this),
      isValidPhone: this.isValidPhone.bind(this),
      getPasswordStrength: this.getPasswordStrength.bind(this),
      getPasswordStrengthText: this.getPasswordStrengthText.bind(this),
      getPasswordStrengthColor: this.getPasswordStrengthColor.bind(this),
      getPasswordStrengthWidth: this.getPasswordStrengthWidth.bind(this),
      clearError: this.clearError.bind(this),
      autoClearError: this.autoClearError.bind(this),
      handleInputChange: this.handleInputChange.bind(this),
      handleRoleSelection: this.handleRoleSelection.bind(this),
      togglePasswordVisibility: this.togglePasswordVisibility.bind(this),
      toggleConfirmPasswordVisibility: this.toggleConfirmPasswordVisibility.bind(this),
      handleKeyPress: this.handleKeyPress.bind(this),
      isFormValid: this.isFormValid.bind(this),
      getLoadingText: this.getLoadingText.bind(this),
      resetForm: this.resetForm.bind(this),
      goToLogin: this.goToLogin.bind(this),
      getRoleOptions: this.getRoleOptions.bind(this)
    }
  }
}

// Utility functions
export const registerUtils = {
  // Format phone number
  formatPhoneNumber(phone) {
    if (!phone) return ''
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format Egyptian phone numbers
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return `+20 ${cleaned.slice(1)}`
    }
    
    return phone
  },

  // Sanitize input
  sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '')
  },

  // Generate strong password
  generateStrongPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return password
  },

  // Check if department is required for role
  isDepartmentRequired(role) {
    return ['doctor', 'nurse'].includes(role)
  },

  // Get department suggestions based on role
  getDepartmentSuggestions(role) {
    const suggestions = {
      'doctor': ['قسم القلب', 'قسم المخ والأعصاب', 'قسم الجراحة', 'قسم الأطفال', 'قسم النساء والولادة'],
      'nurse': ['قسم الطوارئ', 'قسم العناية المركزة', 'قسم العمليات', 'قسم الأطفال', 'قسم النساء والولادة'],
      'receptionist': ['قسم الاستقبال', 'قسم المواعيد', 'قسم المعلومات'],
      'admin': ['الإدارة العامة', 'قسم الموارد البشرية', 'قسم تكنولوجيا المعلومات']
    }
    
    return suggestions[role] || []
  }
}

// Export default instance
export default RegisterManager
