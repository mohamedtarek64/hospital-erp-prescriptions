/**
 * @module analyticsManager
 * @description Manager for analytics dashboard functionality
 */

import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { analyticsApi } from '@/services/api/analyticsApi'

/**
 * Analytics Manager Class
 * Handles analytics dashboard state and business logic
 */
class AnalyticsManager {
  constructor() {
    this.router = useRouter()
    this.reportsStore = useReportsStore()
    
    // Reactive state
    this.isLoading = ref(false)
    this.error = ref(null)
    this.selectedDateRange = ref('month')
    this.customDateRange = ref({
      start: null,
      end: null
    })
    
    // Analytics data
    this.kpiMetrics = ref([])
    this.topDepartments = ref([])
    this.recentActivities = ref([])
    this.revenueData = ref([])
    this.patientData = ref([])
    this.departmentData = ref([])
    this.appointmentData = ref([])
    
    // Chart data
    this.chartData = ref({})
    this.chartOptions = ref({})
    
    // Filters
    this.filters = ref({
      department: '',
      dateRange: 'month',
      metric: 'all'
    })
    
    // Real-time updates
    this.updateInterval = null
    this.isRealTimeEnabled = ref(false)
    
    this.initializeManager()
  }

  /**
   * Initialize the analytics manager
   */
  initializeManager() {
    this.loadInitialData()
    this.setupRealTimeUpdates()
  }

