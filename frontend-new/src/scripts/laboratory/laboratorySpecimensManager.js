import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLaboratoryStore } from '@/stores/laboratory'
import { laboratoryHelpers } from '@/utils/laboratoryHelpers'

export const laboratorySpecimensManager = {
  setup() {
    const router = useRouter()
    const laboratoryStore = useLaboratoryStore()
    
    // State
    const specimens = ref([])
    const loading = ref(false)
    const error = ref(null)
    const filters = ref({
      status: '',
      type: '',
      patient: '',
      expiry: ''
    })
    const pagination = ref({
      currentPage: 1,
      perPage: 10,
      total: 0,
      lastPage: 1
    })
    const selectedSpecimens = ref([])
    const selectAll = ref(false)
    const searchTimeout = ref(null)

    // Computed
    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value !== '')
    })

    const visiblePages = computed(() => {
      const current = pagination.value.currentPage
      const last = pagination.value.lastPage
      const pages = []
      
      // Show up to 5 pages around current page
      const start = Math.max(1, current - 2)
      const end = Math.min(last, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Methods
    const loadSpecimens = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await laboratoryStore.loadSpecimens({
          ...filters.value,
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage
        })
        
        specimens.value = response.data
        pagination.value.total = response.total
        pagination.value.lastPage = response.last_page
      } catch (err) {
        error.value = err.message || 'Failed to load specimens'
        console.error('Error loading specimens:', err)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      pagination.value.currentPage = 1
      loadSpecimens()
    }

    const debouncedSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        applyFilters()
      }, 500)
    }

    const clearFilters = () => {
      filters.value = {
        status: '',
        type: '',
        patient: '',
        expiry: ''
      }
      applyFilters()
    }

    const setPage = (page) => {
      pagination.value.currentPage = page
      loadSpecimens()
    }

    const previousPage = () => {
      if (pagination.value.currentPage > 1) {
        setPage(pagination.value.currentPage - 1)
      }
    }

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.lastPage) {
        setPage(pagination.value.currentPage + 1)
      }
    }

    const goToPage = (page) => {
      setPage(page)
    }

    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedSpecimens.value = specimens.value.map(specimen => specimen.id)
      } else {
        selectedSpecimens.value = []
      }
    }

    const clearSelection = () => {
      selectedSpecimens.value = []
      selectAll.value = false
    }

    const createNewSpecimen = () => {
      router.push('/laboratory/specimens/new')
    }

    const viewSpecimen = (id) => {
      router.push(`/laboratory/specimens/${id}`)
    }

    const editSpecimen = (id) => {
      router.push(`/laboratory/specimens/${id}/edit`)
    }

    const collectSpecimen = async (id) => {
      if (confirm('Are you sure you want to mark this specimen as collected?')) {
        try {
          loading.value = true
          await laboratoryStore.collectSpecimen(id, {
            collected_by: 'current_user_id', // This should come from auth store
            collection_time: new Date().toISOString(),
            collection_notes: 'Specimen collected'
          })
          await loadSpecimens()
        } catch (err) {
          error.value = err.message || 'Failed to collect specimen'
          console.error('Error collecting specimen:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const receiveSpecimen = async (id) => {
      if (confirm('Are you sure you want to mark this specimen as received?')) {
        try {
          loading.value = true
          await laboratoryStore.receiveSpecimen(id, {
            received_by: 'current_user_id', // This should come from auth store
            received_time: new Date().toISOString(),
            storage_conditions: 'Room temperature'
          })
          await loadSpecimens()
        } catch (err) {
          error.value = err.message || 'Failed to receive specimen'
          console.error('Error receiving specimen:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const disposeSpecimen = async (id) => {
      if (confirm('Are you sure you want to dispose of this specimen?')) {
        try {
          loading.value = true
          await laboratoryStore.disposeSpecimen(id, {
            disposed_at: new Date().toISOString(),
            disposal_method: 'Autoclave',
            disposal_notes: 'Specimen disposed of according to protocol'
          })
          await loadSpecimens()
        } catch (err) {
          error.value = err.message || 'Failed to dispose specimen'
          console.error('Error disposing specimen:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const bulkCollect = async () => {
      if (selectedSpecimens.value.length === 0) {
        alert('Please select specimens to collect')
        return
      }

      if (confirm(`Are you sure you want to collect ${selectedSpecimens.value.length} specimen(s)?`)) {
        try {
          loading.value = true
          
          for (const specimenId of selectedSpecimens.value) {
            await laboratoryStore.collectSpecimen(specimenId, {
              collected_by: 'current_user_id',
              collection_time: new Date().toISOString(),
              collection_notes: 'Bulk collection'
            })
          }
          
          await loadSpecimens()
          clearSelection()
        } catch (err) {
          error.value = err.message || 'Failed to collect specimens'
          console.error('Error bulk collecting specimens:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const bulkReceive = async () => {
      if (selectedSpecimens.value.length === 0) {
        alert('Please select specimens to receive')
        return
      }

      if (confirm(`Are you sure you want to receive ${selectedSpecimens.value.length} specimen(s)?`)) {
        try {
          loading.value = true
          
          for (const specimenId of selectedSpecimens.value) {
            await laboratoryStore.receiveSpecimen(specimenId, {
              received_by: 'current_user_id',
              received_time: new Date().toISOString(),
              storage_conditions: 'Room temperature'
            })
          }
          
          await loadSpecimens()
          clearSelection()
        } catch (err) {
          error.value = err.message || 'Failed to receive specimens'
          console.error('Error bulk receiving specimens:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const bulkDispose = async () => {
      if (selectedSpecimens.value.length === 0) {
        alert('Please select specimens to dispose')
        return
      }

      if (confirm(`Are you sure you want to dispose of ${selectedSpecimens.value.length} specimen(s)?`)) {
        try {
          loading.value = true
          
          for (const specimenId of selectedSpecimens.value) {
            await laboratoryStore.disposeSpecimen(specimenId, {
              disposed_at: new Date().toISOString(),
              disposal_method: 'Autoclave',
              disposal_notes: 'Bulk disposal'
            })
          }
          
          await loadSpecimens()
          clearSelection()
        } catch (err) {
          error.value = err.message || 'Failed to dispose specimens'
          console.error('Error bulk disposing specimens:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const getSpecimenStatusClass = (status) => {
      const statusClasses = {
        not_collected: 'specimen-not-collected',
        collected: 'specimen-collected',
        received: 'specimen-received',
        processing: 'specimen-processing',
        completed: 'specimen-completed',
        disposed: 'specimen-disposed'
      }
      return statusClasses[status] || 'specimen-not-collected'
    }

    const getExpiryClass = (expiryDate) => {
      if (!expiryDate) return 'text-gray-500'
      
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-red-600 font-bold' // Expired
      if (diffDays <= 3) return 'text-orange-600 font-medium' // Expiring soon
      return 'text-green-600' // Valid
    }

    const getExpiryStatusClass = (expiryDate) => {
      if (!expiryDate) return 'text-gray-500'
      
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-red-600'
      if (diffDays <= 3) return 'text-orange-600'
      return 'text-green-600'
    }

    const getExpiryStatus = (expiryDate) => {
      if (!expiryDate) return 'No expiry'
      
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Expired'
      if (diffDays <= 3) return 'Expiring soon'
      return 'Valid'
    }

    const canDispose = (specimen) => {
      return ['completed', 'received'].includes(specimen.collection_status) && 
             !specimen.is_disposed
    }

    const formatDate = (date) => {
      return laboratoryHelpers.formatDate(date)
    }

    const formatTime = (date) => {
      return laboratoryHelpers.formatDate(date, 'time')
    }

    const initialize = () => {
      loadSpecimens()
    }

    return {
      // State
      specimens,
      loading,
      error,
      filters,
      pagination,
      selectedSpecimens,
      selectAll,
      
      // Computed
      hasActiveFilters,
      visiblePages,
      
      // Methods
      loadSpecimens,
      applyFilters,
      debouncedSearch,
      clearFilters,
      setPage,
      previousPage,
      nextPage,
      goToPage,
      toggleSelectAll,
      clearSelection,
      createNewSpecimen,
      viewSpecimen,
      editSpecimen,
      collectSpecimen,
      receiveSpecimen,
      disposeSpecimen,
      bulkCollect,
      bulkReceive,
      bulkDispose,
      getSpecimenStatusClass,
      getExpiryClass,
      getExpiryStatusClass,
      getExpiryStatus,
      canDispose,
      formatDate,
      formatTime,
      initialize
    }
  }
}
