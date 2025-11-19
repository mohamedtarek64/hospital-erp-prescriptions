/**
 * Ward Management Store
 * Manages ward, room, and bed data and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useWardManagementStore = defineStore('wardManagement', () => {
  // State
  const wards = ref([])
  const rooms = ref([])
  const beds = ref([])
  const admissions = ref([])
  const housekeepingTasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeWards = computed(() => 
    wards.value.filter(ward => ward.status === 'active')
  )

  const availableBeds = computed(() => 
    beds.value.filter(bed => bed.status === 'available')
  )

  const occupiedBeds = computed(() => 
    beds.value.filter(bed => bed.status === 'occupied')
  )

  const totalCapacity = computed(() => 
    wards.value.reduce((total, ward) => total + (ward.capacity || 0), 0)
  )

  const totalOccupancy = computed(() => 
    occupiedBeds.value.length
  )

  const occupancyRate = computed(() => {
    if (totalCapacity.value === 0) return 0
    return Math.round((totalOccupancy.value / totalCapacity.value) * 100)
  })

  const wardStatistics = computed(() => {
    return wards.value.map(ward => {
      const wardBeds = beds.value.filter(bed => bed.room?.ward_id === ward.id)
      const occupiedBedsCount = wardBeds.filter(bed => bed.status === 'occupied').length
      const availableBedsCount = wardBeds.filter(bed => bed.status === 'available').length
      
      return {
        ...ward,
        totalBeds: wardBeds.length,
        occupiedBeds: occupiedBedsCount,
        availableBeds: availableBedsCount,
        occupancyRate: ward.capacity > 0 ? Math.round((occupiedBedsCount / ward.capacity) * 100) : 0
      }
    })
  })

  // Actions
  const fetchWards = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.get('/api/ward-management/wards')
      wards.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحميل الأجنحة'
      console.error('Error fetching wards:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRooms = async (wardId = null) => {
    try {
      loading.value = true
      error.value = null
      const url = wardId ? `/api/wards/${wardId}/rooms` : '/api/rooms'
      const response = await apiClient.get(url)
      rooms.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحميل الغرف'
      console.error('Error fetching rooms:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBeds = async (roomId = null) => {
    try {
      loading.value = true
      error.value = null
      const url = roomId ? `/api/rooms/${roomId}/beds` : '/api/beds'
      const response = await apiClient.get(url)
      beds.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحميل الأسرة'
      console.error('Error fetching beds:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAdmissions = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.get('/api/ward-management/admissions')
      admissions.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحميل القبولات'
      console.error('Error fetching admissions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchHousekeepingTasks = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.get('/api/housekeeping-tasks')
      housekeepingTasks.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحميل مهام النظافة'
      console.error('Error fetching housekeeping tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createWard = async (wardData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post('/api/wards', wardData)
      wards.value.push(response.data.data || response.data)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء الجناح'
      console.error('Error creating ward:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWard = async (wardId, wardData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.put(`/api/wards/${wardId}`, wardData)
      const index = wards.value.findIndex(ward => ward.id === wardId)
      if (index !== -1) {
        wards.value[index] = response.data.data || response.data
      }
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث الجناح'
      console.error('Error updating ward:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWard = async (wardId) => {
    try {
      loading.value = true
      error.value = null
      await apiClient.delete(`/api/wards/${wardId}`)
      wards.value = wards.value.filter(ward => ward.id !== wardId)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الجناح'
      console.error('Error deleting ward:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRoom = async (roomData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post('/api/rooms', roomData)
      rooms.value.push(response.data.data || response.data)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء الغرفة'
      console.error('Error creating room:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRoom = async (roomId, roomData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.put(`/api/rooms/${roomId}`, roomData)
      const index = rooms.value.findIndex(room => room.id === roomId)
      if (index !== -1) {
        rooms.value[index] = response.data.data || response.data
      }
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث الغرفة'
      console.error('Error updating room:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRoom = async (roomId) => {
    try {
      loading.value = true
      error.value = null
      await apiClient.delete(`/api/rooms/${roomId}`)
      rooms.value = rooms.value.filter(room => room.id !== roomId)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الغرفة'
      console.error('Error deleting room:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createBed = async (bedData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post('/api/ward-management/beds', bedData)
      beds.value.push(response.data.data || response.data)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء السرير'
      console.error('Error creating bed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBed = async (bedId, bedData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.put(`/api/ward-management/beds/${bedId}`, bedData)
      const index = beds.value.findIndex(bed => bed.id === bedId)
      if (index !== -1) {
        beds.value[index] = response.data.data || response.data
      }
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث السرير'
      console.error('Error updating bed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBed = async (bedId) => {
    try {
      loading.value = true
      error.value = null
      await apiClient.delete(`/api/ward-management/beds/${bedId}`)
      beds.value = beds.value.filter(bed => bed.id !== bedId)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف السرير'
      console.error('Error deleting bed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignBed = async (bedId, patientId) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post(`/api/ward-management/beds/${bedId}/assign`, {
        patient_id: patientId
      })
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'occupied'
        beds.value[bedIndex].patient_id = patientId
      }
      
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تعيين السرير'
      console.error('Error assigning bed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const releaseBed = async (bedId) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post(`/api/ward-management/beds/${bedId}/release`)
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'available'
        beds.value[bedIndex].patient_id = null
      }
      
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إخلاء السرير'
      console.error('Error releasing bed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAdmission = async (admissionData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post('/api/ward-management/admissions', admissionData)
      admissions.value.push(response.data.data || response.data)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء القبول'
      console.error('Error creating admission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAdmission = async (admissionId, admissionData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.put(`/api/ward-management/admissions/${admissionId}`, admissionData)
      const index = admissions.value.findIndex(admission => admission.id === admissionId)
      if (index !== -1) {
        admissions.value[index] = response.data.data || response.data
      }
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث القبول'
      console.error('Error updating admission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const dischargePatient = async (admissionId, dischargeData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post(`/api/ward-management/admissions/${admissionId}/discharge`, dischargeData)
      
      // Update admission status
      const admissionIndex = admissions.value.findIndex(admission => admission.id === admissionId)
      if (admissionIndex !== -1) {
        admissions.value[admissionIndex].status = 'discharged'
        admissions.value[admissionIndex].discharge_date = dischargeData.discharge_date
        admissions.value[admissionIndex].discharge_time = dischargeData.discharge_time
      }
      
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في خروج المريض'
      console.error('Error discharging patient:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createHousekeepingTask = async (taskData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post('/api/housekeeping-tasks', taskData)
      housekeepingTasks.value.push(response.data.data || response.data)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء مهمة النظافة'
      console.error('Error creating housekeeping task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHousekeepingTask = async (taskId, taskData) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.put(`/api/housekeeping-tasks/${taskId}`, taskData)
      const index = housekeepingTasks.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        housekeepingTasks.value[index] = response.data.data || response.data
      }
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث مهمة النظافة'
      console.error('Error updating housekeeping task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeHousekeepingTask = async (taskId) => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.post(`/api/housekeeping-tasks/${taskId}/complete`)
      
      // Update task status
      const taskIndex = housekeepingTasks.value.findIndex(task => task.id === taskId)
      if (taskIndex !== -1) {
        housekeepingTasks.value[taskIndex].status = 'completed'
        housekeepingTasks.value[taskIndex].completed_date = new Date().toISOString()
      }
      
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إكمال مهمة النظافة'
      console.error('Error completing housekeeping task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    wards.value = []
    rooms.value = []
    beds.value = []
    admissions.value = []
    housekeepingTasks.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    wards,
    rooms,
    beds,
    admissions,
    housekeepingTasks,
    loading,
    error,
    
    // Getters
    activeWards,
    availableBeds,
    occupiedBeds,
    totalCapacity,
    totalOccupancy,
    occupancyRate,
    wardStatistics,
    
    // Actions
    fetchWards,
    fetchRooms,
    fetchBeds,
    fetchAdmissions,
    fetchHousekeepingTasks,
    createWard,
    updateWard,
    deleteWard,
    createRoom,
    updateRoom,
    deleteRoom,
    createBed,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed,
    createAdmission,
    updateAdmission,
    dischargePatient,
    createHousekeepingTask,
    updateHousekeepingTask,
    completeHousekeepingTask,
    clearError,
    resetStore
  }
})
