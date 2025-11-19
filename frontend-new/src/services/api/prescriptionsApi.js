/**
 * Prescriptions API Service
 * Handles all prescription-related API calls
 */

import apiClient from '@/utils/apiClient'

export const prescriptionsApi = {
  // Prescriptions
  getPrescriptions: (params = {}) => {
    return apiClient.get('/api/prescriptions', { params })
  },

  getPrescription: (id) => {
    return apiClient.get(`/api/prescriptions/${id}`)
  },

  createPrescription: (prescriptionData) => {
    return apiClient.post('/api/prescriptions', prescriptionData)
  },

  updatePrescription: (id, prescriptionData) => {
    return apiClient.put(`/api/prescriptions/${id}`, prescriptionData)
  },

  deletePrescription: (id) => {
    return apiClient.delete(`/api/prescriptions/${id}`)
  },

  // Prescription Dispensing
  getPrescriptionDispensing: (params = {}) => {
    return apiClient.get('/api/prescription-dispensing', { params })
  },

  getPrescriptionDispensingRecord: (id) => {
    return apiClient.get(`/api/prescription-dispensing/${id}`)
  },

  createPrescriptionDispensing: (dispensingData) => {
    return apiClient.post('/api/prescription-dispensing', dispensingData)
  },

  updatePrescriptionDispensing: (id, dispensingData) => {
    return apiClient.put(`/api/prescription-dispensing/${id}`, dispensingData)
  },

  deletePrescriptionDispensing: (id) => {
    return apiClient.delete(`/api/prescription-dispensing/${id}`)
  },

  // Dispense Prescription
  dispensePrescription: (id, dispensingData) => {
    return apiClient.post(`/api/prescriptions/${id}/dispense`, dispensingData)
  },

  // Prescription Status
  updatePrescriptionStatus: (id, status) => {
    return apiClient.patch(`/api/prescriptions/${id}/status`, { status })
  },

  approvePrescription: (id, approvalData = {}) => {
    return apiClient.post(`/api/prescriptions/${id}/approve`, approvalData)
  },

  rejectPrescription: (id, rejectionData) => {
    return apiClient.post(`/api/prescriptions/${id}/reject`, rejectionData)
  },

  // Prescription by Patient
  getPrescriptionsByPatient: (patientId, params = {}) => {
    return apiClient.get(`/api/prescriptions/patient/${patientId}`, { params })
  },

  // Prescription by Doctor
  getPrescriptionsByDoctor: (doctorId, params = {}) => {
    return apiClient.get(`/api/prescriptions/doctor/${doctorId}`, { params })
  },

  // Prescription by Date Range
  getPrescriptionsByDateRange: (startDate, endDate, params = {}) => {
    return apiClient.get('/api/prescriptions', {
      params: { start_date: startDate, end_date: endDate, ...params }
    })
  },

  // Prescription Statistics
  getPrescriptionStats: (params = {}) => {
    return apiClient.get('/api/prescriptions/stats', { params })
  },

  getDispensingStats: (params = {}) => {
    return apiClient.get('/api/prescription-dispensing/stats', { params })
  },

  // Prescription Reports
  generatePrescriptionReport: (reportData) => {
    return apiClient.post('/api/prescriptions/reports', reportData)
  },

  generateDispensingReport: (reportData) => {
    return apiClient.post('/api/prescription-dispensing/reports', reportData)
  },

  // Export
  exportPrescriptions: (filters = {}) => {
    return apiClient.get('/api/prescriptions/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportDispensing: (filters = {}) => {
    return apiClient.get('/api/prescription-dispensing/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  // Print
  printPrescription: (id) => {
    return apiClient.get(`/api/prescriptions/${id}/print`, {
      responseType: 'blob'
    })
  },

  printDispensingLabel: (id) => {
    return apiClient.get(`/api/prescription-dispensing/${id}/print`, {
      responseType: 'blob'
    })
  }
}

export default prescriptionsApi