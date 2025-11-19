import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useBillingStore = defineStore('billing', () => {
  const invoices = ref([])
  const payments = ref([])
  const services = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters (computed properties for derived state)
  const paidInvoices = computed(() =>
    invoices.value.filter(invoice => invoice.status === 'paid')
  )
  const pendingInvoices = computed(() =>
    invoices.value.filter(invoice => invoice.status === 'pending')
  )
  const overdueInvoices = computed(() =>
    invoices.value.filter(invoice => invoice.status === 'overdue')
  )

  const stats = computed(() => ({
    totalInvoices: invoices.value.length,
    paidInvoices: paidInvoices.value.length,
    pendingInvoices: pendingInvoices.value.length,
    overdueInvoices: overdueInvoices.value.length,
    totalRevenue: paidInvoices.value.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0),
    pendingAmount: pendingInvoices.value.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0)
  }))

  const recentInvoices = computed(() => {
    return invoices.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  const recentPayments = computed(() => {
    return payments.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  // API Actions
  const fetchInvoices = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/billing/invoices', { params })
      invoices.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch invoices'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPayments = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/billing/payments', { params })
      payments.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchServices = async () => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/billing/services')
      services.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch services'
      throw err
      } finally {
      loading.value = false
    }
  }

  const createInvoice = async (invoiceData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/billing/invoices', invoiceData)
      invoices.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create invoice'
      return { success: false, message: error.value }
      } finally {
      loading.value = false
    }
  }

  const updateInvoice = async (id, invoiceData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/billing/invoices/${id}`, invoiceData)
      const index = invoices.value.findIndex(i => i.id === id)
        if (index !== -1) {
        invoices.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update invoice'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteInvoice = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/billing/invoices/${id}`)
      invoices.value = invoices.value.filter(i => i.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete invoice'
      return { success: false, message: error.value }
      } finally {
      loading.value = false
    }
  }

  const recordPayment = async (paymentData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/billing/payments', paymentData)
      payments.value.unshift(response.data)
      
      // Update invoice status if payment covers full amount
      const invoice = invoices.value.find(i => i.id === paymentData.invoice_id)
      if (invoice && parseFloat(paymentData.amount) >= parseFloat(invoice.amount)) {
        invoice.status = 'paid'
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to record payment'
      return { success: false, message: error.value }
      } finally {
      loading.value = false
    }
  }

  const createService = async (serviceData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/billing/services', serviceData)
      services.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create service'
      return { success: false, message: error.value }
      } finally {
      loading.value = false
    }
  }

  const updateService = async (id, serviceData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/billing/services/${id}`, serviceData)
      const index = services.value.findIndex(s => s.id === id)
        if (index !== -1) {
        services.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update service'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteService = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/billing/services/${id}`)
      services.value = services.value.filter(s => s.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete service'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    invoices,
    payments,
    services,
    loading,
    error,
    stats,
    recentInvoices,
    recentPayments,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    fetchInvoices,
    fetchPayments,
    fetchServices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    createService,
    updateService,
    deleteService,
    clearError
  }
})