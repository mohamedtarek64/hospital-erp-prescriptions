import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

/**
 * System Settings Store
 * 
 * Manages system settings state and operations
 */
export const useSystemSettingsStore = defineStore('systemSettings', () => {
  // State
  const loading = ref(false)
  const error = ref(null)
  
  // Settings data
  const settings = ref([])
  const settingsPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  })
  
  // Categories and types
  const categories = ref([])
  const types = ref(['string', 'integer', 'float', 'boolean', 'json'])
  
  // Public settings (cached)
  const publicSettings = ref({})

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const getSettings = computed(() => settings.value)
  const getSettingsPagination = computed(() => settingsPagination.value)
  const getCategories = computed(() => categories.value)
  const getTypes = computed(() => types.value)
  const getPublicSettings = computed(() => publicSettings.value)

  // Actions
  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (message) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Settings actions
  const loadSettings = async (params = {}) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-settings', { params })
      
      if (response.data.success) {
        settings.value = response.data.data.data || []
        settingsPagination.value = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to
        }
      } else {
        setError(response.data.message || 'Failed to load settings')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadSettingsByCategory = async (category) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get(`/admin/system-settings/category/${category}`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to load settings for category')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load settings for category'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loadPublicSettings = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-settings/public')
      
      if (response.data.success) {
        // Convert array to object for easier access
        const settingsObj = {}
        response.data.data.forEach(setting => {
          settingsObj[setting.key] = setting.value
        })
        publicSettings.value = settingsObj
        return { success: true, data: settingsObj }
      } else {
        setError(response.data.message || 'Failed to load public settings')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load public settings'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getSettingByKey = async (key) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get(`/admin/system-settings/key/${key}`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Setting not found')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const createSetting = async (settingData) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post('/admin/system-settings', settingData)
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to create setting')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (settingId, settingData) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.put(`/admin/system-settings/${settingId}`, settingData)
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to update setting')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateSettingByKey = async (key, value) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.put(`/admin/system-settings/key/${key}`, { value })
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to update setting')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteSetting = async (settingId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.delete(`/admin/system-settings/${settingId}`)
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true }
      } else {
        setError(response.data.message || 'Failed to delete setting')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const bulkUpdateSettings = async (settingsData) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post('/admin/system-settings/bulk-update', {
        settings: settingsData
      })
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to bulk update settings')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to bulk update settings'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetSettingToDefault = async (settingId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post(`/admin/system-settings/${settingId}/reset`)
      
      if (response.data.success) {
        await loadSettings() // Refresh settings list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to reset setting')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset setting'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Categories and types actions
  const loadCategories = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-settings/categories')
      
      if (response.data.success) {
        categories.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to load categories')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load categories'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loadTypes = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-settings/types')
      
      if (response.data.success) {
        types.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to load types')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load types'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Utility actions
  const getSettingValue = (key, defaultValue = null) => {
    return publicSettings.value[key] || defaultValue
  }

  const setSettingValue = async (key, value) => {
    return await updateSettingByKey(key, value)
  }

  const refreshSettings = async () => {
    await Promise.all([
      loadSettings(),
      loadCategories(),
      loadTypes(),
      loadPublicSettings()
    ])
  }

  const initializeSettings = async () => {
    await Promise.all([
      loadCategories(),
      loadTypes(),
      loadPublicSettings()
    ])
  }

  return {
    // State
    loading,
    error,
    settings,
    settingsPagination,
    categories,
    types,
    publicSettings,

    // Getters
    isLoading,
    hasError,
    getSettings,
    getSettingsPagination,
    getCategories,
    getTypes,
    getPublicSettings,

    // Actions
    setLoading,
    setError,
    clearError,
    loadSettings,
    loadSettingsByCategory,
    loadPublicSettings,
    getSettingByKey,
    createSetting,
    updateSetting,
    updateSettingByKey,
    deleteSetting,
    bulkUpdateSettings,
    resetSettingToDefault,
    loadCategories,
    loadTypes,
    getSettingValue,
    setSettingValue,
    refreshSettings,
    initializeSettings
  }
})
