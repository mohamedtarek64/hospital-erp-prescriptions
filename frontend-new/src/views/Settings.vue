<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">الإعدادات</h1>
      <p class="page-subtitle">إدارة إعدادات النظام والمستخدم</p>
    </div>

    <div class="settings-content">
      <div class="settings-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.name }}
        </button>
      </div>

      <div class="settings-panel">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="settings-section">
          <h2>الإعدادات العامة</h2>
          <div class="form-group">
            <label>اسم المستشفى</label>
            <input type="text" v-model="settings.hospitalName" class="form-input">
          </div>
          <div class="form-group">
            <label>العنوان</label>
            <textarea v-model="settings.address" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>رقم الهاتف</label>
            <input type="tel" v-model="settings.phone" class="form-input">
          </div>
        </div>

        <!-- User Settings -->
        <div v-if="activeTab === 'user'" class="settings-section">
          <h2>إعدادات المستخدم</h2>
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" v-model="userSettings.fullName" class="form-input">
          </div>
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" v-model="userSettings.email" class="form-input">
          </div>
          <div class="form-group">
            <label>كلمة المرور الحالية</label>
            <input type="password" v-model="userSettings.currentPassword" class="form-input">
          </div>
          <div class="form-group">
            <label>كلمة المرور الجديدة</label>
            <input type="password" v-model="userSettings.newPassword" class="form-input">
          </div>
        </div>

        <!-- System Settings -->
        <div v-if="activeTab === 'system'" class="settings-section">
          <h2>إعدادات النظام</h2>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="systemSettings.autoBackup">
              النسخ الاحتياطي التلقائي
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="systemSettings.emailNotifications">
              إشعارات البريد الإلكتروني
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="systemSettings.smsNotifications">
              إشعارات الرسائل النصية
            </label>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="settings-section">
          <h2>إعدادات الأمان</h2>
          <div class="form-group">
            <label>مدة انتهاء الجلسة (بالدقائق)</label>
            <select v-model="securitySettings.sessionTimeout" class="form-select">
              <option value="15">15 دقيقة</option>
              <option value="30">30 دقيقة</option>
              <option value="60">ساعة واحدة</option>
              <option value="120">ساعتين</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="securitySettings.twoFactorAuth">
              المصادقة الثنائية
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="securitySettings.loginAlerts">
              تنبيهات تسجيل الدخول
            </label>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn btn-primary" @click="saveSettings">
            <i class="fas fa-save"></i>
            حفظ التغييرات
          </button>
          <button class="btn btn-outline" @click="resetSettings">
            <i class="fas fa-undo"></i>
            إعادة تعيين
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'SettingsView'
})
import { useSettings } from '@/scripts/views/settings'

const {
  activeTab,
  // loading,
  // saveLoading,
  tabs,
  settings,
  userSettings,
  systemSettings,
  securitySettings,
  setActiveTab,
  saveSettings,
  resetSettings
  // loadSettings
} = useSettings()
</script>

<style scoped>
@import '@/assets/css/views/settings.css';
</style>