import { ref, reactive } from 'vue'

export function useSettings() {
  const activeTab = ref('general')
  const loading = ref(false)
  const saveLoading = ref(false)

  const tabs = [
    { id: 'general', name: 'عام', icon: 'fas fa-cog' },
    { id: 'user', name: 'المستخدم', icon: 'fas fa-user' },
    { id: 'system', name: 'النظام', icon: 'fas fa-server' },
    { id: 'security', name: 'الأمان', icon: 'fas fa-shield-alt' }
  ]

  const settings = reactive({
    hospitalName: 'مستشفى كليوباترا',
    address: 'شارع التحرير، القاهرة، مصر',
    phone: '+20 2 1234 5678',
    email: 'info@hospital.com',
    website: 'www.hospital.com'
  })

  const userSettings = reactive({
    fullName: 'د. أحمد محمد',
    email: 'ahmed@hospital.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'ar',
    timezone: 'Africa/Cairo'
  })

  const systemSettings = reactive({
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceMode: false,
    debugMode: false
  })

  const securitySettings = reactive({
    sessionTimeout: 30,
    twoFactorAuth: false,
    loginAlerts: true,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelist: []
  })

  const setActiveTab = (tabId) => {
    activeTab.value = tabId
  }

  const saveSettings = async () => {
    saveLoading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save logic here
      console.log('Saving settings...', {
        settings,
        userSettings,
        systemSettings,
        securitySettings
      })
      
      // Show success message
      alert('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      saveLoading.value = false
    }
  }

  const resetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      // Reset to default values
      Object.assign(settings, {
        hospitalName: 'مستشفى كليوباترا',
        address: 'شارع التحرير، القاهرة، مصر',
        phone: '+20 2 1234 5678',
        email: 'info@hospital.com',
        website: 'www.hospital.com'
      })
      
      Object.assign(systemSettings, {
        autoBackup: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        maintenanceMode: false,
        debugMode: false
      })
      
      Object.assign(securitySettings, {
        sessionTimeout: 30,
        twoFactorAuth: false,
        loginAlerts: true,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        ipWhitelist: []
      })
      
      alert('تم إعادة تعيين الإعدادات')
    }
  }

  const loadSettings = async () => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Load settings from API
      console.log('Loading settings...')
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    activeTab,
    loading,
    saveLoading,
    tabs,
    settings,
    userSettings,
    systemSettings,
    securitySettings,
    setActiveTab,
    saveSettings,
    resetSettings,
    loadSettings
  }
}
