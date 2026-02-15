import { ref, computed, onMounted } from 'vue'
import { useWardManagementStore } from '@/stores/wardManagement'

export function useHousekeepingManagement() {
  const wardStore = useWardManagementStore()

  const searchQuery = ref('')
  const selectedWard = ref('')
  const selectedStatus = ref('')
  const selectedPriority = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(25)
  const showTaskModal = ref(false)
  const editingTask = ref(null)
  const selectedTask = ref(null)
  const isLoading = ref(false)
  const error = ref('')

  const tasks = computed(() => wardStore.housekeepingTasks)
  const wards = computed(() => wardStore.wards)
  const housekeepingStaff = computed(() => wardStore.housekeepingStaff)
  const housekeepingStats = computed(() => wardStore.housekeepingStats)

  const filteredTasks = computed(() => {
    let filtered = [...tasks.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assigned_to.name.toLowerCase().includes(query)
      )
    }

    if (selectedWard.value) {
      filtered = filtered.filter(task => task.ward.id === selectedWard.value)
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(task => task.status === selectedStatus.value)
    }

    if (selectedPriority.value) {
      filtered = filtered.filter(task => task.priority === selectedPriority.value)
    }

    return filtered
  })

  const totalTasks = computed(() => filteredTasks.value.length)
  const totalPages = computed(() => Math.ceil(totalTasks.value / itemsPerPage.value))
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalTasks.value))

  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages.value, start + maxVisible - 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    }
    return classes[priority] || 'priority-default'
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      in_progress: 'status-in-progress',
      completed: 'status-completed',
      overdue: 'status-overdue'
    }
    return classes[status] || 'status-default'
  }

  const showTaskForm = () => {
    editingTask.value = null
    showTaskModal.value = true
  }

  const closeTaskModal = () => {
    showTaskModal.value = false
    editingTask.value = null
  }

  const viewTask = (task) => {
    selectedTask.value = task
  }

  const closeTaskDetails = () => {
    selectedTask.value = null
  }

  const editTask = (task) => {
    editingTask.value = task
    showTaskModal.value = true
  }

  const completeTask = async (task) => {
    try {
      await wardStore.updateTaskStatus(task.id, 'completed')
      await refreshData()
    } catch (err) {
      console.error('Error completing task:', err)
    }
  }

  const deleteTask = async (task) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await wardStore.deleteTask(task.id)
        await refreshData()
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    }
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask.value) {
        await wardStore.updateTask(editingTask.value.id, taskData)
      } else {
        await wardStore.createTask(taskData)
      }
      closeTaskModal()
      await refreshData()
    } catch (err) {
      console.error('Error saving task:', err)
    }
  }

  const onSearch = () => {
    currentPage.value = 1
  }

  const onWardChange = () => {
    currentPage.value = 1
  }

  const onStatusChange = () => {
    currentPage.value = 1
  }

  const onPriorityChange = () => {
    currentPage.value = 1
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const refreshData = async () => {
    isLoading.value = true
    error.value = ''
    
    try {
      await Promise.all([
        wardStore.fetchHousekeepingTasks(),
        wardStore.fetchWards(),
        wardStore.fetchHousekeepingStaff(),
        wardStore.fetchHousekeepingStats()
      ])
    } catch (err) {
      error.value = 'Failed to load housekeeping data'
      console.error('Error refreshing data:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    refreshData()
  })

  return {
    searchQuery,
    selectedWard,
    selectedStatus,
    selectedPriority,
    currentPage,
    showTaskModal,
    editingTask,
    selectedTask,
    isLoading,
    error,
    tasks,
    wards,
    housekeepingStaff,
    housekeepingStats,
    filteredTasks,
    totalTasks,
    totalPages,
    startIndex,
    endIndex,
    visiblePages,
    formatDate,
    formatTime,
    getPriorityClass,
    getStatusClass,
    showTaskForm,
    closeTaskModal,
    viewTask,
    closeTaskDetails,
    editTask,
    completeTask,
    deleteTask,
    handleTaskSubmit,
    onSearch,
    onWardChange,
    onStatusChange,
    onPriorityChange,
    goToPage,
    refreshData
  }
}
