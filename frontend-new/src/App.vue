<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // التحقق من وجود token في URL
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const user = urlParams.get('user')
  
  if (token === 'valid' && user) {
    try {
      const userData = JSON.parse(decodeURIComponent(user))
      
      // حفظ بيانات المستخدم
      authStore.user = userData
      authStore.token = 'valid-token'
      authStore.isAuthenticated = true
      
      // إزالة token من URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      console.log('تم تسجيل الدخول بنجاح:', userData)
    } catch (error) {
      console.error('خطأ في تحليل بيانات المستخدم:', error)
    }
  }
})
</script>


<style>
#app {
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}
</style>
