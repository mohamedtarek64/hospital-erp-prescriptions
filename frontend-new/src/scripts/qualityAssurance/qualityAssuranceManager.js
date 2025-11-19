/**
 * Quality Assurance Manager
 * Manages the Quality Assurance & Compliance System functionality
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQualityAssuranceStore } from '@/stores/qualityAssurance'
import { useToast } from '@/composables/useToast'

export function useQualityAssuranceManager() {
  const router = useRouter()
  const store = useQualityAssuranceStore()
  const { showToast } = useToast()

  // State
  const loading = ref(false)
  const error = ref(null)
  const selectedTab = ref('overview')
  const filters = ref({
    dateRange: '30d',
    department: null,
    status: null,
    priority: null
  })

  // Computed
  const dashboardData = computed(() => store.dashboardData)
  const standards = computed(() => store.standards)
  const audits = computed(() => store.audits)
  const incidents = computed(() => store.incidents)
  const complianceRecords = computed(() => store.complianceRecords)
  const trainingRecords = computed(() => store.trainingRecords)
  const staffTrainings = computed(() => store.staffTrainings)

  const statistics = computed(() => ({
    totalStandards: standards.value?.length || 0,
    activeStandards: standards.value?.filter(s => s.status === 'active').length || 0,
    totalAudits: audits.value?.length || 0,
    completedAudits: audits.value?.filter(a => a.status === 'completed').length || 0,
    totalIncidents: incidents.value?.length || 0,
    criticalIncidents: incidents.value?.filter(i => i.severity === 'critical').length || 0,
    complianceRate: dashboardData.value?.overview?.compliance_rate || 0,
    trainingCompletionRate: dashboardData.value?.overview?.training_completion_rate || 0
  }))

  const alerts = computed(() => dashboardData.value?.alerts || [])
  const recentActivities = computed(() => dashboardData.value?.recent_activities || [])
  const complianceTrends = computed(() => dashboardData.value?.compliance_trends || [])
  const incidentTrends = computed(() => dashboardData.value?.incident_trends || [])

  // Methods
  const loadDashboardData = async () => {
    try {
      loading.value = true
      error.value = null
      await store.fetchDashboardData()
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل بيانات لوحة التحكم', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadStandards = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchStandards(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل معايير الجودة', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadAudits = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchAudits(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل التدقيقات', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadIncidents = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchIncidents(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل الحوادث', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadComplianceRecords = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchComplianceRecords(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل سجلات الامتثال', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadTrainingRecords = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchTrainingRecords(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل سجلات التدريب', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadStaffTrainings = async (params = {}) => {
    try {
      loading.value = true
      await store.fetchStaffTrainings(params)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحميل تدريب الموظفين', 'error')
    } finally {
      loading.value = false
    }
  }

  // Standard Management
  const createStandard = async (standardData) => {
    try {
      loading.value = true
      const newStandard = await store.createStandard(standardData)
      showToast('تم إنشاء معيار الجودة بنجاح', 'success')
      return newStandard
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء معيار الجودة', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStandard = async (id, standardData) => {
    try {
      loading.value = true
      const updatedStandard = await store.updateStandard(id, standardData)
      showToast('تم تحديث معيار الجودة بنجاح', 'success')
      return updatedStandard
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحديث معيار الجودة', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStandard = async (id) => {
    try {
      loading.value = true
      await store.deleteStandard(id)
      showToast('تم حذف معيار الجودة بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في حذف معيار الجودة', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Audit Management
  const createAudit = async (auditData) => {
    try {
      loading.value = true
      const newAudit = await store.createAudit(auditData)
      showToast('تم إنشاء التدقيق بنجاح', 'success')
      return newAudit
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء التدقيق', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const startAudit = async (id) => {
    try {
      loading.value = true
      await store.startAudit(id)
      showToast('تم بدء التدقيق بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في بدء التدقيق', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeAudit = async (id, auditData) => {
    try {
      loading.value = true
      await store.completeAudit(id, auditData)
      showToast('تم إكمال التدقيق بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إكمال التدقيق', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Incident Management
  const createIncident = async (incidentData) => {
    try {
      loading.value = true
      const newIncident = await store.createIncident(incidentData)
      showToast('تم إنشاء الحادث بنجاح', 'success')
      return newIncident
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء الحادث', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignIncident = async (id, assigneeId) => {
    try {
      loading.value = true
      await store.assignIncident(id, assigneeId)
      showToast('تم تعيين الحادث بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تعيين الحادث', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const resolveIncident = async (id, resolutionData) => {
    try {
      loading.value = true
      await store.resolveIncident(id, resolutionData)
      showToast('تم حل الحادث بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في حل الحادث', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Compliance Management
  const createComplianceRecord = async (recordData) => {
    try {
      loading.value = true
      const newRecord = await store.createComplianceRecord(recordData)
      showToast('تم إنشاء سجل الامتثال بنجاح', 'success')
      return newRecord
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء سجل الامتثال', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateComplianceStatus = async (id, statusData) => {
    try {
      loading.value = true
      await store.updateComplianceStatus(id, statusData)
      showToast('تم تحديث حالة الامتثال بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تحديث حالة الامتثال', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Training Management
  const createTrainingRecord = async (trainingData) => {
    try {
      loading.value = true
      const newTraining = await store.createTrainingRecord(trainingData)
      showToast('تم إنشاء سجل التدريب بنجاح', 'success')
      return newTraining
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء سجل التدريب', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const enrollStaffInTraining = async (trainingId, staffIds) => {
    try {
      loading.value = true
      await store.enrollStaffInTraining(trainingId, staffIds)
      showToast('تم تسجيل الموظفين في التدريب بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تسجيل الموظفين في التدريب', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeStaffTraining = async (id, completionData) => {
    try {
      loading.value = true
      await store.completeStaffTraining(id, completionData)
      showToast('تم إكمال تدريب الموظف بنجاح', 'success')
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إكمال تدريب الموظف', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Navigation
  const navigateToStandards = () => {
    router.push('/quality-assurance/standards')
  }

  const navigateToAudits = () => {
    router.push('/quality-assurance/audits')
  }

  const navigateToIncidents = () => {
    router.push('/quality-assurance/incidents')
  }

  const navigateToCompliance = () => {
    router.push('/quality-assurance/compliance')
  }

  const navigateToTraining = () => {
    router.push('/quality-assurance/training')
  }

  const navigateToReport = (reportId) => {
    router.push(`/quality-assurance/reports/${reportId}`)
  }

  // Filter and Search
  const applyFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    loadDashboardData()
  }

  const clearFilters = () => {
    filters.value = {
      dateRange: '30d',
      department: null,
      status: null,
      priority: null
    }
    loadDashboardData()
  }

  const search = async (query) => {
    try {
      loading.value = true
      await store.search(query)
    } catch (err) {
      error.value = err.message
      showToast('خطأ في البحث', 'error')
    } finally {
      loading.value = false
    }
  }

  // Export and Reports
  const exportData = async (type, format = 'excel') => {
    try {
      loading.value = true
      const data = await store.exportData(type, format)
      showToast('تم تصدير البيانات بنجاح', 'success')
      return data
    } catch (err) {
      error.value = err.message
      showToast('خطأ في تصدير البيانات', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateReport = async (reportType, params = {}) => {
    try {
      loading.value = true
      const report = await store.generateReport(reportType, params)
      showToast('تم إنشاء التقرير بنجاح', 'success')
      return report
    } catch (err) {
      error.value = err.message
      showToast('خطأ في إنشاء التقرير', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility Functions
  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'gray',
      draft: 'yellow',
      archived: 'gray',
      planned: 'blue',
      in_progress: 'yellow',
      completed: 'green',
      cancelled: 'red',
      on_hold: 'orange',
      reported: 'blue',
      investigating: 'yellow',
      resolved: 'green',
      closed: 'gray',
      escalated: 'red',
      compliant: 'green',
      non_compliant: 'red',
      partially_compliant: 'yellow',
      not_applicable: 'gray',
      scheduled: 'blue',
      enrolled: 'blue',
      failed: 'red',
      withdrawn: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    }
    return colors[priority] || 'gray'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    }
    return colors[severity] || 'gray'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ar-SA')
  }

  const formatDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('ar-SA')
  }

  // Lifecycle
  onMounted(() => {
    loadDashboardData()
  })

  return {
    // State
    loading,
    error,
    selectedTab,
    filters,

    // Computed
    dashboardData,
    standards,
    audits,
    incidents,
    complianceRecords,
    trainingRecords,
    staffTrainings,
    statistics,
    alerts,
    recentActivities,
    complianceTrends,
    incidentTrends,

    // Methods
    loadDashboardData,
    loadStandards,
    loadAudits,
    loadIncidents,
    loadComplianceRecords,
    loadTrainingRecords,
    loadStaffTrainings,

    // Standard Management
    createStandard,
    updateStandard,
    deleteStandard,

    // Audit Management
    createAudit,
    startAudit,
    completeAudit,

    // Incident Management
    createIncident,
    assignIncident,
    resolveIncident,

    // Compliance Management
    createComplianceRecord,
    updateComplianceStatus,

    // Training Management
    createTrainingRecord,
    enrollStaffInTraining,
    completeStaffTraining,

    // Navigation
    navigateToStandards,
    navigateToAudits,
    navigateToIncidents,
    navigateToCompliance,
    navigateToTraining,
    navigateToReport,

    // Filter and Search
    applyFilters,
    clearFilters,
    search,

    // Export and Reports
    exportData,
    generateReport,

    // Utility Functions
    getStatusColor,
    getPriorityColor,
    getSeverityColor,
    formatDate,
    formatDateTime
  }
}
