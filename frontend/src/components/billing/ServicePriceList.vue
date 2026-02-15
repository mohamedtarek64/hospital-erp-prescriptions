<template>
  <div class="service-price-list">
    <div class="list-header">
      <h3 class="list-title">Service Price List</h3>
      <div class="list-actions">
        <button @click="exportPrices" class="export-btn">
          <i class="fas fa-download"></i>
          Export
        </button>
        <button @click="refreshPrices" class="refresh-btn">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="search-section">
      <div class="search-group">
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Search services..."
          class="search-input"
        >
        <select v-model="selectedCategory" class="category-filter">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>
    </div>

    <!-- Price List Table -->
    <div class="price-table">
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
            <span class="category-badge">{{ service.category?.name }}</span>
          </div>
          <div class="col-code">
            <span class="service-code">{{ service.code }}</span>
          </div>
          <div class="col-price">
            <div class="price-info">
              <span class="price-amount">{{ formatCurrency(service.price) }}</span>
              <div class="price-actions">
                <button @click="editPrice(service)" class="price-edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-tax">
            <span class="tax-rate">{{ service.tax_rate }}%</span>
          </div>
          <div class="col-status">
            <span :class="getStatusClass(service.status)">{{ service.status }}</span>
          </div>
          <div class="col-actions">
            <button @click="viewService(service)" class="action-btn view">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editService(service)" class="action-btn edit">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Summary -->
    <div class="price-summary">
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Total Services:</span>
          <span class="summary-value">{{ filteredServices.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Active Services:</span>
          <span class="summary-value">{{ activeServicesCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Average Price:</span>
          <span class="summary-value">{{ formatCurrency(averagePrice) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Price Range:</span>
          <span class="summary-value">{{ formatCurrency(minPrice) }} - {{ formatCurrency(maxPrice) }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Price Modal -->
    <div v-if="showPriceModal" class="modal-overlay" @click="closePriceModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Service Price</h3>
          <button @click="closePriceModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="savePrice" class="price-form">
          <div class="form-group">
            <label>Service Name</label>
            <input v-model="editingService.name" type="text" readonly>
          </div>

          <div class="form-group">
            <label>Current Price</label>
            <input v-model="editingService.price" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Tax Rate (%)</label>
            <input v-model="editingService.tax_rate" type="number" step="0.01" min="0" max="100">
          </div>

          <div class="form-group">
            <label>Price Change Reason</label>
            <textarea v-model="priceChangeReason" rows="3" placeholder="Reason for price change..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closePriceModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save Changes</button>
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
  name: 'ServicePriceList',
  setup() {
    const billingStore = useBillingStore()
    
    const services = ref([])
    const categories = ref([])
    const searchTerm = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('name')
    const showPriceModal = ref(false)
    const editingService = ref(null)
    const priceChangeReason = ref('')

    const filteredServices = computed(() => {
      let filtered = services.value

      // Filter by search term
      if (searchTerm.value) {
        filtered = filtered.filter(service =>
          service.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          service.code.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
      }

      // Filter by category
      if (selectedCategory.value) {
        filtered = filtered.filter(service => service.category_id == selectedCategory.value)
      }

      // Sort services
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'price':
            return a.price - b.price
          case 'category':
            return a.category?.name.localeCompare(b.category?.name)
          default:
            return 0
        }
      })

      return filtered
    })

    const activeServicesCount = computed(() => {
      return filteredServices.value.filter(service => service.status === 'active').length
    })

    const averagePrice = computed(() => {
      if (filteredServices.value.length === 0) return 0
      const total = filteredServices.value.reduce((sum, service) => sum + service.price, 0)
      return total / filteredServices.value.length
    })

    const minPrice = computed(() => {
      if (filteredServices.value.length === 0) return 0
      return Math.min(...filteredServices.value.map(service => service.price))
    })

    const maxPrice = computed(() => {
      if (filteredServices.value.length === 0) return 0
      return Math.max(...filteredServices.value.map(service => service.price))
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

    const editPrice = (service) => {
      editingService.value = { ...service }
      showPriceModal.value = true
    }

    const editService = (service) => {
      // Navigate to service edit page
      console.log('Edit service:', service)
    }

    const viewService = (service) => {
      // Navigate to service view page
      console.log('View service:', service)
    }

    const savePrice = async () => {
      try {
        await billingStore.updateService(editingService.value.id, {
          price: editingService.value.price,
          tax_rate: editingService.value.tax_rate
        })
        
        // Log price change
        if (priceChangeReason.value) {
          console.log('Price change reason:', priceChangeReason.value)
        }
        
        await loadData()
        closePriceModal()
      } catch (error) {
        console.error('Error saving price:', error)
      }
    }

    const closePriceModal = () => {
      showPriceModal.value = false
      editingService.value = null
      priceChangeReason.value = ''
    }

    const exportPrices = () => {
      const csvContent = [
        ['Service Name', 'Category', 'Code', 'Price', 'Tax Rate', 'Status'],
        ...filteredServices.value.map(service => [
          service.name,
          service.category?.name || '',
          service.code,
          service.price,
          service.tax_rate,
          service.status
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'service-prices.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    }

    const refreshPrices = () => {
      loadData()
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
      searchTerm,
      selectedCategory,
      sortBy,
      filteredServices,
      activeServicesCount,
      averagePrice,
      minPrice,
      maxPrice,
      showPriceModal,
      editingService,
      priceChangeReason,
      editPrice,
      editService,
      viewService,
      savePrice,
      closePriceModal,
      exportPrices,
      refreshPrices,
      getStatusClass,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
