import { ref, onMounted, computed } from 'vue'
import { useLaboratoryStore } from '@/stores/laboratory'

export function useLaboratory() {
  const laboratoryStore = useLaboratoryStore()
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const selectedTestType = ref('')
  const selectedPriority = ref('')

  const loadLaboratoryData = async () => {
    try {
      await laboratoryStore.fetchTests()
      await laboratoryStore.fetchTestResults()
      await laboratoryStore.fetchSpecimens()
      await laboratoryStore.fetchTestTypes()
    } catch (error) {
      console.error('Error loading laboratory data:', error)
    }
  }

  const laboratoryStats = computed(() => laboratoryStore.stats)
  const recentTests = computed(() => laboratoryStore.recentTests)
  const urgentTests = computed(() => laboratoryStore.urgentTests)
  const todaysTests = computed(() => laboratoryStore.todaysTests)

  const addTest = async (testData) => {
    try {
      const result = await laboratoryStore.createTest(testData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding test:', error)
      throw error
    }
  }

  const updateTest = async (id, testData) => {
    try {
      const result = await laboratoryStore.updateTest(id, testData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating test:', error)
      throw error
    }
  }

  const deleteTest = async (id) => {
    try {
      const result = await laboratoryStore.deleteTest(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting test:', error)
      throw error
    }
  }

  const startTest = async (id) => {
    try {
      const result = await laboratoryStore.startTest(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error starting test:', error)
      throw error
    }
  }

  const completeTest = async (id, results) => {
    try {
      const result = await laboratoryStore.completeTest(id, results)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error completing test:', error)
      throw error
    }
  }

  const cancelTest = async (id, reason) => {
    try {
      const result = await laboratoryStore.cancelTest(id, reason)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error cancelling test:', error)
      throw error
    }
  }

  const addSpecimen = async (specimenData) => {
    try {
      const result = await laboratoryStore.createSpecimen(specimenData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding specimen:', error)
      throw error
    }
  }

  const updateSpecimen = async (id, specimenData) => {
    try {
      const result = await laboratoryStore.updateSpecimen(id, specimenData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating specimen:', error)
      throw error
    }
  }

  const deleteSpecimen = async (id) => {
    try {
      const result = await laboratoryStore.deleteSpecimen(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting specimen:', error)
      throw error
    }
  }

  const addTestType = async (testTypeData) => {
    try {
      const result = await laboratoryStore.createTestType(testTypeData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding test type:', error)
      throw error
    }
  }

  const updateTestType = async (id, testTypeData) => {
    try {
      const result = await laboratoryStore.updateTestType(id, testTypeData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating test type:', error)
      throw error
    }
  }

  const deleteTestType = async (id) => {
    try {
      const result = await laboratoryStore.deleteTestType(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting test type:', error)
      throw error
    }
  }

  const filteredTests = computed(() => {
    let filtered = laboratoryStore.tests
    if (searchQuery.value) {
      filtered = filtered.filter(test =>
        test.test_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        test.patient_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        test.test_type?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    if (selectedStatus.value) {
      filtered = filtered.filter(test => test.status === selectedStatus.value)
    }
    if (selectedTestType.value) {
      filtered = filtered.filter(test => test.test_type === selectedTestType.value)
    }
    if (selectedPriority.value) {
      filtered = filtered.filter(test => test.priority === selectedPriority.value)
    }
    return filtered
  })

  const handleSearch = () => {
    // Search is handled reactively through computed property
  }

  const handleFilterChange = () => {
    // Filtering is handled reactively through computed property
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedStatus.value = ''
    selectedTestType.value = ''
    selectedPriority.value = ''
  }

  const exportTests = async () => {
    try {
      // Implement export functionality
      console.log('Exporting tests...')
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG')
  }

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status) => {
    const statuses = {
      'pending': 'في الانتظار',
      'in_progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    }
    return statuses[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    }
    return classes[status] || ''
  }

  const getPriorityText = (priority) => {
    const priorities = {
      'low': 'منخفض',
      'normal': 'عادي',
      'high': 'عالي',
      'urgent': 'عاجل'
    }
    return priorities[priority] || priority
  }

  const getPriorityClass = (priority) => {
    const classes = {
      'low': 'priority-low',
      'normal': 'priority-normal',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    }
    return classes[priority] || ''
  }

  onMounted(() => {
    loadLaboratoryData()
  })

  return {
    tests: laboratoryStore.tests,
    testResults: laboratoryStore.testResults,
    specimens: laboratoryStore.specimens,
    testTypes: laboratoryStore.testTypes,
    loading: laboratoryStore.loading,
    error: laboratoryStore.error,
    searchQuery,
    selectedStatus,
    selectedTestType,
    selectedPriority,
    filteredTests,
    laboratoryStats,
    recentTests,
    urgentTests,
    todaysTests,
    loadLaboratoryData,
    addTest,
    updateTest,
    deleteTest,
    startTest,
    completeTest,
    cancelTest,
    addSpecimen,
    updateSpecimen,
    deleteSpecimen,
    addTestType,
    updateTestType,
    deleteTestType,
    clearError: laboratoryStore.clearError,
    handleSearch,
    handleFilterChange,
    clearFilters,
    exportTests,
    formatDate,
    formatTime,
    getStatusText,
    getStatusClass,
    getPriorityText,
    getPriorityClass
  }
}