  /**
   * Load initial analytics data
   */
  async loadInitialData() {
    try {
      this.isLoading.value = true
      this.error.value = null
      
      await Promise.all([
        this.loadKPIMetrics(),
        this.loadTopDepartments(),
        this.loadRecentActivities(),
        this.loadChartData()
      ])
    } catch (err) {
      this.error.value = err.message || 'فشل في تحميل بيانات التحليلات'
      console.error('Error loading analytics data:', err)
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * Load KPI metrics
   */
  async loadKPIMetrics() {
    try {
      const response = await analyticsApi.getKPIs(this.filters.value)
      this.kpiMetrics.value = response.data || this.getMockKPIData()
    } catch (err) {
      console.error('Error loading KPI metrics:', err)
      this.kpiMetrics.value = this.getMockKPIData()
    }
  }

  /**
   * Load top departments data
   */
  async loadTopDepartments() {
    try {
      const response = await analyticsApi.getTopDepartments(this.filters.value)
      this.topDepartments.value = response.data || this.getMockDepartmentsData()
    } catch (err) {
      console.error('Error loading top departments:', err)
      this.topDepartments.value = this.getMockDepartmentsData()
    }
  }

  /**
   * Load recent activities
   */
  async loadRecentActivities() {
    try {
      const response = await analyticsApi.getRecentActivities(this.filters.value)
      this.recentActivities.value = response.data || this.getMockActivitiesData()
    } catch (err) {
      console.error('Error loading recent activities:', err)
      this.recentActivities.value = this.getMockActivitiesData()
    }
  }

  /**
   * Load chart data
   */
  async loadChartData() {
    try {
      const response = await analyticsApi.getChartData(this.filters.value)
      this.chartData.value = response.data || this.getMockChartData()
    } catch (err) {
      console.error('Error loading chart data:', err)
      this.chartData.value = this.getMockChartData()
    }
  }

  /**
   * Update date range filter
   */
  async updateDateRange() {
    this.filters.value.dateRange = this.selectedDateRange.value
    await this.loadInitialData()
  }

  /**
   * Refresh all data
   */
  async refreshData() {
    await this.loadInitialData()
  }

  /**
   * Export chart data
   */
  async exportChart(chartType) {
    try {
      const response = await analyticsApi.exportChart(chartType, this.filters.value)
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${chartType}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      this.error.value = err.message || 'فشل في تصدير الرسم البياني'
      console.error('Error exporting chart:', err)
    }
  }

  /**
   * Export table data
   */
  async exportTable(tableType) {
    try {
      const response = await analyticsApi.exportTable(tableType, this.filters.value)
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${tableType}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      this.error.value = err.message || 'فشل في تصدير الجدول'
      console.error('Error exporting table:', err)
    }
  }

  /**
   * Setup real-time updates
   */
  setupRealTimeUpdates() {
    if (this.isRealTimeEnabled.value) {
      this.updateInterval = setInterval(() => {
        this.loadInitialData()
      }, 30000) // Update every 30 seconds
    }
  }

  /**
   * Toggle real-time updates
   */
  toggleRealTimeUpdates() {
    this.isRealTimeEnabled.value = !this.isRealTimeEnabled.value
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    
    if (this.isRealTimeEnabled.value) {
      this.setupRealTimeUpdates()
    }
  }

  /**
   * Navigate to detailed analytics
   */
  navigateToDetailedAnalytics(metricType) {
    this.router.push(`/reports/analytics/${metricType}`)
  }

  /**
   * Navigate to department analytics
   */
  navigateToDepartmentAnalytics(departmentId) {
    this.router.push(`/reports/analytics/departments/${departmentId}`)
  }

  /**
   * Get mock KPI data
   */
  getMockKPIData() {
    return [
      {
        id: 1,
        title: 'إجمالي المرضى',
        value: 1247,
        description: 'مرضى هذا الشهر',
        trend: 12.5,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
      },
      {
        id: 2,
        title: 'الإيرادات الشهرية',
        value: 2450000,
        description: 'ريال سعودي',
        trend: 8.3,
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      },
      {
        id: 3,
        title: 'المواعيد اليوم',
        value: 89,
        description: 'موعد مجدول',
        trend: -2.1,
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        id: 4,
        title: 'معدل الرضا',
        value: 4.7,
        description: 'من 5 نجوم',
        trend: 0.5,
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
      }
    ]
  }

  /**
   * Get mock departments data
   */
  getMockDepartmentsData() {
    return [
      {
        id: 1,
        name: 'الطوارئ',
        patients: 245,
        revenue: 125000,
        rating: 4.8
      },
      {
        id: 2,
        name: 'العيادات الخارجية',
        patients: 189,
        revenue: 98000,
        rating: 4.6
      },
      {
        id: 3,
        name: 'الجراحة',
        patients: 156,
        revenue: 145000,
        rating: 4.9
      },
      {
        id: 4,
        name: 'النساء والولادة',
        patients: 134,
        revenue: 112000,
        rating: 4.7
      },
      {
        id: 5,
        name: 'الأطفال',
        patients: 98,
        revenue: 67000,
        rating: 4.5
      }
    ]
  }

  /**
   * Get mock activities data
   */
  getMockActivitiesData() {
    return [
      {
        id: 1,
        description: 'مريض جديد مسجل في قسم الطوارئ',
        value: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
      },
      {
        id: 2,
        description: 'عملية جراحية مكتملة بنجاح',
        value: 1,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        id: 3,
        description: 'فحص مخبري مكتمل',
        value: 1,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
      },
      {
        id: 4,
        description: 'وصفة طبية صرفت من الصيدلية',
        value: 1,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
      }
    ]
  }

  /**
   * Get mock chart data
   */
  getMockChartData() {
    return {
      revenue: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [{
          label: 'الإيرادات',
          data: [120000, 150000, 180000, 160000, 200000, 220000]
        }]
      },
      patients: {
        labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        datasets: [{
          label: 'عدد المرضى',
          data: [45, 52, 48, 61, 55, 67, 43]
        }]
      }
    }
  }

  /**
   * Get reactive data for template
   */
  getReactiveData() {
    return {
      isLoading: this.isLoading,
      error: this.error,
      selectedDateRange: this.selectedDateRange,
      customDateRange: this.customDateRange,
      kpiMetrics: this.kpiMetrics,
      topDepartments: this.topDepartments,
      recentActivities: this.recentActivities,
      revenueData: this.revenueData,
      patientData: this.patientData,
      departmentData: this.departmentData,
      appointmentData: this.appointmentData,
      chartData: this.chartData,
      chartOptions: this.chartOptions,
      filters: this.filters,
      isRealTimeEnabled: this.isRealTimeEnabled
    }
  }

  /**
   * Get methods for template
   */
  getMethods() {
    return {
      updateDateRange: this.updateDateRange.bind(this),
      refreshData: this.refreshData.bind(this),
      exportChart: this.exportChart.bind(this),
      exportTable: this.exportTable.bind(this),
      toggleRealTimeUpdates: this.toggleRealTimeUpdates.bind(this),
      navigateToDetailedAnalytics: this.navigateToDetailedAnalytics.bind(this),
      navigateToDepartmentAnalytics: this.navigateToDepartmentAnalytics.bind(this)
    }
  }

  /**
   * Cleanup method
   */
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

/**
 * Composable function for using analytics manager
 */
export function useAnalyticsManager() {
  const manager = new AnalyticsManager()
  
  // Cleanup on unmount
  onUnmounted(() => {
    manager.cleanup()
  })
  
  return {
    ...manager.getReactiveData(),
    ...manager.getMethods()
  }
}

export default AnalyticsManager
