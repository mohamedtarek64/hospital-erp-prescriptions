/**
 * Maintenance API Service
 * Handles all maintenance-related API calls
 */

import apiClient from '@/utils/apiClient'

export const maintenanceApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/maintenance/dashboard')
  },

  // Maintenance Schedules
  getSchedules: (params = {}) => {
    return apiClient.get('/api/maintenance/schedules', { params })
  },

  getSchedule: (id) => {
    return apiClient.get(`/api/maintenance/schedules/${id}`)
  },

  createSchedule: (scheduleData) => {
    return apiClient.post('/api/maintenance/schedules', scheduleData)
  },

  updateSchedule: (id, scheduleData) => {
    return apiClient.put(`/api/maintenance/schedules/${id}`, scheduleData)
  },

  deleteSchedule: (id) => {
    return apiClient.delete(`/api/maintenance/schedules/${id}`)
  },

  startMaintenance: (id, startData = {}) => {
    return apiClient.post(`/api/maintenance/schedules/${id}/start`, startData)
  },

  completeMaintenance: (id, completionData) => {
    return apiClient.post(`/api/maintenance/schedules/${id}/complete`, completionData)
  },

  // Maintenance Records
  getRecords: (params = {}) => {
    return apiClient.get('/api/maintenance/records', { params })
  },

  getRecord: (id) => {
    return apiClient.get(`/api/maintenance/records/${id}`)
  },

  createRecord: (recordData) => {
    return apiClient.post('/api/maintenance/records', recordData)
  },

  updateRecord: (id, recordData) => {
    return apiClient.put(`/api/maintenance/records/${id}`, recordData)
  },

  deleteRecord: (id) => {
    return apiClient.delete(`/api/maintenance/records/${id}`)
  },

  // Maintenance Types
  getMaintenanceTypes: (params = {}) => {
    return apiClient.get('/api/maintenance/types', { params })
  },

  createMaintenanceType: (typeData) => {
    return apiClient.post('/api/maintenance/types', typeData)
  },

  updateMaintenanceType: (id, typeData) => {
    return apiClient.put(`/api/maintenance/types/${id}`, typeData)
  },

  deleteMaintenanceType: (id) => {
    return apiClient.delete(`/api/maintenance/types/${id}`)
  },

  // Maintenance Technicians
  getTechnicians: (params = {}) => {
    return apiClient.get('/api/maintenance/technicians', { params })
  },

  getTechnician: (id) => {
    return apiClient.get(`/api/maintenance/technicians/${id}`)
  },

  createTechnician: (technicianData) => {
    return apiClient.post('/api/maintenance/technicians', technicianData)
  },

  updateTechnician: (id, technicianData) => {
    return apiClient.put(`/api/maintenance/technicians/${id}`, technicianData)
  },

  deleteTechnician: (id) => {
    return apiClient.delete(`/api/maintenance/technicians/${id}`)
  },

  // Maintenance Parts
  getParts: (params = {}) => {
    return apiClient.get('/api/maintenance/parts', { params })
  },

  getPart: (id) => {
    return apiClient.get(`/api/maintenance/parts/${id}`)
  },

  createPart: (partData) => {
    return apiClient.post('/api/maintenance/parts', partData)
  },

  updatePart: (id, partData) => {
    return apiClient.put(`/api/maintenance/parts/${id}`, partData)
  },

  deletePart: (id) => {
    return apiClient.delete(`/api/maintenance/parts/${id}`)
  },

  // Maintenance Work Orders
  getWorkOrders: (params = {}) => {
    return apiClient.get('/api/maintenance/work-orders', { params })
  },

  getWorkOrder: (id) => {
    return apiClient.get(`/api/maintenance/work-orders/${id}`)
  },

  createWorkOrder: (workOrderData) => {
    return apiClient.post('/api/maintenance/work-orders', workOrderData)
  },

  updateWorkOrder: (id, workOrderData) => {
    return apiClient.put(`/api/maintenance/work-orders/${id}`, workOrderData)
  },

  deleteWorkOrder: (id) => {
    return apiClient.delete(`/api/maintenance/work-orders/${id}`)
  },

  assignWorkOrder: (id, assignmentData) => {
    return apiClient.post(`/api/maintenance/work-orders/${id}/assign`, assignmentData)
  },

  startWorkOrder: (id, startData = {}) => {
    return apiClient.post(`/api/maintenance/work-orders/${id}/start`, startData)
  },

  completeWorkOrder: (id, completionData) => {
    return apiClient.post(`/api/maintenance/work-orders/${id}/complete`, completionData)
  },

  // Maintenance Issues
  getIssues: (params = {}) => {
    return apiClient.get('/api/maintenance/issues', { params })
  },

  getIssue: (id) => {
    return apiClient.get(`/api/maintenance/issues/${id}`)
  },

  createIssue: (issueData) => {
    return apiClient.post('/api/maintenance/issues', issueData)
  },

  updateIssue: (id, issueData) => {
    return apiClient.put(`/api/maintenance/issues/${id}`, issueData)
  },

  deleteIssue: (id) => {
    return apiClient.delete(`/api/maintenance/issues/${id}`)
  },

  resolveIssue: (id, resolutionData) => {
    return apiClient.post(`/api/maintenance/issues/${id}/resolve`, resolutionData)
  },

  // Maintenance Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/maintenance/stats', { params })
  },

  getScheduleStats: (params = {}) => {
    return apiClient.get('/api/maintenance/schedules/stats', { params })
  },

  getRecordStats: (params = {}) => {
    return apiClient.get('/api/maintenance/records/stats', { params })
  },

  getTechnicianStats: (params = {}) => {
    return apiClient.get('/api/maintenance/technicians/stats', { params })
  },

  // Maintenance Reports
  generateMaintenanceReport: (reportData) => {
    return apiClient.post('/api/maintenance/reports', reportData)
  },

  generateScheduleReport: (reportData) => {
    return apiClient.post('/api/maintenance/reports/schedules', reportData)
  },

  generateRecordReport: (reportData) => {
    return apiClient.post('/api/maintenance/reports/records', reportData)
  },

  generateTechnicianReport: (reportData) => {
    return apiClient.post('/api/maintenance/reports/technicians', reportData)
  },

  // Export
  exportSchedules: (filters = {}) => {
    return apiClient.get('/api/maintenance/schedules/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportRecords: (filters = {}) => {
    return apiClient.get('/api/maintenance/records/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportWorkOrders: (filters = {}) => {
    return apiClient.get('/api/maintenance/work-orders/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default maintenanceApi