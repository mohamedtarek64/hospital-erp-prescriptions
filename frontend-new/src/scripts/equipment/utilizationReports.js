import { ref, computed, onMounted, watch } from 'vue'

export function useUtilizationReports() {
  // Reactive state
  const dateRange = ref('30')
  const customStartDate = ref('')
  const customEndDate = ref('')
  const loading = ref(false)
  
  // Data
  const equipmentUtilization = ref([])
  const utilizationStats = ref({
    totalUsageHours: 0,
    averageUtilization: 0,
    mostUsedEquipment: '',
    underutilizedCount: 0
  })
  const peakUsageHours = ref([])
  const usageByPurpose = ref([])
  const usageByDepartment = ref([])
  const recommendations = ref([])

  // Chart refs
  const utilizationChart = ref(null)
  const trendsChart = ref(null)

  // Computed properties
  const dateRangeDates = computed(() => {
    let endDate = new Date()
    let startDate
    
    if (dateRange.value === 'custom') {
      startDate = new Date(customStartDate.value)
      endDate = new Date(customEndDate.value)
    } else {
      const days = parseInt(dateRange.value)
      startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
    }
    
    return { startDate, endDate }
  })

  // Methods
  const loadUtilizationData = async () => {
    loading.value = true
    try {
      const { startDate, endDate } = dateRangeDates.value
      
      // Load equipment utilization data
      await Promise.all([
        loadEquipmentUtilization(startDate, endDate),
        loadUtilizationStats(startDate, endDate),
        loadUsagePatterns(startDate, endDate),
        loadRecommendations()
      ])
    } catch (error) {
      console.error('Error loading utilization data:', error)
    } finally {
      loading.value = false
    }
  }

  const loadEquipmentUtilization = async () => {
    try {
      // const response = await apiClient.get('/equipment-utilization', {
      //   params: { start_date: startDate, end_date: endDate }
      // })
      // equipmentUtilization.value = response.data
      
      // Mock data
      equipmentUtilization.value = [
        {
          id: 1,
          name: 'X-Ray Machine',
          model: 'XR-2000',
          category: { name: 'Imaging' },
          total_hours: 120,
          utilization_percentage: 75,
          active_sessions: 3,
          last_used: '2024-01-15',
          status: 'available'
        },
        {
          id: 2,
          name: 'MRI Scanner',
          model: 'MRI-3000',
          category: { name: 'Imaging' },
          total_hours: 200,
          utilization_percentage: 85,
          active_sessions: 2,
          last_used: '2024-01-15',
          status: 'in_use'
        }
      ]
    } catch (error) {
      console.error('Error loading equipment utilization:', error)
    }
  }

  const loadUtilizationStats = async () => {
    try {
      // const response = await apiClient.get('/utilization-stats', {
      //   params: { start_date: startDate, end_date: endDate }
      // })
      // utilizationStats.value = response.data
      
      // Mock data
      utilizationStats.value = {
        totalUsageHours: 1250,
        averageUtilization: 78,
        mostUsedEquipment: 'MRI Scanner',
        underutilizedCount: 3
      }
    } catch (error) {
      console.error('Error loading utilization stats:', error)
    }
  }

  const loadUsagePatterns = async () => {
    try {
      // Load peak usage hours
      // const peakResponse = await apiClient.get('/peak-usage-hours', {
      //   params: { start_date: startDate, end_date: endDate }
      // })
      // peakUsageHours.value = peakResponse.data
      
      // Mock data
      peakUsageHours.value = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString().padStart(2, '0'),
        usage: Math.floor(Math.random() * 100)
      }))

      // Load usage by purpose
      // const purposeResponse = await apiClient.get('/usage-by-purpose', {
      //   params: { start_date: startDate, end_date: endDate }
      // })
      // usageByPurpose.value = purposeResponse.data
      
      usageByPurpose.value = [
        { purpose: 'Patient Care', count: 45 },
        { purpose: 'Maintenance', count: 12 },
        { purpose: 'Training', count: 8 },
        { purpose: 'Testing', count: 5 }
      ]

      // Load usage by department
      // const deptResponse = await apiClient.get('/usage-by-department', {
      //   params: { start_date: startDate, end_date: endDate }
      // })
      // usageByDepartment.value = deptResponse.data
      
      usageByDepartment.value = [
        { department: 'Radiology', hours: 320 },
        { department: 'ICU', hours: 280 },
        { department: 'Emergency', hours: 200 },
        { department: 'Surgery', hours: 150 }
      ]
    } catch (error) {
      console.error('Error loading usage patterns:', error)
    }
  }

  const loadRecommendations = async () => {
    try {
      // const response = await apiClient.get('/utilization-recommendations')
      // recommendations.value = response.data
      
      // Mock data
      recommendations.value = [
        {
          id: 1,
          title: 'Optimize MRI Scanner Schedule',
          description: 'Consider extending operating hours to increase utilization from 85% to 95%',
          priority: 'high',
          icon: 'fas fa-clock'
        },
        {
          id: 2,
          title: 'Relocate Underutilized Equipment',
          description: 'Move 3 underutilized devices to busier departments',
          priority: 'medium',
          icon: 'fas fa-exchange-alt'
        },
        {
          id: 3,
          title: 'Implement Preventive Maintenance',
          description: 'Schedule regular maintenance to reduce downtime',
          priority: 'low',
          icon: 'fas fa-wrench'
        }
      ]
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const updateDateRange = () => {
    if (dateRange.value === 'custom') {
      // Custom range selected, dates will be handled by custom inputs
      return
    }
    loadUtilizationData()
  }

  const updateCustomRange = () => {
    if (customStartDate.value && customEndDate.value) {
      loadUtilizationData()
    }
  }

  const refreshData = () => {
    loadUtilizationData()
  }

  const exportReport = async () => {
    try {
      const reportData = {
        dateRange: dateRange.value,
        customDates: dateRange.value === 'custom' ? {
          start: customStartDate.value,
          end: customEndDate.value
        } : null,
        stats: utilizationStats.value,
        equipment: equipmentUtilization.value,
        patterns: {
          peakHours: peakUsageHours.value,
          byPurpose: usageByPurpose.value,
          byDepartment: usageByDepartment.value
        },
        recommendations: recommendations.value
      }
      
      // Export as JSON
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `utilization-report-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const getUtilizationStatus = (percentage) => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 60) return 'Good'
    if (percentage >= 40) return 'Fair'
    if (percentage >= 20) return 'Poor'
    return 'Critical'
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'info'
    if (percentage >= 40) return 'warning'
    if (percentage >= 20) return 'danger'
    return 'danger'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const createUtilizationChart = () => {
    if (!utilizationChart.value) return
    
    // Chart.js implementation would go here
    console.log('Creating utilization chart')
  }

  const createTrendsChart = () => {
    if (!trendsChart.value) return
    
    // Chart.js implementation would go here
    console.log('Creating trends chart')
  }

  // Watchers
  watch(dateRange, () => {
    updateDateRange()
  })

  watch([customStartDate, customEndDate], () => {
    if (dateRange.value === 'custom') {
      updateCustomRange()
    }
  })

  // Lifecycle
  onMounted(() => {
    loadUtilizationData()
  })

  return {
    // State
    dateRange,
    customStartDate,
    customEndDate,
    loading,
    equipmentUtilization,
    utilizationStats,
    peakUsageHours,
    usageByPurpose,
    usageByDepartment,
    recommendations,
    utilizationChart,
    trendsChart,
    
    // Computed
    dateRangeDates,
    
    // Methods
    loadUtilizationData,
    updateDateRange,
    updateCustomRange,
    refreshData,
    exportReport,
    getUtilizationStatus,
    getStatusColor,
    formatDate,
    createUtilizationChart,
    createTrendsChart
  }
}
