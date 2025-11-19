import { ref, onMounted, computed } from 'vue'
import { usePatientsStore } from '@/stores/patients'

export function usePatients() {
  const patientsStore = usePatientsStore()
  const searchQuery = ref('')
  const selectedGender = ref('')
  const selectedBloodGroup = ref('')

  const loadPatients = async () => {
    try {
      await patientsStore.fetchPatients()
      await patientsStore.fetchPatientStats()
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const addPatient = async (patientData) => {
    try {
      const result = await patientsStore.createPatient(patientData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding patient:', error)
      throw error
    }
  }

  const updatePatient = async (id, patientData) => {
    try {
      const result = await patientsStore.updatePatient(id, patientData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating patient:', error)
      throw error
    }
  }

  const deletePatient = async (id) => {
    try {
      const result = await patientsStore.deletePatient(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw error
    }
  }

  const filteredPatients = computed(() => {
    let filtered = patientsStore.patients

    if (searchQuery.value) {
      filtered = filtered.filter(patient =>
        patient.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        patient.phone?.includes(searchQuery.value) ||
        patient.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    if (selectedGender.value) {
      filtered = filtered.filter(patient => patient.gender === selectedGender.value)
    }

    if (selectedBloodGroup.value) {
      filtered = filtered.filter(patient => patient.blood_group === selectedBloodGroup.value)
    }

    return filtered
  })

  // Statistics
  const todayPatientsCount = computed(() => {
    return patientsStore.stats.today || 0
  })

  const todayAppointmentsCount = computed(() => {
    // This would come from appointments API
    return 0
  })

  // Utility functions
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'غير محدد'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (date) => {
    if (!date) return 'غير محدد'
    return new Date(date).toLocaleDateString('ar-SA')
  }

  // Event handlers
  const handleSearch = () => {
    patientsStore.updateFilters({ search: searchQuery.value })
    patientsStore.fetchPatients()
  }

  const handleFilterChange = () => {
    patientsStore.updateFilters({ 
      gender: selectedGender.value,
      blood_group: selectedBloodGroup.value
    })
    patientsStore.fetchPatients()
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedGender.value = ''
    selectedBloodGroup.value = ''
    patientsStore.clearFilters()
    patientsStore.fetchPatients()
  }

  onMounted(() => {
    loadPatients()
  })

  return {
    patients: patientsStore.patients,
    loading: patientsStore.loading,
    error: patientsStore.error,
    searchQuery,
    selectedGender,
    selectedBloodGroup,
    filteredPatients,
    loadPatients,
    addPatient,
    updatePatient,
    deletePatient,
    clearError: patientsStore.clearError,
    clearFilters,
    handleSearch,
    handleFilterChange,
    todayPatientsCount,
    todayAppointmentsCount,
    calculateAge,
    formatDate
  }
}
