import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatPrice } from '@/utils/pharmacyHelpers'

export class MedicineManager {
  constructor() {
    this.medicines = ref([])
    this.loading = ref(false)
    this.error = ref(null)
    this.filters = ref({
      search: '',
      category: '',
      manufacturer: '',
      stockStatus: '',
      priceRange: { min: 0, max: 10000 }
    })
    this.pagination = ref({
      currentPage: 1,
      perPage: 20,
      total: 0
    })
    
    this.authStore = useAuthStore()
  }

  // Getters
  get filteredMedicines() {
    return computed(() => {
      let filtered = this.medicines.value

      // Search filter
      if (this.filters.value.search) {
        const searchTerm = this.filters.value.search.toLowerCase()
        filtered = filtered.filter(medicine => 
          medicine.name.toLowerCase().includes(searchTerm) ||
          medicine.category.toLowerCase().includes(searchTerm) ||
          medicine.manufacturer.toLowerCase().includes(searchTerm)
        )
      }

      // Category filter
      if (this.filters.value.category) {
        filtered = filtered.filter(medicine => 
          medicine.category === this.filters.value.category
        )
      }

      // Manufacturer filter
      if (this.filters.value.manufacturer) {
        filtered = filtered.filter(medicine => 
          medicine.manufacturer === this.filters.value.manufacturer
        )
      }

      // Stock status filter
      if (this.filters.value.stockStatus) {
        filtered = filtered.filter(medicine => 
          medicine.stock_status === this.filters.value.stockStatus
        )
      }

      // Price range filter
      filtered = filtered.filter(medicine => 
        medicine.price >= this.filters.value.priceRange.min &&
        medicine.price <= this.filters.value.priceRange.max
      )

      return filtered
    })
  }

  get lowStockMedicines() {
    return computed(() => 
      this.medicines.value.filter(medicine => this.isLowStock(medicine))
    )
  }

  get outOfStockMedicines() {
    return computed(() => 
      this.medicines.value.filter(medicine => this.isOutOfStock(medicine))
    )
  }

  get expiringSoonMedicines() {
    return computed(() => 
      this.medicines.value.filter(medicine => this.isExpiringSoon(medicine))
    )
  }

  get totalInventoryValue() {
    return computed(() => 
      this.medicines.value.reduce((total, medicine) => {
        const quantity = medicine.available_quantity || 0
        return total + (medicine.price * quantity)
      }, 0)
    )
  }

  // Utility methods
  isLowStock(medicine) {
    const threshold = medicine.low_stock_threshold || 10
    return (medicine.available_quantity || 0) <= threshold && (medicine.available_quantity || 0) > 0
  }

  isOutOfStock(medicine) {
    return (medicine.available_quantity || 0) === 0
  }

  isExpiringSoon(medicine) {
    if (!medicine.expiry_date) return false
    const expiryDate = new Date(medicine.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  isExpired(medicine) {
    if (!medicine.expiry_date) return false
    const expiryDate = new Date(medicine.expiry_date)
    const today = new Date()
    return expiryDate < today
  }

  formatPrice(price) {
    return formatPrice(price)
  }

  formatDate(date) {
    return formatDate(date)
  }

  // API methods
  async fetchMedicines(page = 1) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/pharmacy/medicines?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch medicines')
      }

      const data = await response.json()
      this.medicines.value = data.data
      this.pagination.value = {
        currentPage: data.current_page,
        perPage: data.per_page,
        total: data.total
      }
    } catch (error) {
      this.error.value = error.message
      console.error('Error fetching medicines:', error)
    } finally {
      this.loading.value = false
    }
  }

  async createMedicine(medicineData) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicineData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create medicine')
      }

      const newMedicine = await response.json()
      this.medicines.value.unshift(newMedicine.data)
      return newMedicine.data
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateMedicine(id, medicineData) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/pharmacy/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicineData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update medicine')
      }

      const updatedMedicine = await response.json()
      const index = this.medicines.value.findIndex(m => m.id === id)
      if (index !== -1) {
        this.medicines.value[index] = updatedMedicine.data
      }
      return updatedMedicine.data
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteMedicine(id) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/pharmacy/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete medicine')
      }

      this.medicines.value = this.medicines.value.filter(m => m.id !== id)
      return true
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async dispenseMedicine(id, quantity, prescriptionId = null) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/pharmacy/medicines/${id}/dispense`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity,
          prescription_id: prescriptionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to dispense medicine')
      }

      const result = await response.json()
      
      // Update local medicine quantity
      const medicine = this.medicines.value.find(m => m.id === id)
      if (medicine) {
        medicine.available_quantity = Math.max(0, (medicine.available_quantity || 0) - quantity)
      }

      return result
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async getCategories() {
    try {
      const response = await fetch('/api/pharmacy/categories', {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  async getManufacturers() {
    try {
      const response = await fetch('/api/pharmacy/manufacturers', {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch manufacturers')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
      return []
    }
  }

  async getStatistics() {
    try {
      const response = await fetch('/api/pharmacy/statistics', {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return {}
    }
  }

  // Filter methods
  setSearchFilter(search) {
    this.filters.value.search = search
    this.pagination.value.currentPage = 1
  }

  setCategoryFilter(category) {
    this.filters.value.category = category
    this.pagination.value.currentPage = 1
  }

  setManufacturerFilter(manufacturer) {
    this.filters.value.manufacturer = manufacturer
    this.pagination.value.currentPage = 1
  }

  setStockStatusFilter(status) {
    this.filters.value.stockStatus = status
    this.pagination.value.currentPage = 1
  }

  setPriceRangeFilter(min, max) {
    this.filters.value.priceRange = { min, max }
    this.pagination.value.currentPage = 1
  }

  clearFilters() {
    this.filters.value = {
      search: '',
      category: '',
      manufacturer: '',
      stockStatus: '',
      priceRange: { min: 0, max: 10000 }
    }
    this.pagination.value.currentPage = 1
  }

  // Pagination methods
  async goToPage(page) {
    if (page >= 1 && page <= Math.ceil(this.pagination.value.total / this.pagination.value.perPage)) {
      await this.fetchMedicines(page)
    }
  }

  async nextPage() {
    const nextPage = this.pagination.value.currentPage + 1
    if (nextPage <= Math.ceil(this.pagination.value.total / this.pagination.value.perPage)) {
      await this.fetchMedicines(nextPage)
    }
  }

  async previousPage() {
    const prevPage = this.pagination.value.currentPage - 1
    if (prevPage >= 1) {
      await this.fetchMedicines(prevPage)
    }
  }

  // Export methods
  exportToCSV() {
    const headers = ['Name', 'Category', 'Manufacturer', 'Price', 'Available Quantity', 'Expiry Date', 'Stock Status']
    const csvContent = [
      headers.join(','),
      ...this.filteredMedicines.value.map(medicine => [
        medicine.name,
        medicine.category,
        medicine.manufacturer,
        medicine.price,
        medicine.available_quantity || 0,
        medicine.expiry_date || '',
        medicine.stock_status || 'unknown'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `medicines_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportToPDF() {
    // Implementation for PDF export
    console.log('PDF export functionality to be implemented')
  }
}

// Composable function
export function useMedicineManager() {
  return new MedicineManager()
}
