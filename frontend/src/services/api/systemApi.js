/**
 * System API Service
 * Handles all system-related API calls
 */

import apiClient from '@/utils/apiClient'

export const systemApi = {
  // System Health
  getSystemHealth: () => {
    return apiClient.get('/api/system/health')
  },

  getSystemStatus: () => {
    return apiClient.get('/api/system/status')
  },

  // System Settings
  getSystemSettings: (params = {}) => {
    return apiClient.get('/api/system/settings', { params })
  },

  getSystemSetting: (key) => {
    return apiClient.get(`/api/system/settings/${key}`)
  },

  updateSystemSetting: (key, value) => {
    return apiClient.put(`/api/system/settings/${key}`, { value })
  },

  updateSystemSettings: (settingsData) => {
    return apiClient.put('/api/system/settings', settingsData)
  },

  // System Logs
  getSystemLogs: (params = {}) => {
    return apiClient.get('/api/system/logs', { params })
  },

  getSystemLog: (id) => {
    return apiClient.get(`/api/system/logs/${id}`)
  },

  clearSystemLogs: (params = {}) => {
    return apiClient.delete('/api/system/logs', { params })
  },

  // System Backups
  getSystemBackups: (params = {}) => {
    return apiClient.get('/api/system/backups', { params })
  },

  createSystemBackup: (backupData = {}) => {
    return apiClient.post('/api/system/backups', backupData)
  },

  restoreSystemBackup: (id, restoreData = {}) => {
    return apiClient.post(`/api/system/backups/${id}/restore`, restoreData)
  },

  deleteSystemBackup: (id) => {
    return apiClient.delete(`/api/system/backups/${id}`)
  },

  downloadSystemBackup: (id) => {
    return apiClient.get(`/api/system/backups/${id}/download`, {
      responseType: 'blob'
    })
  },

  // Database Management
  getDatabaseInfo: () => {
    return apiClient.get('/api/system/database/info')
  },

  optimizeDatabase: () => {
    return apiClient.post('/api/system/database/optimize')
  },

  repairDatabase: () => {
    return apiClient.post('/api/system/database/repair')
  },

  // Cache Management
  getCacheInfo: () => {
    return apiClient.get('/api/system/cache/info')
  },

  clearCache: (type = 'all') => {
    return apiClient.post('/api/system/cache/clear', { type })
  },

  // File Management
  getFileInfo: (path) => {
    return apiClient.get('/api/system/files/info', { params: { path } })
  },

  deleteFile: (path) => {
    return apiClient.delete('/api/system/files', { params: { path } })
  },

  // System Statistics
  getSystemStats: (params = {}) => {
    return apiClient.get('/api/system/stats', { params })
  },

  getDatabaseStats: () => {
    return apiClient.get('/api/system/database/stats')
  },

  getCacheStats: () => {
    return apiClient.get('/api/system/cache/stats')
  },

  getFileStats: () => {
    return apiClient.get('/api/system/files/stats')
  },

  // System Monitoring
  getSystemMetrics: (params = {}) => {
    return apiClient.get('/api/system/metrics', { params })
  },

  getPerformanceMetrics: (params = {}) => {
    return apiClient.get('/api/system/performance', { params })
  },

  getResourceUsage: (params = {}) => {
    return apiClient.get('/api/system/resources', { params })
  },

  // System Updates
  checkForUpdates: () => {
    return apiClient.get('/api/system/updates/check')
  },

  getAvailableUpdates: () => {
    return apiClient.get('/api/system/updates/available')
  },

  installUpdate: (updateId) => {
    return apiClient.post(`/api/system/updates/${updateId}/install`)
  },

  // System Maintenance
  startMaintenanceMode: (maintenanceData = {}) => {
    return apiClient.post('/api/system/maintenance/start', maintenanceData)
  },

  stopMaintenanceMode: () => {
    return apiClient.post('/api/system/maintenance/stop')
  },

  getMaintenanceStatus: () => {
    return apiClient.get('/api/system/maintenance/status')
  },

  // System Security
  getSecuritySettings: () => {
    return apiClient.get('/api/system/security/settings')
  },

  updateSecuritySettings: (securityData) => {
    return apiClient.put('/api/system/security/settings', securityData)
  },

  getSecurityLogs: (params = {}) => {
    return apiClient.get('/api/system/security/logs', { params })
  },

  // System Reports
  generateSystemReport: (reportData) => {
    return apiClient.post('/api/system/reports', reportData)
  },

  generateHealthReport: (reportData) => {
    return apiClient.post('/api/system/reports/health', reportData)
  },

  generatePerformanceReport: (reportData) => {
    return apiClient.post('/api/system/reports/performance', reportData)
  },

  // Export
  exportSystemLogs: (filters = {}) => {
    return apiClient.get('/api/system/logs/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportSystemSettings: (filters = {}) => {
    return apiClient.get('/api/system/settings/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default systemApi