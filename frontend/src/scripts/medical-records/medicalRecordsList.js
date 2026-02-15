import { ref, computed, onMounted } from 'vue'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'

/**
 * Composable for Medical Records List functionality
 * Handles search, filtering, pagination, and CRUD operations
 */
export function useMedicalRecordsList() {
  // Store
  const medicalRecordsStore = useMedicalRecordsStore()

  // Reactive data
  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showViewModal = ref(false)
  const editingRecord = ref(null)
  const viewingRecord = ref(null)

  // Search timeout
  let searchTimeout

  // Computed
  const medicalRecords = computed(() => medicalRecordsStore.medicalRecords)
  const pagination = computed(() => medicalRecordsStore.pagination)
  const statistics = computed(() => medicalRecordsStore.statistics)

  // Methods
  const loadMedicalRecords = async () => {
    loading.value = true
    try {
      await medicalRecordsStore.fetchMedicalRecords({
        search: searchQuery.value,
        status: statusFilter.value,
        date_from: dateFromFilter.value,
        date_to: dateToFilter.value
      })
    } catch (error) {
      console.error('Failed to load medical records:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    // Debounce search
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      loadMedicalRecords()
    }, 500)
  }

  const applyFilters = () => {
    loadMedicalRecords()
  }

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    dateFromFilter.value = ''
    dateToFilter.value = ''
    loadMedicalRecords()
  }

  const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
      medicalRecordsStore.setPage(page)
      loadMedicalRecords()
    }
  }

  const viewRecord = (record) => {
    viewingRecord.value = record
    showViewModal.value = true
  }

  const editRecord = (record) => {
    editingRecord.value = record
    showEditModal.value = true
  }

  const deleteRecord = async (record) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل الطبي؟')) {
      try {
        await medicalRecordsStore.deleteMedicalRecord(record.id)
        await loadMedicalRecords()
      } catch (error) {
        console.error('Failed to delete medical record:', error)
      }
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingRecord.value = null
  }

  const closeViewModal = () => {
    showViewModal.value = false
    viewingRecord.value = null
  }

  const handleRecordSaved = () => {
    closeModal()
    loadMedicalRecords()
  }

  // Lifecycle
  onMounted(() => {
    loadMedicalRecords()
  })

  return {
    // State
    loading,
    searchQuery,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    showCreateModal,
    showEditModal,
    showViewModal,
    editingRecord,
    viewingRecord,
    
    // Computed
    medicalRecords,
    pagination,
    statistics,
    
    // Methods
    loadMedicalRecords,
    handleSearch,
    applyFilters,
    clearFilters,
    changePage,
    viewRecord,
    editRecord,
    deleteRecord,
    closeModal,
    closeViewModal,
    handleRecordSaved
  }
}
