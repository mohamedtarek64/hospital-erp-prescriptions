/**
 * Ward Management API Service
 * Handles all ward management-related API calls
 */

import apiClient from '@/utils/apiClient'

export const wardManagementApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/ward-management/dashboard')
  },

  // Wards
  getWards: (params = {}) => {
    return apiClient.get('/api/ward-management/wards', { params })
  },

  getWard: (id) => {
    return apiClient.get(`/api/ward-management/wards/${id}`)
  },

  createWard: (wardData) => {
    return apiClient.post('/api/ward-management/wards', wardData)
  },

  updateWard: (id, wardData) => {
    return apiClient.put(`/api/ward-management/wards/${id}`, wardData)
  },

  deleteWard: (id) => {
    return apiClient.delete(`/api/ward-management/wards/${id}`)
  },

  // Beds
  getBeds: (params = {}) => {
    return apiClient.get('/api/ward-management/beds', { params })
  },

  getBed: (id) => {
    return apiClient.get(`/api/ward-management/beds/${id}`)
  },

  createBed: (bedData) => {
    return apiClient.post('/api/ward-management/beds', bedData)
  },

  updateBed: (id, bedData) => {
    return apiClient.put(`/api/ward-management/beds/${id}`, bedData)
  },

  deleteBed: (id) => {
    return apiClient.delete(`/api/ward-management/beds/${id}`)
  },

  getAvailableBeds: (wardId = null) => {
    const params = wardId ? { ward_id: wardId } : {}
    return apiClient.get('/api/ward-management/beds/available', { params })
  },

  // Admissions
  getAdmissions: (params = {}) => {
    return apiClient.get('/api/ward-management/admissions', { params })
  },

  getAdmission: (id) => {
    return apiClient.get(`/api/ward-management/admissions/${id}`)
  },

  createAdmission: (admissionData) => {
    return apiClient.post('/api/ward-management/admissions', admissionData)
  },

  updateAdmission: (id, admissionData) => {
    return apiClient.put(`/api/ward-management/admissions/${id}`, admissionData)
  },

  deleteAdmission: (id) => {
    return apiClient.delete(`/api/ward-management/admissions/${id}`)
  },

  dischargePatient: (id, dischargeData) => {
    return apiClient.post(`/api/ward-management/admissions/${id}/discharge`, dischargeData)
  },

  // Transfers
  getTransfers: (params = {}) => {
    return apiClient.get('/api/ward-management/transfers', { params })
  },

  getTransfer: (id) => {
    return apiClient.get(`/api/ward-management/transfers/${id}`)
  },

  createTransfer: (transferData) => {
    return apiClient.post('/api/ward-management/transfers', transferData)
  },

  updateTransfer: (id, transferData) => {
    return apiClient.put(`/api/ward-management/transfers/${id}`, transferData)
  },

  deleteTransfer: (id) => {
    return apiClient.delete(`/api/ward-management/transfers/${id}`)
  },

  // Housekeeping
  getHousekeepingTasks: (params = {}) => {
    return apiClient.get('/api/ward-management/housekeeping', { params })
  },

  createHousekeepingTask: (taskData) => {
    return apiClient.post('/api/ward-management/housekeeping', taskData)
  },

  updateHousekeepingTask: (id, taskData) => {
    return apiClient.put(`/api/ward-management/housekeeping/${id}`, taskData)
  },

  completeHousekeepingTask: (id, completionData) => {
    return apiClient.patch(`/api/ward-management/housekeeping/${id}/complete`, completionData)
  },

  // Ward Rounds
  getWardRounds: (params = {}) => {
    return apiClient.get('/api/ward-rounds', { params })
  },

  createWardRound: (roundData) => {
    return apiClient.post('/api/ward-rounds', roundData)
  },

  updateWardRound: (id, roundData) => {
    return apiClient.put(`/api/ward-rounds/${id}`, roundData)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/ward-management/stats', { params })
  },

  getOccupancyRate: (params = {}) => {
    return apiClient.get('/api/ward-management/occupancy', { params })
  },

  getBedUtilization: (params = {}) => {
    return apiClient.get('/api/ward-management/bed-utilization', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/ward-management/reports', { params })
  },

  generateOccupancyReport: (reportData) => {
    return apiClient.post('/api/ward-management/reports/occupancy', reportData)
  },

  generateAdmissionReport: (reportData) => {
    return apiClient.post('/api/ward-management/reports/admissions', reportData)
  },

  // Export
  exportWards: (filters = {}) => {
    return apiClient.get('/api/ward-management/wards/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportBeds: (filters = {}) => {
    return apiClient.get('/api/ward-management/beds/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportAdmissions: (filters = {}) => {
    return apiClient.get('/api/ward-management/admissions/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default wardManagementApi