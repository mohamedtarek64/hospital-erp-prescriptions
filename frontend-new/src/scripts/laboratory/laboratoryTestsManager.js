import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLaboratoryStore } from '@/stores/laboratory'
import { laboratoryHelpers } from '@/utils/laboratoryHelpers'

export const laboratoryTestsManager = {
  setup() {
    const router = useRouter()
    const laboratoryStore = useLaboratoryStore()
    
    // State
    const tests = ref([])
    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)
    const filters = ref({
      category: '',
      search: '',
      status: ''
    })
    const searchTimeout = ref(null)

    // Computed
    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value !== '')
    })

    // Methods
    const loadTests = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await laboratoryStore.loadTests(filters.value)
        tests.value = response
      } catch (err) {
        error.value = err.message || 'Failed to load tests'
        console.error('Error loading tests:', err)
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        const response = await laboratoryStore.loadCategories()
        categories.value = response
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }

    const applyFilters = () => {
      loadTests()
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
        category: '',
        search: '',
        status: ''
      }
      applyFilters()
    }

    const createNewTest = () => {
      router.push('/laboratory/tests/new')
    }

    const viewTest = (id) => {
      router.push(`/laboratory/tests/${id}`)
    }

    const editTest = (id) => {
      router.push(`/laboratory/tests/${id}/edit`)
    }

    const deleteTest = async (id) => {
      if (confirm('Are you sure you want to delete this test?')) {
        try {
          loading.value = true
          await laboratoryStore.deleteTest(id)
          await loadTests()
        } catch (err) {
          error.value = err.message || 'Failed to delete test'
          console.error('Error deleting test:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const createNewCategory = () => {
      router.push('/laboratory/categories/new')
    }

    const editCategory = (id) => {
      router.push(`/laboratory/categories/${id}/edit`)
    }

    const deleteCategory = async (id) => {
      if (confirm('Are you sure you want to delete this category? This will affect all tests in this category.')) {
        try {
          loading.value = true
          await laboratoryStore.deleteCategory(id)
          await loadCategories()
          await loadTests()
        } catch (err) {
          error.value = err.message || 'Failed to delete category'
          console.error('Error deleting category:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const formatCurrency = (amount) => {
      return laboratoryHelpers.formatCurrency(amount)
    }

    const initialize = () => {
      loadTests()
      loadCategories()
    }

    return {
      // State
      tests,
      categories,
      loading,
      error,
      filters,
      
      // Computed
      hasActiveFilters,
      
      // Methods
      loadTests,
      loadCategories,
      applyFilters,
      debouncedSearch,
      clearFilters,
      createNewTest,
      viewTest,
      editTest,
      deleteTest,
      createNewCategory,
      editCategory,
      deleteCategory,
      formatCurrency,
      initialize
    }
  }
}
