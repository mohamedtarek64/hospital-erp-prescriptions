/**
 * Patients API Service
 * Handles all patient-related API calls
 */

import apiClient from '@/utils/apiClient'

export const patientsApi = {
  // Get all patients with pagination and filters
  getPatients: (params = {}) => {
    return apiClient.get('/api/patients', { params })
  },

  // Get single patient by ID
  getPatient: (id) => {
    return apiClient.get(`/api/patients/${id}`)
  },

  // Create new patient
  createPatient: (patientData) => {
    return apiClient.post('/api/patients', patientData)
  },

  // Update patient
  updatePatient: (id, patientData) => {
    return apiClient.put(`/api/patients/${id}`, patientData)
  },

  // Delete patient
  deletePatient: (id) => {
    return apiClient.delete(`/api/patients/${id}`)
  },

  // Search patients
  searchPatients: (query, filters = {}) => {
    return apiClient.get('/api/patients/search', {
      params: { q: query, ...filters }
    })
  },

  // Get patient medical history
  getMedicalHistory: (patientId) => {
    return apiClient.get(`/api/patients/${patientId}/medical-history`)
  },

  // Get patient statistics
  getPatientStats: () => {
    return apiClient.get('/api/patients/stats')
  },

  // Export patients data
  exportPatients: (filters = {}) => {
    return apiClient.get('/api/patients/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default patientsApi
