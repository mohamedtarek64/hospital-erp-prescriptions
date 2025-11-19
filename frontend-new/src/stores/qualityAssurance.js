/**
 * Quality Assurance Pinia Store
 * Manages state for the Quality Assurance & Compliance System
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { qualityAssuranceApi, qualityAssuranceHelpers } from '@/api/qualityAssuranceApi'

export const useQualityAssuranceStore = defineStore('qualityAssurance', () => {
  // State
  const dashboardData = ref(null)
  const standards = ref([])
  const audits = ref([])
  const incidents = ref([])
  const complianceRecords = ref([])
  const trainingRecords = ref([])
  const staffTrainings = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const statistics = computed(() => {
    if (!dashboardData.value) return null
    return dashboardData.value.overview || {}
  })

  const alerts = computed(() => {
    if (!dashboardData.value) return []
    return dashboardData.value.alerts || []
  })

  const recentActivities = computed(() => {
    if (!dashboardData.value) return []
    return dashboardData.value.recent_activities || []
  })

  const complianceTrends = computed(() => {
    if (!dashboardData.value) return []
    return dashboardData.value.compliance_trends || []
  })

  const incidentTrends = computed(() => {
    if (!dashboardData.value) return []
    return dashboardData.value.incident_trends || []
  })

  const trainingStatus = computed(() => {
    if (!dashboardData.value) return {}
    return dashboardData.value.training_status || {}
  })

  // Actions
  const fetchDashboardData = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getDashboardData()
      dashboardData.value = response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStandards = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getStandards(params)
      standards.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAudits = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getAudits(params)
      audits.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchIncidents = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getIncidents(params)
      incidents.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchComplianceRecords = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getComplianceRecords(params)
      complianceRecords.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTrainingRecords = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getTrainingRecords(params)
      trainingRecords.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStaffTrainings = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.getStaffTrainings(params)
      staffTrainings.value = response.data.data.data || response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Standard Management
  const createStandard = async (data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatStandardData(data)
      const response = await qualityAssuranceApi.createStandard(formattedData)
      const newStandard = qualityAssuranceHelpers.parseStandardResponse(response.data.data)
      standards.value.unshift(newStandard)
      return newStandard
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStandard = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatStandardData(data)
      const response = await qualityAssuranceApi.updateStandard(id, formattedData)
      const updatedStandard = qualityAssuranceHelpers.parseStandardResponse(response.data.data)
      const index = standards.value.findIndex(s => s.id === id)
      if (index !== -1) {
        standards.value[index] = updatedStandard
      }
      return updatedStandard
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStandard = async (id) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.deleteStandard(id)
      standards.value = standards.value.filter(s => s.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Audit Management
  const createAudit = async (data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatAuditData(data)
      const response = await qualityAssuranceApi.createAudit(formattedData)
      const newAudit = qualityAssuranceHelpers.parseAuditResponse(response.data.data)
      audits.value.unshift(newAudit)
      return newAudit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const startAudit = async (id) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.startAudit(id)
      const index = audits.value.findIndex(a => a.id === id)
      if (index !== -1) {
        audits.value[index].status = 'in_progress'
        audits.value[index].start_date = new Date().toISOString()
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeAudit = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.completeAudit(id, data)
      const index = audits.value.findIndex(a => a.id === id)
      if (index !== -1) {
        audits.value[index].status = 'completed'
        audits.value[index].end_date = new Date().toISOString()
        audits.value[index].overall_rating = data.overall_rating
        audits.value[index].summary = data.summary
        audits.value[index].findings = data.findings
        audits.value[index].recommendations = data.recommendations
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Incident Management
  const createIncident = async (data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatIncidentData(data)
      const response = await qualityAssuranceApi.createIncident(formattedData)
      const newIncident = qualityAssuranceHelpers.parseIncidentResponse(response.data.data)
      incidents.value.unshift(newIncident)
      return newIncident
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignIncident = async (id, assigneeId) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.assignIncident(id, assigneeId)
      const index = incidents.value.findIndex(i => i.id === id)
      if (index !== -1) {
        incidents.value[index].assigned_to = assigneeId
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resolveIncident = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.resolveIncident(id, data)
      const index = incidents.value.findIndex(i => i.id === id)
      if (index !== -1) {
        incidents.value[index].status = 'resolved'
        incidents.value[index].resolved_date = new Date().toISOString()
        incidents.value[index].root_cause = data.root_cause
        incidents.value[index].corrective_action = data.corrective_action
        incidents.value[index].preventive_action = data.preventive_action
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Compliance Management
  const createComplianceRecord = async (data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatComplianceRecordData(data)
      const response = await qualityAssuranceApi.createComplianceRecord(formattedData)
      const newRecord = qualityAssuranceHelpers.parseComplianceRecordResponse(response.data.data)
      complianceRecords.value.unshift(newRecord)
      return newRecord
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateComplianceStatus = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.updateComplianceStatus(id, data)
      const index = complianceRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        complianceRecords.value[index].compliance_status = data.compliance_status
        complianceRecords.value[index].assessment_notes = data.assessment_notes
        complianceRecords.value[index].evidence = data.evidence
        complianceRecords.value[index].gaps = data.gaps
        complianceRecords.value[index].action_plan = data.action_plan
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Training Management
  const createTrainingRecord = async (data) => {
    try {
      loading.value = true
      error.value = null
      const formattedData = qualityAssuranceHelpers.formatTrainingRecordData(data)
      const response = await qualityAssuranceApi.createTrainingRecord(formattedData)
      const newTraining = qualityAssuranceHelpers.parseTrainingRecordResponse(response.data.data)
      trainingRecords.value.unshift(newTraining)
      return newTraining
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const enrollStaffInTraining = async (trainingId, staffIds) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.enrollStaffInTraining(trainingId, staffIds)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeStaffTraining = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      await qualityAssuranceApi.completeStaffTraining(id, data)
      const index = staffTrainings.value.findIndex(st => st.id === id)
      if (index !== -1) {
        staffTrainings.value[index].status = 'completed'
        staffTrainings.value[index].completion_date = new Date().toISOString()
        staffTrainings.value[index].score = data.score
        staffTrainings.value[index].result = data.result
        staffTrainings.value[index].feedback = data.feedback
        staffTrainings.value[index].assessment_results = data.assessment_results
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Search
  const search = async (query) => {
    try {
      loading.value = true
      error.value = null
      // Search across all modules
      const [standardsRes, auditsRes, incidentsRes, complianceRes, trainingRes] = await Promise.all([
        qualityAssuranceApi.getStandards({ search: query }),
        qualityAssuranceApi.getAudits({ search: query }),
        qualityAssuranceApi.getIncidents({ search: query }),
        qualityAssuranceApi.getComplianceRecords({ search: query }),
        qualityAssuranceApi.getTrainingRecords({ search: query })
      ])

      return {
        standards: standardsRes.data.data.data || standardsRes.data.data,
        audits: auditsRes.data.data.data || auditsRes.data.data,
        incidents: incidentsRes.data.data.data || incidentsRes.data.data,
        complianceRecords: complianceRes.data.data.data || complianceRes.data.data,
        trainingRecords: trainingRes.data.data.data || trainingRes.data.data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Export
  const exportData = async (type, format = 'excel') => {
    try {
      loading.value = true
      error.value = null
      let response
      switch (type) {
        case 'standards':
          response = await qualityAssuranceApi.exportStandards(format)
          break
        case 'audits':
          response = await qualityAssuranceApi.exportAudits(format)
          break
        case 'incidents':
          response = await qualityAssuranceApi.exportIncidents(format)
          break
        case 'compliance':
          response = await qualityAssuranceApi.exportComplianceRecords(format)
          break
        case 'training':
          response = await qualityAssuranceApi.exportTrainingRecords(format)
          break
        case 'staff-training':
          response = await qualityAssuranceApi.exportStaffTrainings(format)
          break
        default:
          throw new Error('Invalid export type')
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reports
  const generateReport = async (reportType, params = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await qualityAssuranceApi.generateReport(params)
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    dashboardData.value = null
    standards.value = []
    audits.value = []
    incidents.value = []
    complianceRecords.value = []
    trainingRecords.value = []
    staffTrainings.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    dashboardData,
    standards,
    audits,
    incidents,
    complianceRecords,
    trainingRecords,
    staffTrainings,
    loading,
    error,

    // Computed
    statistics,
    alerts,
    recentActivities,
    complianceTrends,
    incidentTrends,
    trainingStatus,

    // Actions
    fetchDashboardData,
    fetchStandards,
    fetchAudits,
    fetchIncidents,
    fetchComplianceRecords,
    fetchTrainingRecords,
    fetchStaffTrainings,

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

    // Search and Export
    search,
    exportData,
    generateReport,

    // Utility
    clearError,
    resetStore
  }
})
