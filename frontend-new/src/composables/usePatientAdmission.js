import { ref, computed, onMounted } from 'vue'
import { useWardManagementStore } from '@/stores/wardManagement'

export function usePatientAdmission() {
  const wardStore = useWardManagementStore()

  const searchQuery = ref('')
  const selectedWard = ref('')
  const selectedStatus = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(25)
  const showAdmissionModal = ref(false)
  const selectedAdmission = ref(null)
  const isLoading = ref(false)
  const error = ref('')

  const admissions = computed(() => wardStore.admissions)
  const wards = computed(() => wardStore.wards)
  const availableBeds = computed(() => wardStore.availableBeds)
  const admissionStats = computed(() => wardStore.admissionStats)

  const filteredAdmissions = computed(() => {
    let filtered = [...admissions.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(admission =>
        admission.patient.name.toLowerCase().includes(query) ||
        admission.patient.patient_id.toLowerCase().includes(query)
      )
    }

    if (selectedWard.value) {
      filtered = filtered.filter(admission => admission.ward.id === selectedWard.value)
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(admission => admission.status === selectedStatus.value)
    }

    return filtered
  })

  const totalAdmissions = computed(() => filteredAdmissions.value.length)
  const totalPages = computed(() => Math.ceil(totalAdmissions.value / itemsPerPage.value))
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalAdmissions.value))

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

  const getStatusClass = (status) => {
    const classes = {
      admitted: 'status-admitted',
      pending: 'status-pending',
      discharged: 'status-discharged',
      transferred: 'status-transferred'
    }
    return classes[status] || 'status-default'
  }

  const showAdmissionForm = () => {
    showAdmissionModal.value = true
  }

  const closeAdmissionModal = () => {
    showAdmissionModal.value = false
  }

  const viewAdmission = (admission) => {
    selectedAdmission.value = admission
  }

  const closeAdmissionDetails = () => {
    selectedAdmission.value = null
  }

  const editAdmission = (admission) => {
    // Navigate to edit admission page or show edit modal
    console.log('Edit admission:', admission)
  }

  const transferPatient = (admission) => {
    // Show transfer form
    console.log('Transfer patient:', admission)
  }

  const dischargePatient = (admission) => {
    // Show discharge form
    console.log('Discharge patient:', admission)
  }

  const handleAdmissionSubmit = async (admissionData) => {
    try {
      await wardStore.createAdmission(admissionData)
      closeAdmissionModal()
      await refreshData()
    } catch (err) {
      console.error('Error creating admission:', err)
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
        wardStore.fetchAdmissions(),
        wardStore.fetchWards(),
        wardStore.fetchAvailableBeds(),
        wardStore.fetchAdmissionStats()
      ])
    } catch (err) {
      error.value = 'Failed to load admission data'
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
    currentPage,
    showAdmissionModal,
    selectedAdmission,
    isLoading,
    error,
    admissions,
    wards,
    availableBeds,
    admissionStats,
    filteredAdmissions,
    totalAdmissions,
    totalPages,
    startIndex,
    endIndex,
    visiblePages,
    formatDate,
    formatTime,
    getStatusClass,
    showAdmissionForm,
    closeAdmissionModal,
    viewAdmission,
    closeAdmissionDetails,
    editAdmission,
    transferPatient,
    dischargePatient,
    handleAdmissionSubmit,
    onSearch,
    onWardChange,
    onStatusChange,
    goToPage,
    refreshData
  }
}
