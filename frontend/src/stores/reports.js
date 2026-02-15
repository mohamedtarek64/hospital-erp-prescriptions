import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useReportsStore = defineStore('reports', () => {
  const reports = ref([])
  const reportTemplates = ref([])
  const scheduledReports = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters (computed properties for derived state)
  const publishedReports = computed(() =>
    reports.value.filter(report => report.status === 'published')
  )
  const draftReports = computed(() =>
    reports.value.filter(report => report.status === 'draft')
  )
  const scheduledReportsActive = computed(() =>
    scheduledReports.value.filter(report => report.is_active)
  )

  const stats = computed(() => ({
    totalReports: reports.value.length,
    publishedReports: publishedReports.value.length,
    draftReports: draftReports.value.length,
    totalTemplates: reportTemplates.value.length,
    activeSchedules: scheduledReportsActive.value.length
  }))

  const recentReports = computed(() => {
    return reports.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  const popularReports = computed(() => {
    return reports.value
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
  })

  // API Actions
  const fetchReports = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/reports', { params })
      reports.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch reports'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchReportTemplates = async () => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/reports/templates')
      reportTemplates.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch report templates'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchScheduledReports = async () => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/reports/scheduled')
      scheduledReports.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch scheduled reports'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createReport = async (reportData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/reports', reportData)
      reports.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateReport = async (id, reportData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/reports/${id}`, reportData)
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteReport = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/reports/${id}`)
      reports.value = reports.value.filter(r => r.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const publishReport = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.patch(`/api/reports/${id}/publish`)
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index].status = 'published'
        reports.value[index].published_at = response.data.published_at
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to publish report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const unpublishReport = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.patch(`/api/reports/${id}/unpublish`)
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index].status = 'draft'
        reports.value[index].unpublished_at = response.data.unpublished_at
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to unpublish report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const generateReport = async (id, params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.post(`/api/reports/${id}/generate`, params)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to generate report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const downloadReport = async (id, format = 'pdf') => {
    loading.value = true
    try {
      const response = await apiClient.get(`/api/reports/${id}/download`, {
        params: { format },
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to download report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const shareReport = async (id, shareData) => {
    loading.value = true
    try {
      const response = await apiClient.post(`/api/reports/${id}/share`, shareData)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to share report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createReportTemplate = async (templateData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/reports/templates', templateData)
      reportTemplates.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create report template'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateReportTemplate = async (id, templateData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/reports/templates/${id}`, templateData)
      const index = reportTemplates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        reportTemplates.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update report template'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteReportTemplate = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/reports/templates/${id}`)
      reportTemplates.value = reportTemplates.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete report template'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const scheduleReport = async (scheduleData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/reports/schedule', scheduleData)
      scheduledReports.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to schedule report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateScheduledReport = async (id, scheduleData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/reports/schedule/${id}`, scheduleData)
      const index = scheduledReports.value.findIndex(s => s.id === id)
      if (index !== -1) {
        scheduledReports.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update scheduled report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteScheduledReport = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/reports/schedule/${id}`)
      scheduledReports.value = scheduledReports.value.filter(s => s.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete scheduled report'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    reports,
    reportTemplates,
    scheduledReports,
    loading,
    error,
    stats,
    recentReports,
    popularReports,
    publishedReports,
    draftReports,
    scheduledReportsActive,
    fetchReports,
    fetchReportTemplates,
    fetchScheduledReports,
    createReport,
    updateReport,
    deleteReport,
    publishReport,
    unpublishReport,
    generateReport,
    downloadReport,
    shareReport,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    scheduleReport,
    updateScheduledReport,
    deleteScheduledReport,
    clearError
  }
})