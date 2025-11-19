/**
 * Quality Assurance API Service
 * Handles all quality assurance-related API calls
 */

import apiClient from '@/utils/apiClient'

export const qualityAssuranceApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/quality-assurance/dashboard')
  },

  // Quality Standards
  getStandards: (params = {}) => {
    return apiClient.get('/api/quality-assurance/standards', { params })
  },

  getStandard: (id) => {
    return apiClient.get(`/api/quality-assurance/standards/${id}`)
  },

  createStandard: (standardData) => {
    return apiClient.post('/api/quality-assurance/standards', standardData)
  },

  updateStandard: (id, standardData) => {
    return apiClient.put(`/api/quality-assurance/standards/${id}`, standardData)
  },

  deleteStandard: (id) => {
    return apiClient.delete(`/api/quality-assurance/standards/${id}`)
  },

  // Audits
  getAudits: (params = {}) => {
    return apiClient.get('/api/quality-assurance/audits', { params })
  },

  getAudit: (id) => {
    return apiClient.get(`/api/quality-assurance/audits/${id}`)
  },

  createAudit: (auditData) => {
    return apiClient.post('/api/quality-assurance/audits', auditData)
  },

  updateAudit: (id, auditData) => {
    return apiClient.put(`/api/quality-assurance/audits/${id}`, auditData)
  },

  deleteAudit: (id) => {
    return apiClient.delete(`/api/quality-assurance/audits/${id}`)
  },

  startAudit: (id) => {
    return apiClient.post(`/api/quality-assurance/audits/${id}/start`)
  },

  completeAudit: (id, completionData) => {
    return apiClient.post(`/api/quality-assurance/audits/${id}/complete`, completionData)
  },

  // Incidents
  getIncidents: (params = {}) => {
    return apiClient.get('/api/quality-assurance/incidents', { params })
  },

  getIncident: (id) => {
    return apiClient.get(`/api/quality-assurance/incidents/${id}`)
  },

  createIncident: (incidentData) => {
    return apiClient.post('/api/quality-assurance/incidents', incidentData)
  },

  updateIncident: (id, incidentData) => {
    return apiClient.put(`/api/quality-assurance/incidents/${id}`, incidentData)
  },

  deleteIncident: (id) => {
    return apiClient.delete(`/api/quality-assurance/incidents/${id}`)
  },

  reportIncident: (incidentData) => {
    return apiClient.post('/api/quality-assurance/incidents/report', incidentData)
  },

  investigateIncident: (id, investigationData) => {
    return apiClient.post(`/api/quality-assurance/incidents/${id}/investigate`, investigationData)
  },

  resolveIncident: (id, resolutionData) => {
    return apiClient.post(`/api/quality-assurance/incidents/${id}/resolve`, resolutionData)
  },

  // Compliance Records
  getComplianceRecords: (params = {}) => {
    return apiClient.get('/api/quality-assurance/compliance', { params })
  },

  getComplianceRecord: (id) => {
    return apiClient.get(`/api/quality-assurance/compliance/${id}`)
  },

  createComplianceRecord: (recordData) => {
    return apiClient.post('/api/quality-assurance/compliance', recordData)
  },

  updateComplianceRecord: (id, recordData) => {
    return apiClient.put(`/api/quality-assurance/compliance/${id}`, recordData)
  },

  deleteComplianceRecord: (id) => {
    return apiClient.delete(`/api/quality-assurance/compliance/${id}`)
  },

  // Training Records
  getTrainingRecords: (params = {}) => {
    return apiClient.get('/api/quality-assurance/training', { params })
  },

  getTrainingRecord: (id) => {
    return apiClient.get(`/api/quality-assurance/training/${id}`)
  },

  createTrainingRecord: (recordData) => {
    return apiClient.post('/api/quality-assurance/training', recordData)
  },

  updateTrainingRecord: (id, recordData) => {
    return apiClient.put(`/api/quality-assurance/training/${id}`, recordData)
  },

  deleteTrainingRecord: (id) => {
    return apiClient.delete(`/api/quality-assurance/training/${id}`)
  },

  completeTraining: (id, completionData) => {
    return apiClient.post(`/api/quality-assurance/training/${id}/complete`, completionData)
  },

  // Performance Reviews
  getPerformanceReviews: (params = {}) => {
    return apiClient.get('/api/performance-reviews', { params })
  },

  getPerformanceReview: (id) => {
    return apiClient.get(`/api/performance-reviews/${id}`)
  },

  createPerformanceReview: (reviewData) => {
    return apiClient.post('/api/performance-reviews', reviewData)
  },

  updatePerformanceReview: (id, reviewData) => {
    return apiClient.put(`/api/performance-reviews/${id}`, reviewData)
  },

  deletePerformanceReview: (id) => {
    return apiClient.delete(`/api/performance-reviews/${id}`)
  },

  submitPerformanceReview: (id, submissionData) => {
    return apiClient.post(`/api/performance-reviews/${id}/submit`, submissionData)
  },

  approvePerformanceReview: (id, approvalData) => {
    return apiClient.post(`/api/performance-reviews/${id}/approve`, approvalData)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/quality-assurance/stats', { params })
  },

  getIncidentStats: (params = {}) => {
    return apiClient.get('/api/quality-assurance/incidents/stats', { params })
  },

  getComplianceStats: (params = {}) => {
    return apiClient.get('/api/quality-assurance/compliance/stats', { params })
  },

  getTrainingStats: (params = {}) => {
    return apiClient.get('/api/quality-assurance/training/stats', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/quality-assurance/reports', { params })
  },

  generateQualityReport: (reportData) => {
    return apiClient.post('/api/quality-assurance/reports/generate', reportData)
  },

  generateIncidentReport: (reportData) => {
    return apiClient.post('/api/quality-assurance/reports/incidents', reportData)
  },

  generateComplianceReport: (reportData) => {
    return apiClient.post('/api/quality-assurance/reports/compliance', reportData)
  },

  generateTrainingReport: (reportData) => {
    return apiClient.post('/api/quality-assurance/reports/training', reportData)
  },

  // Export
  exportStandards: (filters = {}) => {
    return apiClient.get('/api/quality-assurance/standards/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportIncidents: (filters = {}) => {
    return apiClient.get('/api/quality-assurance/incidents/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportCompliance: (filters = {}) => {
    return apiClient.get('/api/quality-assurance/compliance/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportTraining: (filters = {}) => {
    return apiClient.get('/api/quality-assurance/training/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default qualityAssuranceApi