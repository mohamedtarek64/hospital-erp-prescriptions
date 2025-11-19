/**
 * Laboratory API Service
 * Handles all laboratory-related API calls
 */

import apiClient from '@/utils/apiClient'

export const laboratoryApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/laboratory/dashboard')
  },

  // Tests
  getTests: (params = {}) => {
    return apiClient.get('/api/laboratory/tests', { params })
  },

  getTest: (id) => {
    return apiClient.get(`/api/laboratory/tests/${id}`)
  },

  createTest: (testData) => {
    return apiClient.post('/api/laboratory/tests', testData)
  },

  updateTest: (id, testData) => {
    return apiClient.put(`/api/laboratory/tests/${id}`, testData)
  },

  deleteTest: (id) => {
    return apiClient.delete(`/api/laboratory/tests/${id}`)
  },

  // Test Requests
  getRequests: (params = {}) => {
    return apiClient.get('/api/laboratory/requests', { params })
  },

  getRequest: (id) => {
    return apiClient.get(`/api/laboratory/requests/${id}`)
  },

  createRequest: (requestData) => {
    return apiClient.post('/api/laboratory/requests', requestData)
  },

  updateRequest: (id, requestData) => {
    return apiClient.put(`/api/laboratory/requests/${id}`, requestData)
  },

  deleteRequest: (id) => {
    return apiClient.delete(`/api/laboratory/requests/${id}`)
  },

  processRequest: (id, processData) => {
    return apiClient.post(`/api/laboratory/requests/${id}/process`, processData)
  },

  // Test Results
  getResults: (params = {}) => {
    return apiClient.get('/api/laboratory/results', { params })
  },

  getResult: (id) => {
    return apiClient.get(`/api/laboratory/results/${id}`)
  },

  createResult: (resultData) => {
    return apiClient.post('/api/laboratory/results', resultData)
  },

  updateResult: (id, resultData) => {
    return apiClient.put(`/api/laboratory/results/${id}`, resultData)
  },

  deleteResult: (id) => {
    return apiClient.delete(`/api/laboratory/results/${id}`)
  },

  approveResult: (id) => {
    return apiClient.patch(`/api/laboratory/results/${id}/approve`)
  },

  rejectResult: (id, reason) => {
    return apiClient.patch(`/api/laboratory/results/${id}/reject`, { reason })
  },

  // Samples
  getSamples: (params = {}) => {
    return apiClient.get('/api/laboratory/samples', { params })
  },

  getSample: (id) => {
    return apiClient.get(`/api/laboratory/samples/${id}`)
  },

  createSample: (sampleData) => {
    return apiClient.post('/api/laboratory/samples', sampleData)
  },

  updateSample: (id, sampleData) => {
    return apiClient.put(`/api/laboratory/samples/${id}`, sampleData)
  },

  deleteSample: (id) => {
    return apiClient.delete(`/api/laboratory/samples/${id}`)
  },

  collectSample: (id, collectionData) => {
    return apiClient.post(`/api/laboratory/samples/${id}/collect`, collectionData)
  },

  processSample: (id, processData) => {
    return apiClient.post(`/api/laboratory/samples/${id}/process`, processData)
  },

  // Quality Control
  getQualityControl: (params = {}) => {
    return apiClient.get('/api/laboratory/quality-control', { params })
  },

  createQualityControl: (qcData) => {
    return apiClient.post('/api/laboratory/quality-control', qcData)
  },

  updateQualityControl: (id, qcData) => {
    return apiClient.put(`/api/laboratory/quality-control/${id}`, qcData)
  },

  // Test Categories
  getTestCategories: (params = {}) => {
    return apiClient.get('/api/laboratory/test-categories', { params })
  },

  createTestCategory: (categoryData) => {
    return apiClient.post('/api/laboratory/test-categories', categoryData)
  },

  updateTestCategory: (id, categoryData) => {
    return apiClient.put(`/api/laboratory/test-categories/${id}`, categoryData)
  },

  deleteTestCategory: (id) => {
    return apiClient.delete(`/api/laboratory/test-categories/${id}`)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/laboratory/stats', { params })
  },

  getTurnaroundTime: (params = {}) => {
    return apiClient.get('/api/laboratory/turnaround-time', { params })
  },

  getCriticalValues: (params = {}) => {
    return apiClient.get('/api/laboratory/critical-values', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/laboratory/reports', { params })
  },

  generateReport: (reportData) => {
    return apiClient.post('/api/laboratory/reports/generate', reportData)
  },

  exportResults: (filters = {}) => {
    return apiClient.get('/api/laboratory/results/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportRequests: (filters = {}) => {
    return apiClient.get('/api/laboratory/requests/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default laboratoryApi