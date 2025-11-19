import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const inventory = ref([])
  const categories = ref([])
  const suppliers = ref([])
  const stockMovements = ref([])
  const alerts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalItems = computed(() => inventory.value.length)
  const totalCategories = computed(() => categories.value.length)
  const totalSuppliers = computed(() => suppliers.value.length)
  const totalStockMovements = computed(() => stockMovements.value.length)
  const totalAlerts = computed(() => alerts.value.length)

  const lowStockItems = computed(() => 
    inventory.value.filter(item => item.currentStock <= item.minStock)
  )

  const outOfStockItems = computed(() => 
    inventory.value.filter(item => item.currentStock === 0)
  )

  const expiredItems = computed(() => {
    const today = new Date()
    return inventory.value.filter(item => 
      new Date(item.expiryDate) < today
    )
  })

  const expiringSoonItems = computed(() => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    return inventory.value.filter(item => {
      const expiryDate = new Date(item.expiryDate)
      return expiryDate > today && expiryDate <= thirtyDaysFromNow
    })
  })

  const totalInventoryValue = computed(() => 
    inventory.value.reduce((sum, item) => sum + (item.currentStock * item.purchasePrice), 0)
  )

  const totalRetailValue = computed(() => 
    inventory.value.reduce((sum, item) => sum + (item.currentStock * item.sellingPrice), 0)
  )

  const categoryBreakdown = computed(() => {
    const breakdown = {}
    
    inventory.value.forEach(item => {
      const category = item.category || 'غير محدد'
      if (!breakdown[category]) {
        breakdown[category] = {
          name: category,
          count: 0,
          totalValue: 0,
          totalStock: 0
        }
      }
      
      breakdown[category].count++
      breakdown[category].totalValue += item.currentStock * item.purchasePrice
      breakdown[category].totalStock += item.currentStock
    })
    
    return Object.values(breakdown).sort((a, b) => b.totalValue - a.totalValue)
  })

  const supplierBreakdown = computed(() => {
    const breakdown = {}
    
    inventory.value.forEach(item => {
      const supplier = item.supplier?.name || 'غير محدد'
      if (!breakdown[supplier]) {
        breakdown[supplier] = {
          name: supplier,
          count: 0,
          totalValue: 0,
          totalStock: 0
        }
      }
      
      breakdown[supplier].count++
      breakdown[supplier].totalValue += item.currentStock * item.purchasePrice
      breakdown[supplier].totalStock += item.currentStock
    })
    
    return Object.values(breakdown).sort((a, b) => b.totalValue - a.totalValue)
  })

  const recentStockMovements = computed(() => 
    stockMovements.value
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
  )

  const criticalAlerts = computed(() => 
    alerts.value.filter(alert => alert.severity === 'critical')
  )

  const warningAlerts = computed(() => 
    alerts.value.filter(alert => alert.severity === 'warning')
  )

  const infoAlerts = computed(() => 
    alerts.value.filter(alert => alert.severity === 'info')
  )

  // Actions
  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (message) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Inventory Actions
  const setInventory = (inventoryList) => {
    inventory.value = inventoryList
  }

  const addInventoryItem = (item) => {
    inventory.value.unshift(item)
  }

  const updateInventoryItem = (id, updatedItem) => {
    const index = inventory.value.findIndex(i => i.id === id)
    if (index !== -1) {
      inventory.value[index] = { ...inventory.value[index], ...updatedItem }
    }
  }

  const removeInventoryItem = (id) => {
    const index = inventory.value.findIndex(i => i.id === id)
    if (index !== -1) {
      inventory.value.splice(index, 1)
    }
  }

  const getInventoryItemById = (id) => {
    return inventory.value.find(i => i.id === id)
  }

  const searchInventory = (query) => {
    if (!query) return inventory.value
    
    const searchTerm = query.toLowerCase()
    return inventory.value.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.supplier?.name?.toLowerCase().includes(searchTerm) ||
      item.barcode?.includes(searchTerm)
    )
  }

  const filterInventoryByCategory = (categoryId) => {
    if (!categoryId) return inventory.value
    return inventory.value.filter(item => item.categoryId === categoryId)
  }

  const filterInventoryBySupplier = (supplierId) => {
    if (!supplierId) return inventory.value
    return inventory.value.filter(item => item.supplierId === supplierId)
  }

  const filterInventoryByStatus = (status) => {
    switch (status) {
      case 'in_stock':
        return inventory.value.filter(item => item.currentStock > item.minStock)
      case 'low_stock':
        return inventory.value.filter(item => 
          item.currentStock > 0 && item.currentStock <= item.minStock
        )
      case 'out_of_stock':
        return inventory.value.filter(item => item.currentStock === 0)
      case 'expired':
        return expiredItems.value
      case 'expiring_soon':
        return expiringSoonItems.value
      default:
        return inventory.value
    }
  }

  // Stock Movement Actions
  const addStockMovement = (movement) => {
    stockMovements.value.unshift(movement)
  }

  const adjustStock = (itemId, quantity, type, reason, notes = '') => {
    const item = getInventoryItemById(itemId)
    if (!item) return false

    const oldStock = item.currentStock
    let newStock = oldStock

    switch (type) {
      case 'add':
        newStock = oldStock + quantity
        break
      case 'subtract':
        newStock = Math.max(0, oldStock - quantity)
        break
      case 'set':
        newStock = quantity
        break
      default:
        return false
    }

    // Update inventory item
    item.currentStock = newStock
    item.lastModified = new Date().toISOString()

    // Add stock movement record
    const movement = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      type,
      quantity: Math.abs(newStock - oldStock),
      oldStock,
      newStock,
      reason,
      notes,
      createdAt: new Date().toISOString(),
      userId: 'current-user-id' // TODO: Get from auth store
    }

    addStockMovement(movement)

    // Check if we need to create alerts
    checkAndCreateAlerts(item)

    return true
  }

  const checkAndCreateAlerts = (item) => {
    const today = new Date()
    const alerts = []

    // Low stock alert
    if (item.currentStock <= item.minStock && item.currentStock > 0) {
      alerts.push({
        id: Date.now().toString(),
        type: 'low_stock',
        severity: 'warning',
        title: 'مخزون منخفض',
        message: `المخزون الحالي للدواء ${item.name} منخفض (${item.currentStock} وحدة)`,
        itemId: item.id,
        itemName: item.name,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Out of stock alert
    if (item.currentStock === 0) {
      alerts.push({
        id: Date.now().toString(),
        type: 'out_of_stock',
        severity: 'critical',
        title: 'نفذ المخزون',
        message: `الدواء ${item.name} نفذ من المخزون`,
        itemId: item.id,
        itemName: item.name,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Expiry alert
    const expiryDate = new Date(item.expiryDate)
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      alerts.push({
        id: Date.now().toString(),
        type: 'expiring_soon',
        severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
        title: 'ينتهي الصلاحية قريباً',
        message: `الدواء ${item.name} سينتهي صلاحيته خلال ${daysUntilExpiry} يوم`,
        itemId: item.id,
        itemName: item.name,
        expiryDate: item.expiryDate,
        daysUntilExpiry,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Expired alert
    if (expiryDate < today) {
      alerts.push({
        id: Date.now().toString(),
        type: 'expired',
        severity: 'critical',
        title: 'انتهت الصلاحية',
        message: `الدواء ${item.name} انتهت صلاحيته`,
        itemId: item.id,
        itemName: item.name,
        expiryDate: item.expiryDate,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Add new alerts
    alerts.forEach(alert => {
      if (!this.alerts.value.find(a => 
        a.type === alert.type && 
        a.itemId === alert.itemId && 
        !a.acknowledged
      )) {
        this.alerts.value.push(alert)
      }
    })
  }

  // Category Actions
  const setCategories = (categoriesList) => {
    categories.value = categoriesList
  }

  const addCategory = (category) => {
    categories.value.unshift(category)
  }

  const updateCategory = (id, updatedCategory) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updatedCategory }
    }
  }

  const removeCategory = (id) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value.splice(index, 1)
    }
  }

  const getCategoryById = (id) => {
    return categories.value.find(c => c.id === id)
  }

  // Supplier Actions
  const setSuppliers = (suppliersList) => {
    suppliers.value = suppliersList
  }

  const addSupplier = (supplier) => {
    suppliers.value.unshift(supplier)
  }

  const updateSupplier = (id, updatedSupplier) => {
    const index = suppliers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      suppliers.value[index] = { ...suppliers.value[index], ...updatedSupplier }
    }
  }

  const removeSupplier = (id) => {
    const index = suppliers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      suppliers.value.splice(index, 1)
    }
  }

  const getSupplierById = (id) => {
    return suppliers.value.find(s => s.id === id)
  }

  // Alert Actions
  const acknowledgeAlert = (alertId) => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date().toISOString()
    }
  }

  const acknowledgeAllAlerts = () => {
    alerts.value.forEach(alert => {
      if (!alert.acknowledged) {
        alert.acknowledged = true
        alert.acknowledgedAt = new Date().toISOString()
      }
    })
  }

  const removeAlert = (alertId) => {
    const index = alerts.value.findIndex(a => a.id === alertId)
    if (index !== -1) {
      alerts.value.splice(index, 1)
    }
  }

  const clearExpiredAlerts = () => {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    alerts.value = alerts.value.filter(alert => 
      new Date(alert.createdAt) > thirtyDaysAgo
    )
  }

  // Analytics Actions
  const getStockValueByCategory = () => {
    return categoryBreakdown.value.map(category => ({
      name: category.name,
      value: category.totalValue,
      stock: category.totalStock
    }))
  }

  const getStockValueBySupplier = () => {
    return supplierBreakdown.value.map(supplier => ({
      name: supplier.name,
      value: supplier.totalValue,
      stock: supplier.totalStock
    }))
  }

  const getMonthlyStockMovements = (year, month) => {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    return stockMovements.value.filter(movement => {
      const movementDate = new Date(movement.createdAt)
      return movementDate >= startDate && movementDate <= endDate
    })
  }

  const getStockTurnoverRate = (itemId, period = 30) => {
    const item = getInventoryItemById(itemId)
    if (!item) return 0

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000))
    
    const movements = stockMovements.value.filter(movement => 
      movement.itemId === itemId &&
      new Date(movement.createdAt) >= startDate &&
      new Date(movement.createdAt) <= endDate &&
      movement.type === 'subtract'
    )

    const totalSold = movements.reduce((sum, m) => sum + m.quantity, 0)
    const averageStock = (item.currentStock + item.minStock) / 2

    return averageStock > 0 ? (totalSold / averageStock) * (365 / period) : 0
  }

  // Export Actions
  const exportInventoryToCSV = () => {
    const headers = [
      'اسم الدواء',
      'الفئة',
      'المورد',
      'المخزون الحالي',
      'المخزون الأدنى',
      'سعر الشراء',
      'سعر البيع',
      'تاريخ انتهاء الصلاحية',
      'آخر تعديل'
    ]

    const csvContent = [
      headers.join(','),
      ...inventory.value.map(item => [
        item.name,
        item.category || '',
        item.supplier?.name || '',
        item.currentStock,
        item.minStock,
        item.purchasePrice,
        item.sellingPrice,
        item.expiryDate,
        item.lastModified
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportStockMovementsToCSV = () => {
    const headers = [
      'اسم الدواء',
      'النوع',
      'الكمية',
      'المخزون القديم',
      'المخزون الجديد',
      'السبب',
      'الملاحظات',
      'التاريخ'
    ]

    const csvContent = [
      headers.join(','),
      ...stockMovements.value.map(movement => [
        movement.itemName,
        movement.type,
        movement.quantity,
        movement.oldStock,
        movement.newStock,
        movement.reason,
        movement.notes,
        movement.createdAt
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Reset Actions
  const resetStore = () => {
    inventory.value = []
    categories.value = []
    suppliers.value = []
    stockMovements.value = []
    alerts.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    inventory,
    categories,
    suppliers,
    stockMovements,
    alerts,
    loading,
    error,
    
    // Getters
    totalItems,
    totalCategories,
    totalSuppliers,
    totalStockMovements,
    totalAlerts,
    lowStockItems,
    outOfStockItems,
    expiredItems,
    expiringSoonItems,
    totalInventoryValue,
    totalRetailValue,
    categoryBreakdown,
    supplierBreakdown,
    recentStockMovements,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    
    // Actions
    setLoading,
    setError,
    clearError,
    
    // Inventory Actions
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    getInventoryItemById,
    searchInventory,
    filterInventoryByCategory,
    filterInventoryBySupplier,
    filterInventoryByStatus,
    
    // Stock Movement Actions
    addStockMovement,
    adjustStock,
    checkAndCreateAlerts,
    
    // Category Actions
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    getCategoryById,
    
    // Supplier Actions
    setSuppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
    getSupplierById,
    
    // Alert Actions
    acknowledgeAlert,
    acknowledgeAllAlerts,
    removeAlert,
    clearExpiredAlerts,
    
    // Analytics Actions
    getStockValueByCategory,
    getStockValueBySupplier,
    getMonthlyStockMovements,
    getStockTurnoverRate,
    
    // Export Actions
    exportInventoryToCSV,
    exportStockMovementsToCSV,
    
    // Reset Actions
    resetStore,
    
    // API Actions
    fetchInventory: async () => {
      try {
        loading.value = true
        const response = await apiClient.get('/api/inventory')
        inventory.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch inventory'
        throw err
      } finally {
        loading.value = false
      }
    },
    
    fetchCategories: async () => {
      try {
        const response = await apiClient.get('/api/inventory/categories')
        categories.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch categories'
        throw err
      }
    },
    
    fetchSuppliers: async () => {
      try {
        const response = await apiClient.get('/api/inventory/suppliers')
        suppliers.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch suppliers'
        throw err
      }
    }
  }
})
