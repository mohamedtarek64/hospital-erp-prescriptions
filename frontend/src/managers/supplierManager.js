import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatPrice, formatPhoneNumber } from '@/utils/pharmacyHelpers'

export class SupplierManager {
  constructor() {
    this.suppliers = ref([])
    this.loading = ref(false)
    this.error = ref(null)
    this.filters = ref({
      search: '',
      city: '',
      country: '',
      status: '',
      creditRange: { min: 0, max: 1000000 }
    })
    this.pagination = ref({
      currentPage: 1,
      perPage: 20,
      total: 0
    })
    
    this.authStore = useAuthStore()
  }

  // Getters
  get filteredSuppliers() {
    return computed(() => {
      let filtered = this.suppliers.value

      // Search filter
      if (this.filters.value.search) {
        const searchTerm = this.filters.value.search.toLowerCase()
        filtered = filtered.filter(supplier => 
          supplier.name.toLowerCase().includes(searchTerm) ||
          supplier.contact_person.toLowerCase().includes(searchTerm) ||
          supplier.email.toLowerCase().includes(searchTerm)
        )
      }

      // City filter
      if (this.filters.value.city) {
        filtered = filtered.filter(supplier => 
          supplier.city === this.filters.value.city
        )
      }

      // Country filter
      if (this.filters.value.country) {
        filtered = filtered.filter(supplier => 
          supplier.country === this.filters.value.country
        )
      }

      // Status filter
      if (this.filters.value.status) {
        filtered = filtered.filter(supplier => 
          supplier.status === this.filters.value.status
        )
      }

      // Credit range filter
      filtered = filtered.filter(supplier => 
        (supplier.outstanding_balance || 0) >= this.filters.value.creditRange.min &&
        (supplier.outstanding_balance || 0) <= this.filters.value.creditRange.max
      )

      return filtered
    })
  }

  get activeSuppliers() {
    return computed(() => 
      this.suppliers.value.filter(supplier => supplier.status === 'active')
    )
  }

  get suppliersWithOutstandingBalance() {
    return computed(() => 
      this.suppliers.value.filter(supplier => (supplier.outstanding_balance || 0) > 0)
    )
  }

  get topSuppliers() {
    return computed(() => 
      this.suppliers.value
        .sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))
        .slice(0, 5)
    )
  }

  get totalOutstandingBalance() {
    return computed(() => 
      this.suppliers.value.reduce((total, supplier) => {
        return total + (supplier.outstanding_balance || 0)
      }, 0)
    )
  }

  // Utility methods
  getSupplierPerformance(supplier) {
    const performance = {
      rating: 0,
      status: 'unknown'
    }

    if (supplier.total_orders > 0) {
      const onTimeDelivery = (supplier.on_time_deliveries || 0) / supplier.total_orders
      const qualityRating = supplier.quality_rating || 0
      
      performance.rating = Math.round((onTimeDelivery * 0.6 + qualityRating * 0.4) * 100)
      
      if (performance.rating >= 90) {
        performance.status = 'excellent'
      } else if (performance.rating >= 75) {
        performance.status = 'good'
      } else if (performance.rating >= 60) {
        performance.status = 'fair'
      } else {
        performance.status = 'poor'
      }
    }

    return performance
  }

  formatPrice(price) {
    return formatPrice(price)
  }

  formatDate(date) {
    return formatDate(date)
  }

  formatPhone(phone) {
    return formatPhoneNumber(phone)
  }

  // API methods
  async fetchSuppliers(page = 1) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/suppliers?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers')
      }

      const data = await response.json()
      this.suppliers.value = data.data
      this.pagination.value = {
        currentPage: data.current_page,
        perPage: data.per_page,
        total: data.total
      }
    } catch (error) {
      this.error.value = error.message
      console.error('Error fetching suppliers:', error)
    } finally {
      this.loading.value = false
    }
  }

  async createSupplier(supplierData) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create supplier')
      }

      const newSupplier = await response.json()
      this.suppliers.value.unshift(newSupplier.data)
      return newSupplier.data
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateSupplier(id, supplierData) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update supplier')
      }

      const updatedSupplier = await response.json()
      const index = this.suppliers.value.findIndex(s => s.id === id)
      if (index !== -1) {
        this.suppliers.value[index] = updatedSupplier.data
      }
      return updatedSupplier.data
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteSupplier(id) {
    try {
      this.loading.value = true
      this.error.value = null

      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete supplier')
      }

      this.suppliers.value = this.suppliers.value.filter(s => s.id !== id)
      return true
    } catch (error) {
      this.error.value = error.message
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async getSupplierPerformanceData(id) {
    try {
      const response = await fetch(`/api/suppliers/${id}/performance`, {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch supplier performance')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching supplier performance:', error)
      return {}
    }
  }

  async getSupplierAnalytics(id) {
    try {
      const response = await fetch(`/api/suppliers/${id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch supplier analytics')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching supplier analytics:', error)
      return {}
    }
  }

  async getCities() {
    try {
      const response = await fetch('/api/suppliers/cities', {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching cities:', error)
      return []
    }
  }

  async getCountries() {
    try {
      const response = await fetch('/api/suppliers/countries', {
        headers: {
          'Authorization': `Bearer ${this.authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch countries')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching countries:', error)
      return []
    }
  }

  // Filter methods
  setSearchFilter(search) {
    this.filters.value.search = search
    this.pagination.value.currentPage = 1
  }

  setCityFilter(city) {
    this.filters.value.city = city
    this.pagination.value.currentPage = 1
  }

  setCountryFilter(country) {
    this.filters.value.country = country
    this.pagination.value.currentPage = 1
  }

  setStatusFilter(status) {
    this.filters.value.status = status
    this.pagination.value.currentPage = 1
  }

  setCreditRangeFilter(min, max) {
    this.filters.value.creditRange = { min, max }
    this.pagination.value.currentPage = 1
  }

  clearFilters() {
    this.filters.value = {
      search: '',
      city: '',
      country: '',
      status: '',
      creditRange: { min: 0, max: 1000000 }
    }
    this.pagination.value.currentPage = 1
  }

  // Pagination methods
  async goToPage(page) {
    if (page >= 1 && page <= Math.ceil(this.pagination.value.total / this.pagination.value.perPage)) {
      await this.fetchSuppliers(page)
    }
  }

  async nextPage() {
    const nextPage = this.pagination.value.currentPage + 1
    if (nextPage <= Math.ceil(this.pagination.value.total / this.pagination.value.perPage)) {
      await this.fetchSuppliers(nextPage)
    }
  }

  async previousPage() {
    const prevPage = this.pagination.value.currentPage - 1
    if (prevPage >= 1) {
      await this.fetchSuppliers(prevPage)
    }
  }

  // Export methods
  exportToCSV() {
    const headers = ['Name', 'Contact Person', 'Phone', 'Email', 'Address', 'City', 'Country', 'Status', 'Outstanding Balance', 'Available Credit']
    const csvContent = [
      headers.join(','),
      ...this.filteredSuppliers.value.map(supplier => [
        supplier.name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.city,
        supplier.country,
        supplier.status,
        supplier.outstanding_balance || 0,
        supplier.available_credit || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportToPDF() {
    // Implementation for PDF export
    console.log('PDF export functionality to be implemented')
  }
}

// Composable function
export function useSupplierManager() {
  return new SupplierManager()
}
