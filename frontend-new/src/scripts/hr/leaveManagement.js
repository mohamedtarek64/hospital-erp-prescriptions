import { ref, computed, onMounted } from 'vue'
import { useLeaveStore } from '@/stores/leave'
import { useEmployeeStore } from '@/stores/employee'

/**
 * Composable for Leave Management functionality
 * Handles leave requests, approvals, and management
 */
export function useLeaveManagement() {
  // Stores
  const leaveStore = useLeaveStore()
  const employeeStore = useEmployeeStore()

  // Reactive data
  const leaveRequests = ref([])
  const leaveTypes = ref([])
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Statistics
  const stats = ref({
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    total_days_taken: 0
  })

  // Filters
  const filters = ref({
    status: '',
    leave_type: '',
    employee: '',
    date_from: '',
    date_to: ''
  })

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(20)

  // Modal state
  const showRequestForm = ref(false)
  const showApprovalModal = ref(false)
  const selectedRequest = ref(null)
  const leaveForm = ref({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  const approvalForm = ref({
    status: 'approved',
    comments: ''
  })

  // Computed
  const filteredRequests = computed(() => {
    let filtered = leaveRequests.value

    if (filters.value.status) {
      filtered = filtered.filter(request => 
        request.status === filters.value.status
      )
    }

    if (filters.value.leave_type) {
      filtered = filtered.filter(request => 
        request.leave_type_id === parseInt(filters.value.leave_type)
      )
    }

    if (filters.value.employee) {
      filtered = filtered.filter(request => 
        request.employee_id === parseInt(filters.value.employee)
      )
    }

    if (filters.value.date_from) {
      filtered = filtered.filter(request => 
        new Date(request.start_date) >= new Date(filters.value.date_from)
      )
    }

    if (filters.value.date_to) {
      filtered = filtered.filter(request => 
        new Date(request.end_date) <= new Date(filters.value.date_to)
      )
    }

    return filtered
  })

  const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredRequests.value.slice(start, end)
  })

  // Methods
  const loadLeaveRequests = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await leaveStore.getLeaveRequests({
        page: currentPage.value,
        per_page: itemsPerPage.value,
        ...filters.value
      })
      leaveRequests.value = data.data
      totalPages.value = data.last_page
    } catch (err) {
      console.error('Error loading leave requests:', err)
      error.value = 'Failed to load leave requests'
    } finally {
      loading.value = false
    }
  }

  const loadLeaveTypes = async () => {
    try {
      const data = await leaveStore.getLeaveTypes()
      leaveTypes.value = data
    } catch (err) {
      console.error('Error loading leave types:', err)
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
      const data = await leaveStore.getLeaveStats()
      stats.value = data
    } catch (err) {
      console.error('Error loading leave stats:', err)
    }
  }

  const submitLeaveRequest = async () => {
    try {
      await leaveStore.createLeaveRequest(leaveForm.value)
      closeModal()
      await loadLeaveRequests()
      await loadStats()
    } catch (err) {
      console.error('Error submitting leave request:', err)
      error.value = 'Failed to submit leave request'
    }
  }

  const approveLeaveRequest = async (request) => {
    selectedRequest.value = request
    approvalForm.value = {
      status: 'approved',
      comments: ''
    }
    showApprovalModal.value = true
  }

  const rejectLeaveRequest = async (request) => {
    selectedRequest.value = request
    approvalForm.value = {
      status: 'rejected',
      comments: ''
    }
    showApprovalModal.value = true
  }

  const processApproval = async () => {
    try {
      await leaveStore.updateLeaveRequest(selectedRequest.value.id, {
        status: approvalForm.value.status,
        approval_comments: approvalForm.value.comments
      })
      closeModal()
      await loadLeaveRequests()
      await loadStats()
    } catch (err) {
      console.error('Error processing approval:', err)
      error.value = 'Failed to process approval'
    }
  }

  const deleteLeaveRequest = async (request) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveStore.deleteLeaveRequest(request.id)
        await loadLeaveRequests()
        await loadStats()
      } catch (err) {
        console.error('Error deleting leave request:', err)
        error.value = 'Failed to delete leave request'
      }
    }
  }

  const applyFilters = () => {
    currentPage.value = 1
    loadLeaveRequests()
  }

  const clearFilters = () => {
    filters.value = {
      status: '',
      leave_type: '',
      employee: '',
      date_from: '',
      date_to: ''
    }
    applyFilters()
  }

  const closeModal = () => {
    showRequestForm.value = false
    showApprovalModal.value = false
    selectedRequest.value = null
    leaveForm.value = {
      employee_id: '',
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: '',
      emergency_contact: '',
      emergency_phone: ''
    }
    approvalForm.value = {
      status: 'approved',
      comments: ''
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadLeaveRequests()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadLeaveRequests()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadLeaveRequests()
    }
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
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled'
    }
    return statusClasses[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    }
    return statusTexts[status] || status
  }

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  // Lifecycle
  onMounted(() => {
    loadLeaveRequests()
    loadLeaveTypes()
    loadEmployees()
    loadStats()
  })

  return {
    // State
    leaveRequests,
    leaveTypes,
    employees,
    stats,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    showRequestForm,
    showApprovalModal,
    selectedRequest,
    leaveForm,
    approvalForm,
    loading,
    error,

    // Computed
    filteredRequests,
    paginatedRequests,

    // Methods
    loadLeaveRequests,
    loadLeaveTypes,
    loadEmployees,
    loadStats,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    processApproval,
    deleteLeaveRequest,
    applyFilters,
    clearFilters,
    closeModal,
    previousPage,
    nextPage,
    goToPage,
    formatDate,
    getStatusClass,
    getStatusText,
    calculateDays
  }
}
