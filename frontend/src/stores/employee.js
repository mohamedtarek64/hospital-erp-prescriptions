/**
 * Employee Store
 * Manages employee data and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref([])
  const departments = ref([])
  const positions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const employeeStats = computed(() => {
    const total = employees.value.length
    const active = employees.value.filter(emp => emp.status === 'active').length
    const inactive = employees.value.filter(emp => emp.status === 'inactive').length
    
    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : 0
    }
  })

  const employeesByDepartment = computed(() => {
    const grouped = {}
    employees.value.forEach(emp => {
      const dept = emp.department || 'غير محدد'
      if (!grouped[dept]) {
        grouped[dept] = []
      }
      grouped[dept].push(emp)
    })
    return grouped
  })

  // Actions
  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get('/employees')
      employees.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchEmployee = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get(`/employees/${id}`)
      return response.data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createEmployee = async (employeeData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.post('/employees', employeeData)
      employees.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id, employeeData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.put(`/employees/${id}`, employeeData)
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.delete(`/employees/${id}`)
      employees.value = employees.value.filter(emp => emp.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/departments')
      departments.value = response.data
    } catch (err) {
      error.value = err.message
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await apiClient.get('/positions')
      positions.value = response.data
    } catch (err) {
      error.value = err.message
    }
  }

  const searchEmployees = (query) => {
    if (!query) return employees.value
    
    return employees.value.filter(emp => 
      emp.name?.toLowerCase().includes(query.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(query.toLowerCase()) ||
      emp.department?.toLowerCase().includes(query.toLowerCase()) ||
      emp.position?.toLowerCase().includes(query.toLowerCase())
    )
  }

  const getEmployeeById = (id) => {
    return employees.value.find(emp => emp.id === id)
  }

  const getEmployeesByDepartment = (department) => {
    return employees.value.filter(emp => emp.department === department)
  }

  const getActiveEmployees = () => {
    return employees.value.filter(emp => emp.status === 'active')
  }

  const getInactiveEmployees = () => {
    return employees.value.filter(emp => emp.status === 'inactive')
  }

  return {
    // State
    employees,
    departments,
    positions,
    loading,
    error,
    
    // Computed
    employeeStats,
    employeesByDepartment,
    
    // Actions
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchDepartments,
    fetchPositions,
    searchEmployees,
    getEmployeeById,
    getEmployeesByDepartment,
    getActiveEmployees,
    getInactiveEmployees
  }
})
