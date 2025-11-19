import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useLeaveStore = defineStore('leave', () => {
  // State
  const leaveRequests = ref([])
  const leaveTypes = ref([])
  const employees = ref([])
  const statistics = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const pendingRequests = computed(() => 
    leaveRequests.value.filter(request => request.status === 'pending')
  )

  const approvedRequests = computed(() => 
    leaveRequests.value.filter(request => request.status === 'approved')
  )

  const rejectedRequests = computed(() => 
    leaveRequests.value.filter(request => request.status === 'rejected')
  )

  // Actions
  const getLeaveRequests = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/leave-requests', { params: filters })
      leaveRequests.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load leave requests'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getLeaveTypes = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/leave-types')
      leaveTypes.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load leave types'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployees = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees')
      employees.value = response.data.data.data
      return response.data.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employees'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStatistics = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/leave-requests/statistics', { params: filters })
      statistics.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load leave statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLeaveRequest = async (requestData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/leave-requests', requestData)
      leaveRequests.value.unshift(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create leave request'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLeaveRequest = async (id, requestData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/leave-requests/${id}`, requestData)
      const index = leaveRequests.value.findIndex(request => request.id === id)
      if (index !== -1) {
        leaveRequests.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update leave request'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLeaveRequest = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/leave-requests/${id}`)
      leaveRequests.value = leaveRequests.value.filter(request => request.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete leave request'
      throw err
    } finally {
      loading.value = false
    }
  }

  const approveLeaveRequest = async (id, notes = null) => {
    try {
      loading.value = true
      const response = await apiClient.post(`/hr/leave-requests/${id}/approve`, { approval_notes: notes })
      const index = leaveRequests.value.findIndex(request => request.id === id)
      if (index !== -1) {
        leaveRequests.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to approve leave request'
      throw err
    } finally {
      loading.value = false
    }
  }

  const rejectLeaveRequest = async (id, notes) => {
    try {
      loading.value = true
      const response = await apiClient.post(`/hr/leave-requests/${id}/reject`, { approval_notes: notes })
      const index = leaveRequests.value.findIndex(request => request.id === id)
      if (index !== -1) {   
        leaveRequests.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reject leave request'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeeLeaveBalance = async (employeeId, year = null) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/leave-requests/balance/${employeeId}`, { 
        params: { year } 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load leave balance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeeLeaveHistory = async (employeeId, filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/leave-requests/employee/${employeeId}`, { 
        params: filters 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load leave history'
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkLeaveConflict = async (employeeId, startDate, endDate, excludeId = null) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/leave-requests/check-conflict', {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        exclude_id: excludeId
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to check leave conflict'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLeaveType = async (typeData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/leave-types', typeData)
      leaveTypes.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create leave type'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLeaveType = async (id, typeData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/leave-types/${id}`, typeData)
      const index = leaveTypes.value.findIndex(type => type.id === id)
      if (index !== -1) {
        leaveTypes.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update leave type'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLeaveType = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/leave-types/${id}`)
      leaveTypes.value = leaveTypes.value.filter(type => type.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete leave type'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    leaveRequests,
    leaveTypes,
    employees,
    statistics,
    loading,
    error,
    
    // Getters
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    
    // Actions
    getLeaveRequests,
    getLeaveTypes,
    getEmployees,
    getStatistics,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    getEmployeeLeaveBalance,
    getEmployeeLeaveHistory,
    checkLeaveConflict,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    clearError
  }
})
