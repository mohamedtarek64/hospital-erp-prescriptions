/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import apiClient from '@/utils/apiClient'

export const adminApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/admin/dashboard')
  },

  // Users
  getUsers: (params = {}) => {
    return apiClient.get('/api/admin/users', { params })
  },

  getUser: (id) => {
    return apiClient.get(`/api/admin/users/${id}`)
  },

  createUser: (userData) => {
    return apiClient.post('/api/admin/users', userData)
  },

  updateUser: (id, userData) => {
    return apiClient.put(`/api/admin/users/${id}`, userData)
  },

  deleteUser: (id) => {
    return apiClient.delete(`/api/admin/users/${id}`)
  },

  activateUser: (id) => {
    return apiClient.patch(`/api/admin/users/${id}/activate`)
  },

  deactivateUser: (id) => {
    return apiClient.patch(`/api/admin/users/${id}/deactivate`)
  },

  resetUserPassword: (id, passwordData) => {
    return apiClient.post(`/api/admin/users/${id}/reset-password`, passwordData)
  },

  // Roles
  getRoles: (params = {}) => {
    return apiClient.get('/api/admin/roles', { params })
  },

  getRole: (id) => {
    return apiClient.get(`/api/admin/roles/${id}`)
  },

  createRole: (roleData) => {
    return apiClient.post('/api/admin/roles', roleData)
  },

  updateRole: (id, roleData) => {
    return apiClient.put(`/api/admin/roles/${id}`, roleData)
  },

  deleteRole: (id) => {
    return apiClient.delete(`/api/admin/roles/${id}`)
  },

  assignRoleToUser: (userId, roleId) => {
    return apiClient.post(`/api/admin/users/${userId}/roles`, { role_id: roleId })
  },

  removeRoleFromUser: (userId, roleId) => {
    return apiClient.delete(`/api/admin/users/${userId}/roles/${roleId}`)
  },

  // Permissions
  getPermissions: (params = {}) => {
    return apiClient.get('/api/admin/permissions', { params })
  },

  getPermission: (id) => {
    return apiClient.get(`/api/admin/permissions/${id}`)
  },

  createPermission: (permissionData) => {
    return apiClient.post('/api/admin/permissions', permissionData)
  },

  updatePermission: (id, permissionData) => {
    return apiClient.put(`/api/admin/permissions/${id}`, permissionData)
  },

  deletePermission: (id) => {
    return apiClient.delete(`/api/admin/permissions/${id}`)
  },

  assignPermissionToRole: (roleId, permissionId) => {
    return apiClient.post(`/api/admin/roles/${roleId}/permissions`, { permission_id: permissionId })
  },

  removePermissionFromRole: (roleId, permissionId) => {
    return apiClient.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`)
  },

  // User Roles
  getUserRoles: (params = {}) => {
    return apiClient.get('/api/user-roles', { params })
  },

  createUserRole: (userRoleData) => {
    return apiClient.post('/api/user-roles', userRoleData)
  },

  updateUserRole: (id, userRoleData) => {
    return apiClient.put(`/api/user-roles/${id}`, userRoleData)
  },

  deleteUserRole: (id) => {
    return apiClient.delete(`/api/user-roles/${id}`)
  },

  // User Permissions
  getUserPermissions: (params = {}) => {
    return apiClient.get('/api/user-permissions', { params })
  },

  createUserPermission: (userPermissionData) => {
    return apiClient.post('/api/user-permissions', userPermissionData)
  },

  updateUserPermission: (id, userPermissionData) => {
    return apiClient.put(`/api/user-permissions/${id}`, userPermissionData)
  },

  deleteUserPermission: (id) => {
    return apiClient.delete(`/api/user-permissions/${id}`)
  },

  // Settings
  getSettings: (params = {}) => {
    return apiClient.get('/api/admin/settings', { params })
  },

  getSetting: (key) => {
    return apiClient.get(`/api/admin/settings/${key}`)
  },

  updateSetting: (key, value) => {
    return apiClient.put(`/api/admin/settings/${key}`, { value })
  },

  updateSettings: (settingsData) => {
    return apiClient.put('/api/admin/settings', settingsData)
  },

  // System Logs
  getLogs: (params = {}) => {
    return apiClient.get('/api/admin/logs', { params })
  },

  getLog: (id) => {
    return apiClient.get(`/api/admin/logs/${id}`)
  },

  clearLogs: (params = {}) => {
    return apiClient.delete('/api/admin/logs', { params })
  },

  // System Logs (Alternative endpoint)
  getSystemLogs: (params = {}) => {
    return apiClient.get('/api/system-logs', { params })
  },

  // Backups
  getBackups: (params = {}) => {
    return apiClient.get('/api/admin/backups', { params })
  },

  createBackup: (backupData = {}) => {
    return apiClient.post('/api/admin/backups', backupData)
  },

  restoreBackup: (id, restoreData = {}) => {
    return apiClient.post(`/api/admin/backups/${id}/restore`, restoreData)
  },

  deleteBackup: (id) => {
    return apiClient.delete(`/api/admin/backups/${id}`)
  },

  downloadBackup: (id) => {
    return apiClient.get(`/api/admin/backups/${id}/download`, {
      responseType: 'blob'
    })
  },

  // System Backups (Alternative endpoint)
  getSystemBackups: (params = {}) => {
    return apiClient.get('/api/system-backups', { params })
  },

  createSystemBackup: (backupData = {}) => {
    return apiClient.post('/api/system-backups', backupData)
  },

  // System Health
  getSystemHealth: () => {
    return apiClient.get('/api/admin/system-health')
  },

  getSystemStatus: () => {
    return apiClient.get('/api/admin/system-status')
  },

  // Database Management
  getDatabaseInfo: () => {
    return apiClient.get('/api/admin/database/info')
  },

  optimizeDatabase: () => {
    return apiClient.post('/api/admin/database/optimize')
  },

  repairDatabase: () => {
    return apiClient.post('/api/admin/database/repair')
  },

  // Cache Management
  getCacheInfo: () => {
    return apiClient.get('/api/admin/cache/info')
  },

  clearCache: (type = 'all') => {
    return apiClient.post('/api/admin/cache/clear', { type })
  },

  // File Management
  getFileInfo: (path) => {
    return apiClient.get('/api/admin/files/info', { params: { path } })
  },

  deleteFile: (path) => {
    return apiClient.delete('/api/admin/files', { params: { path } })
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/admin/stats', { params })
  },

  getUserStats: () => {
    return apiClient.get('/api/admin/stats/users')
  },

  getSystemStats: () => {
    return apiClient.get('/api/admin/stats/system')
  },

  // Audit Logs
  getAuditLogs: (params = {}) => {
    return apiClient.get('/api/audit-logs', { params })
  },

  getAuditLog: (id) => {
    return apiClient.get(`/api/audit-logs/${id}`)
  },

  // Dashboard Widgets
  getDashboardWidgets: (params = {}) => {
    return apiClient.get('/api/dashboard-widgets', { params })
  },

  createDashboardWidget: (widgetData) => {
    return apiClient.post('/api/dashboard-widgets', widgetData)
  },

  updateDashboardWidget: (id, widgetData) => {
    return apiClient.put(`/api/dashboard-widgets/${id}`, widgetData)
  },

  deleteDashboardWidget: (id) => {
    return apiClient.delete(`/api/dashboard-widgets/${id}`)
  },

  // User Dashboard Layouts
  getUserDashboardLayouts: (params = {}) => {
    return apiClient.get('/api/user-dashboard-layouts', { params })
  },

  createUserDashboardLayout: (layoutData) => {
    return apiClient.post('/api/user-dashboard-layouts', layoutData)
  },

  updateUserDashboardLayout: (id, layoutData) => {
    return apiClient.put(`/api/user-dashboard-layouts/${id}`, layoutData)
  },

  deleteUserDashboardLayout: (id) => {
    return apiClient.delete(`/api/user-dashboard-layouts/${id}`)
  }
}

export default adminApi