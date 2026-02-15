<template>
  <div class="service-management">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Service Management</h1>
      <button @click="showAddModal = true" class="add-btn">
        <i class="fas fa-plus"></i>
        Add Service
      </button>
    </div>

    <!-- Service Categories -->
    <div class="categories-section">
      <h2 class="section-title">Service Categories</h2>
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.id" class="category-card">
          <div class="category-header">
            <h3 class="category-name">{{ category.name }}</h3>
            <div class="category-actions">
              <button @click="editCategory(category)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteCategory(category.id)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="category-description">{{ category.description }}</p>
          <div class="category-stats">
            <span class="service-count">{{ getCategoryServiceCount(category.id) }} services</span>
          </div>
        </div>
      </div>
      <button @click="showCategoryModal = true" class="add-category-btn">
        <i class="fas fa-plus"></i>
        Add Category
      </button>
    </div>

    <!-- Services List -->
    <div class="services-section">
      <h2 class="section-title">Services</h2>
      
      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Search services..."
            class="search-input"
          >
          <select v-model="filters.category" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <select v-model="filters.status" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Services Table -->
      <div class="services-table">
        <div class="table-header">
          <div class="table-row">
            <div class="col-service">Service</div>
            <div class="col-category">Category</div>
            <div class="col-code">Code</div>
            <div class="col-price">Price</div>
            <div class="col-tax">Tax Rate</div>
            <div class="col-status">Status</div>
            <div class="col-actions">Actions</div>
          </div>
        </div>
        
        <div class="table-body">
          <div v-for="service in filteredServices" :key="service.id" class="table-row">
            <div class="col-service">
              <div class="service-info">
                <span class="service-name">{{ service.name }}</span>
                <span class="service-description">{{ service.description }}</span>
              </div>
            </div>
            <div class="col-category">
              <span class="category-name">{{ service.category?.name }}</span>
            </div>
            <div class="col-code">
              <span class="service-code">{{ service.code }}</span>
            </div>
            <div class="col-price">
              <span class="service-price">{{ formatCurrency(service.price) }}</span>
            </div>
            <div class="col-tax">
              <span class="tax-rate">{{ service.tax_rate }}%</span>
            </div>
            <div class="col-status">
              <span :class="getStatusClass(service.status)">{{ service.status }}</span>
            </div>
            <div class="col-actions">
              <button @click="editService(service)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteService(service.id)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? 'Add Service' : 'Edit Service' }}</h2>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveService" class="service-form">
          <div class="form-group">
            <label>Service Name *</label>
            <input v-model="serviceForm.name" type="text" required>
          </div>

          <div class="form-group">
            <label>Service Code *</label>
            <input v-model="serviceForm.code" type="text" required>
          </div>

          <div class="form-group">
            <label>Category *</label>
            <select v-model="serviceForm.category_id" required>
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Price *</label>
            <input v-model="serviceForm.price" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Tax Rate (%)</label>
            <input v-model="serviceForm.tax_rate" type="number" step="0.01" min="0" max="100">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="serviceForm.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="serviceForm.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="closeCategoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add Category</h2>
          <button @click="closeCategoryModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="category-form">
          <div class="form-group">
            <label>Category Name *</label>
            <input v-model="categoryForm.name" type="text" required>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="categoryForm.description" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeCategoryModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing'
import { formatCurrency } from '@/utils/billingHelpers'

export default {
  name: 'ServiceManagement',
  setup() {
    const billingStore = useBillingStore()
    
    const services = ref([])
    const categories = ref([])
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showCategoryModal = ref(false)
    const editingService = ref(null)

    const filters = ref({
      search: '',
      category: '',
      status: ''
    })

    const serviceForm = ref({
      name: '',
      code: '',
      category_id: '',
      price: '',
      tax_rate: 10,
      description: '',
      status: 'active'
    })

    const categoryForm = ref({
      name: '',
      description: ''
    })

    const filteredServices = computed(() => {
      let filtered = services.value

      if (filters.value.search) {
        filtered = filtered.filter(service =>
          service.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          service.code.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      if (filters.value.category) {
        filtered = filtered.filter(service => service.category_id == filters.value.category)
      }

      if (filters.value.status) {
        filtered = filtered.filter(service => service.status === filters.value.status)
      }

      return filtered
    })

    const loadData = async () => {
      try {
        await Promise.all([
          billingStore.fetchServices(),
          billingStore.fetchServiceCategories()
        ])
        services.value = billingStore.services
        categories.value = billingStore.serviceCategories
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const getCategoryServiceCount = (categoryId) => {
      return services.value.filter(service => service.category_id == categoryId).length
    }

    const editService = (service) => {
      editingService.value = service
      serviceForm.value = { ...service }
      showEditModal.value = true
    }

    const deleteService = async (serviceId) => {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          await billingStore.deleteService(serviceId)
          await loadData()
        } catch (error) {
          console.error('Error deleting service:', error)
        }
      }
    }

    const saveService = async () => {
      try {
        if (showAddModal.value) {
          await billingStore.createService(serviceForm.value)
        } else {
          await billingStore.updateService(editingService.value.id, serviceForm.value)
        }
        await loadData()
        closeModal()
      } catch (error) {
        console.error('Error saving service:', error)
      }
    }

    const editCategory = (category) => {
      categoryForm.value = { ...category }
      showCategoryModal.value = true
    }

    const deleteCategory = async (categoryId) => {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          await billingStore.deleteServiceCategory(categoryId)
          await loadData()
        } catch (error) {
          console.error('Error deleting category:', error)
        }
      }
    }

    const saveCategory = async () => {
      try {
        await billingStore.createServiceCategory(categoryForm.value)
        await loadData()
        closeCategoryModal()
      } catch (error) {
        console.error('Error saving category:', error)
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      editingService.value = null
      serviceForm.value = {
        name: '',
        code: '',
        category_id: '',
        price: '',
        tax_rate: 10,
        description: '',
        status: 'active'
      }
    }

    const closeCategoryModal = () => {
      showCategoryModal.value = false
      categoryForm.value = {
        name: '',
        description: ''
      }
    }

    const getStatusClass = (status) => {
      return status === 'active' ? 'status-active' : 'status-inactive'
    }

    onMounted(() => {
      loadData()
    })

    return {
      services,
      categories,
      filters,
      serviceForm,
      categoryForm,
      filteredServices,
      showAddModal,
      showEditModal,
      showCategoryModal,
      getCategoryServiceCount,
      editService,
      deleteService,
      saveService,
      editCategory,
      deleteCategory,
      saveCategory,
      closeModal,
      closeCategoryModal,
      getStatusClass,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
