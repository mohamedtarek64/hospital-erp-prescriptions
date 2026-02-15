import { ref, computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.js'

export function useInventoryManagement() {
  const equipmentStore = useEquipmentStore()

  // Reactive state
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedStatus = ref('')
  const selectedLocation = ref('')
  const sortBy = ref('name')
  const selectAll = ref(false)
  const selectedItems = ref([])
  const showAddItemModal = ref(false)
  const showStockModal = ref(false)
  const selectedItem = ref(null)

  const newItem = ref({
    name: '',
    sku: '',
    category_id: '',
    location: '',
    quantity: 0,
    minimum_stock: 0,
    unit_price: 0,
    supplier: '',
    description: ''
  })

  const stockAdjustment = ref({
    type: 'add',
    quantity: 0,
    reason: 'purchase',
    notes: ''
  })

  // Mock inventory data (in real app, this would come from API)
  const inventoryItems = ref([
    {
      id: 1,
      name: 'Surgical Scissors',
      sku: 'SC-001',
      category: { id: 1, name: 'Surgical Instruments' },
      category_id: 1,
      quantity: 25,
      minimum_stock: 10,
      unit_price: 45.99,
      location: 'Operating Room 1',
      supplier: 'MedSupply Co.',
      description: 'High-quality stainless steel surgical scissors',
      last_updated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Blood Pressure Cuff',
      sku: 'BPC-002',
      category: { id: 2, name: 'Diagnostic Equipment' },
      category_id: 2,
      quantity: 8,
      minimum_stock: 15,
      unit_price: 89.50,
      location: 'Emergency Department',
      supplier: 'HealthTech Inc.',
      description: 'Digital blood pressure monitoring cuff',
      last_updated: '2024-01-14'
    },
    {
      id: 3,
      name: 'IV Catheter',
      sku: 'IVC-003',
      category: { id: 3, name: 'Medical Supplies' },
      category_id: 3,
      quantity: 0,
      minimum_stock: 50,
      unit_price: 12.75,
      location: 'ICU',
      supplier: 'MedLine Supplies',
      description: 'Sterile IV catheter set',
      last_updated: '2024-01-13'
    }
  ])

  // Computed properties
  const categories = computed(() => equipmentStore.categories)
  const locations = computed(() => {
    const uniqueLocations = [...new Set(inventoryItems.value.map(item => item.location))]
    return uniqueLocations.sort()
  })

  const filteredItems = computed(() => {
    let filtered = inventoryItems.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory.value) {
      filtered = filtered.filter(item => item.category_id === selectedCategory.value)
    }

    // Apply status filter
    if (selectedStatus.value) {
      filtered = filtered.filter(item => getStockStatus(item) === selectedStatus.value)
    }

    // Apply location filter
    if (selectedLocation.value) {
      filtered = filtered.filter(item => item.location === selectedLocation.value)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category?.name.localeCompare(b.category?.name)
        case 'quantity':
          return b.quantity - a.quantity
        case 'value':
          return (b.quantity * b.unit_price) - (a.quantity * a.unit_price)
        case 'last_updated':
          return new Date(b.last_updated) - new Date(a.last_updated)
        default:
          return 0
      }
    })

    return filtered
  })

  const totalItems = computed(() => inventoryItems.value.length)
  const lowStockItems = computed(() => 
    inventoryItems.value.filter(item => 
      item.quantity <= item.minimum_stock && item.quantity > 0
    ).length
  )
  const outOfStockItems = computed(() => 
    inventoryItems.value.filter(item => item.quantity === 0).length
  )
  const totalInventoryValue = computed(() => 
    inventoryItems.value.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  )

  // Methods
  const refreshInventory = async () => {
    try {
      await equipmentStore.fetchCategories()
      // In real app, fetch inventory items from API
    } catch (error) {
      console.error('Error refreshing inventory:', error)
    }
  }

  const searchItems = () => {
    // Search is handled by computed property
  }

  const filterItems = () => {
    // Filtering is handled by computed property
  }

  const sortItems = () => {
    // Sorting is handled by computed property
  }

  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedItems.value = filteredItems.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }

  const bulkUpdate = () => {
    if (selectedItems.value.length === 0) {
      alert('Please select items to update')
      return
    }
    console.log('Bulk update selected items:', selectedItems.value)
  }

  const addItem = async () => {
    try {
      const newId = Math.max(...inventoryItems.value.map(item => item.id)) + 1
      const item = {
        id: newId,
        ...newItem.value,
        last_updated: new Date().toISOString().split('T')[0]
      }
      inventoryItems.value.push(item)
      showAddItemModal.value = false
      resetNewItem()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const resetNewItem = () => {
    newItem.value = {
      name: '',
      sku: '',
      category_id: '',
      location: '',
      quantity: 0,
      minimum_stock: 0,
      unit_price: 0,
      supplier: '',
      description: ''
    }
  }

  const viewItem = (item) => {
    selectedItem.value = item
  }

  const editItem = (item) => {
    // Navigate to edit page or open edit modal
    console.log('Edit item:', item)
  }

  const adjustStock = (item) => {
    selectedItem.value = item
    stockAdjustment.value = {
      type: 'add',
      quantity: 0,
      reason: 'purchase',
      notes: ''
    }
    showStockModal.value = true
  }

  const adjustStockQuantity = async () => {
    try {
      const item = selectedItem.value
      const adjustment = stockAdjustment.value
      let newQuantity = item.quantity

      switch (adjustment.type) {
        case 'add':
          newQuantity += adjustment.quantity
          break
        case 'remove':
          newQuantity -= adjustment.quantity
          break
        case 'set':
          newQuantity = adjustment.quantity
          break
      }

      if (newQuantity < 0) {
        alert('Quantity cannot be negative')
        return
      }

      // Update item quantity
      const index = inventoryItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        inventoryItems.value[index].quantity = newQuantity
        inventoryItems.value[index].last_updated = new Date().toISOString().split('T')[0]
      }

      showStockModal.value = false
      selectedItem.value = null
    } catch (error) {
      console.error('Error adjusting stock:', error)
    }
  }

  const deleteItem = (item) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      const index = inventoryItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        inventoryItems.value.splice(index, 1)
      }
    }
  }

  const viewLowStockItems = () => {
    selectedStatus.value = 'low_stock'
  }

  const exportInventory = () => {
    const csvContent = generateCSV(filteredItems.value)
    downloadCSV(csvContent, 'inventory.csv')
  }

  const generateCSV = (items) => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Unit Price', 'Total Value', 'Location', 'Status']
    const rows = items.map(item => [
      item.name,
      item.sku,
      item.category?.name || '',
      item.quantity,
      item.minimum_stock,
      item.unit_price,
      (item.quantity * item.unit_price).toFixed(2),
      item.location,
      getStockStatus(item)
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'out_of_stock'
    if (item.quantity <= item.minimum_stock) return 'low_stock'
    return 'in_stock'
  }

  const getStockStatusClass = (item) => {
    const status = getStockStatus(item)
    switch (status) {
      case 'out_of_stock':
        return 'text-red-600 font-semibold'
      case 'low_stock':
        return 'text-yellow-600 font-semibold'
      default:
        return 'text-green-600 font-semibold'
    }
  }

  // Lifecycle
  onMounted(async () => {
    await refreshInventory()
  })

  return {
    // State
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    sortBy,
    selectAll,
    selectedItems,
    showAddItemModal,
    showStockModal,
    selectedItem,
    newItem,
    stockAdjustment,
    inventoryItems,
    
    // Computed
    categories,
    locations,
    filteredItems,
    totalItems,
    lowStockItems,
    outOfStockItems,
    totalInventoryValue,
    
    // Methods
    refreshInventory,
    searchItems,
    filterItems,
    sortItems,
    toggleSelectAll,
    bulkUpdate,
    addItem,
    viewItem,
    editItem,
    adjustStock,
    adjustStockQuantity,
    deleteItem,
    viewLowStockItems,
    exportInventory,
    getStockStatus,
    getStockStatusClass
  }
}
