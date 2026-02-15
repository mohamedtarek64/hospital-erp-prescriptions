import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hrApi from '@/services/api/hrApi'

export const useStaffStore = defineStore('staff', () => {
  // State
  const staff = ref([])
  const currentStaff = ref(null)
  const loading = ref(false)
  const error = ref('')
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  })
  const filters = ref({
    search: '',
    department: '',
    role: '',
    status: ''
  })

  // Getters
  const totalStaff = computed(() => pagination.value.total)
  const hasStaff = computed(() => staff.value.length > 0)
  const isLoading = computed(() => loading.value)

  const stats = computed(() => {
    const doctors = staff.value.filter(s => s.role === 'doctor').length
    const nurses = staff.value.filter(s => s.role === 'nurse').length
    const admin = staff.value.filter(s => s.role === 'admin').length
    const active = staff.value.filter(s => s.status === 'active').length

    return { 
      doctors, 
      nurses, 
      admin, 
      active, 
      total: staff.value.length 
    }
  })

  // Actions
  const fetchStaff = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = ''
    
    try {
      const params = {
        page,
        per_page: limit,
        ...filters.value
      }
      
      const response = await hrApi.getEmployees(params)
      
      staff.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب الموظفين'
      console.error('Error fetching staff:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStaffMember = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await hrApi.getEmployee(id)
      
      currentStaff.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات الموظف'
      console.error('Error fetching staff member:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createStaff = async (staffData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await hrApi.createEmployee(staffData)
      
      // Add to staff list
      staff.value.unshift(response.data)
      pagination.value.total++
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء الموظف'
      console.error('Error creating staff:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateStaff = async (id, staffData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await hrApi.updateEmployee(id, staffData)
      
      // Update in staff list
      const index = staff.value.findIndex(s => s.id === id)
      if (index !== -1) {
        staff.value[index] = response.data
      }
      
      // Update current staff if it's the same
      if (currentStaff.value && currentStaff.value.id === id) {
        currentStaff.value = response.data
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث الموظف'
      console.error('Error updating staff:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteStaff = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      await hrApi.deleteEmployee(id)
      
      // Remove from staff list
      staff.value = staff.value.filter(s => s.id !== id)
      pagination.value.total--
      
      // Clear current staff if it's the same
      if (currentStaff.value && currentStaff.value.id === id) {
        currentStaff.value = null
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الموظف'
      console.error('Error deleting staff:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const toggleStaffStatus = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await hrApi.updateEmployee(id, { status: 'toggle' })
      
      // Update in staff list
      const index = staff.value.findIndex(s => s.id === id)
      if (index !== -1) {
        staff.value[index] = response.data
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تغيير حالة الموظف'
      console.error('Error toggling staff status:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    // Reset to first page when filters change
    pagination.value.current_page = 1
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      department: '',
      role: '',
      status: ''
    }
    pagination.value.current_page = 1
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentStaff = () => {
    currentStaff.value = null
  }

  return {
    // State
    staff,
    currentStaff,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    totalStaff,
    hasStaff,
    isLoading,
    stats,
    
    // Actions
    fetchStaff,
    fetchStaffMember,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus,
    updateFilters,
    clearFilters,
    clearError,
    clearCurrentStaff
  }
})
