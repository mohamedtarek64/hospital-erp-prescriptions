<template>
  <div class="test-catalog-container">
    <div class="catalog-header">
      <h2>Laboratory Test Catalog</h2>
      <div class="header-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search tests..."
            @input="filterTests"
          >
        </div>
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
          >
            <i class="fas fa-th"></i>
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="['view-btn', { active: viewMode === 'list' }]"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <button 
        @click="selectedCategory = null"
        :class="['category-btn', { active: !selectedCategory }]"
      >
        All Tests
      </button>
      <button 
        v-for="category in categories" 
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="['category-btn', { active: selectedCategory === category.id }]"
      >
        {{ category.name }}
        <span class="test-count">({{ getTestsByCategory(category.id).length }})</span>
      </button>
    </div>

    <!-- Tests Display -->
    <div class="tests-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading test catalog...
      </div>

      <div v-else-if="filteredTests.length === 0" class="empty-state">
        <i class="fas fa-flask"></i>
        <p>No tests found matching your criteria</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="tests-grid">
        <div 
          v-for="test in paginatedTests" 
          :key="test.id" 
          class="test-card"
          :class="{ inactive: test.status === 'inactive' }"
        >
          <div class="test-header">
            <div class="test-info">
              <h4>{{ test.name }}</h4>
              <p class="test-code">{{ test.code }}</p>
              <span class="test-category">{{ test.category?.name }}</span>
            </div>
            <div class="test-status">
              <span :class="`status-${test.status}`">{{ test.status }}</span>
            </div>
          </div>

          <div class="test-details">
            <div class="detail-item">
              <label>Price:</label>
              <span class="price">${{ test.price }}</span>
            </div>
            <div class="detail-item">
              <label>Turnaround:</label>
              <span>{{ test.turnaround_time }}h</span>
            </div>
            <div class="detail-item">
              <label>Unit:</label>
              <span>{{ test.unit }}</span>
            </div>
          </div>

          <div class="test-ranges">
            <h5>Normal Ranges</h5>
            <div class="ranges">
              <div v-if="test.normal_range_male" class="range-item">
                <span class="range-label">Male:</span>
                <span class="range-value">{{ test.normal_range_male }}</span>
              </div>
              <div v-if="test.normal_range_female" class="range-item">
                <span class="range-label">Female:</span>
                <span class="range-value">{{ test.normal_range_female }}</span>
              </div>
            </div>
          </div>

          <div v-if="test.description" class="test-description">
            <p>{{ test.description }}</p>
          </div>

          <div v-if="test.preparation_instructions" class="test-instructions">
            <h5>Preparation</h5>
            <p>{{ test.preparation_instructions }}</p>
          </div>

          <div class="test-actions">
            <button @click="selectTest(test)" class="select-btn">
              <i class="fas fa-plus"></i>
              Select Test
            </button>
            <button @click="viewTestDetails(test)" class="details-btn">
              <i class="fas fa-info-circle"></i>
              Details
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="tests-list">
        <div class="list-header">
          <div class="header-cell">Test Name</div>
          <div class="header-cell">Code</div>
          <div class="header-cell">Category</div>
          <div class="header-cell">Price</div>
          <div class="header-cell">Turnaround</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        
        <div 
          v-for="test in paginatedTests" 
          :key="test.id" 
          class="list-item"
          :class="{ inactive: test.status === 'inactive' }"
        >
          <div class="list-cell">
            <div class="test-name">
              <h5>{{ test.name }}</h5>
              <p>{{ test.description }}</p>
            </div>
          </div>
          <div class="list-cell">
            <span class="test-code">{{ test.code }}</span>
          </div>
          <div class="list-cell">
            <span class="test-category">{{ test.category?.name }}</span>
          </div>
          <div class="list-cell">
            <span class="price">${{ test.price }}</span>
          </div>
          <div class="list-cell">
            <span>{{ test.turnaround_time }}h</span>
          </div>
          <div class="list-cell">
            <span :class="`status-${test.status}`">{{ test.status }}</span>
          </div>
          <div class="list-cell">
            <div class="action-buttons">
              <button @click="selectTest(test)" class="select-btn">
                <i class="fas fa-plus"></i>
              </button>
              <button @click="viewTestDetails(test)" class="details-btn">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Next
      </button>
    </div>

    <!-- Test Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Test Details</h3>
          <button @click="closeDetailsModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedTestDetails" class="test-details-content">
          <div class="details-section">
            <h4>Basic Information</h4>
            <div class="details-grid">
              <div class="detail-item">
                <label>Test Name:</label>
                <span>{{ selectedTestDetails.name }}</span>
              </div>
              <div class="detail-item">
                <label>Test Code:</label>
                <span>{{ selectedTestDetails.code }}</span>
              </div>
              <div class="detail-item">
                <label>Category:</label>
                <span>{{ selectedTestDetails.category?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="`status-${selectedTestDetails.status}`">
                  {{ selectedTestDetails.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h4>Pricing & Timing</h4>
            <div class="details-grid">
              <div class="detail-item">
                <label>Price:</label>
                <span class="price">${{ selectedTestDetails.price }}</span>
              </div>
              <div class="detail-item">
                <label>Turnaround Time:</label>
                <span>{{ selectedTestDetails.turnaround_time }} hours</span>
              </div>
              <div class="detail-item">
                <label>Unit:</label>
                <span>{{ selectedTestDetails.unit }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h4>Normal Ranges</h4>
            <div class="ranges-section">
              <div v-if="selectedTestDetails.normal_range_male" class="range-item">
                <label>Male Normal Range:</label>
                <span>{{ selectedTestDetails.normal_range_male }}</span>
              </div>
              <div v-if="selectedTestDetails.normal_range_female" class="range-item">
                <label>Female Normal Range:</label>
                <span>{{ selectedTestDetails.normal_range_female }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedTestDetails.description" class="details-section">
            <h4>Description</h4>
            <p>{{ selectedTestDetails.description }}</p>
          </div>

          <div v-if="selectedTestDetails.preparation_instructions" class="details-section">
            <h4>Preparation Instructions</h4>
            <p>{{ selectedTestDetails.preparation_instructions }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TestCatalog',
  props: {
    tests: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['test-selected', 'test-details'],
  setup(props, { emit }) {
    // Reactive data
    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const viewMode = ref('grid')
    const currentPage = ref(1)
    const itemsPerPage = 12
    const showDetailsModal = ref(false)
    const selectedTestDetails = ref(null)

    // Computed properties
    const getTestsByCategory = (categoryId) => {
      return props.tests.filter(test => test.category_id === categoryId)
    }

    const filteredTests = computed(() => {
      let filtered = props.tests

      if (selectedCategory.value) {
        filtered = filtered.filter(test => test.category_id === selectedCategory.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(test => 
          test.name.toLowerCase().includes(query) ||
          test.code.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query) ||
          test.category?.name.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const totalPages = computed(() => 
      Math.ceil(filteredTests.value.length / itemsPerPage)
    )

    const paginatedTests = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredTests.value.slice(start, end)
    })

    // Methods
    const filterTests = () => {
      currentPage.value = 1
    }

    const selectTest = (test) => {
      emit('test-selected', test)
    }

    const viewTestDetails = (test) => {
      selectedTestDetails.value = test
      showDetailsModal.value = true
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedTestDetails.value = null
    }

    return {
      searchQuery,
      selectedCategory,
      viewMode,
      currentPage,
      showDetailsModal,
      selectedTestDetails,
      getTestsByCategory,
      filteredTests,
      totalPages,
      paginatedTests,
      filterTests,
      selectTest,
      viewTestDetails,
      closeDetailsModal
    }
  }
}
</script>

<style scoped>
.test-catalog-container {
  @apply max-w-7xl mx-auto p-6;
}

.catalog-header {
  @apply flex justify-between items-center mb-6;
}

.catalog-header h2 {
  @apply text-2xl font-bold text-gray-800;
}

.header-actions {
  @apply flex items-center space-x-4;
}

.search-box {
  @apply relative;
}

.search-box i {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-box input {
  @apply pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.view-controls {
  @apply flex border border-gray-300 rounded-lg overflow-hidden;
}

.view-btn {
  @apply px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200;
}

.view-btn.active {
  @apply bg-blue-100 text-blue-600;
}

.category-filter {
  @apply flex flex-wrap gap-2 mb-6;
}

.category-btn {
  @apply px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200;
}

.category-btn.active {
  @apply bg-blue-600 text-white border-blue-600;
}

.test-count {
  @apply text-xs opacity-75;
}

.tests-container {
  @apply min-h-96;
}

.loading-state, .empty-state {
  @apply flex flex-col items-center justify-center py-12 text-gray-500;
}

.loading-state i, .empty-state i {
  @apply text-4xl mb-4;
}

.tests-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.test-card {
  @apply bg-white rounded-lg shadow-md border border-gray-200 p-4 transition-all duration-200 hover:shadow-lg;
}

.test-card.inactive {
  @apply opacity-60;
}

.test-header {
  @apply flex justify-between items-start mb-3;
}

.test-info h4 {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.test-code {
  @apply text-sm text-gray-600 mb-1;
}

.test-category {
  @apply text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800;
}

.test-status {
  @apply flex flex-col items-end;
}

.status-active {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-inactive {
  @apply px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800;
}

.test-details {
  @apply space-y-2 mb-3;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-item label {
  @apply text-gray-600;
}

.price {
  @apply font-semibold text-green-600;
}

.test-ranges {
  @apply mb-3;
}

.test-ranges h5 {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.ranges {
  @apply space-y-1;
}

.range-item {
  @apply flex justify-between text-xs;
}

.range-label {
  @apply text-gray-600;
}

.range-value {
  @apply font-medium;
}

.test-description, .test-instructions {
  @apply mb-3;
}

.test-description p, .test-instructions p {
  @apply text-sm text-gray-600;
}

.test-instructions h5 {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.test-actions {
  @apply flex space-x-2;
}

.select-btn, .details-btn {
  @apply flex-1 px-3 py-2 text-xs rounded transition-colors duration-200;
}

.select-btn {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.details-btn {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.tests-list {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}

.list-header {
  @apply grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700;
}

.list-item {
  @apply grid grid-cols-7 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200;
}

.list-item.inactive {
  @apply opacity-60;
}

.list-cell {
  @apply flex items-center;
}

.test-name h5 {
  @apply font-medium text-gray-800;
}

.test-name p {
  @apply text-sm text-gray-600;
}

.action-buttons {
  @apply flex space-x-2;
}

.action-buttons .select-btn,
.action-buttons .details-btn {
  @apply px-2 py-1;
}

.pagination {
  @apply flex justify-center items-center space-x-4 mt-8;
}

.page-btn {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-info {
  @apply text-sm text-gray-600;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto;
}

.modal-content.large {
  @apply max-w-4xl;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-header h3 {
  @apply text-xl font-semibold text-gray-800;
}

.close-btn {
  @apply text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.test-details-content {
  @apply p-6 space-y-6;
}

.details-section {
  @apply space-y-3;
}

.details-section h4 {
  @apply text-lg font-medium text-gray-800 border-b border-gray-200 pb-2;
}

.details-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.detail-item {
  @apply flex justify-between;
}

.detail-item label {
  @apply font-medium text-gray-600;
}

.ranges-section {
  @apply space-y-2;
}

.range-item {
  @apply flex justify-between;
}
</style>
