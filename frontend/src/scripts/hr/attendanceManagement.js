import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useEmployeeStore } from '@/stores/employee'

/**
 * Composable for Attendance Management functionality
 * Handles attendance tracking, reporting, and management
 */
export function useAttendanceManagement() {
  // Stores
  const attendanceStore = useAttendanceStore()
  const employeeStore = useEmployeeStore()

  // Reactive data
  const attendanceRecords = ref([])
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Statistics
  const stats = ref({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  })

  // Filters
  const filters = ref({
    date: new Date().toISOString().split('T')[0],
    department: '',
    employee: '',
    status: ''
  })

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(20)

  // Modal state
  const showMarkAttendanceModal = ref(false)
  const selectedEmployee = ref(null)
  const attendanceForm = ref({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present',
    notes: ''
  })

  // Computed
  const filteredRecords = computed(() => {
    let filtered = attendanceRecords.value

    if (filters.value.date) {
      filtered = filtered.filter(record => 
        record.date === filters.value.date
      )
    }

    if (filters.value.department) {
      filtered = filtered.filter(record => 
        record.employee?.department_id === parseInt(filters.value.department)
      )
    }

    if (filters.value.employee) {
      filtered = filtered.filter(record => 
        record.employee_id === parseInt(filters.value.employee)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(record => 
        record.status === filters.value.status
      )
    }

    return filtered
  })

  const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredRecords.value.slice(start, end)
  })

  // Methods
  const loadAttendanceRecords = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await attendanceStore.getAttendanceRecords({
        page: currentPage.value,
        per_page: itemsPerPage.value,
        ...filters.value
      })
      attendanceRecords.value = data.data
      totalPages.value = data.last_page
    } catch (err) {
      console.error('Error loading attendance records:', err)
      error.value = 'Failed to load attendance records'
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
      const data = await attendanceStore.getAttendanceStats(filters.value.date)
      stats.value = data
    } catch (err) {
      console.error('Error loading attendance stats:', err)
    }
  }

  const markAttendance = (employee) => {
    selectedEmployee.value = employee
    attendanceForm.value = {
      employee_id: employee.id,
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
      status: 'present',
      notes: ''
    }
    showMarkAttendanceModal.value = true
  }

  const saveAttendance = async () => {
    try {
      await attendanceStore.createAttendanceRecord(attendanceForm.value)
      closeModal()
      await loadAttendanceRecords()
      await loadStats()
    } catch (err) {
      console.error('Error saving attendance:', err)
      error.value = 'Failed to save attendance record'
    }
  }

  const updateAttendance = async (record) => {
    try {
      await attendanceStore.updateAttendanceRecord(record.id, record)
      await loadAttendanceRecords()
      await loadStats()
    } catch (err) {
      console.error('Error updating attendance:', err)
      error.value = 'Failed to update attendance record'
    }
  }

  const deleteAttendance = async (record) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceStore.deleteAttendanceRecord(record.id)
        await loadAttendanceRecords()
        await loadStats()
      } catch (err) {
        console.error('Error deleting attendance:', err)
        error.value = 'Failed to delete attendance record'
      }
    }
  }

  const exportAttendance = async () => {
    try {
      await attendanceStore.exportAttendanceRecords(filters.value)
    } catch (err) {
      console.error('Error exporting attendance:', err)
      error.value = 'Failed to export attendance records'
    }
  }

  const applyFilters = () => {
    currentPage.value = 1
    loadAttendanceRecords()
    loadStats()
  }

  const clearFilters = () => {
    filters.value = {
      date: new Date().toISOString().split('T')[0],
      department: '',
      employee: '',
      status: ''
    }
    applyFilters()
  }

  const closeModal = () => {
    showMarkAttendanceModal.value = false
    selectedEmployee.value = null
    attendanceForm.value = {
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
      status: 'present',
      notes: ''
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadAttendanceRecords()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadAttendanceRecords()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadAttendanceRecords()
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return '--'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      present: 'status-present',
      absent: 'status-absent',
      late: 'status-late',
      half_day: 'status-half-day'
    }
    return statusClasses[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTexts = {
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      half_day: 'Half Day'
    }
    return statusTexts[status] || status
  }

  // Lifecycle
  onMounted(() => {
    loadAttendanceRecords()
    loadEmployees()
    loadStats()
  })

  return {
    // State
    attendanceRecords,
    employees,
    stats,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    showMarkAttendanceModal,
    selectedEmployee,
    attendanceForm,
    loading,
    error,

    // Computed
    filteredRecords,
    paginatedRecords,

    // Methods
    loadAttendanceRecords,
    loadEmployees,
    loadStats,
    markAttendance,
    saveAttendance,
    updateAttendance,
    deleteAttendance,
    exportAttendance,
    applyFilters,
    clearFilters,
    closeModal,
    previousPage,
    nextPage,
    goToPage,
    formatTime,
    getStatusClass,
    getStatusText
  }
}
