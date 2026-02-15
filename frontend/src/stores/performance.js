import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const performanceReviews = ref([])
  const employees = ref([])
  const statistics = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const averageRating = computed(() => {
    if (performanceReviews.value.length === 0) return 0
    const total = performanceReviews.value.reduce((sum, review) => sum + review.overall_rating, 0)
    return total / performanceReviews.value.length
  })

  const highPerformers = computed(() => 
    performanceReviews.value.filter(review => review.overall_rating >= 4).length
  )

  const lowPerformers = computed(() => 
    performanceReviews.value.filter(review => review.overall_rating <= 2).length
  )

  const recentReviews = computed(() => 
    performanceReviews.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  )

  // Actions
  const getPerformanceReviews = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/performance-reviews', { params: filters })
      performanceReviews.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load performance reviews'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStatistics = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/performance-reviews/statistics', { params: filters })
      statistics.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load performance statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployees = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees')
      employees.value = response.data.data.data
      return response.data.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employees'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPerformanceReview = async (reviewData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/performance-reviews', reviewData)
      performanceReviews.value.unshift(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create performance review'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePerformanceReview = async (id, reviewData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/performance-reviews/${id}`, reviewData)
      const index = performanceReviews.value.findIndex(review => review.id === id)
      if (index !== -1) {
        performanceReviews.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update performance review'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePerformanceReview = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/performance-reviews/${id}`)
      performanceReviews.value = performanceReviews.value.filter(review => review.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete performance review'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeePerformance = async (employeeId) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/performance-reviews/employee/${employeeId}`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employee performance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPerformanceTrends = async (employeeId, limit = 5) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/performance-reviews/trends/${employeeId}`, { 
        params: { limit } 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load performance trends'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDepartmentPerformance = async (departmentId) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/performance-reviews/department/${departmentId}`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load department performance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAverageRating = async (employeeId) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/performance-reviews/average-rating/${employeeId}`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load average rating'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPerformanceDistribution = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/performance-reviews/distribution', { params: filters })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load performance distribution'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTopPerformers = async (limit = 10) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/performance-reviews/top-performers', { 
        params: { limit } 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load top performers'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPerformanceGoals = async (employeeId) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/performance-reviews/goals/${employeeId}`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load performance goals'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePerformanceGoals = async (employeeId, goals) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/performance-reviews/goals/${employeeId}`, { goals })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update performance goals'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportPerformanceReport = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/performance-reviews/export', { 
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export performance report'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    performanceReviews,
    employees,
    statistics,
    loading,
    error,
    
    // Getters
    averageRating,
    highPerformers,
    lowPerformers,
    recentReviews,
    
    // Actions
    getPerformanceReviews,
    getStatistics,
    getEmployees,
    createPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
    getEmployeePerformance,
    getPerformanceTrends,
    getDepartmentPerformance,
    getAverageRating,
    getPerformanceDistribution,
    getTopPerformers,
    getPerformanceGoals,
    updatePerformanceGoals,
    exportPerformanceReport,
    clearError
  }
})
