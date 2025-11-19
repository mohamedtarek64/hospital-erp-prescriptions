import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useAttendanceStore = defineStore('attendance', () => {
  // State
  const attendanceRecords = ref([])
  const employees = ref([])
  const statistics = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const todayAttendance = computed(() => 
    attendanceRecords.value.filter(record => 
      new Date(record.date).toDateString() === new Date().toDateString()
    )
  )

  const presentToday = computed(() => 
    todayAttendance.value.filter(record => record.status === 'present').length
  )

  const absentToday = computed(() => 
    todayAttendance.value.filter(record => record.status === 'absent').length
  )

  // Actions
  const getAttendanceRecords = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/attendance', { params: filters })
      attendanceRecords.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load attendance records'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStatistics = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/attendance/statistics', { params: filters })
      statistics.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load attendance statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTodaySummary = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/attendance/today-summary')
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load today summary'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployees = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/employees')
      employees.value = response.data.data.data
      return response.data.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employees'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAttendance = async (attendanceData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/attendance', attendanceData)
      attendanceRecords.value.unshift(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create attendance record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAttendance = async (id, attendanceData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/hr/attendance/${id}`, attendanceData)
      const index = attendanceRecords.value.findIndex(record => record.id === id)
      if (index !== -1) {
        attendanceRecords.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update attendance record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAttendance = async (id) => {
    try {
      loading.value = true
      await apiClient.delete(`/hr/attendance/${id}`)
      attendanceRecords.value = attendanceRecords.value.filter(record => record.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete attendance record'
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkIn = async (employeeId, date = null) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/attendance/check-in', {
        employee_id: employeeId,
        date: date
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to check in'
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkOut = async (employeeId, date = null) => {
    try {
      loading.value = true
      const response = await apiClient.post('/hr/attendance/check-out', {
        employee_id: employeeId,
        date: date
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to check out'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEmployeeAttendance = async (employeeId, filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/attendance/employee/${employeeId}`, { params: filters })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load employee attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAttendanceTrends = async (employeeId, months = 6) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/hr/attendance/trends/${employeeId}`, { 
        params: { months } 
      })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load attendance trends'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportAttendance = async (filters = {}) => {
    try {
      loading.value = true
      const response = await apiClient.get('/hr/attendance/export', { 
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to export attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    attendanceRecords,
    employees,
    statistics,
    loading,
    error,
    
    // Getters
    todayAttendance,
    presentToday,
    absentToday,
    
    // Actions
    getAttendanceRecords,
    getStatistics,
    getTodaySummary,
    getEmployees,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    checkIn,
    checkOut,
    getEmployeeAttendance,
    getAttendanceTrends,
    exportAttendance,
    clearError
  }
})
