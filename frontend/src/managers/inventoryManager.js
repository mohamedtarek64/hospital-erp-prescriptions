import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/pharmacyHelpers'

export class InventoryManager {
  constructor() {
    // Reactive state
    this.inventory = ref([])
    this.categories = ref([])
    this.currentPage = ref(1)
    this.itemsPerPage = ref(20)
    this.totalItems = ref(0)
    this.isLoading = ref(false)
    
    // Filters
    this.searchFilter = ref('')
    this.categoryFilter = ref('')
    this.statusFilter = ref('')
    
    // Alerts
    this.lowStockAlerts = ref([])
    this.expiryAlerts = ref([])
    this.outOfStockAlerts = ref([])
    
    // Statistics
    this.totalValue = ref(0)
    this.inStockItems = ref(0)
    this.lowStockItems = ref(0)
    this.outOfStockItems = ref(0)
    this.expiringSoonItems = ref(0)
  }

  // Computed properties
  get filteredInventory() {
    let filtered = this.inventory.value

    // Apply search filter
    if (this.searchFilter.value) {
      const search = this.searchFilter.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.manufacturer?.toLowerCase().includes(search)
      )
    }

    // Apply category filter
    if (this.categoryFilter.value) {
      filtered = filtered.filter(item => item.category_id === this.categoryFilter.value)
    }

    // Apply status filter
    if (this.statusFilter.value) {
      filtered = filtered.filter(item => item.status === this.statusFilter.value)
    }

