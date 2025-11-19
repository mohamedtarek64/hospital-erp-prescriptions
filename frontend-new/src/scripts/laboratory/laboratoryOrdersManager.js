import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLaboratoryStore } from '@/stores/laboratory'
import { laboratoryHelpers } from '@/utils/laboratoryHelpers'

export const laboratoryOrdersManager = {
  setup() {
    const router = useRouter()
    const laboratoryStore = useLaboratoryStore()
    
    // State
    const orders = ref([])
    const loading = ref(false)
    const error = ref(null)
    const filters = ref({
      status: '',
      patient: '',
      dateRange: '',
      priority: ''
    })
    const pagination = ref({
      currentPage: 1,
      perPage: 10,
      total: 0,
      lastPage: 1
    })
    const searchTimeout = ref(null)

    // Computed
    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value !== '')
    })

    const visiblePages = computed(() => {
      const current = pagination.value.currentPage
      const last = pagination.value.lastPage
      const pages = []
      
      // Show up to 5 pages around current page
      const start = Math.max(1, current - 2)
      const end = Math.min(last, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Methods
    const loadOrders = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await laboratoryStore.loadOrders({
          ...filters.value,
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage
        })
        
        orders.value = response.data
        pagination.value.total = response.total
        pagination.value.lastPage = response.last_page
      } catch (err) {
        error.value = err.message || 'Failed to load orders'
        console.error('Error loading orders:', err)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      pagination.value.currentPage = 1
      loadOrders()
    }

    const debouncedSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        applyFilters()
      }, 500)
    }

    const clearFilters = () => {
      filters.value = {
        status: '',
        patient: '',
        dateRange: '',
        priority: ''
      }
      applyFilters()
    }

    const setPage = (page) => {
      pagination.value.currentPage = page
      loadOrders()
    }

    const previousPage = () => {
      if (pagination.value.currentPage > 1) {
        setPage(pagination.value.currentPage - 1)
      }
    }

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.lastPage) {
        setPage(pagination.value.currentPage + 1)
      }
    }

    const goToPage = (page) => {
      setPage(page)
    }

    const createNewOrder = () => {
      router.push('/laboratory/orders/new')
    }

    const viewOrder = (id) => {
      router.push(`/laboratory/orders/${id}`)
    }

    const editOrder = (id) => {
      router.push(`/laboratory/orders/${id}/edit`)
    }

    const deleteOrder = async (id) => {
      if (confirm('Are you sure you want to delete this order?')) {
        try {
          loading.value = true
          await laboratoryStore.deleteOrder(id)
          await loadOrders()
        } catch (err) {
          error.value = err.message || 'Failed to delete order'
          console.error('Error deleting order:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const exportOrders = async () => {
      try {
        loading.value = true
        const response = await laboratoryStore.generateReport('orders', {
          ...filters.value,
          format: 'csv'
        })
        
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `laboratory-orders-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        error.value = err.message || 'Failed to export orders'
        console.error('Error exporting orders:', err)
      } finally {
        loading.value = false
      }
    }

    const getStatusClass = (status) => {
      return laboratoryHelpers.getStatusColor(status)
    }

    const getPriorityClass = (priority) => {
      const priorityClasses = {
        low: 'priority-low',
        normal: 'priority-normal',
        high: 'priority-high',
        urgent: 'priority-urgent',
        critical: 'priority-critical'
      }
      return priorityClasses[priority] || 'priority-normal'
    }

    const formatDate = (date) => {
      return laboratoryHelpers.formatDate(date)
    }

    const formatCurrency = (amount) => {
      return laboratoryHelpers.formatCurrency(amount)
    }

    const initialize = () => {
      loadOrders()
    }

    return {
      // State
      orders,
      loading,
      error,
      filters,
      pagination,
      
      // Computed
      hasActiveFilters,
      visiblePages,
      
      // Methods
      loadOrders,
      applyFilters,
      debouncedSearch,
      clearFilters,
      setPage,
      previousPage,
      nextPage,
      goToPage,
      createNewOrder,
      viewOrder,
      editOrder,
      deleteOrder,
      exportOrders,
      getStatusClass,
      getPriorityClass,
      formatDate,
      formatCurrency,
      initialize
    }
  }
}
