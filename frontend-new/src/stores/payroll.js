import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const usePayrollStore = defineStore('payroll', () => {
  // State
  const payrollRecords = ref([])
  const departments = ref([])
  const payPeriods = ref([])
  const statistics = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const draftPayrolls = computed(() => 
    payrollRecords.value.filter(payroll => payroll.status === 'draft')
  )

  const approvedPayrolls = computed(() => 
    payrollRecords.value.filter(payroll => payroll.status === 'approved')
  )

  const paidPayrolls = computed(() => 
    payrollRecords.value.filter(payroll => payroll.status === 'paid')
  )

  const totalNetSalary = computed(() => 
    payrollRecords.value.reduce((sum, payroll) => sum + parseFloat(payroll.net_salary || 0), 0)
  )

  // Actions
  const getPayrollRecords = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/payroll', { params: filters })
      payrollRecords.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load payroll records'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStatistics = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/payroll/statistics', { params: filters })
      statistics.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load payroll statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDepartments = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/departments')
      departments.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load departments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPayPeriods = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/payroll/periods')
      payPeriods.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load pay periods'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPayroll = async (payrollData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/payroll', payrollData)
      payrollRecords.value.unshift(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create payroll record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePayroll = async (id, payrollData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/payroll/${id}`, payrollData)
      const index = payrollRecords.value.findIndex(payroll => payroll.id === id)
      if (index !== -1) {
        payrollRecords.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update payroll record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePayroll = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/payroll/${id}`)
      payrollRecords.value = payrollRecords.value.filter(payroll => payroll.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete payroll record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const approvePayroll = async (id) => {
    try {
      loading.value = true
      const response = await apiClient.post(`/hr/payroll/${id}/approve`)
      const index = payrollRecords.value.findIndex(payroll => payroll.id === id)
      if (index !== -1) {
        payrollRecords.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to approve payroll'
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsPaid = async (id) => {
    try {
      loading.value = true
      const response = await apiClient.post(`/hr/payroll/${id}/mark-paid`)
      const index = payrollRecords.value.findIndex(payroll => payroll.id === id)
      if (index !== -1) {
        payrollRecords.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark payroll as paid'
      throw err
    } finally {
      loading.value = false
    }
  }

  const generatePayroll = async (payPeriod) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/payroll/generate', { pay_period: payPeriod })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to generate payroll'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPayPeriodSummary = async (payPeriod) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/payroll/summary/${payPeriod}`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load pay period summary'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeePayroll = async (employeeId, filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/payroll/employee/${employeeId}`, { 
        params: filters 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employee payroll'
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculatePayroll = async (employeeId, payPeriod, adjustments = {}) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/payroll/calculate', {
        employee_id: employeeId,
        pay_period: payPeriod,
        adjustments: adjustments
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to calculate payroll'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportPayroll = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/payroll/export', { 
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export payroll'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPayrollReport = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/payroll/report', { params: filters })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load payroll report'
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
    payrollRecords,
    departments,
    payPeriods,
    statistics,
    loading,
    error,
    
    // Getters
    draftPayrolls,
    approvedPayrolls,
    paidPayrolls,
    totalNetSalary,
    
    // Actions
    getPayrollRecords,
    getStatistics,
    getDepartments,
    getPayPeriods,
    createPayroll,
    updatePayroll,
    deletePayroll,
    approvePayroll,
    markAsPaid,
    generatePayroll,
    getPayPeriodSummary,
    getEmployeePayroll,
    calculatePayroll,
    exportPayroll,
    getPayrollReport,
    clearError
  }
})