    return filtered
  }

  get totalPages() {
    return Math.ceil(this.filteredInventory.length / this.itemsPerPage.value)
  }

  get paginatedInventory() {
    const start = (this.currentPage.value - 1) * this.itemsPerPage.value
    const end = start + this.itemsPerPage.value
    return this.filteredInventory.slice(start, end)
  }

  // API Methods
  async fetchInventory(page = 1) {
    try {
      this.isLoading.value = true
      const authStore = useAuthStore()
      
      const response = await fetch(`/api/inventory?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }

      const data = await response.json()
      this.inventory.value = data.data || []
      this.totalItems.value = data.total || 0
      this.currentPage.value = page
      
      // Update statistics
      this.updateStatistics()
      
    } catch (error) {
      console.error('Error fetching inventory:', error)
      throw error
    } finally {
      this.isLoading.value = false
    }
  }

  async loadCategories() {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch('/api/medicine-categories', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      this.categories.value = data.data || []
      
    } catch (error) {
      console.error('Error loading categories:', error)
      this.categories.value = []
    }
  }

  async adjustStock(itemId, adjustmentData) {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`/api/inventory/${itemId}/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adjustmentData)
      })

      if (!response.ok) {
        throw new Error('Failed to adjust stock')
      }

      const data = await response.json()
      
      // Update local inventory
      const index = this.inventory.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        this.inventory.value[index] = { ...this.inventory.value[index], ...data.data }
      }
      
      // Update statistics and alerts
      this.updateStatistics()
      this.updateAlerts()
      
      return data.data
      
    } catch (error) {
      console.error('Error adjusting stock:', error)
      throw error
    }
  }

  async getStockHistory(itemId) {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`/api/inventory/${itemId}/history`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stock history')
      }

      const data = await response.json()
      return data.data || []
      
    } catch (error) {
      console.error('Error fetching stock history:', error)
      throw error
    }
  }

  async generateInventoryReport(reportType, filters = {}) {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch('/api/inventory/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: reportType,
          filters
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      return data.data
      
    } catch (error) {
      console.error('Error generating inventory report:', error)
      throw error
    }
  }

  // Utility Methods
  updateStatistics() {
    const items = this.inventory.value
    
    this.totalValue.value = items.reduce((sum, item) => {
      return sum + (item.currentStock * item.purchasePrice)
    }, 0)
    
    this.inStockItems.value = items.filter(item => item.currentStock > item.minStock).length
    this.lowStockItems.value = items.filter(item => 
      item.currentStock <= item.minStock && item.currentStock > 0
    ).length
    this.outOfStockItems.value = items.filter(item => item.currentStock === 0).length
    
    // Items expiring within 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    this.expiringSoonItems.value = items.filter(item => {
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date()
    }).length
  }

  updateAlerts() {
    const items = this.inventory.value
    
    // Low stock alerts
    this.lowStockAlerts.value = items.filter(item => 
      item.currentStock <= item.minStock && item.currentStock > 0
    ).map(item => ({
      id: item.id,
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock
    }))
    
    // Expiry alerts (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    this.expiryAlerts.value = items.filter(item => {
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date()
    }).map(item => ({
      id: item.id,
      name: item.name,
      expiryDate: item.expiryDate
    }))
    
    // Out of stock alerts
    this.outOfStockAlerts.value = items.filter(item => 
      item.currentStock === 0
    ).map(item => ({
      id: item.id,
      name: item.name
    }))
  }

  // Pagination Methods
  async goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.value = page
    }
  }

  async nextPage() {
    if (this.currentPage.value < this.totalPages) {
      this.currentPage.value++
    }
  }

  async previousPage() {
    if (this.currentPage.value > 1) {
      this.currentPage.value--
    }
  }

  // Filter Methods
  setSearchFilter(search) {
    this.searchFilter.value = search
    this.currentPage.value = 1
  }

  setCategoryFilter(category) {
    this.categoryFilter.value = category
    this.currentPage.value = 1
  }

  setStatusFilter(status) {
    this.statusFilter.value = status
    this.currentPage.value = 1
  }

  clearFilters() {
    this.searchFilter.value = ''
    this.categoryFilter.value = ''
    this.statusFilter.value = ''
    this.currentPage.value = 1
  }

  // Export Methods
  exportToCSV() {
    const headers = ['اسم الدواء', 'الفئة', 'الكمية المتوفرة', 'الحد الأدنى', 'تاريخ انتهاء الصلاحية', 'سعر الشراء', 'سعر البيع', 'الحالة']
    const csvContent = [
      headers.join(','),
      ...this.filteredInventory.map(item => [
        item.name,
        item.category,
        item.currentStock,
        item.minStock,
        formatDate(item.expiryDate),
        item.purchasePrice,
        item.sellingPrice,
        this.getStatusText(item.status)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportToPDF() {
    // Implementation for PDF export
    console.log('PDF export functionality to be implemented')
  }

  // Helper Methods
  getStatusText(status) {
    const statusMap = {
      'in_stock': 'متوفر',
      'low_stock': 'مخزون منخفض',
      'out_of_stock': 'نفذ'
    }
    return statusMap[status] || status
  }

  getStatusClass(status) {
    const statusClasses = {
      'in_stock': 'text-green-600',
      'low_stock': 'text-yellow-600',
      'out_of_stock': 'text-red-600'
    }
    return statusClasses[status] || 'text-gray-600'
  }

  getStockClass(current, min) {
    if (current === 0) return 'text-red-600 font-semibold'
    if (current <= min) return 'text-yellow-600 font-semibold'
    return 'text-green-600'
  }

  getExpiryClass(expiryDate) {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'text-red-600 font-semibold'
    if (daysUntilExpiry <= 30) return 'text-orange-600 font-semibold'
    return 'text-green-600'
  }

  // Initialize data
  async initializeData() {
    try {
      await Promise.all([
        this.fetchInventory(),
        this.loadCategories()
      ])
      
      this.updateStatistics()
      this.updateAlerts()
      
    } catch (error) {
      console.error('Error initializing inventory data:', error)
    }
  }
}

export function useInventoryManager() {
  const manager = new InventoryManager()
  
  return {
    // Reactive state
    inventory: manager.inventory,
    categories: manager.categories,
    currentPage: manager.currentPage,
    itemsPerPage: manager.itemsPerPage,
    totalItems: manager.totalItems,
    isLoading: manager.isLoading,
    
    // Filters
    searchFilter: manager.searchFilter,
    categoryFilter: manager.categoryFilter,
    statusFilter: manager.statusFilter,
    
    // Alerts
    lowStockAlerts: manager.lowStockAlerts,
    expiryAlerts: manager.expiryAlerts,
    outOfStockAlerts: manager.outOfStockAlerts,
    
    // Statistics
    totalValue: manager.totalValue,
    inStockItems: manager.inStockItems,
    lowStockItems: manager.lowStockItems,
    outOfStockItems: manager.outOfStockItems,
    expiringSoonItems: manager.expiringSoonItems,
    
    // Computed properties
    filteredInventory: manager.filteredInventory,
    totalPages: manager.totalPages,
    paginatedInventory: manager.paginatedInventory,
    
    // Methods
    fetchInventory: manager.fetchInventory.bind(manager),
    loadCategories: manager.loadCategories.bind(manager),
    adjustStock: manager.adjustStock.bind(manager),
    getStockHistory: manager.getStockHistory.bind(manager),
    generateInventoryReport: manager.generateInventoryReport.bind(manager),
    updateStatistics: manager.updateStatistics.bind(manager),
    updateAlerts: manager.updateAlerts.bind(manager),
    goToPage: manager.goToPage.bind(manager),
    nextPage: manager.nextPage.bind(manager),
    previousPage: manager.previousPage.bind(manager),
    setSearchFilter: manager.setSearchFilter.bind(manager),
    setCategoryFilter: manager.setCategoryFilter.bind(manager),
    setStatusFilter: manager.setStatusFilter.bind(manager),
    clearFilters: manager.clearFilters.bind(manager),
    exportToCSV: manager.exportToCSV.bind(manager),
    exportToPDF: manager.exportToPDF.bind(manager),
    getStatusText: manager.getStatusText.bind(manager),
    getStatusClass: manager.getStatusClass.bind(manager),
    getStockClass: manager.getStockClass.bind(manager),
    getExpiryClass: manager.getExpiryClass.bind(manager),
    initializeData: manager.initializeData.bind(manager)
  }
}
