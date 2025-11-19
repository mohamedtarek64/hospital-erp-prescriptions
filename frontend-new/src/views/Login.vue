<template>
  <div class="login-page">
    <!-- Animated Background -->
    <div class="animated-background"></div>
    
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <svg class="logo-icon" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_6_319)">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
            </g>
            <defs>
              <clipPath id="clip0_6_319">
                <rect fill="white" height="48" width="48"></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a class="nav-item" href="#" title="Contact Support">
          <span class="material-symbols-outlined">contact_support</span>
          <span class="nav-tooltip">Contact Support</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <div class="login-grid">
        <!-- Left Panel - Branding -->
        <div class="branding-panel">
          <div class="branding-content">
            <div class="branding-header">
              <svg class="branding-logo" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_6_319_2)">
                  <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_319_2">
                    <rect fill="white" height="48" width="48"></rect>
                  </clipPath>
                </defs>
              </svg>
              <h1 class="branding-title">نظام إدارة المستشفى</h1>
            </div>
            <p class="branding-description">
              نظام إدارة المستشفى المتطور لإدارة العمليات الطبية بكفاءة عالية
            </p>
          </div>
          <div class="branding-footer">
            <p>© 2024 نظام إدارة المستشفى. جميع الحقوق محفوظة.</p>
          </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="login-panel">
          <div class="login-content">
            <!-- Alert Messages -->
            <transition name="alert">
              <div v-if="error" class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ error }}</span>
              </div>
            </transition>
            
            <transition name="alert">
              <div v-if="success" class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <span>{{ success }}</span>
              </div>
            </transition>

            <!-- Login Header -->
            <div class="login-header">
              <h2 class="login-title">مرحباً بعودتك</h2>
              <p class="login-subtitle">يرجى إدخال بياناتك لتسجيل الدخول</p>
            </div>

            <!-- Login Form -->
            <form @submit="handleSubmit" class="login-form">
              <div class="form-group">
                <div class="input-container">
                  <span class="input-icon material-symbols-outlined">person</span>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    class="form-input"
                    placeholder="البريد الإلكتروني"
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <div class="input-container">
                  <span class="input-icon material-symbols-outlined">lock</span>
                  <input 
                    type="password" 
                    id="password" 
                    v-model="formData.password" 
                    class="form-input"
                    placeholder="كلمة المرور"
                    required
                  >
                </div>
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="form-options">
                <label class="checkbox-wrapper">
                  <input type="checkbox" class="checkbox-input" v-model="rememberMe">
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">تذكرني</span>
                </label>
                <a href="#" class="forgot-password">نسيت كلمة المرور؟</a>
              </div>
              
              <!-- Login Button -->
              <button type="submit" class="login-btn" :disabled="loading">
                <span v-if="!loading" class="btn-content">
                  تسجيل الدخول
                </span>
                <span v-else class="btn-loading">
                  <div class="btn-spinner"></div>
                  جاري تسجيل الدخول...
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLogin } from '@/scripts/views/login'

defineOptions({
  name: 'LoginView'
})

const {
  loading,
  error,
  success,
  formData,
  handleSubmit
} = useLogin()

const rememberMe = ref(false)
</script>

<style scoped>
@import '@/assets/css/views/login-scoped.css';
</style>