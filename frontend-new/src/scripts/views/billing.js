import { ref, onMounted, computed } from 'vue'
import { useBillingStore } from '@/stores/billing'

export function useBilling() {
  const billingStore = useBillingStore()
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const selectedDateRange = ref('')

  const loadBillingData = async () => {
    try {
      await billingStore.fetchInvoices()
      await billingStore.fetchPayments()
      await billingStore.fetchServices()
    } catch (error) {
      console.error('Error loading billing data:', error)
    }
  }

  const billingStats = computed(() => billingStore.stats)
  const recentInvoices = computed(() => billingStore.recentInvoices)
  const recentPayments = computed(() => billingStore.recentPayments)

  const addInvoice = async (invoiceData) => {
    try {
      const result = await billingStore.createInvoice(invoiceData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding invoice:', error)
      throw error
    }
  }

  const updateInvoice = async (id, invoiceData) => {
    try {
      const result = await billingStore.updateInvoice(id, invoiceData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  }

  const deleteInvoice = async (id) => {
    try {
      const result = await billingStore.deleteInvoice(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  }

  const addPayment = async (paymentData) => {
    try {
      const result = await billingStore.recordPayment(paymentData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding payment:', error)
      throw error
    }
  }

  const addService = async (serviceData) => {
    try {
      const result = await billingStore.createService(serviceData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding service:', error)
      throw error
    }
  }

  const updateService = async (id, serviceData) => {
    try {
      const result = await billingStore.updateService(id, serviceData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating service:', error)
      throw error
    }
  }

  const deleteService = async (id) => {
    try {
      const result = await billingStore.deleteService(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting service:', error)
      throw error
    }
  }

  const filteredInvoices = computed(() => {
    let filtered = billingStore.invoices
    if (searchQuery.value) {
      filtered = filtered.filter(invoice =>
        invoice.patient_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        invoice.invoice_number?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    if (selectedStatus.value) {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus.value)
    }
    if (selectedDateRange.value) {
      const today = new Date()
      const filterDate = new Date()
      
      switch (selectedDateRange.value) {
        case 'today':
          filterDate.setDate(today.getDate())
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(today.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(invoice => 
        new Date(invoice.created_at) >= filterDate
      )
    }
    return filtered
  })

  const handleSearch = () => {
    // Search is handled reactively through computed property
  }

  const handleFilterChange = () => {
    // Filtering is handled reactively through computed property
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedStatus.value = ''
    selectedDateRange.value = ''
  }

  const exportInvoices = async () => {
    try {
      // Implement export functionality
      console.log('Exporting invoices...')
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG')
  }

  const getStatusText = (status) => {
    const statuses = {
      'paid': 'مدفوع',
      'pending': 'في الانتظار',
      'overdue': 'متأخر',
      'cancelled': 'ملغي'
    }
    return statuses[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      'paid': 'status-paid',
      'pending': 'status-pending',
      'overdue': 'status-overdue',
      'cancelled': 'status-cancelled'
    }
    return classes[status] || ''
  }

  onMounted(() => {
    loadBillingData()
  })

  return {
    invoices: billingStore.invoices,
    payments: billingStore.payments,
    services: billingStore.services,
    loading: billingStore.loading,
    error: billingStore.error,
    searchQuery,
    selectedStatus,
    selectedDateRange,
    filteredInvoices,
    billingStats,
    recentInvoices,
    recentPayments,
    loadBillingData,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    addService,
    updateService,
    deleteService,
    clearError: billingStore.clearError,
    handleSearch,
    handleFilterChange,
    clearFilters,
    exportInvoices,
    formatPrice,
    formatDate,
    getStatusText,
    getStatusClass
  }
}
