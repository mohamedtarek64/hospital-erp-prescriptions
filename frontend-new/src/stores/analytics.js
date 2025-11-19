import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const analyticsData = ref({})
  const kpiData = ref({})
  const chartData = ref({})
  const isLoading = ref(false)
  const error = ref('')

  // Getters
  const totalPatients = computed(() => kpiData.value.totalPatients || 0)
  const totalRevenue = computed(() => kpiData.value.totalRevenue || 0)
  const occupancyRate = computed(() => kpiData.value.occupancyRate || 0)
  const averageStay = computed(() => kpiData.value.averageStay || 0)

  // Actions
  const fetchAnalyticsData = async (filters = {}) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await apiClient.get('/api/analytics/dashboard', { params: filters })
      analyticsData.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch analytics data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchKPIData = async (period = '30d') => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await apiClient.get('/api/analytics/kpis', { 
        params: { period } 
      })
      kpiData.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch KPI data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchChartData = async (chartType, filters = {}) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await apiClient.get(`/api/analytics/charts/${chartType}`, { 
        params: filters 
      })
      chartData.value[chartType] = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch chart data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const generateReport = async (reportConfig) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await apiClient.post('/api/analytics/reports/generate', reportConfig)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to generate report'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const exportData = async (exportConfig) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await apiClient.post('/api/analytics/export', exportConfig, {
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getPatientAnalytics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/patients', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch patient analytics'
      throw err
    }
  }

  const getRevenueAnalytics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/revenue', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch revenue analytics'
      throw err
    }
  }

  const getOperationalAnalytics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/operations', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch operational analytics'
      throw err
    }
  }

  const getDepartmentAnalytics = async (departmentId, filters = {}) => {
    try {
      const response = await apiClient.get(`/analytics/departments/${departmentId}`, { 
        params: filters 
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch department analytics'
      throw err
    }
  }

  const getStaffAnalytics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/staff', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch staff analytics'
      throw err
    }
  }

  const getEquipmentAnalytics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/equipment', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch equipment analytics'
      throw err
    }
  }

  const getQualityMetrics = async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/analytics/quality', { params: filters })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch quality metrics'
      throw err
    }
  }

  const getTrendAnalysis = async (metric, period = '12m') => {
    try {
      const response = await apiClient.get('/api/analytics/trends', { 
        params: { metric, period } 
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch trend analysis'
      throw err
    }
  }

  const getComparativeAnalysis = async (comparisonConfig) => {
    try {
      const response = await apiClient.post('/api/analytics/compare', comparisonConfig)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch comparative analysis'
      throw err
    }
  }

  const getPredictiveAnalytics = async (predictionConfig) => {
    try {
      const response = await apiClient.post('/api/analytics/predict', predictionConfig)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch predictive analytics'
      throw err
    }
  }

  const clearError = () => {
    error.value = ''
  }

  const resetStore = () => {
    analyticsData.value = {}
    kpiData.value = {}
    chartData.value = {}
    isLoading.value = false
    error.value = ''
  }

  return {
    // State
    analyticsData,
    kpiData,
    chartData,
    isLoading,
    error,
    
    // Getters
    totalPatients,
    totalRevenue,
    occupancyRate,
    averageStay,
    
    // Actions
    fetchAnalyticsData,
    fetchKPIData,
    fetchChartData,
    generateReport,
    exportData,
    getPatientAnalytics,
    getRevenueAnalytics,
    getOperationalAnalytics,
    getDepartmentAnalytics,
    getStaffAnalytics,
    getEquipmentAnalytics,
    getQualityMetrics,
    getTrendAnalysis,
    getComparativeAnalysis,
    getPredictiveAnalytics,
    clearError,
    resetStore
  }
})
