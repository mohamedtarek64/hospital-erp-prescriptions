/**
 * Reports API Service
 * Handles all reports-related API calls
 */

import apiClient from '@/utils/apiClient'

export const reportsApi = {
  // Report Categories
  getReportCategories: (params = {}) => {
    return apiClient.get('/api/report-categories', { params })
  },

  createReportCategory: (categoryData) => {
    return apiClient.post('/api/report-categories', categoryData)
  },

  updateReportCategory: (id, categoryData) => {
    return apiClient.put(`/api/report-categories/${id}`, categoryData)
  },

  deleteReportCategory: (id) => {
    return apiClient.delete(`/api/report-categories/${id}`)
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/reports/list', { params })
  },

  getReport: (id) => {
    return apiClient.get(`/api/reports/list/${id}`)
  },

  createReport: (reportData) => {
    return apiClient.post('/api/reports/list', reportData)
  },

  updateReport: (id, reportData) => {
    return apiClient.put(`/api/reports/list/${id}`, reportData)
  },

  deleteReport: (id) => {
    return apiClient.delete(`/api/reports/list/${id}`)
  },

  // Report Generation
  generateReport: (reportData) => {
    return apiClient.post('/api/reports/generate', reportData)
  },

  getReportTemplates: (params = {}) => {
    return apiClient.get('/api/reports/templates', { params })
  },

  createReportTemplate: (templateData) => {
    return apiClient.post('/api/reports/templates', templateData)
  },

  updateReportTemplate: (id, templateData) => {
    return apiClient.put(`/api/reports/templates/${id}`, templateData)
  },

  deleteReportTemplate: (id) => {
    return apiClient.delete(`/api/reports/templates/${id}`)
  },

  // Report Executions
  getReportExecutions: (params = {}) => {
    return apiClient.get('/api/report-executions', { params })
  },

  getReportExecution: (id) => {
    return apiClient.get(`/api/report-executions/${id}`)
  },

  executeReport: (executionData) => {
    return apiClient.post('/api/report-executions', executionData)
  },

  getReportExecutionStatus: (id) => {
    return apiClient.get(`/api/report-executions/${id}/status`)
  },

  downloadReport: (id) => {
    return apiClient.get(`/api/report-executions/${id}/download`, {
      responseType: 'blob'
    })
  },

  // Patient Reports
  generatePatientReport: (reportData) => {
    return apiClient.post('/api/reports/patients', reportData)
  },

  generatePatientSummary: (patientId, params = {}) => {
    return apiClient.get(`/api/reports/patients/${patientId}/summary`, { params })
  },

  generatePatientHistory: (patientId, params = {}) => {
    return apiClient.get(`/api/reports/patients/${patientId}/history`, { params })
  },

  // Financial Reports
  generateFinancialReport: (reportData) => {
    return apiClient.post('/api/reports/financial', reportData)
  },

  generateRevenueReport: (reportData) => {
    return apiClient.post('/api/reports/revenue', reportData)
  },

  generateExpenseReport: (reportData) => {
    return apiClient.post('/api/reports/expenses', reportData)
  },

  generateProfitLossReport: (reportData) => {
    return apiClient.post('/api/reports/profit-loss', reportData)
  },

  // Operational Reports
  generateOperationalReport: (reportData) => {
    return apiClient.post('/api/reports/operational', reportData)
  },

  generateAppointmentReport: (reportData) => {
    return apiClient.post('/api/reports/appointments', reportData)
  },

  generateWardReport: (reportData) => {
    return apiClient.post('/api/reports/wards', reportData)
  },

  generateStaffReport: (reportData) => {
    return apiClient.post('/api/reports/staff', reportData)
  },

  // Quality Reports
  generateQualityReport: (reportData) => {
    return apiClient.post('/api/reports/quality', reportData)
  },

  generateIncidentReport: (reportData) => {
    return apiClient.post('/api/reports/incidents', reportData)
  },

  generateComplianceReport: (reportData) => {
    return apiClient.post('/api/reports/compliance', reportData)
  },

  // Laboratory Reports
  generateLabReport: (reportData) => {
    return apiClient.post('/api/reports/laboratory', reportData)
  },

  generateTestReport: (reportData) => {
    return apiClient.post('/api/reports/lab-tests', reportData)
  },

  generateResultReport: (reportData) => {
    return apiClient.post('/api/reports/lab-results', reportData)
  },

  // Emergency Reports
  generateEmergencyReport: (reportData) => {
    return apiClient.post('/api/reports/emergency', reportData)
  },

  generateAmbulanceReport: (reportData) => {
    return apiClient.post('/api/reports/ambulances', reportData)
  },

  generateTriageReport: (reportData) => {
    return apiClient.post('/api/reports/triage', reportData)
  },

  // Equipment Reports
  generateEquipmentReport: (reportData) => {
    return apiClient.post('/api/reports/equipment', reportData)
  },

  generateMaintenanceReport: (reportData) => {
    return apiClient.post('/api/reports/maintenance', reportData)
  },

  generateUtilizationReport: (reportData) => {
    return apiClient.post('/api/reports/utilization', reportData)
  },

  // Pharmacy Reports
  generatePharmacyReport: (reportData) => {
    return apiClient.post('/api/reports/pharmacy', reportData)
  },

  generateInventoryReport: (reportData) => {
    return apiClient.post('/api/reports/inventory', reportData)
  },

  generatePrescriptionReport: (reportData) => {
    return apiClient.post('/api/reports/prescriptions', reportData)
  },

  // HR Reports
  generateHRReport: (reportData) => {
    return apiClient.post('/api/reports/hr', reportData)
  },

  generateAttendanceReport: (reportData) => {
    return apiClient.post('/api/reports/attendance', reportData)
  },

  generatePayrollReport: (reportData) => {
    return apiClient.post('/api/reports/payroll', reportData)
  },

  // System Reports
  generateSystemReport: (reportData) => {
    return apiClient.post('/api/reports/system', reportData)
  },

  generateAuditReport: (reportData) => {
    return apiClient.post('/api/reports/audit', reportData)
  },

  generateLogReport: (reportData) => {
    return apiClient.post('/api/reports/logs', reportData)
  },

  // Export Reports
  exportReport: (id, format = 'pdf') => {
    return apiClient.get(`/api/reports/${id}/export`, {
      params: { format },
      responseType: 'blob'
    })
  },

  exportReportData: (reportData, format = 'excel') => {
    return apiClient.post('/api/reports/export', reportData, {
      params: { format },
      responseType: 'blob'
    })
  },

  // Schedule Reports
  scheduleReport: (scheduleData) => {
    return apiClient.post('/api/reports/schedule', scheduleData)
  },

  getScheduledReports: (params = {}) => {
    return apiClient.get('/api/reports/scheduled', { params })
  },

  updateScheduledReport: (id, scheduleData) => {
    return apiClient.put(`/api/reports/scheduled/${id}`, scheduleData)
  },

  deleteScheduledReport: (id) => {
    return apiClient.delete(`/api/reports/scheduled/${id}`)
  }
}

export default reportsApi