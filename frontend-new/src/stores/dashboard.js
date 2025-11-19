import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dashboardApi from '@/services/api/dashboardApi'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const dashboardData = ref({})
  const loading = ref(false)
  const error = ref(null)
  const stats = ref({
    totalPatients: 0,
    todayAppointments: 0,
    activeDoctors: 0,
    monthlyRevenue: 0
  })
  const todaysAppointments = ref([])
  const recentActivities = ref([])

  // Computed
  const overviewStats = computed(() => dashboardData.value.overview || {})
  const patientMetrics = computed(() => dashboardData.value.patient_metrics || {})
  const financialMetrics = computed(() => dashboardData.value.financial_metrics || {})
  const operationalMetrics = computed(() => dashboardData.value.operational_metrics || {})
  const charts = computed(() => dashboardData.value.charts || {})

  // Actions
  const fetchDashboardData = async (filters = {}) => {
    try {
      loading.value = true
      const response = await dashboardApi.getDashboard(filters)
      dashboardData.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard data'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDashboardStats = async () => {
    try {
      loading.value = true
      const response = await dashboardApi.getStats()
      stats.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTodaysAppointments = async () => {
    try {
      const response = await dashboardApi.getTodaysAppointments()
      todaysAppointments.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch today\'s appointments'
      throw err
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await dashboardApi.getRecentActivities()
      recentActivities.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recent activities'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    dashboardData,
    loading,
    error,
    stats,
    todaysAppointments,
    recentActivities,
    overviewStats,
    patientMetrics,
    financialMetrics,
    operationalMetrics,
    charts,
    fetchDashboardData,
    fetchDashboardStats,
    fetchTodaysAppointments,
    fetchRecentActivities,
    clearError
  }
})
