import { ref, reactive } from 'vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { debounce } from '@/utils/adminHelpers'

/**
 * System Settings Composable
 * 
 * Manages system settings functionality
 */
export const useSystemSettings = () => {
  // Store
  const settingsStore = useSystemSettingsStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const settings = ref([])
  const categories = ref([])
  const types = ref(['string', 'integer', 'float', 'boolean', 'json'])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  })
  
  // UI state
  const selectedCategory = ref('')
  const showCreateForm = ref(false)
  const showEditForm = ref(false)
  const showDeleteModal = ref(false)
  const settingToDelete = ref(null)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  
  // Filters
  const filters = reactive({
    search: '',
    type: '',
    is_public: ''
  })
  
  // Form data
  const form = reactive({
    key: '',
    value: '',
    type: '',
    description: '',
    category: '',
    is_public: false
  })

  // Methods
  const loadSettings = async () => {
    try {
      loading.value = true
      error.value = null
      
      const params = {
        page: pagination.value.current_page,
        per_page: pagination.value.per_page,
        category: selectedCategory.value,
        ...filters
      }
      
      await settingsStore.loadSettings(params)
      settings.value = settingsStore.getSettings
      pagination.value = settingsStore.getSettingsPagination
    } catch (err) {
      error.value = err.message || 'Failed to load settings'
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      await settingsStore.loadCategories()
      categories.value = settingsStore.getCategories
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadTypes = async () => {
    try {
      await settingsStore.loadTypes()
      types.value = settingsStore.getTypes
    } catch (err) {
      console.error('Failed to load types:', err)
    }
  }

  const debouncedSearch = debounce(() => {
    pagination.value.current_page = 1
    loadSettings()
  }, 500)

  const clearFilters = () => {
    filters.search = ''
    filters.type = ''
    filters.is_public = ''
    pagination.value.current_page = 1
    loadSettings()
  }

  const changePage = (page) => {
    pagination.value.current_page = page
    loadSettings()
  }

  const editSetting = (setting) => {
    form.key = setting.key
    form.value = setting.value
    form.type = setting.type
    form.description = setting.description || ''
    form.category = setting.category
    form.is_public = setting.is_public
    showEditForm.value = true
  }

  const deleteSetting = (setting) => {
    settingToDelete.value = setting
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!settingToDelete.value) return
    
    try {
      isDeleting.value = true
      const result = await settingsStore.deleteSetting(settingToDelete.value.id)
      
      if (result.success) {
        showDeleteModal.value = false
        settingToDelete.value = null
        await loadSettings()
      } else {
        error.value = result.error || 'Failed to delete setting'
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete setting'
    } finally {
      isDeleting.value = false
    }
  }

  const closeForm = () => {
    showCreateForm.value = false
    showEditForm.value = false
    resetForm()
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    settingToDelete.value = null
  }

  const resetForm = () => {
    form.key = ''
    form.value = ''
    form.type = ''
    form.description = ''
    form.category = ''
    form.is_public = false
  }

  const submitForm = async () => {
    try {
      isSubmitting.value = true
      
      const settingData = {
        key: form.key,
        value: form.value,
        type: form.type,
        description: form.description,
        category: form.category,
        is_public: form.is_public
      }
      
      let result
      if (showEditForm.value) {
        // Update existing setting
        const settingId = settings.value.find(s => s.key === form.key)?.id
        result = await settingsStore.updateSetting(settingId, settingData)
      } else {
        // Create new setting
        result = await settingsStore.createSetting(settingData)
      }
      
      if (result.success) {
        closeForm()
        await loadSettings()
      } else {
        error.value = result.error || 'Failed to save setting'
      }
    } catch (err) {
      error.value = err.message || 'Failed to save setting'
    } finally {
      isSubmitting.value = false
    }
  }

  const updateSetting = async (setting, value) => {
    try {
      const result = await settingsStore.updateSettingByKey(setting.key, value)
      
      if (result.success) {
        // Update local setting
        const index = settings.value.findIndex(s => s.id === setting.id)
        if (index !== -1) {
          settings.value[index].value = value
        }
      } else {
        error.value = result.error || 'Failed to update setting'
      }
    } catch (err) {
      error.value = err.message || 'Failed to update setting'
    }
  }

  const resetSetting = async (setting) => {
    try {
      const result = await settingsStore.resetSettingToDefault(setting.id)
      
      if (result.success) {
        await loadSettings()
      } else {
        error.value = result.error || 'Failed to reset setting'
      }
    } catch (err) {
      error.value = err.message || 'Failed to reset setting'
    }
  }

  const resetToDefaults = async () => {
    try {
      loading.value = true
      // Implement reset to defaults logic
      console.log('Reset all settings to defaults')
      await loadSettings()
    } catch (err) {
      error.value = err.message || 'Failed to reset settings'
    } finally {
      loading.value = false
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      general: 'fas fa-cog',
      system: 'fas fa-server',
      backup: 'fas fa-archive',
      security: 'fas fa-shield-alt',
      email: 'fas fa-envelope',
      sms: 'fas fa-sms',
      notification: 'fas fa-bell',
      appearance: 'fas fa-palette',
      integration: 'fas fa-plug',
      maintenance: 'fas fa-tools'
    }
    return icons[category] || 'fas fa-folder'
  }

  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getTypeClass = (type) => {
    const classes = {
      string: 'bg-blue-100 text-blue-800',
      integer: 'bg-green-100 text-green-800',
      float: 'bg-yellow-100 text-yellow-800',
      boolean: 'bg-purple-100 text-purple-800',
      json: 'bg-indigo-100 text-indigo-800'
    }
    return classes[type] || 'bg-gray-100 text-gray-800'
  }

  const getBooleanValue = (value) => {
    return value === 'true' || value === true || value === '1' || value === 1
  }

  const formatJsonValue = (value) => {
    try {
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    } catch {
      return value
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  const onMountedHandler = () => {
    loadSettings()
    loadCategories()
    loadTypes()
  }

  return {
    // Reactive data
    loading,
    error,
    settings,
    categories,
    types,
    pagination,
    selectedCategory,
    showCreateForm,
    showEditForm,
    showDeleteModal,
    settingToDelete,
    isSubmitting,
    isDeleting,
    filters,
    form,

    // Methods
    loadSettings,
    loadCategories,
    loadTypes,
    debouncedSearch,
    clearFilters,
    changePage,
    editSetting,
    deleteSetting,
    confirmDelete,
    closeForm,
    closeDeleteModal,
    submitForm,
    updateSetting,
    resetSetting,
    resetToDefaults,
    getCategoryIcon,
    formatCategoryName,
    getTypeClass,
    getBooleanValue,
    formatJsonValue,
    formatDate,
    onMountedHandler
  }
}
