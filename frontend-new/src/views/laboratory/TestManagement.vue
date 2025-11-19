<template>
  <div class="test-management-container">
    <div class="page-header">
      <h1 class="page-title">Test Management</h1>
      <button @click="showCreateModal = true" class="add-btn">
        <i class="fas fa-plus"></i>
        Add Test
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Category:</label>
        <select v-model="filters.category" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="category in testCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.search" 
          @input="applyFilters"
          placeholder="Search tests..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Test Categories Tabs -->
    <div class="categories-tabs">
      <button 
        v-for="category in testCategories" 
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="['tab-btn', { active: selectedCategory === category.id }]"
      >
        {{ category.name }}
        <span class="test-count">({{ getTestsByCategory(category.id).length }})</span>
      </button>
    </div>

    <!-- Tests List -->
    <div class="tests-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading tests...
      </div>

      <div v-else-if="filteredTests.length === 0" class="empty-state">
        <i class="fas fa-flask"></i>
        <p>No tests found</p>
      </div>

      <div v-else class="tests-grid">
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
            <div class="detail-row">
              <label>Price:</label>
              <span class="price">${{ test.price }}</span>
            </div>
            <div class="detail-row">
              <label>Turnaround:</label>
              <span>{{ test.turnaround_time }} hours</span>
            </div>
            <div class="detail-row">
              <label>Unit:</label>
              <span>{{ test.unit }}</span>
            </div>
          </div>

          <div class="test-ranges">
            <div class="range-section">
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
          </div>

          <div v-if="test.preparation_instructions" class="test-instructions">
            <h5>Preparation Instructions</h5>
            <p>{{ test.preparation_instructions }}</p>
          </div>

          <div class="test-actions">
            <button @click="editTest(test)" class="edit-btn">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="duplicateTest(test)" class="duplicate-btn">
              <i class="fas fa-copy"></i>
              Duplicate
            </button>
            <button @click="toggleTestStatus(test)" class="toggle-btn">
              <i :class="test.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
              {{ test.status === 'active' ? 'Deactivate' : 'Activate' }}
            </button>
            <button @click="deleteTest(test)" class="delete-btn">
              <i class="fas fa-trash"></i>
              Delete
            </button>
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

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Add New Test' : 'Edit Test' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveTest" class="test-form">
          <div class="form-section">
            <h5>Basic Information</h5>
            <div class="form-row">
              <div class="form-group">
                <label>Test Name *</label>
                <input type="text" v-model="formData.name" required>
              </div>
              <div class="form-group">
                <label>Test Code *</label>
                <input type="text" v-model="formData.code" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select v-model="formData.category_id" required>
                  <option value="">Select Category</option>
                  <option v-for="category in testCategories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="formData.status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" rows="3"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h5>Pricing & Timing</h5>
            <div class="form-row">
              <div class="form-group">
                <label>Price *</label>
                <input type="number" v-model="formData.price" step="0.01" required>
              </div>
              <div class="form-group">
                <label>Turnaround Time (hours) *</label>
                <input type="number" v-model="formData.turnaround_time" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Unit</label>
                <input type="text" v-model="formData.unit" placeholder="e.g., mg/dL, %">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h5>Normal Ranges</h5>
            <div class="form-row">
              <div class="form-group">
                <label>Male Normal Range</label>
                <input type="text" v-model="formData.normal_range_male" placeholder="e.g., 3.5-5.0">
              </div>
              <div class="form-group">
                <label>Female Normal Range</label>
                <input type="text" v-model="formData.normal_range_female" placeholder="e.g., 3.5-5.0">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h5>Preparation Instructions</h5>
            <div class="form-group">
              <label>Instructions for Patient</label>
              <textarea 
                v-model="formData.preparation_instructions" 
                rows="4"
                placeholder="e.g., Fasting required for 12 hours, no alcohol 24 hours before..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Saving...' : 'Save Test' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Management Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Manage Categories</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="category-management">
          <div class="add-category-section">
            <h4>Add New Category</h4>
            <form @submit.prevent="addCategory" class="category-form">
              <div class="form-group">
                <input 
                  type="text" 
                  v-model="newCategory.name" 
                  placeholder="Category name"
                  required
                >
              </div>
              <div class="form-group">
                <textarea 
                  v-model="newCategory.description" 
                  placeholder="Category description"
                  rows="2"
                ></textarea>
              </div>
              <button type="submit" class="add-category-btn">
                <i class="fas fa-plus"></i>
                Add Category
              </button>
            </form>
          </div>

          <div class="categories-list">
            <h4>Existing Categories</h4>
            <div class="category-items">
              <div v-for="category in testCategories" :key="category.id" class="category-item">
                <div class="category-info">
                  <h5>{{ category.name }}</h5>
                  <p>{{ category.description }}</p>
                  <span class="test-count">{{ getTestsByCategory(category.id).length }} tests</span>
                </div>
                <div class="category-actions">
                  <button @click="editCategory(category)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteCategory(category)" class="delete-btn">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLaboratoryStore } from '@/stores/laboratory'

