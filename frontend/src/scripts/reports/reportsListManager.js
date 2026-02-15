/**
 * @module reportsListManager
 * @description Manager for handling reports list business logic
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/services/api/reportsApi'
import { reportHelpers } from '@/utils/reportHelpers'

export function useReportsListManager() {
  const router = useRouter()
  const reportsStore = useReportsStore()
  const authStore = useAuthStore()

  // Reactive state
  const isLoading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedType = ref('')
  const selectedStatus = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref('created_at')
  const sortOrder = ref('desc')
  const selectedReports = ref([])
  const selectAll = ref(false)
  const isGeneratingReport = ref(false)
  const reportGenerationProgress = ref(0)

  // Computed properties
  const filteredReports = computed(() => {
    let reports = reportsStore.reports || []

    // Filter by category
    if (selectedCategory.value) {
      reports = reports.filter(report => report?.category?.id === selectedCategory.value)
    }

    // Filter by type
    if (selectedType.value) {
      reports = reports.filter(report => report?.type === selectedType.value)
    }

    // Filter by status
    if (selectedStatus.value) {
      reports = reports.filter(report => {
        if (selectedStatus.value === 'active') return report?.is_public
        if (selectedStatus.value === 'inactive') return !report?.is_public
        if (selectedStatus.value === 'scheduled') return report?.is_scheduled
        return true
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

    // Sort reports
    reports.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'title':
          aValue = a?.title || ''
          bValue = b?.title || ''
          break
        case 'category':
          aValue = a?.category?.name || ''
          bValue = b?.category?.name || ''
          break
        case 'type':
          aValue = a?.type || ''
          bValue = b?.type || ''
          break
        case 'status':
          aValue = a?.is_public ? 'active' : 'inactive'
          bValue = b?.is_public ? 'active' : 'inactive'
          break
        case 'generation_count':
          aValue = a?.generation_count || 0
          bValue = b?.generation_count || 0
          break
        case 'last_generated_at':
          aValue = new Date(a?.last_generated_at || 0)
          bValue = new Date(b?.last_generated_at || 0)
          break
        default:
          aValue = new Date(a?.created_at || 0)
          bValue = new Date(b?.created_at || 0)
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

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

  const visiblePages = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 4; i <= total; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      }
    }
    
    return pages
  })

  const reportCategories = computed(() => {
    return reportsStore.reportCategories || []
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

  const loadReportCategories = async () => {
    try {
      await reportsStore.fetchReportCategories()
    } catch (err) {
      console.error('Error loading report categories:', err)
    }
  }

  const generateReport = async (report) => {
    try {
      isGeneratingReport.value = true
      reportGenerationProgress.value = 0
      error.value = null

      const reportData = await reportsApi.generateReport(report?.type || 'standard', {
        report_id: report?.id
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

  const downloadReport = async (report) => {
    try {
      const response = await reportsApi.downloadReport(report?.id, 'pdf')
      
      // Create download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${report?.id}.pdf`
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
      // Remove from selected reports
      const index = selectedReports.value.indexOf(reportId)
      if (index > -1) {
        selectedReports.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete report'
      console.error('Error deleting report:', err)
    }
  }

  const deleteSelectedReports = async () => {
    if (selectedReports.value.length === 0) return

    if (confirm(`هل أنت متأكد من حذف ${selectedReports.value.length} تقرير؟`)) {
      try {
        await Promise.all(selectedReports.value.map(id => deleteReport(id)))
        selectedReports.value = []
        selectAll.value = false
      } catch (err) {
        console.error('Error deleting selected reports:', err)
      }
    }
  }

  const exportReports = async (format = 'csv') => {
    try {
      const reportsToExport = selectedReports.value.length > 0 
        ? filteredReports.value.filter(report => selectedReports.value.includes(report?.id))
        : filteredReports.value

      const exportData = reportHelpers.formatDataForExport(reportsToExport, format)
      const blob = new Blob([exportData], { type: `text/${format}` })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reports_export_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.message || 'Failed to export reports'
      console.error('Error exporting reports:', err)
    }
  }

  const navigateToReport = (reportId) => {
    router.push(`/reports/${reportId}`)
  }

  const navigateToCreateReport = () => {
    router.push('/reports/create')
  }

  const clearFilters = () => {
    selectedCategory.value = ''
    selectedType.value = ''
    selectedStatus.value = ''
    searchQuery.value = ''
    currentPage.value = 1
  }

  const refreshData = async () => {
    await Promise.all([
      loadReports(),
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

  const canExportReports = computed(() => {
    return hasPermission('export_reports')
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
    searchQuery,
    selectedCategory,
    selectedType,
    selectedStatus,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    selectedReports,
    selectAll,
    isGeneratingReport,
    reportGenerationProgress,

    // Computed
    filteredReports,
    paginatedReports,
    totalPages,
    visiblePages,
    reportCategories,
    userPermissions,
    canCreateReport,
    canDeleteReport,
    canExportReports,

    // Methods
    loadReports,
    loadReportCategories,
    generateReport,
    downloadReport,
    deleteReport,
    deleteSelectedReports,
    exportReports,
    navigateToReport,
    navigateToCreateReport,
    clearFilters,
    refreshData,
    hasPermission
  }
}
