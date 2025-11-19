import { ref, onMounted, computed } from 'vue'
import { useStaffStore } from '@/stores/staff'

export function useStaff() {
  const staffStore = useStaffStore()
  const searchQuery = ref('')
  const selectedDepartment = ref('all')
  const selectedRole = ref('all')

  const loadStaff = async () => {
    try {
      await staffStore.fetchStaff()
    } catch (error) {
      console.error('Error loading staff:', error)
    }
  }

  const addStaff = async (staffData) => {
    try {
      const result = await staffStore.createStaff(staffData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding staff:', error)
      throw error
    }
  }

  const updateStaff = async (id, staffData) => {
    try {
      const result = await staffStore.updateStaff(id, staffData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating staff:', error)
      throw error
    }
  }

  const deleteStaff = async (id) => {
    try {
      const result = await staffStore.deleteStaff(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting staff:', error)
      throw error
    }
  }

  const toggleStaffStatus = async (id) => {
    try {
      const result = await staffStore.toggleStaffStatus(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error toggling staff status:', error)
      throw error
    }
  }

  const filteredStaff = computed(() => {
    let filtered = staffStore.staff

    if (searchQuery.value) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    if (selectedDepartment.value !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment.value)
    }

    if (selectedRole.value !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole.value)
    }

    return filtered
  })

  const staffStats = computed(() => {
    return staffStore.stats
  })

  onMounted(() => {
    loadStaff()
  })

  return {
    staff: staffStore.staff,
    loading: staffStore.loading,
    error: staffStore.error,
    searchQuery,
    selectedDepartment,
    selectedRole,
    filteredStaff,
    staffStats,
    loadStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus,
    clearError: staffStore.clearError
  }
}
