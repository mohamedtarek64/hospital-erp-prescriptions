/**
 * @module reportsManager
 * @description Manager for handling reports and analytics business logic
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/services/api/reportsApi'
import { analyticsApi } from '@/services/api/analyticsApi'
import { reportHelpers } from '@/utils/reportHelpers'

export function useReportsManager() {
  const router = useRouter()
  const reportsStore = useReportsStore()
  const authStore = useAuthStore()

  // Reactive state
  const isLoading = ref(false)
  const error = ref(null)
  const selectedReportType = ref('all')
  const dateRange = ref({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref('created_at')
  const sortOrder = ref('desc')
  const selectedReports = ref([])
  const isGeneratingReport = ref(false)
  const reportGenerationProgress = ref(0)

  // Computed properties
  const filteredReports = computed(() => {
    let reports = reportsStore.reports || []

    // Filter by type
    if (selectedReportType.value !== 'all') {
      reports = reports.filter(report => report?.type === selectedReportType.value)
    }

    // Filter by date range
    if (dateRange.value.start && dateRange.value.end) {
      reports = reports.filter(report => {
        const reportDate = new Date(report?.created_at)
        const startDate = new Date(dateRange.value.start)
        const endDate = new Date(dateRange.value.end)
        return reportDate >= startDate && reportDate <= endDate
      })
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      reports = reports.filter(report => 
        report?.title?.toLowerCase().includes(query) ||
        report?.description?.toLowerCase().includes(query) ||
        report?.category?.name?.toLowerCase().includes(query)
      )
    }

    return reports
  })

  const paginatedReports = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredReports.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredReports.value.length / itemsPerPage.value)
  })

  const reportStats = computed(() => {
    return reportsStore.reportStats
  })

  const recentReports = computed(() => {
    return reportsStore.recentReports
  })

  const reportCategories = computed(() => {
    return reportsStore.reportCategories
  })

  const userPermissions = computed(() => {
    return authStore.user?.permissions || []
  })

  // Methods
  const loadReports = async () => {
    try {
      isLoading.value = true
      error.value = null
      await reportsStore.fetchReports()
    } catch (err) {
      error.value = err.message || 'Failed to load reports'
      console.error('Error loading reports:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadReportStats = async () => {
    try {
      await reportsStore.fetchReportStats()
    } catch (err) {
      console.error('Error loading report stats:', err)
    }
  }

  const loadRecentReports = async () => {
    try {
      await reportsStore.fetchRecentReports()
    } catch (err) {
      console.error('Error loading recent reports:', err)
    }
  }

  const loadReportCategories = async () => {
    try {
      await reportsStore.fetchReportCategories()
    } catch (err) {
      console.error('Error loading report categories:', err)
    }
  }

  const generateReport = async (reportType, parameters = {}) => {
    try {
      isGeneratingReport.value = true
      reportGenerationProgress.value = 0
      error.value = null

      const reportData = await reportsApi.generateReport(reportType, {
        ...parameters,
        date_range: dateRange.value
      })

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        if (reportGenerationProgress.value < 90) {
          reportGenerationProgress.value += 10
        }
      }, 200)

      // Wait for actual report generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      clearInterval(progressInterval)
      reportGenerationProgress.value = 100

      // Add to reports list
      reportsStore.addReport(reportData)
      
      return reportData
    } catch (err) {
      error.value = err.message || 'Failed to generate report'
      console.error('Error generating report:', err)
      throw err
    } finally {
      isGeneratingReport.value = false
      reportGenerationProgress.value = 0
    }
  }

  const downloadReport = async (reportId, format = 'pdf') => {
    try {
      const response = await reportsApi.downloadReport(reportId, format)
      
      // Create download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${reportId}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.message || 'Failed to download report'
      console.error('Error downloading report:', err)
    }
  }

  const deleteReport = async (reportId) => {
    try {
      await reportsApi.deleteReport(reportId)
      reportsStore.removeReport(reportId)
    } catch (err) {
      error.value = err.message || 'Failed to delete report'
      console.error('Error deleting report:', err)
    }
  }

  const scheduleReport = async (reportData) => {
    try {
      const schedule = await reportsApi.scheduleReport(reportData)
      reportsStore.addScheduledReport(schedule)
      return schedule
    } catch (err) {
      error.value = err.message || 'Failed to schedule report'
      console.error('Error scheduling report:', err)
      throw err
    }
  }

  const getAnalyticsData = async (metricType, timeRange = '30d') => {
    try {
      return await analyticsApi.getMetric(metricType, { time_range: timeRange })
    } catch (err) {
      console.error('Error getting analytics data:', err)
      throw err
    }
  }

  const getDashboardWidgets = async () => {
    try {
      return await analyticsApi.getDashboardWidgets()
    } catch (err) {
      console.error('Error getting dashboard widgets:', err)
      throw err
    }
  }

  const updateWidgetPreferences = async (widgetId, preferences) => {
    try {
      return await analyticsApi.updateWidgetPreferences(widgetId, preferences)
    } catch (err) {
      console.error('Error updating widget preferences:', err)
      throw err
    }
  }

  const exportData = async (data, format = 'csv', filename = 'export') => {
    try {
      const exportData = reportHelpers.formatDataForExport(data, format)
      const blob = new Blob([exportData], { type: `text/${format}` })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.message || 'Failed to export data'
      console.error('Error exporting data:', err)
    }
  }

  const navigateToReport = (reportId) => {
    router.push(`/reports/${reportId}`)
  }

  const navigateToCreateReport = () => {
    router.push('/reports/create')
  }

  const navigateToScheduledReports = () => {
    router.push('/reports/scheduled')
  }

  const navigateToAnalytics = () => {
    router.push('/reports/analytics')
  }

  const clearFilters = () => {
    selectedReportType.value = 'all'
    dateRange.value = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
    searchQuery.value = ''
    currentPage.value = 1
  }

  const refreshData = async () => {
    await Promise.all([
      loadReports(),
      loadReportStats(),
      loadRecentReports(),
      loadReportCategories()
    ])
  }

  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  const canCreateReport = computed(() => {
    return hasPermission('create_reports')
  })

  const canDeleteReport = computed(() => {
    return hasPermission('delete_reports')
  })

  const canScheduleReport = computed(() => {
    return hasPermission('schedule_reports')
  })

  // Lifecycle
  onMounted(async () => {
    await refreshData()
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  return {
    // State
    isLoading,
    error,
    selectedReportType,
    dateRange,
    searchQuery,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    selectedReports,
    isGeneratingReport,
    reportGenerationProgress,

    // Computed
    filteredReports,
    paginatedReports,
    totalPages,
    reportStats,
    recentReports,
    reportCategories,
    userPermissions,
    canCreateReport,
    canDeleteReport,
    canScheduleReport,

    // Methods
    loadReports,
    loadReportStats,
    loadRecentReports,
    loadReportCategories,
    generateReport,
    downloadReport,
    deleteReport,
    scheduleReport,
    getAnalyticsData,
    getDashboardWidgets,
    updateWidgetPreferences,
    exportData,
    navigateToReport,
    navigateToCreateReport,
    navigateToScheduledReports,
    navigateToAnalytics,
    clearFilters,
    refreshData,
    hasPermission
  }
}
