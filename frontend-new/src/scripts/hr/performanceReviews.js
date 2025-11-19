import { ref, computed, onMounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import { useEmployeeStore } from '@/stores/employee'

/**
 * Composable for Performance Reviews functionality
 * Handles performance reviews, ratings, and management
 */
export function usePerformanceReviews() {
  // Stores
  const performanceStore = usePerformanceStore()
  const employeeStore = useEmployeeStore()

  // Reactive data
  const reviews = ref([])
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Statistics
  const stats = ref({
    average_rating: 0,
    high_performers: 0,
    low_performers: 0,
    total_reviews: 0
  })

  // Filters
  const filters = ref({
    employee: '',
    rating: '',
    period: '',
    reviewer: ''
  })

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = ref(20)

  // Modal state
  const showReviewForm = ref(false)
  const showEditModal = ref(false)
  const selectedReview = ref(null)
  const reviewForm = ref({
    employee_id: '',
    reviewer_id: '',
    period: '',
    rating: '',
    goals_achieved: '',
    strengths: '',
    areas_for_improvement: '',
    development_plan: '',
    comments: ''
  })

  // Computed
  const filteredReviews = computed(() => {
    let filtered = reviews.value

    if (filters.value.employee) {
      filtered = filtered.filter(review => 
        review.employee_id === parseInt(filters.value.employee)
      )
    }

    if (filters.value.rating) {
      filtered = filtered.filter(review => 
        review.rating === parseInt(filters.value.rating)
      )
    }

    if (filters.value.period) {
      filtered = filtered.filter(review => 
        review.period === filters.value.period
      )
    }

    if (filters.value.reviewer) {
      filtered = filtered.filter(review => 
        review.reviewer_id === parseInt(filters.value.reviewer)
      )
    }

    return filtered
  })

  const paginatedReviews = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredReviews.value.slice(start, end)
  })

  // Methods
  const loadReviews = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await performanceStore.getReviews({
        page: currentPage.value,
        per_page: itemsPerPage.value,
        ...filters.value
      })
      reviews.value = data.data
      totalPages.value = data.last_page
    } catch (err) {
      console.error('Error loading reviews:', err)
      error.value = 'Failed to load reviews'
    } finally {
      loading.value = false
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await employeeStore.getEmployees()
      employees.value = data.data
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  const loadStats = async () => {
    try {
      const data = await performanceStore.getPerformanceStats()
      stats.value = data
    } catch (err) {
      console.error('Error loading performance stats:', err)
    }
  }

  const submitReview = async () => {
    try {
      await performanceStore.createReview(reviewForm.value)
      closeModal()
      await loadReviews()
      await loadStats()
    } catch (err) {
      console.error('Error submitting review:', err)
      error.value = 'Failed to submit review'
    }
  }

  const editReview = (review) => {
    selectedReview.value = review
    reviewForm.value = { ...review }
    showEditModal.value = true
  }

  const updateReview = async () => {
    try {
      await performanceStore.updateReview(selectedReview.value.id, reviewForm.value)
      closeModal()
      await loadReviews()
      await loadStats()
    } catch (err) {
      console.error('Error updating review:', err)
      error.value = 'Failed to update review'
    }
  }

  const deleteReview = async (review) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await performanceStore.deleteReview(review.id)
        await loadReviews()
        await loadStats()
      } catch (err) {
        console.error('Error deleting review:', err)
        error.value = 'Failed to delete review'
      }
    }
  }

  const applyFilters = () => {
    currentPage.value = 1
    loadReviews()
  }

  const clearFilters = () => {
    filters.value = {
      employee: '',
      rating: '',
      period: '',
      reviewer: ''
    }
    applyFilters()
  }

  const closeModal = () => {
    showReviewForm.value = false
    showEditModal.value = false
    selectedReview.value = null
    reviewForm.value = {
      employee_id: '',
      reviewer_id: '',
      period: '',
      rating: '',
      goals_achieved: '',
      strengths: '',
      areas_for_improvement: '',
      development_plan: '',
      comments: ''
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadReviews()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadReviews()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadReviews()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRatingClass = (rating) => {
    if (rating >= 4.5) return 'rating-excellent'
    if (rating >= 3.5) return 'rating-good'
    if (rating >= 2.5) return 'rating-average'
    if (rating >= 1.5) return 'rating-poor'
    return 'rating-very-poor'
  }

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    if (rating >= 2.5) return 'Average'
    if (rating >= 1.5) return 'Poor'
    return 'Very Poor'
  }

  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star')
    }

    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt')
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star')
    }

    return stars
  }

  const getPeriodOptions = () => {
    const currentYear = new Date().getFullYear()
    const periods = []
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      periods.push(`${year} Q1`)
      periods.push(`${year} Q2`)
      periods.push(`${year} Q3`)
      periods.push(`${year} Q4`)
    }
    
    return periods.reverse()
  }

  // Lifecycle
  onMounted(() => {
    loadReviews()
    loadEmployees()
    loadStats()
  })

  return {
    // State
    reviews,
    employees,
    stats,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    showReviewForm,
    showEditModal,
    selectedReview,
    reviewForm,
    loading,
    error,

    // Computed
    filteredReviews,
    paginatedReviews,

    // Methods
    loadReviews,
    loadEmployees,
    loadStats,
    submitReview,
    editReview,
    updateReview,
    deleteReview,
    applyFilters,
    clearFilters,
    closeModal,
    previousPage,
    nextPage,
    goToPage,
    formatDate,
    getRatingClass,
    getRatingText,
    getRatingStars,
    getPeriodOptions
  }
}
