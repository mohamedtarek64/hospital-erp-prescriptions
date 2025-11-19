/**
 * Medical Records API Service
 * Handles all medical record-related API calls
 */

import apiClient from '@/utils/apiClient'

export const medicalRecordsApi = {
  // Get all medical records with pagination and filters
  getMedicalRecords: (params = {}) => {
    return apiClient.get('/api/medical-records', { params })
  },

  // Get single medical record by ID
  getMedicalRecord: (id) => {
    return apiClient.get(`/api/medical-records/${id}`)
  },

  // Create new medical record
  createMedicalRecord: (recordData) => {
    return apiClient.post('/api/medical-records', recordData)
  },

  // Update medical record
  updateMedicalRecord: (id, recordData) => {
    return apiClient.put(`/api/medical-records/${id}`, recordData)
  },

  // Delete medical record
  deleteMedicalRecord: (id) => {
    return apiClient.delete(`/api/medical-records/${id}`)
  },

  // Get patient medical history
  getPatientHistory: (patientId, params = {}) => {
    return apiClient.get(`/api/medical-records/patient/${patientId}`, { params })
  },

  // Add attachment to medical record
  addAttachment: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/api/medical-records/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Get medical record attachments
  getAttachments: (id) => {
    return apiClient.get(`/api/medical-records/${id}/attachments`)
  },

  // Delete attachment
  deleteAttachment: (recordId, attachmentId) => {
    return apiClient.delete(`/api/medical-records/${recordId}/attachments/${attachmentId}`)
  },

  // Get medical records by doctor
  getByDoctor: (doctorId, params = {}) => {
    return apiClient.get('/api/medical-records', {
      params: { doctor_id: doctorId, ...params }
    })
  },

  // Get medical records by date range
  getByDateRange: (startDate, endDate, params = {}) => {
    return apiClient.get('/api/medical-records', {
      params: { start_date: startDate, end_date: endDate, ...params }
    })
  },

  // Search medical records
  searchRecords: (query, filters = {}) => {
    return apiClient.get('/api/medical-records/search', {
      params: { q: query, ...filters }
    })
  },

  // Get medical record statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/medical-records/stats', { params })
  },

  // Export medical records
  exportRecords: (filters = {}) => {
    return apiClient.get('/api/medical-records/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  // Get diagnosis list
  getDiagnoses: (params = {}) => {
    return apiClient.get('/api/diagnoses', { params })
  },

  // Create diagnosis
  createDiagnosis: (diagnosisData) => {
    return apiClient.post('/api/diagnoses', diagnosisData)
  },

  // Update diagnosis
  updateDiagnosis: (id, diagnosisData) => {
    return apiClient.put(`/api/diagnoses/${id}`, diagnosisData)
  },

  // Delete diagnosis
  deleteDiagnosis: (id) => {
    return apiClient.delete(`/api/diagnoses/${id}`)
  }
}

export default medicalRecordsApi