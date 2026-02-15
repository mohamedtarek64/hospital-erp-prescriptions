import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useMaintenanceStore = defineStore('maintenance', () => {
  // State
  const schedules = ref([])
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalSchedules = computed(() => schedules.value.length)
  const scheduledMaintenance = computed(() => 
    schedules.value.filter(schedule => schedule.status === 'scheduled')
  )
  const overdueMaintenance = computed(() => 
    schedules.value.filter(schedule => {
      const scheduledDate = new Date(schedule.scheduled_date)
      const now = new Date()
      return scheduledDate < now && schedule.status === 'scheduled'
    })
  )
  const inProgressMaintenance = computed(() => 
    schedules.value.filter(schedule => schedule.status === 'in_progress')
  )
  const completedMaintenance = computed(() => 
    schedules.value.filter(schedule => schedule.status === 'completed')
  )
  const criticalMaintenance = computed(() => 
    schedules.value.filter(schedule => schedule.priority === 'critical')
  )

  // Actions
  const fetchSchedules = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/maintenance/schedules')
      schedules.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch maintenance schedules'
      console.error('Error fetching maintenance schedules:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRecords = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/maintenance/records')
      records.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch maintenance records'
      console.error('Error fetching maintenance records:', err)
    } finally {
      loading.value = false
    }
  }

  const createSchedule = async (scheduleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/maintenance/schedules', scheduleData)
      schedules.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create maintenance schedule'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchedule = async (id, scheduleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.put(`/api/maintenance/schedules/${id}`, scheduleData)
      const index = schedules.value.findIndex(schedule => schedule.id === id)
      if (index !== -1) {
        schedules.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update maintenance schedule'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSchedule = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete(`/api/maintenance/schedules/${id}`)
      schedules.value = schedules.value.filter(schedule => schedule.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete maintenance schedule'
      throw err
    } finally {
      loading.value = false
    }
  }

  const startMaintenance = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post(`/api/maintenance/schedules/${id}/start`)
      const index = schedules.value.findIndex(schedule => schedule.id === id)
      if (index !== -1) {
        schedules.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start maintenance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeMaintenance = async (id, recordData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post(`/api/maintenance/schedules/${id}/complete`, recordData)
      const index = schedules.value.findIndex(schedule => schedule.id === id)
      if (index !== -1) {
        schedules.value[index] = response.data.schedule
      }
      if (response.data.record) {
        records.value.push(response.data.record)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to complete maintenance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getScheduleById = (id) => {
    return schedules.value.find(schedule => schedule.id === id)
  }

  const getSchedulesByEquipment = (equipmentId) => {
    return schedules.value.filter(schedule => schedule.equipment_id === equipmentId)
  }

  const getSchedulesByDateRange = (startDate, endDate) => {
    return schedules.value.filter(schedule => {
      const scheduledDate = new Date(schedule.scheduled_date)
      return scheduledDate >= startDate && scheduledDate <= endDate
    })
  }

  const searchSchedules = (query) => {
    if (!query) return schedules.value
    return schedules.value.filter(schedule => 
      schedule.equipment?.name.toLowerCase().includes(query.toLowerCase()) ||
      schedule.maintenance_type.toLowerCase().includes(query.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(query.toLowerCase())
    )
  }

  const filterSchedulesByStatus = (status) => {
    if (!status) return schedules.value
    return schedules.value.filter(schedule => schedule.status === status)
  }

  const filterSchedulesByPriority = (priority) => {
    if (!priority) return schedules.value
    return schedules.value.filter(schedule => schedule.priority === priority)
  }

  const filterSchedulesByType = (type) => {
    if (!type) return schedules.value
    return schedules.value.filter(schedule => schedule.maintenance_type === type)
  }

  const getUpcomingMaintenance = (days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return schedules.value.filter(schedule => {
      const scheduledDate = new Date(schedule.scheduled_date)
      return scheduledDate >= now && scheduledDate <= futureDate && schedule.status === 'scheduled'
    })
  }

  return {
    // State
    schedules,
    records,
    loading,
    error,
    
    // Getters
    totalSchedules,
    scheduledMaintenance,
    overdueMaintenance,
    inProgressMaintenance,
    completedMaintenance,
    criticalMaintenance,
    
    // Actions
    fetchSchedules,
    fetchRecords,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    startMaintenance,
    completeMaintenance,
    getScheduleById,
    getSchedulesByEquipment,
    getSchedulesByDateRange,
    searchSchedules,
    filterSchedulesByStatus,
    filterSchedulesByPriority,
    filterSchedulesByType,
    getUpcomingMaintenance
  }
})