export default {
  name: 'TestManagement',
  setup() {
    const laboratoryStore = useLaboratoryStore()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showCategoryModal = ref(false)
    const selectedTest = ref(null)
    const selectedCategory = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 12

    const filters = ref({
      category: '',
      status: '',
      search: ''
    })

    const formData = ref({
      name: '',
      code: '',
      category_id: '',
      description: '',
      price: '',
      turnaround_time: '',
      unit: '',
      normal_range_male: '',
      normal_range_female: '',
      preparation_instructions: '',
      status: 'active'
    })

    const newCategory = ref({
      name: '',
      description: ''
    })

    // Computed properties
    const tests = computed(() => laboratoryStore.labTests)
    const testCategories = computed(() => laboratoryStore.testCategories)

    const getTestsByCategory = (categoryId) => {
      return tests.value.filter(test => test.category_id === categoryId)
    }

    const filteredTests = computed(() => {
      let filtered = tests.value

      if (selectedCategory.value) {
        filtered = filtered.filter(test => test.category_id === selectedCategory.value)
      }

      if (filters.value.category) {
        filtered = filtered.filter(test => test.category_id === filters.value.category)
      }

      if (filters.value.status) {
        filtered = filtered.filter(test => test.status === filters.value.status)
      }

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(test => 
          test.name.toLowerCase().includes(search) ||
          test.code.toLowerCase().includes(search) ||
          test.description?.toLowerCase().includes(search)
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
    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          laboratoryStore.fetchLabTests(),
          laboratoryStore.fetchTestCategories()
        ])
        if (testCategories.value.length > 0 && !selectedCategory.value) {
          selectedCategory.value = testCategories.value[0].id
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const editTest = (test) => {
      selectedTest.value = test
      formData.value = {
        name: test.name,
        code: test.code,
        category_id: test.category_id,
        description: test.description || '',
        price: test.price,
        turnaround_time: test.turnaround_time,
        unit: test.unit || '',
        normal_range_male: test.normal_range_male || '',
        normal_range_female: test.normal_range_female || '',
        preparation_instructions: test.preparation_instructions || '',
        status: test.status
      }
      showEditModal.value = true
    }

    const duplicateTest = (test) => {
      selectedTest.value = null
      formData.value = {
        name: `${test.name} (Copy)`,
        code: `${test.code}_COPY`,
        category_id: test.category_id,
        description: test.description || '',
        price: test.price,
        turnaround_time: test.turnaround_time,
        unit: test.unit || '',
        normal_range_male: test.normal_range_male || '',
        normal_range_female: test.normal_range_female || '',
        preparation_instructions: test.preparation_instructions || '',
        status: 'active'
      }
      showCreateModal.value = true
    }

    const toggleTestStatus = async (test) => {
      try {
        const newStatus = test.status === 'active' ? 'inactive' : 'active'
        await laboratoryStore.updateLabTest(test.id, { status: newStatus })
      } catch (error) {
        console.error('Error updating test status:', error)
      }
    }

    const deleteTest = async (test) => {
      if (confirm(`Are you sure you want to delete "${test.name}"?`)) {
        try {
          await laboratoryStore.deleteLabTest(test.id)
        } catch (error) {
          console.error('Error deleting test:', error)
        }
      }
    }

    const saveTest = async () => {
      saving.value = true
      try {
        if (showCreateModal.value) {
          await laboratoryStore.createLabTest(formData.value)
        } else {
          await laboratoryStore.updateLabTest(selectedTest.value.id, formData.value)
        }
        closeModal()
      } catch (error) {
        console.error('Error saving test:', error)
      } finally {
        saving.value = false
      }
    }

    const addCategory = async () => {
      try {
        await laboratoryStore.createTestCategory(newCategory.value)
        newCategory.value = { name: '', description: '' }
      } catch (error) {
        console.error('Error adding category:', error)
      }
    }

    const editCategory = (category) => {
      // Implement category editing
      console.log('Edit category:', category)
    }

    const deleteCategory = async (category) => {
      if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        try {
          await laboratoryStore.deleteTestCategory(category.id)
        } catch (error) {
          console.error('Error deleting category:', error)
        }
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      showCategoryModal.value = false
      selectedTest.value = null
      formData.value = {
        name: '',
        code: '',
        category_id: '',
        description: '',
        price: '',
        turnaround_time: '',
        unit: '',
        normal_range_male: '',
        normal_range_female: '',
        preparation_instructions: '',
        status: 'active'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      loading,
      saving,
      showCreateModal,
      showEditModal,
      showCategoryModal,
      selectedTest,
      selectedCategory,
      currentPage,
      filters,
      formData,
      newCategory,
      tests,
      testCategories,
      getTestsByCategory,
      filteredTests,
      totalPages,
      paginatedTests,
      applyFilters,
      editTest,
      duplicateTest,
      toggleTestStatus,
      deleteTest,
      saveTest,
      addCategory,
      editCategory,
      deleteCategory,
      closeModal
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/laboratory.css';
</style>
