import { ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { debounce } from '@/utils/adminHelpers'

/**
 * System Logs Composable
 * 
 * Manages system logs functionality
 */
export const useSystemLogs = () => {
  // Store
  const adminStore = useAdminStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const logs = ref([])
  const users = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  })
  
  // UI state
  const showDetailsModal = ref(false)
  const showCleanModal = ref(false)
  const selectedLog = ref(null)
  const isCleaning = ref(false)
  
  // Filters
  const filters = reactive({
    search: '',
    user_id: '',
    action: '',
    module: '',
    start_date: '',
    end_date: ''
  })
  
  const cleanDays = ref(90)
  
  // Available options
  const availableActions = ref({
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    view: 'View',
    login: 'Login',
    logout: 'Logout',
    backup: 'Backup',
    restore: 'Restore',
    export: 'Export',
    import: 'Import'
  })
  
  const availableModules = ref({
    auth: 'Authentication',
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    medical_records: 'Medical Records',
    pharmacy: 'Pharmacy',
    laboratory: 'Laboratory',
    billing: 'Billing',
    wards: 'Ward Management',
    reports: 'Reports',
    quality: 'Quality Assurance',
    admin: 'Administration',
    settings: 'Settings',
    users: 'User Management',
    roles: 'Role Management'
  })

  // Methods
  const loadLogs = async () => {
    try {
      loading.value = true
      error.value = null
      
      const params = {
        page: pagination.value.current_page,
        per_page: pagination.value.per_page,
        ...filters
      }
      
      await adminStore.loadSystemLogs(params)
      logs.value = adminStore.getSystemLogs
      pagination.value = adminStore.getLogsPagination
    } catch (err) {
      error.value = err.message || 'Failed to load system logs'
    } finally {
      loading.value = false
    }
  }

  const loadUsers = async () => {
    try {
      // Mock users data - replace with actual API call
      users.value = [
        { id: 1, name: 'Admin User' },
        { id: 2, name: 'Doctor Smith' },
        { id: 3, name: 'Nurse Johnson' }
      ]
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const debouncedSearch = debounce(() => {
    pagination.value.current_page = 1
    loadLogs()
  }, 500)

  const clearFilters = () => {
    filters.search = ''
    filters.user_id = ''
    filters.action = ''
    filters.module = ''
    filters.start_date = ''
    filters.end_date = ''
    pagination.value.current_page = 1
    loadLogs()
  }

  const changePage = (page) => {
    pagination.value.current_page = page
    loadLogs()
  }

  const viewLogDetails = (log) => {
    selectedLog.value = log
    showDetailsModal.value = true
  }

  const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedLog.value = null
  }

  const cleanOldLogs = () => {
    showCleanModal.value = true
  }

  const closeCleanModal = () => {
    showCleanModal.value = false
  }

  const confirmCleanLogs = async () => {
    try {
      isCleaning.value = true
      const result = await adminStore.cleanOldLogs(cleanDays.value)
      
      if (result.success) {
        showCleanModal.value = false
        await loadLogs()
        // Show success message
        console.log('Old logs cleaned successfully')
      } else {
        error.value = result.error || 'Failed to clean old logs'
      }
    } catch (err) {
      error.value = err.message || 'Failed to clean old logs'
    } finally {
      isCleaning.value = false
    }
  }

  const exportLogs = async () => {
    try {
      loading.value = true
      // Implement export logs logic
      console.log('Export logs')
    } catch (err) {
      error.value = err.message || 'Failed to export logs'
    } finally {
      loading.value = false
    }
  }

  const getActionClass = (action) => {
    const classes = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-gray-100 text-gray-800',
      login: 'bg-green-100 text-green-800',
      logout: 'bg-orange-100 text-orange-800',
      backup: 'bg-purple-100 text-purple-800',
      restore: 'bg-indigo-100 text-indigo-800',
      export: 'bg-cyan-100 text-cyan-800',
      import: 'bg-teal-100 text-teal-800'
    }
    return classes[action] || 'bg-gray-100 text-gray-800'
  }

  const getActionIcon = (action) => {
    const icons = {
      create: 'fas fa-plus',
      update: 'fas fa-edit',
      delete: 'fas fa-trash',
      view: 'fas fa-eye',
      login: 'fas fa-sign-in-alt',
      logout: 'fas fa-sign-out-alt',
      backup: 'fas fa-download',
      restore: 'fas fa-undo',
      export: 'fas fa-file-export',
      import: 'fas fa-file-import'
    }
    return icons[action] || 'fas fa-question'
  }

  const getActionLabel = (action) => {
    return availableActions.value[action] || action
  }

  const getModuleClass = (module) => {
    const classes = {
      auth: 'bg-blue-100 text-blue-800',
      dashboard: 'bg-purple-100 text-purple-800',
      patients: 'bg-green-100 text-green-800',
      appointments: 'bg-yellow-100 text-yellow-800',
      medical_records: 'bg-indigo-100 text-indigo-800',
      pharmacy: 'bg-pink-100 text-pink-800',
      laboratory: 'bg-cyan-100 text-cyan-800',
      billing: 'bg-orange-100 text-orange-800',
      wards: 'bg-teal-100 text-teal-800',
      reports: 'bg-red-100 text-red-800',
      quality: 'bg-emerald-100 text-emerald-800',
      admin: 'bg-gray-100 text-gray-800',
      settings: 'bg-slate-100 text-slate-800',
      users: 'bg-violet-100 text-violet-800',
      roles: 'bg-amber-100 text-amber-800'
    }
    return classes[module] || 'bg-gray-100 text-gray-800'
  }

  const getModuleIcon = (module) => {
    const icons = {
      auth: 'fas fa-lock',
      dashboard: 'fas fa-tachometer-alt',
      patients: 'fas fa-user-injured',
      appointments: 'fas fa-calendar-check',
      medical_records: 'fas fa-file-medical',
      pharmacy: 'fas fa-pills',
      laboratory: 'fas fa-flask',
      billing: 'fas fa-receipt',
      wards: 'fas fa-bed',
      reports: 'fas fa-chart-bar',
      quality: 'fas fa-shield-alt',
      admin: 'fas fa-cogs',
      settings: 'fas fa-cog',
      users: 'fas fa-users',
      roles: 'fas fa-user-shield'
    }
    return icons[module] || 'fas fa-folder'
  }

  const getModuleLabel = (module) => {
    return availableModules.value[module] || module
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleTimeString()
  }

  const formatDateTime = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  const onMountedHandler = () => {
    loadLogs()
    loadUsers()
  }

  return {
    // Reactive data
    loading,
    error,
    logs,
    users,
    pagination,
    showDetailsModal,
    showCleanModal,
    selectedLog,
    isCleaning,
    filters,
    cleanDays,
    availableActions,
    availableModules,

    // Methods
    loadLogs,
    loadUsers,
    debouncedSearch,
    clearFilters,
    changePage,
    viewLogDetails,
    closeDetailsModal,
    cleanOldLogs,
    closeCleanModal,
    confirmCleanLogs,
    exportLogs,
    getActionClass,
    getActionIcon,
    getActionLabel,
    getModuleClass,
    getModuleIcon,
    getModuleLabel,
    formatDate,
    formatTime,
    formatDateTime,
    onMountedHandler
  }
}
