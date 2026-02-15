import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hrApi from '@/services/api/hrApi'
import apiClient from '@/utils/apiClient'

export const useHRStore = defineStore('hr', () => {
  // State
  const dashboardStats = ref({})
  const employees = ref([])
  const departments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalEmployees = computed(() => employees.value.length)
  const activeEmployees = computed(() => employees.value.filter(emp => emp.status === 'active').length)

  // Actions
  const getDashboardStats = async () => {
    try {
      loading.value = true
      const response = await hrApi.getDashboard()
      dashboardStats.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load dashboard stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployees = async (filters = {}) => {
    try {
      loading.value = true
      const response = await hrApi.getEmployees(filters)
      employees.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employees'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDepartments = async () => {
    try {
      loading.value = true
      const response = await hrApi.getDepartments()
      departments.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load departments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEmployee = async (employeeData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/employees', employeeData)
      employees.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create employee'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id, employeeData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/employees/${id}`, employeeData)
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update employee'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/employees/${id}`)
      employees.value = employees.value.filter(emp => emp.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete employee'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeeStatistics = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees/statistics')
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employee statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateEmployeeId = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees/generate-id')
      return response.data.data.employee_id
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to generate employee ID'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUpcomingBirthdays = async (days = 30) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees/birthdays', { params: { days } })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load upcoming birthdays'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTurnoverRate = async (period = 'year') => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees/turnover-rate', { params: { period } })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load turnover rate'
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
    dashboardStats,
    employees,
    departments,
    loading,
    error,
    
    // Getters
    totalEmployees,
    activeEmployees,
    
    // Actions
    getDashboardStats,
    getEmployees,
    getDepartments,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStatistics,
    generateEmployeeId,
    getUpcomingBirthdays,
    getTurnoverRate,
    clearError
  }
})
