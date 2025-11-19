import { ref, onMounted, computed } from 'vue'
import { useReportsStore } from '@/stores/reports'

export function useReports() {
  const reportsStore = useReportsStore()
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedStatus = ref('')
  const selectedDateRange = ref('')

  const loadReportsData = async () => {
    try {
      await reportsStore.fetchReports()
      await reportsStore.fetchReportTemplates()
      await reportsStore.fetchScheduledReports()
    } catch (error) {
      console.error('Error loading reports data:', error)
    }
  }

  const reportsStats = computed(() => reportsStore.stats)
  const recentReports = computed(() => reportsStore.recentReports)
  const popularReports = computed(() => reportsStore.popularReports)

  const addReport = async (reportData) => {
    try {
      const result = await reportsStore.createReport(reportData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding report:', error)
      throw error
    }
  }

  const updateReport = async (id, reportData) => {
    try {
      const result = await reportsStore.updateReport(id, reportData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    }
  }

  const deleteReport = async (id) => {
    try {
      const result = await reportsStore.deleteReport(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }

  const publishReport = async (id) => {
    try {
      const result = await reportsStore.publishReport(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error publishing report:', error)
      throw error
    }
  }

  const unpublishReport = async (id) => {
    try {
      const result = await reportsStore.unpublishReport(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error unpublishing report:', error)
      throw error
    }
  }

  const generateReport = async (id, params = {}) => {
    try {
      const result = await reportsStore.generateReport(id, params)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  const downloadReport = async (id, format = 'pdf') => {
    try {
      const result = await reportsStore.downloadReport(id, format)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }

  const shareReport = async (id, shareData) => {
    try {
      const result = await reportsStore.shareReport(id, shareData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error sharing report:', error)
      throw error
    }
  }

  const addReportTemplate = async (templateData) => {
    try {
      const result = await reportsStore.createReportTemplate(templateData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding report template:', error)
      throw error
    }
  }

  const updateReportTemplate = async (id, templateData) => {
    try {
      const result = await reportsStore.updateReportTemplate(id, templateData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating report template:', error)
      throw error
    }
  }

  const deleteReportTemplate = async (id) => {
    try {
      const result = await reportsStore.deleteReportTemplate(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting report template:', error)
      throw error
    }
  }

  const scheduleReport = async (scheduleData) => {
    try {
      const result = await reportsStore.scheduleReport(scheduleData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error scheduling report:', error)
      throw error
    }
  }

  const updateScheduledReport = async (id, scheduleData) => {
    try {
      const result = await reportsStore.updateScheduledReport(id, scheduleData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating scheduled report:', error)
      throw error
    }
  }

  const deleteScheduledReport = async (id) => {
    try {
      const result = await reportsStore.deleteScheduledReport(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting scheduled report:', error)
      throw error
    }
  }

  const filteredReports = computed(() => {
    let filtered = reportsStore.reports
    if (searchQuery.value) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    if (selectedCategory.value) {
      filtered = filtered.filter(report => report.category === selectedCategory.value)
    }
    if (selectedStatus.value) {
      filtered = filtered.filter(report => report.status === selectedStatus.value)
    }
    if (selectedDateRange.value) {
      const today = new Date()
      const filterDate = new Date()
      
      switch (selectedDateRange.value) {
        case 'today':
          filterDate.setDate(today.getDate())
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(today.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(report => 
        new Date(report.created_at) >= filterDate
      )
    }
    return filtered
  })

  const handleSearch = () => {
    // Search is handled reactively through computed property
  }

  const handleFilterChange = () => {
    // Filtering is handled reactively through computed property
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    selectedStatus.value = ''
    selectedDateRange.value = ''
  }

  const exportReports = async () => {
    try {
      // Implement export functionality
      console.log('Exporting reports...')
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusText = (status) => {
    const statuses = {
      'draft': 'مسودة',
      'published': 'منشور',
      'archived': 'مؤرشف'
    }
    return statuses[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      'draft': 'status-draft',
      'published': 'status-published',
      'archived': 'status-archived'
    }
    return classes[status] || ''
  }

  const getCategoryText = (category) => {
    const categories = {
      'financial': 'مالي',
      'medical': 'طبي',
      'operational': 'تشغيلي',
      'administrative': 'إداري',
      'statistical': 'إحصائي'
    }
    return categories[category] || category
  }

  const getCategoryClass = (category) => {
    const classes = {
      'financial': 'category-financial',
      'medical': 'category-medical',
      'operational': 'category-operational',
      'administrative': 'category-administrative',
      'statistical': 'category-statistical'
    }
    return classes[category] || ''
  }

  onMounted(() => {
    loadReportsData()
  })

  return {
    reports: reportsStore.reports,
    reportTemplates: reportsStore.reportTemplates,
    scheduledReports: reportsStore.scheduledReports,
    loading: reportsStore.loading,
    error: reportsStore.error,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedDateRange,
    filteredReports,
    reportsStats,
    recentReports,
    popularReports,
    loadReportsData,
    addReport,
    updateReport,
    deleteReport,
    publishReport,
    unpublishReport,
    generateReport,
    downloadReport,
    shareReport,
    addReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    scheduleReport,
    updateScheduledReport,
    deleteScheduledReport,
    clearError: reportsStore.clearError,
    handleSearch,
    handleFilterChange,
    clearFilters,
    exportReports,
    formatDate,
    formatFileSize,
    getStatusText,
    getStatusClass,
    getCategoryText,
    getCategoryClass
  }
}