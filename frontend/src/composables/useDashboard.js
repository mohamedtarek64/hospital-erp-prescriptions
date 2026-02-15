import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/dashboardHelpers'

export const useDashboard = () => {
  const dashboardStore = useDashboardStore()

  const loading = computed(() => dashboardStore.loading)
  const error = computed(() => dashboardStore.error)
  const dashboardData = computed(() => dashboardStore.dashboardData)

  const overviewStats = computed(() => dashboardStore.overviewStats)
  const patientMetrics = computed(() => dashboardStore.patientMetrics)
  const financialMetrics = computed(() => dashboardStore.financialMetrics)
  const operationalMetrics = computed(() => dashboardStore.operationalMetrics)
  const recentActivities = computed(() => dashboardStore.recentActivities)
  const charts = computed(() => dashboardStore.charts)

  const fetchDashboardData = (filters = {}) => dashboardStore.fetchDashboardData(filters)
  const clearError = () => dashboardStore.clearError()

  // Formatted computed values
  const formattedOverviewStats = computed(() => ({
    totalPatients: formatNumber(overviewStats.value.total_patients || 0),
    newPatientsToday: formatNumber(overviewStats.value.new_patients_today || 0),
    totalAppointments: formatNumber(overviewStats.value.total_appointments || 0),
    completedAppointments: formatNumber(overviewStats.value.completed_appointments || 0),
    totalRevenue: formatCurrency(overviewStats.value.total_revenue || 0),
    pendingPayments: formatCurrency(overviewStats.value.pending_payments || 0)
  }))

  const formattedFinancialMetrics = computed(() => ({
    dailyRevenue: formatCurrency(financialMetrics.value.daily_revenue || 0),
    outstandingAmount: formatCurrency(financialMetrics.value.outstanding_amount || 0),
    averageTransaction: formatCurrency(financialMetrics.value.average_transaction || 0)
  }))

  const formattedOperationalMetrics = computed(() => ({
    appointmentEfficiency: formatPercentage(operationalMetrics.value.appointment_efficiency || 0),
    bedUtilization: formatPercentage(operationalMetrics.value.bed_utilization || 0),
    staffUtilization: formatPercentage(operationalMetrics.value.staff_utilization || 0),
    equipmentUtilization: formatPercentage(operationalMetrics.value.equipment_utilization || 0)
  }))

  return {
    loading,
    error,
    dashboardData,
    overviewStats,
    patientMetrics,
    financialMetrics,
    operationalMetrics,
    recentActivities,
    charts,
    formattedOverviewStats,
    formattedFinancialMetrics,
    formattedOperationalMetrics,
    fetchDashboardData,
    clearError
  }
}
