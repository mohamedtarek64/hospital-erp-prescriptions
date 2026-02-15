import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

/**
 * Admin Store
 * 
 * Manages system administration state and operations
 */
export const useAdminStore = defineStore('admin', () => {
  // State
  const loading = ref(false)
  const error = ref(null)
  
  // Dashboard data
  const dashboardStats = ref(null)
  const systemOverview = ref(null)
  const recentActivity = ref([])
  
  // Users data
  const users = ref([])
  const usersPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  })
  
  // System logs data
  const systemLogs = ref([])
  const logsPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  })
  
  // Backups data
  const backups = ref([])
  const backupStats = ref(null)
  const backupsPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  })

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const getDashboardStats = computed(() => dashboardStats.value)
  const getSystemOverview = computed(() => systemOverview.value)
  const getRecentActivity = computed(() => recentActivity.value)
  const getUsers = computed(() => users.value)
  const getUsersPagination = computed(() => usersPagination.value)
  const getSystemLogs = computed(() => systemLogs.value)
  const getLogsPagination = computed(() => logsPagination.value)
  const getBackups = computed(() => backups.value)
  const getBackupStats = computed(() => backupStats.value)
  const getBackupsPagination = computed(() => backupsPagination.value)

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

  // Dashboard actions
  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/dashboard')
      
      if (response.data.success) {
        dashboardStats.value = response.data.data
      } else {
        setError(response.data.message || 'Failed to load dashboard stats')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const loadSystemOverview = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-overview')
      
      if (response.data.success) {
        systemOverview.value = response.data.data
      } else {
        setError(response.data.message || 'Failed to load system overview')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system overview')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async (limit = 10) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-logs', {
        params: { per_page: limit }
      })
      
      if (response.data.success) {
        recentActivity.value = response.data.data.data || []
      } else {
        setError(response.data.message || 'Failed to load recent activity')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recent activity')
    } finally {
      setLoading(false)
    }
  }

  // Users actions
  const loadUsers = async (params = {}) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/users', { params })
      
      if (response.data.success) {
        users.value = response.data.data.data || []
        usersPagination.value = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to
        }
      } else {
        setError(response.data.message || 'Failed to load users')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post('/admin/users', userData)
      
      if (response.data.success) {
        await loadUsers() // Refresh users list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to create user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.put(`/admin/users/${userId}`, userData)
      
      if (response.data.success) {
        await loadUsers() // Refresh users list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to update user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.delete(`/admin/users/${userId}`)
      
      if (response.data.success) {
        await loadUsers() // Refresh users list
        return { success: true }
      } else {
        setError(response.data.message || 'Failed to delete user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // System logs actions
  const loadSystemLogs = async (params = {}) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/system-logs', { params })
      
      if (response.data.success) {
        systemLogs.value = response.data.data.data || []
        logsPagination.value = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to
        }
      } else {
        setError(response.data.message || 'Failed to load system logs')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system logs')
    } finally {
      setLoading(false)
    }
  }

  const cleanOldLogs = async (days = 90) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post('/admin/clean-logs', { days })
      
      if (response.data.success) {
        await loadSystemLogs() // Refresh logs list
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to clean old logs')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clean old logs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Backups actions
  const loadBackups = async (params = {}) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/backups', { params })
      
      if (response.data.success) {
        backups.value = response.data.data.data || []
        backupsPagination.value = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to
        }
      } else {
        setError(response.data.message || 'Failed to load backups')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backups')
    } finally {
      setLoading(false)
    }
  }

  const loadBackupStats = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get('/admin/backup-stats')
      
      if (response.data.success) {
        backupStats.value = response.data.data
      } else {
        setError(response.data.message || 'Failed to load backup stats')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backup stats')
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async (type = 'full') => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post('/admin/backups', { type })
      
      if (response.data.success) {
        await loadBackups() // Refresh backups list
        await loadBackupStats() // Refresh stats
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to create backup')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const downloadBackup = async (backupId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.get(`/admin/backups/${backupId}/download`, {
        responseType: 'blob'
      })
      
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to download backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = async (backupId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.post(`/admin/backups/${backupId}/restore`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to restore backup')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to restore backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteBackup = async (backupId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await apiClient.delete(`/admin/backups/${backupId}`)
      
      if (response.data.success) {
        await loadBackups() // Refresh backups list
        await loadBackupStats() // Refresh stats
        return { success: true }
      } else {
        setError(response.data.message || 'Failed to delete backup')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Utility actions
  const refreshDashboard = async () => {
    await Promise.all([
      loadDashboardStats(),
      loadSystemOverview(),
      loadRecentActivity()
    ])
  }

  const refreshAll = async () => {
    await Promise.all([
      loadDashboardStats(),
      loadSystemOverview(),
      loadRecentActivity(),
      loadUsers(),
      loadSystemLogs(),
      loadBackups(),
      loadBackupStats()
    ])
  }

  return {
    // State
    loading,
    error,
    dashboardStats,
    systemOverview,
    recentActivity,
    users,
    usersPagination,
    systemLogs,
    logsPagination,
    backups,
    backupStats,
    backupsPagination,

    // Getters
    isLoading,
    hasError,
    getDashboardStats,
    getSystemOverview,
    getRecentActivity,
    getUsers,
    getUsersPagination,
    getSystemLogs,
    getLogsPagination,
    getBackups,
    getBackupStats,
    getBackupsPagination,

    // Actions
    setLoading,
    setError,
    clearError,
    loadDashboardStats,
    loadSystemOverview,
    loadRecentActivity,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    loadSystemLogs,
    cleanOldLogs,
    loadBackups,
    loadBackupStats,
    createBackup,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    refreshDashboard,
    refreshAll
  }
})
