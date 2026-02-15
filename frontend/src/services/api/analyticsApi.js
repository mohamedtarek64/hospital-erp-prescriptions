/**
 * Analytics API Service
 * Handles all analytics-related API calls
 */

import apiClient from '@/utils/apiClient'

export const analyticsApi = {
  // Dashboard Analytics
  getDashboardAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/dashboard', { params })
  },

  // KPI Data
  getKPIs: (params = {}) => {
    return apiClient.get('/api/analytics/kpis', { params })
  },

  getKPIDetails: (kpiId, params = {}) => {
    return apiClient.get(`/api/analytics/kpis/${kpiId}`, { params })
  },

  // Chart Data
  getChartData: (chartType, params = {}) => {
    return apiClient.get(`/api/analytics/charts/${chartType}`, { params })
  },

  getRevenueChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/revenue', { params })
  },

  getPatientChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/patients', { params })
  },

  getAppointmentChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/appointments', { params })
  },

  getOccupancyChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/occupancy', { params })
  },

  getEquipmentUtilizationChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/equipment-utilization', { params })
  },

  getLabTestsChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/lab-tests', { params })
  },

  getEmergencyResponseChart: (params = {}) => {
    return apiClient.get('/api/analytics/charts/emergency-response', { params })
  },

  // Financial Analytics
  getFinancialAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/financial', { params })
  },

  getRevenueAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/revenue', { params })
  },

  getCostAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/costs', { params })
  },

  getProfitabilityAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/profitability', { params })
  },

  // Operational Analytics
  getOperationalAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/operational', { params })
  },

  getPatientFlowAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/patient-flow', { params })
  },

  getAppointmentAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/appointments', { params })
  },

  getWardOccupancyAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/ward-occupancy', { params })
  },

  getStaffProductivityAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/staff-productivity', { params })
  },

  // Quality Analytics
  getQualityAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/quality', { params })
  },

  getPatientSatisfactionAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/patient-satisfaction', { params })
  },

  getClinicalOutcomesAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/clinical-outcomes', { params })
  },

  getSafetyMetricsAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/safety-metrics', { params })
  },

  // Resource Utilization
  getResourceUtilization: (params = {}) => {
    return apiClient.get('/api/analytics/resource-utilization', { params })
  },

  getEquipmentUtilization: (params = {}) => {
    return apiClient.get('/api/analytics/equipment-utilization', { params })
  },

  getStaffUtilization: (params = {}) => {
    return apiClient.get('/api/analytics/staff-utilization', { params })
  },

  getBedUtilization: (params = {}) => {
    return apiClient.get('/api/analytics/bed-utilization', { params })
  },

  // Trend Analysis
  getTrendAnalysis: (params = {}) => {
    return apiClient.get('/api/analytics/trends', { params })
  },

  getSeasonalTrends: (params = {}) => {
    return apiClient.get('/api/analytics/seasonal-trends', { params })
  },

  getGrowthTrends: (params = {}) => {
    return apiClient.get('/api/analytics/growth-trends', { params })
  },

  // Comparative Analysis
  getComparativeAnalysis: (params = {}) => {
    return apiClient.get('/api/analytics/comparative', { params })
  },

  getDepartmentComparison: (params = {}) => {
    return apiClient.get('/api/analytics/department-comparison', { params })
  },

  getPeriodComparison: (params = {}) => {
    return apiClient.get('/api/analytics/period-comparison', { params })
  },

  // Predictive Analytics
  getPredictiveAnalytics: (params = {}) => {
    return apiClient.get('/api/analytics/predictive', { params })
  },

  getForecasting: (params = {}) => {
    return apiClient.get('/api/analytics/forecasting', { params })
  },

  getDemandForecasting: (params = {}) => {
    return apiClient.get('/api/analytics/demand-forecasting', { params })
  },

  // Reports
  generateAnalyticsReport: (reportData) => {
    return apiClient.post('/api/analytics/reports/generate', reportData)
  },

  getAnalyticsReports: (params = {}) => {
    return apiClient.get('/api/analytics/reports', { params })
  },

  // Export
  exportAnalytics: (filters = {}) => {
    return apiClient.get('/api/analytics/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportChartData: (chartType, filters = {}) => {
    return apiClient.get(`/api/analytics/charts/${chartType}/export`, {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default analyticsApi