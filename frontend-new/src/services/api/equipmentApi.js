/**
 * Equipment API Service
 * Handles all equipment-related API calls
 */

import apiClient from '@/utils/apiClient'

export const equipmentApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/equipment/dashboard')
  },

  // Equipment
  getEquipment: (params = {}) => {
    return apiClient.get('/api/equipment/list', { params })
  },

  getEquipmentItem: (id) => {
    return apiClient.get(`/api/equipment/list/${id}`)
  },

  createEquipment: (equipmentData) => {
    return apiClient.post('/api/equipment/list', equipmentData)
  },

  updateEquipment: (id, equipmentData) => {
    return apiClient.put(`/api/equipment/list/${id}`, equipmentData)
  },

  deleteEquipment: (id) => {
    return apiClient.delete(`/api/equipment/list/${id}`)
  },

  // Equipment Categories
  getEquipmentCategories: (params = {}) => {
    return apiClient.get('/api/equipment-categories', { params })
  },

  createEquipmentCategory: (categoryData) => {
    return apiClient.post('/api/equipment-categories', categoryData)
  },

  updateEquipmentCategory: (id, categoryData) => {
    return apiClient.put(`/api/equipment-categories/${id}`, categoryData)
  },

  deleteEquipmentCategory: (id) => {
    return apiClient.delete(`/api/equipment-categories/${id}`)
  },

  // Maintenance
  getMaintenance: (params = {}) => {
    return apiClient.get('/api/equipment/maintenance', { params })
  },

  getMaintenanceRecord: (id) => {
    return apiClient.get(`/api/equipment/maintenance/${id}`)
  },

  createMaintenance: (maintenanceData) => {
    return apiClient.post('/api/equipment/maintenance', maintenanceData)
  },

  updateMaintenance: (id, maintenanceData) => {
    return apiClient.put(`/api/equipment/maintenance/${id}`, maintenanceData)
  },

  deleteMaintenance: (id) => {
    return apiClient.delete(`/api/equipment/maintenance/${id}`)
  },

  scheduleMaintenance: (id, scheduleData) => {
    return apiClient.post(`/api/equipment/maintenance/${id}/schedule`, scheduleData)
  },

  completeMaintenance: (id, completionData) => {
    return apiClient.patch(`/api/equipment/maintenance/${id}/complete`, completionData)
  },

  // Maintenance Schedules
  getMaintenanceSchedules: (params = {}) => {
    return apiClient.get('/api/maintenance-schedules', { params })
  },

  createMaintenanceSchedule: (scheduleData) => {
    return apiClient.post('/api/maintenance-schedules', scheduleData)
  },

  updateMaintenanceSchedule: (id, scheduleData) => {
    return apiClient.put(`/api/maintenance-schedules/${id}`, scheduleData)
  },

  deleteMaintenanceSchedule: (id) => {
    return apiClient.delete(`/api/maintenance-schedules/${id}`)
  },

  // Equipment Locations
  getEquipmentLocations: (params = {}) => {
    return apiClient.get('/api/equipment/locations', { params })
  },

  getEquipmentLocation: (id) => {
    return apiClient.get(`/api/equipment/locations/${id}`)
  },

  createEquipmentLocation: (locationData) => {
    return apiClient.post('/api/equipment/locations', locationData)
  },

  updateEquipmentLocation: (id, locationData) => {
    return apiClient.put(`/api/equipment/locations/${id}`, locationData)
  },

  deleteEquipmentLocation: (id) => {
    return apiClient.delete(`/api/equipment/locations/${id}`)
  },

  // Equipment Transfers
  getEquipmentTransfers: (params = {}) => {
    return apiClient.get('/api/equipment-transfers', { params })
  },

  createEquipmentTransfer: (transferData) => {
    return apiClient.post('/api/equipment-transfers', transferData)
  },

  updateEquipmentTransfer: (id, transferData) => {
    return apiClient.put(`/api/equipment-transfers/${id}`, transferData)
  },

  approveEquipmentTransfer: (id) => {
    return apiClient.patch(`/api/equipment-transfers/${id}/approve`)
  },

  // Equipment Issues
  getEquipmentIssues: (params = {}) => {
    return apiClient.get('/api/equipment-issues', { params })
  },

  createEquipmentIssue: (issueData) => {
    return apiClient.post('/api/equipment-issues', issueData)
  },

  updateEquipmentIssue: (id, issueData) => {
    return apiClient.put(`/api/equipment-issues/${id}`, issueData)
  },

  resolveEquipmentIssue: (id, resolutionData) => {
    return apiClient.patch(`/api/equipment-issues/${id}/resolve`, resolutionData)
  },

  // Equipment Usage Logs
  getEquipmentUsageLogs: (params = {}) => {
    return apiClient.get('/api/equipment-usage-logs', { params })
  },

  createEquipmentUsageLog: (logData) => {
    return apiClient.post('/api/equipment-usage-logs', logData)
  },

  // Service Contracts
  getServiceContracts: (params = {}) => {
    return apiClient.get('/api/equipment/contracts', { params })
  },

  createServiceContract: (contractData) => {
    return apiClient.post('/api/service-contracts', contractData)
  },

  updateServiceContract: (id, contractData) => {
    return apiClient.put(`/api/service-contracts/${id}`, contractData)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/equipment/stats', { params })
  },

  getMaintenanceStats: (params = {}) => {
    return apiClient.get('/api/equipment/maintenance/stats', { params })
  },

  getUtilizationStats: (params = {}) => {
    return apiClient.get('/api/equipment/utilization', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/equipment/reports', { params })
  },

  generateMaintenanceReport: (reportData) => {
    return apiClient.post('/api/equipment/reports/maintenance', reportData)
  },

  generateUtilizationReport: (reportData) => {
    return apiClient.post('/api/equipment/reports/utilization', reportData)
  },

  // Export
  exportEquipment: (filters = {}) => {
    return apiClient.get('/api/equipment/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportMaintenance: (filters = {}) => {
    return apiClient.get('/api/equipment/maintenance/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default equipmentApi