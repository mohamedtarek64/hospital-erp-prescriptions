<template>
  <div class="register-container">
    <div class="register-form-container">
      <div class="register-header">
        <div class="register-logo">
          <svg class="register-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </div>
        <h2 class="register-title">
          إنشاء حساب جديد
        </h2>
        <p class="register-subtitle">
          أو
          <router-link to="/login" class="register-link">
            تسجيل الدخول
          </router-link>
        </p>
      </div>
      
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="register-input-group">
          <div class="register-form-group">
            <label for="name" class="register-label">الاسم الكامل</label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="register-input"
              placeholder="الاسم الكامل"
            />
          </div>
          
          <div class="register-form-group">
            <label for="email" class="register-label">البريد الإلكتروني</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="register-input"
              placeholder="البريد الإلكتروني"
            />
          </div>
          
          <div class="register-form-group">
            <label for="role" class="register-label">الدور</label>
            <select
              id="role"
              v-model="form.role"
              name="role"
              required
              class="register-select"
            >
              <option value="">اختر الدور</option>
              <option value="receptionist">موظف استقبال</option>
              <option value="nurse">ممرض/ممرضة</option>
              <option value="doctor">طبيب</option>
              <option value="admin">مدير</option>
            </select>
          </div>
          
          <div class="register-form-group">
            <label for="phone" class="register-label">رقم الهاتف</label>
            <input
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              class="register-input"
              placeholder="رقم الهاتف (اختياري)"
            />
          </div>
          
          <div class="register-form-group">
            <label for="department" class="register-label">القسم</label>
            <input
              id="department"
              v-model="form.department"
              name="department"
              type="text"
              class="register-input"
              placeholder="القسم (اختياري)"
            />
          </div>
          
          <div class="register-form-group">
            <label for="password" class="register-label">كلمة المرور</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="register-input"
              placeholder="كلمة المرور"
            />
            <!-- Password Strength Indicator -->
            <div v-if="form.password" class="password-strength">
              <div class="password-strength-bar">
                <div 
                  class="password-strength-fill"
                  :class="getPasswordStrengthColor()"
                  :style="{ width: getPasswordStrengthWidth() }"
                ></div>
              </div>
              <div class="password-strength-text">
                قوة كلمة المرور: {{ getPasswordStrengthText() }}
              </div>
            </div>
          </div>
          
          <div class="register-form-group">
            <label for="password_confirmation" class="register-label">تأكيد كلمة المرور</label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              name="password_confirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="register-input"
              placeholder="تأكيد كلمة المرور"
            />
          </div>
        </div>

        <div v-if="error" class="register-error">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="register-submit-btn"
          >
            <span v-if="loading" class="register-loading">
              <svg class="register-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ getLoadingText() }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'RegisterView'
})
import RegisterManager from '@/scripts/auth/registerManager.js'

// Initialize the register manager
const registerManager = new RegisterManager()

// Get reactive data and methods
const { form, loading, error, showPassword, showConfirmPassword } = registerManager.getReactiveData()

const {
  handleRegister,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  getPasswordStrengthWidth,
  getLoadingText
} = registerManager.getMethods()
</script>

<style scoped>
@import '@/assets/css/register.css';
</style>
