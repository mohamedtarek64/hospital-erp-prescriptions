import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const usePaymentsStore = defineStore('payments', () => {
  // State
  const payments = ref([])
  const currentPayment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalPayments = computed(() => payments.value.length)
  const totalAmount = computed(() => payments.value.reduce((sum, payment) => sum + payment.amount, 0))
  const paymentsByMethod = computed(() => {
    const methods = {}
    payments.value.forEach(payment => {
      methods[payment.payment_method] = (methods[payment.payment_method] || 0) + 1
    })
    return methods
  })
  const recentPayments = computed(() => {
    return payments.value
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      .slice(0, 10)
  })

  // Actions
  const fetchPayments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/payments', { params })
      payments.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/payments/${id}`)
      currentPayment.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPayment = async (paymentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/payments', paymentData)
      const newPayment = response.data
      payments.value.unshift(newPayment)
      return newPayment
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePayment = async (id, paymentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.put(`/payments/${id}`, paymentData)
      const updatedPayment = response.data
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = updatedPayment
      }
      return updatedPayment
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePayment = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete(`/payments/${id}`)
      payments.value = payments.value.filter(p => p.id !== id)
      if (currentPayment.value?.id === id) {
        currentPayment.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentsByInvoice = async (invoiceId) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/payments`)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch invoice payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentsByDateRange = async (startDate, endDate) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/payments', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      })
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payments by date range'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentStatistics = async (period = '30') => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/payments/statistics', {
        params: { period }
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payment statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportPayments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/payments/export', {
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentPayment = () => {
    currentPayment.value = null
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    error,
    
    // Getters
    totalPayments,
    totalAmount,
    paymentsByMethod,
    recentPayments,
    
    // Actions
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    fetchPaymentsByInvoice,
    fetchPaymentsByDateRange,
    fetchPaymentStatistics,
    exportPayments,
    clearError,
    clearCurrentPayment
  }
})
