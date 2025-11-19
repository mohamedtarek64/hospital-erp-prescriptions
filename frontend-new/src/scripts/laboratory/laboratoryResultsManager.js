import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLaboratoryStore } from '@/stores/laboratory'
import { laboratoryHelpers } from '@/utils/laboratoryHelpers'

export const laboratoryResultsManager = {
  setup() {
    const router = useRouter()
    const laboratoryStore = useLaboratoryStore()
    
    // State
    const results = ref([])
    const loading = ref(false)
    const error = ref(null)
    const filters = ref({
      status: '',
      patient: '',
      test: '',
      dateRange: ''
    })
    const pagination = ref({
      currentPage: 1,
      perPage: 10,
      total: 0,
      lastPage: 1
    })
    const selectedResults = ref([])
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
    const loadResults = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await laboratoryStore.loadResults({
          ...filters.value,
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage
        })
        
        results.value = response.data
        pagination.value.total = response.total
        pagination.value.lastPage = response.last_page
      } catch (err) {
        error.value = err.message || 'Failed to load results'
        console.error('Error loading results:', err)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      pagination.value.currentPage = 1
      loadResults()
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
        patient: '',
        test: '',
        dateRange: ''
      }
      applyFilters()
    }

    const setPage = (page) => {
      pagination.value.currentPage = page
      loadResults()
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
        selectedResults.value = results.value.map(result => result.id)
      } else {
        selectedResults.value = []
      }
    }

    const clearSelection = () => {
      selectedResults.value = []
      selectAll.value = false
    }

    const createNewResult = () => {
      router.push('/laboratory/results/new')
    }

    const viewResult = (id) => {
      router.push(`/laboratory/results/${id}`)
    }

    const editResult = (id) => {
      router.push(`/laboratory/results/${id}/edit`)
    }

    const verifyResult = async (id) => {
      if (confirm('Are you sure you want to verify this result?')) {
        try {
          loading.value = true
          await laboratoryStore.verifyResult(id, {
            verified_by: 'current_user_id', // This should come from auth store
            verified_at: new Date().toISOString()
          })
          await loadResults()
        } catch (err) {
          error.value = err.message || 'Failed to verify result'
          console.error('Error verifying result:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const deleteResult = async (id) => {
      if (confirm('Are you sure you want to delete this result?')) {
        try {
          loading.value = true
          await laboratoryStore.deleteResult(id)
          await loadResults()
        } catch (err) {
          error.value = err.message || 'Failed to delete result'
          console.error('Error deleting result:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const bulkVerify = async () => {
      if (selectedResults.value.length === 0) {
        alert('Please select results to verify')
        return
      }

      if (confirm(`Are you sure you want to verify ${selectedResults.value.length} result(s)?`)) {
        try {
          loading.value = true
          
          // Verify each selected result
          for (const resultId of selectedResults.value) {
            await laboratoryStore.verifyResult(resultId, {
              verified_by: 'current_user_id', // This should come from auth store
              verified_at: new Date().toISOString()
            })
          }
          
          await loadResults()
          clearSelection()
        } catch (err) {
          error.value = err.message || 'Failed to verify results'
          console.error('Error bulk verifying results:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const bulkExport = async () => {
      if (selectedResults.value.length === 0) {
        alert('Please select results to export')
        return
      }

      try {
        loading.value = true
        const response = await laboratoryStore.generateReport('results', {
          ids: selectedResults.value,
          format: 'csv'
        })
        
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `laboratory-results-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        error.value = err.message || 'Failed to export results'
        console.error('Error exporting results:', err)
      } finally {
        loading.value = false
      }
    }

    const getResultStatusClass = (status) => {
      const statusClasses = {
        normal: 'result-normal',
        abnormal: 'result-abnormal',
        critical: 'result-critical',
        pending_verification: 'result-pending',
        verified: 'result-verified'
      }
      return statusClasses[status] || 'result-pending'
    }

    const getResultValueClass = (status) => {
      const valueClasses = {
        normal: 'text-green-600',
        abnormal: 'text-orange-600',
        critical: 'text-red-600 font-bold'
      }
      return valueClasses[status] || 'text-gray-600'
    }

    const formatDate = (date) => {
      return laboratoryHelpers.formatDate(date)
    }

    const initialize = () => {
      loadResults()
    }

    return {
      // State
      results,
      loading,
      error,
      filters,
      pagination,
      selectedResults,
      selectAll,
      
      // Computed
      hasActiveFilters,
      visiblePages,
      
      // Methods
      loadResults,
      applyFilters,
      debouncedSearch,
      clearFilters,
      setPage,
      previousPage,
      nextPage,
      goToPage,
      toggleSelectAll,
      clearSelection,
      createNewResult,
      viewResult,
      editResult,
      verifyResult,
      deleteResult,
      bulkVerify,
      bulkExport,
      getResultStatusClass,
      getResultValueClass,
      formatDate,
      initialize
    }
  }
}
