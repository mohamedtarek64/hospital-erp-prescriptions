import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, endpoints } from '@/utils/apiClient'

/**
 * Authentication Store
 * Handles user authentication, authorization, and session management
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const loading = ref(false)
  const error = ref(null)
  const permissions = ref([])
  const roles = ref([])

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => roles.value.includes('admin'))
  const isDoctor = computed(() => roles.value.includes('doctor'))
  const isNurse = computed(() => roles.value.includes('nurse'))
  const isReceptionist = computed(() => roles.value.includes('receptionist'))
  const isPharmacist = computed(() => roles.value.includes('pharmacist'))
  const isLabTechnician = computed(() => roles.value.includes('lab_technician'))
  const isHR = computed(() => roles.value.includes('hr'))
  const isFinance = computed(() => roles.value.includes('finance'))
  const isMaintenance = computed(() => roles.value.includes('maintenance'))

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post(endpoints.auth.login, credentials)
      const { user: userData, token: authToken, refresh_token } = response.data.data
      
      // Store tokens
      token.value = authToken
      refreshToken.value = refresh_token
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Store user data
      user.value = userData
      permissions.value = userData.permissions || []
      roles.value = userData.roles || []
      
      return userData
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post(endpoints.auth.register, userData)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post(endpoints.auth.logout, { refresh_token: refreshToken.value })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear all auth data
      user.value = null
      token.value = null
      refreshToken.value = null
      permissions.value = []
      roles.value = []
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await api.post(endpoints.auth.refresh, {
        refresh_token: refreshToken.value
      })
      
      const { token: newToken, refresh_token: newRefreshToken } = response.data.data
      
      token.value = newToken
      refreshToken.value = newRefreshToken
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('refresh_token', newRefreshToken)
      
      return newToken
    } catch (err) {
      // If refresh fails, logout user
      await logout()
      throw err
    }
  }

  const fetchProfile = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get(endpoints.auth.profile)
      const userData = response.data.data
      
      user.value = userData
      permissions.value = userData.permissions || []
      roles.value = userData.roles || []
      
      return userData
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(endpoints.auth.profile, profileData)
      user.value = response.data.data
      
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      error.value = null
      
      await api.post(endpoints.auth.changePassword, passwordData)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to change password'
      throw err
    } finally {
      loading.value = false
    }
  }

  const hasPermission = (permission) => {
    if (!permissions.value) return false
    return permissions.value.includes(permission)
  }

  const hasRole = (role) => {
    if (!roles.value) return false
    return roles.value.includes(role)
  }

  const hasAnyRole = (roleList) => {
    if (!roles.value || !roleList) return false
    return roleList.some(role => roles.value.includes(role))
  }

  const hasAllRoles = (roleList) => {
    if (!roles.value || !roleList) return false
    return roleList.every(role => roles.value.includes(role))
  }

  const canAccess = (resource, action = 'read') => {
    const permission = `${resource}.${action}`
    return hasPermission(permission) || hasPermission(`${resource}.*`) || hasPermission('*')
  }

  const canManage = (resource) => {
    return canAccess(resource, 'create') && 
           canAccess(resource, 'update') && 
           canAccess(resource, 'delete')
  }

  const initializeAuth = async () => {
    if (token.value && !user.value) {
      try {
        await fetchProfile()
      } catch (err) {
        // If profile fetch fails, clear auth data
        await logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Helper functions for direct state updates
  const setUser = (userData) => {
    user.value = userData
    if (userData.roles) {
      roles.value = userData.roles
    }
    if (userData.permissions) {
      permissions.value = userData.permissions
    }
  }

  const setToken = (authToken) => {
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
  }

  const setRefreshToken = (refreshTokenValue) => {
    refreshToken.value = refreshTokenValue
    localStorage.setItem('refresh_token', refreshTokenValue)
  }

  // Initialize auth on store creation
  if (token.value) {
    initializeAuth()
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    error,
    permissions,
    roles,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isPharmacist,
    isLabTechnician,
    isHR,
    isFinance,
    isMaintenance,
    
    // Actions
    login,
    register,
    logout,
    refreshAuthToken,
    fetchProfile,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    canManage,
    initializeAuth,
    clearError,
    
    // Helper functions
    setUser,
    setToken,
    setRefreshToken
  }
})
