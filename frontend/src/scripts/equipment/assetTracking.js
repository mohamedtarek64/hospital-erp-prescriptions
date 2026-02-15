import { ref, computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.js'

export function useAssetTracking() {
  const equipmentStore = useEquipmentStore()

  // Reactive state
  const viewMode = ref('list')
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedStatus = ref('')
  const selectedLocation = ref('')
  const sortBy = ref('name')
  const selectedAsset = ref(null)

  // Computed properties
  const equipment = computed(() => equipmentStore.equipment)
  const categories = computed(() => equipmentStore.categories)
  const locations = computed(() => {
    const uniqueLocations = [...new Set(equipment.value.map(item => item.location))]
    return uniqueLocations.sort()
  })

  const filteredAssets = computed(() => {
    let filtered = equipment.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.serial_number.toLowerCase().includes(query) ||
        asset.location.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory.value) {
      filtered = filtered.filter(asset => asset.category_id === selectedCategory.value)
    }

    // Apply status filter
    if (selectedStatus.value) {
      filtered = filtered.filter(asset => asset.status === selectedStatus.value)
    }

    // Apply location filter
    if (selectedLocation.value) {
      filtered = filtered.filter(asset => asset.location === selectedLocation.value)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'location':
          return a.location.localeCompare(b.location)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'purchase_date':
          return new Date(b.purchase_date) - new Date(a.purchase_date)
        default:
          return 0
      }
    })

    return filtered
  })

  // Methods
  const refreshAssets = async () => {
    try {
      await equipmentStore.fetchEquipment()
    } catch (error) {
      console.error('Error refreshing assets:', error)
    }
  }

  const searchAssets = () => {
    // Search is handled by computed property
  }

  const filterAssets = () => {
    // Filtering is handled by computed property
  }

  const sortAssets = () => {
    // Sorting is handled by computed property
  }

  const viewAssetDetails = (asset) => {
    selectedAsset.value = asset
  }

  const editAsset = (asset) => {
    // Navigate to edit page or open edit modal
    console.log('Edit asset:', asset)
  }

  const trackAsset = (asset) => {
    // Implement asset tracking functionality
    console.log('Track asset:', asset)
  }

  const exportAssets = () => {
    // Implement export functionality
    const csvContent = generateCSV(filteredAssets.value)
    downloadCSV(csvContent, 'assets.csv')
  }

  const generateCSV = (assets) => {
    const headers = ['Name', 'Serial Number', 'Category', 'Location', 'Status', 'Purchase Date', 'Purchase Price']
    const rows = assets.map(asset => [
      asset.name,
      asset.serial_number,
      asset.category?.name || '',
      asset.location,
      asset.status,
      asset.purchase_date,
      asset.purchase_price
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // Lifecycle
  onMounted(async () => {
    await Promise.all([
      equipmentStore.fetchEquipment(),
      equipmentStore.fetchCategories()
    ])
  })

  return {
    // State
    viewMode,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    sortBy,
    selectedAsset,
    
    // Computed
    equipment,
    categories,
    locations,
    filteredAssets,
    
    // Methods
    refreshAssets,
    searchAssets,
    filterAssets,
    sortAssets,
    viewAssetDetails,
    editAsset,
    trackAsset,
    exportAssets,
    formatDate
  }
}
