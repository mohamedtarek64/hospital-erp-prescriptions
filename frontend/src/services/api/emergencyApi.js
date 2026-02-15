/**
 * Emergency API Service
 * Handles all emergency-related API calls
 */

import apiClient from '@/utils/apiClient'

export const emergencyApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/emergency/dashboard')
  },

  // Emergency Cases
  getCases: (params = {}) => {
    return apiClient.get('/api/emergency/cases', { params })
  },

  getCase: (id) => {
    return apiClient.get(`/api/emergency/cases/${id}`)
  },

  createCase: (caseData) => {
    return apiClient.post('/api/emergency/cases', caseData)
  },

  updateCase: (id, caseData) => {
    return apiClient.put(`/api/emergency/cases/${id}`, caseData)
  },

  deleteCase: (id) => {
    return apiClient.delete(`/api/emergency/cases/${id}`)
  },

  closeCase: (id, closureData) => {
    return apiClient.patch(`/api/emergency/cases/${id}/close`, closureData)
  },

  // Ambulances
  getAmbulances: (params = {}) => {
    return apiClient.get('/api/emergency/ambulances', { params })
  },

  getAmbulance: (id) => {
    return apiClient.get(`/api/emergency/ambulances/${id}`)
  },

  createAmbulance: (ambulanceData) => {
    return apiClient.post('/api/emergency/ambulances', ambulanceData)
  },

  updateAmbulance: (id, ambulanceData) => {
    return apiClient.put(`/api/emergency/ambulances/${id}`, ambulanceData)
  },

  deleteAmbulance: (id) => {
    return apiClient.delete(`/api/emergency/ambulances/${id}`)
  },

  dispatchAmbulance: (id, dispatchData) => {
    return apiClient.post(`/api/emergency/ambulances/${id}/dispatch`, dispatchData)
  },

  returnAmbulance: (id, returnData) => {
    return apiClient.post(`/api/emergency/ambulances/${id}/return`, returnData)
  },

  // Triage
  getTriage: (params = {}) => {
    return apiClient.get('/api/emergency/triage', { params })
  },

  getTriageAssessment: (id) => {
    return apiClient.get(`/api/emergency/triage/${id}`)
  },

  createTriageAssessment: (assessmentData) => {
    return apiClient.post('/api/emergency/triage', assessmentData)
  },

  updateTriageAssessment: (id, assessmentData) => {
    return apiClient.put(`/api/emergency/triage/${id}`, assessmentData)
  },

  assessPatient: (id, assessmentData) => {
    return apiClient.post(`/api/emergency/triage/${id}/assess`, assessmentData)
  },

  // Critical Alerts
  getAlerts: (params = {}) => {
    return apiClient.get('/api/emergency/alerts', { params })
  },

  getAlert: (id) => {
    return apiClient.get(`/api/emergency/alerts/${id}`)
  },

  createAlert: (alertData) => {
    return apiClient.post('/api/emergency/alerts', alertData)
  },

  updateAlert: (id, alertData) => {
    return apiClient.put(`/api/emergency/alerts/${id}`, alertData)
  },

  acknowledgeAlert: (id) => {
    return apiClient.patch(`/api/emergency/alerts/${id}/acknowledge`)
  },

  resolveAlert: (id, resolutionData) => {
    return apiClient.patch(`/api/emergency/alerts/${id}/resolve`, resolutionData)
  },

  // Emergency Equipment
  getEmergencyEquipment: (params = {}) => {
    return apiClient.get('/api/emergency-equipment', { params })
  },

  createEmergencyEquipment: (equipmentData) => {
    return apiClient.post('/api/emergency-equipment', equipmentData)
  },

  updateEmergencyEquipment: (id, equipmentData) => {
    return apiClient.put(`/api/emergency-equipment/${id}`, equipmentData)
  },

  // Emergency Staff Schedules
  getEmergencyStaffSchedules: (params = {}) => {
    return apiClient.get('/api/emergency-staff-schedules', { params })
  },

  createEmergencyStaffSchedule: (scheduleData) => {
    return apiClient.post('/api/emergency-staff-schedules', scheduleData)
  },

  updateEmergencyStaffSchedule: (id, scheduleData) => {
    return apiClient.put(`/api/emergency-staff-schedules/${id}`, scheduleData)
  },

  // Emergency Contacts
  getEmergencyContacts: (params = {}) => {
    return apiClient.get('/api/emergency-contacts', { params })
  },

  createEmergencyContact: (contactData) => {
    return apiClient.post('/api/emergency-contacts', contactData)
  },

  updateEmergencyContact: (id, contactData) => {
    return apiClient.put(`/api/emergency-contacts/${id}`, contactData)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/emergency/stats', { params })
  },

  getResponseTime: (params = {}) => {
    return apiClient.get('/api/emergency/response-time', { params })
  },

  getCaseOutcomes: (params = {}) => {
    return apiClient.get('/api/emergency/case-outcomes', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/emergency/reports', { params })
  },

  generateEmergencyReport: (reportData) => {
    return apiClient.post('/api/emergency/reports/generate', reportData)
  },

  // Export
  exportCases: (filters = {}) => {
    return apiClient.get('/api/emergency/cases/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportAmbulances: (filters = {}) => {
    return apiClient.get('/api/emergency/ambulances/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default emergencyApi