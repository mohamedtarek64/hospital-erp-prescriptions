import { ref, computed, onMounted } from 'vue'
import { usePayrollStore } from '@/stores/payroll'
import { useEmployeeStore } from '@/stores/employee'

/**
 * Composable for Payroll Management functionality
 * Handles payroll generation, processing, and management
 */
export function usePayrollManagement() {
  // Stores
  const payrollStore = usePayrollStore()
  const employeeStore = useEmployeeStore()

  // Reactive data
  const payrolls = ref([])
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Statistics
  const stats = ref({
    total_employees: 0,
    draft_payrolls: 0,
    approved_payrolls: 0,
    total_amount: 0
  })

  // Filters
  const filters = ref({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
    employee: ''
  })

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(20)

  // Modal state
  const showGenerateModal = ref(false)
  const showEditModal = ref(false)
  const selectedPayroll = ref(null)
  const payrollForm = ref({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employees: []
  })

  // Computed
  const filteredPayrolls = computed(() => {
    let filtered = payrolls.value

    if (filters.value.month) {
      filtered = filtered.filter(payroll => 
        payroll.month === parseInt(filters.value.month)
      )
    }

    if (filters.value.year) {
      filtered = filtered.filter(payroll => 
        payroll.year === parseInt(filters.value.year)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(payroll => 
        payroll.status === filters.value.status
      )
    }

    if (filters.value.employee) {
      filtered = filtered.filter(payroll => 
        payroll.employee_id === parseInt(filters.value.employee)
      )
    }

    return filtered
  })

  const paginatedPayrolls = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredPayrolls.value.slice(start, end)
  })

  // Methods
  const loadPayrolls = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await payrollStore.getPayrolls({
        page: currentPage.value,
        per_page: itemsPerPage.value,
        ...filters.value
      })
      payrolls.value = data.data
      totalPages.value = data.last_page
    } catch (err) {
      console.error('Error loading payrolls:', err)
      error.value = 'Failed to load payrolls'
    } finally {
      loading.value = false
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await employeeStore.getEmployees()
      employees.value = data.data
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  const loadStats = async () => {
    try {
      const data = await payrollStore.getPayrollStats()
      stats.value = data
    } catch (err) {
      console.error('Error loading payroll stats:', err)
    }
  }

  const generatePayroll = () => {
    payrollForm.value = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      employees: employees.value.map(emp => ({
        id: emp.id,
        name: emp.name,
        selected: true
      }))
    }
    showGenerateModal.value = true
  }

  const processPayrollGeneration = async () => {
    try {
      const selectedEmployees = payrollForm.value.employees
        .filter(emp => emp.selected)
        .map(emp => emp.id)

      await payrollStore.generatePayroll({
        month: payrollForm.value.month,
        year: payrollForm.value.year,
        employee_ids: selectedEmployees
      })
      closeModal()
      await loadPayrolls()
      await loadStats()
    } catch (err) {
      console.error('Error generating payroll:', err)
      error.value = 'Failed to generate payroll'
    }
  }

  const approvePayroll = async (payroll) => {
    if (confirm('Are you sure you want to approve this payroll?')) {
      try {
        await payrollStore.approvePayroll(payroll.id)
        await loadPayrolls()
        await loadStats()
      } catch (err) {
        console.error('Error approving payroll:', err)
        error.value = 'Failed to approve payroll'
      }
    }
  }

  const rejectPayroll = async (payroll) => {
    if (confirm('Are you sure you want to reject this payroll?')) {
      try {
        await payrollStore.rejectPayroll(payroll.id)
        await loadPayrolls()
        await loadStats()
      } catch (err) {
        console.error('Error rejecting payroll:', err)
        error.value = 'Failed to reject payroll'
      }
    }
  }

  const editPayroll = (payroll) => {
    selectedPayroll.value = payroll
    showEditModal.value = true
  }

  const updatePayroll = async () => {
    try {
      await payrollStore.updatePayroll(selectedPayroll.value.id, selectedPayroll.value)
      closeModal()
      await loadPayrolls()
    } catch (err) {
      console.error('Error updating payroll:', err)
      error.value = 'Failed to update payroll'
    }
  }

  const deletePayroll = async (payroll) => {
    if (confirm('Are you sure you want to delete this payroll?')) {
      try {
        await payrollStore.deletePayroll(payroll.id)
        await loadPayrolls()
        await loadStats()
      } catch (err) {
        console.error('Error deleting payroll:', err)
        error.value = 'Failed to delete payroll'
      }
    }
  }

  const exportPayroll = async () => {
    try {
      await payrollStore.exportPayrolls(filters.value)
    } catch (err) {
      console.error('Error exporting payroll:', err)
      error.value = 'Failed to export payroll'
    }
  }

  const applyFilters = () => {
    currentPage.value = 1
    loadPayrolls()
  }

  const clearFilters = () => {
    filters.value = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: '',
      employee: ''
    }
    applyFilters()
  }

  const closeModal = () => {
    showGenerateModal.value = false
    showEditModal.value = false
    selectedPayroll.value = null
    payrollForm.value = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      employees: []
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadPayrolls()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadPayrolls()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadPayrolls()
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      paid: 'status-paid'
    }
    return statusClasses[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTexts = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Paid'
    }
    return statusTexts[status] || status
  }

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }

  // Lifecycle
  onMounted(() => {
    loadPayrolls()
    loadEmployees()
    loadStats()
  })

  return {
    // State
    payrolls,
    employees,
    stats,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    showGenerateModal,
    showEditModal,
    selectedPayroll,
    payrollForm,
    loading,
    error,

    // Computed
    filteredPayrolls,
    paginatedPayrolls,

    // Methods
    loadPayrolls,
    loadEmployees,
    loadStats,
    generatePayroll,
    processPayrollGeneration,
    approvePayroll,
    rejectPayroll,
    editPayroll,
    updatePayroll,
    deletePayroll,
    exportPayroll,
    applyFilters,
    clearFilters,
    closeModal,
    previousPage,
    nextPage,
    goToPage,
    formatCurrency,
    formatDate,
    getStatusClass,
    getStatusText,
    getMonthName
  }
}
