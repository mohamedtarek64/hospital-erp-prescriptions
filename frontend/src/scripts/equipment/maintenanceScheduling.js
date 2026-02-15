import { ref, computed, onMounted } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance.js'
import { useEquipmentStore } from '@/stores/equipment.js'

export function useMaintenanceScheduling() {
  const maintenanceStore = useMaintenanceStore()
  const equipmentStore = useEquipmentStore()

  // Reactive state
  const viewMode = ref('list')
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const selectedPriority = ref('')
  const selectedEquipment = ref('')
  const sortBy = ref('scheduled_date')
  const showScheduleModal = ref(false)
  const selectedSchedule = ref(null)
  const currentDate = ref(new Date())

  const newSchedule = ref({
    equipment_id: '',
    maintenance_type: '',
    scheduled_date: '',
    priority: 'medium',
    description: '',
    assigned_to: ''
  })

  // Mock data for technicians
  const technicians = ref([
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Wilson' },
    { id: 4, name: 'Emily Davis' }
  ])

  // Computed properties
  const schedules = computed(() => maintenanceStore.schedules)
  const equipmentList = computed(() => equipmentStore.equipment)

  const filteredSchedules = computed(() => {
    let filtered = schedules.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(schedule => 
        schedule.equipment?.name.toLowerCase().includes(query) ||
        schedule.maintenance_type.toLowerCase().includes(query) ||
        schedule.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (selectedStatus.value) {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus.value)
    }

    // Apply priority filter
    if (selectedPriority.value) {
      filtered = filtered.filter(schedule => schedule.priority === selectedPriority.value)
    }

    // Apply equipment filter
    if (selectedEquipment.value) {
      filtered = filtered.filter(schedule => schedule.equipment_id === selectedEquipment.value)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'scheduled_date':
          return new Date(a.scheduled_date) - new Date(b.scheduled_date)
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        case 'equipment_name':
          return a.equipment?.name.localeCompare(b.equipment?.name)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  })

  const scheduledMaintenance = computed(() => maintenanceStore.scheduledMaintenance.length)
  const overdueMaintenance = computed(() => maintenanceStore.overdueMaintenance.length)
  const completedThisMonth = computed(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return schedules.value.filter(schedule => 
      schedule.status === 'completed' && 
      new Date(schedule.completed_at) >= startOfMonth
    ).length
  })
  const criticalMaintenance = computed(() => maintenanceStore.criticalMaintenance.length)

  const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  })

  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    // const lastDay = new Date(year, month + 1, 0) // Unused variable
    // const daysInMonth = lastDay.getDate() // Unused variable
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const daySchedules = schedules.value.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduled_date)
        return scheduleDate.toDateString() === date.toDateString()
      })

      days.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        schedules: daySchedules
      })
    }

    return days
  })

  // Methods
  const refreshSchedules = async () => {
    try {
      await Promise.all([
        maintenanceStore.fetchSchedules(),
        equipmentStore.fetchEquipment()
      ])
    } catch (error) {
      console.error('Error refreshing schedules:', error)
    }
  }

  const searchSchedules = () => {
    // Search is handled by computed property
  }

  const filterSchedules = () => {
    // Filtering is handled by computed property
  }

  const sortSchedules = () => {
    // Sorting is handled by computed property
  }

  const createSchedule = async () => {
    try {
      await maintenanceStore.createSchedule(newSchedule.value)
      showScheduleModal.value = false
      resetNewSchedule()
      await refreshSchedules()
    } catch (error) {
      console.error('Error creating schedule:', error)
    }
  }

  const resetNewSchedule = () => {
    newSchedule.value = {
      equipment_id: '',
      maintenance_type: '',
      scheduled_date: '',
      priority: 'medium',
      description: '',
      assigned_to: ''
    }
  }

  const viewSchedule = (schedule) => {
    selectedSchedule.value = schedule
  }

  const editSchedule = (schedule) => {
    // Navigate to edit page or open edit modal
    console.log('Edit schedule:', schedule)
  }

  const startMaintenance = async (schedule) => {
    try {
      await maintenanceStore.startMaintenance(schedule.id)
      await refreshSchedules()
    } catch (error) {
      console.error('Error starting maintenance:', error)
    }
  }

  const completeMaintenance = async (schedule) => {
    try {
      const recordData = {
        notes: 'Maintenance completed successfully',
        parts_used: [],
        cost: 0
      }
      await maintenanceStore.completeMaintenance(schedule.id, recordData)
      await refreshSchedules()
    } catch (error) {
      console.error('Error completing maintenance:', error)
    }
  }

  const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }

  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  // Lifecycle
  onMounted(async () => {
    await refreshSchedules()
  })

  return {
    // State
    viewMode,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedEquipment,
    sortBy,
    showScheduleModal,
    selectedSchedule,
    currentDate,
    newSchedule,
    technicians,
    
    // Computed
    schedules,
    equipmentList,
    filteredSchedules,
    scheduledMaintenance,
    overdueMaintenance,
    completedThisMonth,
    criticalMaintenance,
    currentMonthYear,
    calendarDays,
    
    // Methods
    refreshSchedules,
    searchSchedules,
    filterSchedules,
    sortSchedules,
    createSchedule,
    viewSchedule,
    editSchedule,
    startMaintenance,
    completeMaintenance,
    previousMonth,
    nextMonth,
    formatDate,
    formatDateTime
  }
}
