import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment.js'
import { useMaintenanceStore } from '@/stores/maintenance.js'

export function useEquipmentDashboard() {
  const router = useRouter()
  const equipmentStore = useEquipmentStore()
  const maintenanceStore = useMaintenanceStore()

  // Reactive state
  const showAddEquipmentModal = ref(false)
  const newEquipment = ref({
    name: '',
    category_id: '',
    serial_number: '',
    location: '',
    purchase_date: '',
    purchase_price: ''
  })

  // Computed properties
  const totalEquipment = computed(() => equipmentStore.totalEquipment)
  const maintenanceDue = computed(() => maintenanceStore.overdueMaintenance.length)
  const criticalIssues = computed(() => maintenanceStore.criticalMaintenance.length)
  const totalValue = computed(() => equipmentStore.totalValue)
  const operationalCount = computed(() => equipmentStore.operationalEquipment.length)
  const maintenanceCount = computed(() => equipmentStore.maintenanceEquipment.length)
  const outOfServiceCount = computed(() => equipmentStore.outOfServiceEquipment.length)
  const retiredCount = computed(() => equipmentStore.equipment.filter(item => item.status === 'retired').length)
  const categories = computed(() => equipmentStore.categories)

  // Mock data for recent activities
  const recentActivities = ref([
    {
      id: 1,
      title: 'New Equipment Added',
      description: 'MRI Scanner Model X-2000 added to Radiology Department',
      time: '2 hours ago',
      icon: 'fas fa-plus-circle'
    },
    {
      id: 2,
      title: 'Maintenance Completed',
      description: 'Ventilator maintenance completed successfully',
      time: '4 hours ago',
      icon: 'fas fa-wrench'
    },
    {
      id: 3,
      title: 'Equipment Moved',
      description: 'X-Ray machine relocated to Emergency Department',
      time: '6 hours ago',
      icon: 'fas fa-arrows-alt'
    },
    {
      id: 4,
      title: 'Low Stock Alert',
      description: 'Surgical instruments running low on stock',
      time: '8 hours ago',
      icon: 'fas fa-exclamation-triangle'
    }
  ])

  // Methods
  const refreshDashboard = async () => {
    try {
      await Promise.all([
        equipmentStore.fetchEquipment(),
        equipmentStore.fetchCategories(),
        maintenanceStore.fetchSchedules()
      ])
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    }
  }

  const addEquipment = async () => {
    try {
      await equipmentStore.addEquipment(newEquipment.value)
      showAddEquipmentModal.value = false
      resetNewEquipment()
      await refreshDashboard()
    } catch (error) {
      console.error('Error adding equipment:', error)
    }
  }

  const resetNewEquipment = () => {
    newEquipment.value = {
      name: '',
      category_id: '',
      serial_number: '',
      location: '',
      purchase_date: '',
      purchase_price: ''
    }
  }

  const navigateToAssetTracking = () => {
    router.push('/equipment/asset-tracking')
  }

  const navigateToMaintenance = () => {
    router.push('/equipment/maintenance-scheduling')
  }

  const navigateToInventory = () => {
    router.push('/equipment/inventory-management')
  }

  const navigateToReports = () => {
    router.push('/reports')
  }

  // Lifecycle
  onMounted(async () => {
    await refreshDashboard()
  })

  return {
    // State
    showAddEquipmentModal,
    newEquipment,
    recentActivities,
    
    // Computed
    totalEquipment,
    maintenanceDue,
    criticalIssues,
    totalValue,
    operationalCount,
    maintenanceCount,
    outOfServiceCount,
    retiredCount,
    categories,
    
    // Methods
    refreshDashboard,
    addEquipment,
    navigateToAssetTracking,
    navigateToMaintenance,
    navigateToInventory,
    navigateToReports
  }
}
