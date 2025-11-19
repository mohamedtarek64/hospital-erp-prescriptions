import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employee'

/**
 * Composable for Employee Directory functionality
 * Handles employee listing, filtering, and CRUD operations
 */
export function useEmployeeDirectory() {
  // Store
  const employeeStore = useEmployeeStore()

  // Reactive data
  const employees = ref([])
  const departments = ref([])
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters and pagination
  const filters = ref({
    search: '',
    department: '',
    status: ''
  })

  const currentPage = ref(1)
  const totalPages = ref(1)

  // Modal state
  const showAddForm = ref(false)
  const showEditForm = ref(false)
  const selectedEmployee = ref(null)

  // Form data
  const employeeForm = ref({
    employee_id: '',
    user_id: '',
    department_id: '',
    designation: '',
    hire_date: '',
    salary: '',
    employment_type: 'full_time'
  })

  // Computed
  const filteredEmployees = computed(() => {
    let filtered = employees.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(search) ||
        employee.employee_id.toLowerCase().includes(search) ||
        employee.designation.toLowerCase().includes(search)
      )
    }

    if (filters.value.department) {
      filtered = filtered.filter(employee =>
        employee.department_id === parseInt(filters.value.department)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(employee =>
        employee.status === filters.value.status
      )
    }

    return filtered
  })

  // Methods
  const loadEmployees = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await employeeStore.getEmployees({
        page: currentPage.value,
        ...filters.value
      })
      employees.value = data.data
      totalPages.value = data.last_page
    } catch (err) {
      console.error('Error loading employees:', err)
      error.value = 'Failed to load employees'
    } finally {
      loading.value = false
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await employeeStore.getDepartments()
      departments.value = data
    } catch (err) {
      console.error('Error loading departments:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await employeeStore.getUsers()
      users.value = data
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const applyFilters = () => {
    currentPage.value = 1
    loadEmployees()
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      department: '',
      status: ''
    }
    applyFilters()
  }

  const viewEmployee = (employee) => {
    // Navigate to employee details
    console.log('View employee:', employee)
  }

  const editEmployee = (employee) => {
    selectedEmployee.value = employee
    employeeForm.value = { ...employee }
    showEditForm.value = true
  }

  const deleteEmployee = async (employee) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeStore.deleteEmployee(employee.id)
        await loadEmployees()
      } catch (err) {
        console.error('Error deleting employee:', err)
        error.value = 'Failed to delete employee'
      }
    }
  }

  const saveEmployee = async () => {
    try {
      if (showAddForm.value) {
        await employeeStore.createEmployee(employeeForm.value)
      } else {
        await employeeStore.updateEmployee(selectedEmployee.value.id, employeeForm.value)
      }
      closeModal()
      await loadEmployees()
    } catch (err) {
      console.error('Error saving employee:', err)
      error.value = 'Failed to save employee'
    }
  }

  const closeModal = () => {
    showAddForm.value = false
    showEditForm.value = false
    selectedEmployee.value = null
    employeeForm.value = {
      employee_id: '',
      user_id: '',
      department_id: '',
      designation: '',
      hire_date: '',
      salary: '',
      employment_type: 'full_time'
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadEmployees()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadEmployees()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadEmployees()
    }
  }

  // Lifecycle
  onMounted(() => {
    loadEmployees()
    loadDepartments()
    loadUsers()
  })

  return {
    // State
    employees,
    departments,
    users,
    filters,
    currentPage,
    totalPages,
    showAddForm,
    showEditForm,
    employeeForm,
    selectedEmployee,
    loading,
    error,

    // Computed
    filteredEmployees,

    // Methods
    loadEmployees,
    loadDepartments,
    loadUsers,
    applyFilters,
    clearFilters,
    viewEmployee,
    editEmployee,
    deleteEmployee,
    saveEmployee,
    closeModal,
    previousPage,
    nextPage,
    goToPage
  }
}
