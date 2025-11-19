/**
 * Ward Layout Management
 * Handles ward layout and design logic
 */

import { ref, computed, onMounted } from 'vue'
import { useWardStore } from '@/stores/ward'

export function useWardLayout() {
  const wardStore = useWardStore()
  
  // State
  const wards = ref([])
  const selectedWard = ref(null)
  const layout = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Computed
  const wardLayouts = computed(() => {
    return wards.value.map(ward => ({
      ...ward,
      layout: ward.layout || getDefaultLayout(ward.type)
    }))
  })
  
  const selectedWardLayout = computed(() => {
    if (!selectedWard.value) return null
    return selectedWard.value.layout || getDefaultLayout(selectedWard.value.type)
  })
  
  // Methods
  const loadWards = async () => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.fetchWards()
      wards.value = wardStore.wards
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const loadWardLayout = async (wardId) => {
    loading.value = true
    error.value = null
    
    try {
      const wardLayout = await wardStore.fetchWardLayout(wardId)
      layout.value = wardLayout
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const saveWardLayout = async (wardId, layoutData) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.saveWardLayout(wardId, layoutData)
      await loadWardLayout(wardId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const getDefaultLayout = (wardType) => {
    const defaultLayouts = {
      'general': {
        name: 'General Ward Layout',
        beds: 20,
        privateRooms: 2,
        sharedRooms: 4,
        bedsPerRoom: 4,
        facilities: ['nursing_station', 'bathroom', 'storage']
      },
      'icu': {
        name: 'ICU Layout',
        beds: 8,
        privateRooms: 8,
        sharedRooms: 0,
        bedsPerRoom: 1,
        facilities: ['nursing_station', 'monitoring', 'ventilator', 'bathroom']
      },
      'pediatric': {
        name: 'Pediatric Ward Layout',
        beds: 16,
        privateRooms: 2,
        sharedRooms: 3,
        bedsPerRoom: 4,
        facilities: ['nursing_station', 'play_area', 'bathroom', 'family_room']
      },
      'maternity': {
        name: 'Maternity Ward Layout',
        beds: 12,
        privateRooms: 6,
        sharedRooms: 2,
        bedsPerRoom: 2,
        facilities: ['nursing_station', 'delivery_room', 'bathroom', 'nursery']
      }
    }
    
    return defaultLayouts[wardType] || defaultLayouts['general']
  }
  
  const createCustomLayout = (wardData) => {
    return {
      name: wardData.name || 'Custom Layout',
      beds: wardData.beds || 10,
      privateRooms: wardData.privateRooms || 0,
      sharedRooms: wardData.sharedRooms || 0,
      bedsPerRoom: wardData.bedsPerRoom || 2,
      facilities: wardData.facilities || ['nursing_station', 'bathroom'],
      custom: true
    }
  }
  
  const updateLayout = (layoutData) => {
    layout.value = { ...layout.value, ...layoutData }
  }
  
  const addRoom = (roomData) => {
    if (!layout.value.rooms) {
      layout.value.rooms = []
    }
    
    layout.value.rooms.push({
      id: Date.now(),
      ...roomData,
      created_at: new Date().toISOString()
    })
  }
  
  const removeRoom = (roomId) => {
    if (layout.value.rooms) {
      layout.value.rooms = layout.value.rooms.filter(room => room.id !== roomId)
    }
  }
  
  const updateRoom = (roomId, roomData) => {
    if (layout.value.rooms) {
      const roomIndex = layout.value.rooms.findIndex(room => room.id === roomId)
      if (roomIndex !== -1) {
        layout.value.rooms[roomIndex] = { ...layout.value.rooms[roomIndex], ...roomData }
      }
    }
  }
  
  const addFacility = (facilityData) => {
    if (!layout.value.facilities) {
      layout.value.facilities = []
    }
    
    layout.value.facilities.push({
      id: Date.now(),
      ...facilityData,
      created_at: new Date().toISOString()
    })
  }
  
  const removeFacility = (facilityId) => {
    if (layout.value.facilities) {
      layout.value.facilities = layout.value.facilities.filter(facility => facility.id !== facilityId)
    }
  }
  
  const updateFacility = (facilityId, facilityData) => {
    if (layout.value.facilities) {
      const facilityIndex = layout.value.facilities.findIndex(facility => facility.id === facilityId)
      if (facilityIndex !== -1) {
        layout.value.facilities[facilityIndex] = { ...layout.value.facilities[facilityIndex], ...facilityData }
      }
    }
  }
  
  const getRoomCapacity = (roomType) => {
    const capacityMap = {
      'private': 1,
      'shared': layout.value?.bedsPerRoom || 2,
      'icu': 1,
      'isolation': 1
    }
    
    return capacityMap[roomType] || 1
  }
  
  const calculateTotalCapacity = () => {
    if (!layout.value) return 0
    
    const privateCapacity = (layout.value.privateRooms || 0) * getRoomCapacity('private')
    const sharedCapacity = (layout.value.sharedRooms || 0) * getRoomCapacity('shared')
    
    return privateCapacity + sharedCapacity
  }
  
  const validateLayout = () => {
    if (!layout.value) return { isValid: false, errors: ['Layout not found'] }
    
    const errors = []
    
    if (!layout.value.name) {
      errors.push('Layout name is required')
    }
    
    if (!layout.value.beds || layout.value.beds < 1) {
      errors.push('Number of beds must be at least 1')
    }
    
    if (layout.value.privateRooms < 0) {
      errors.push('Private rooms cannot be negative')
    }
    
    if (layout.value.sharedRooms < 0) {
      errors.push('Shared rooms cannot be negative')
    }
    
    const totalCapacity = calculateTotalCapacity()
    if (totalCapacity !== layout.value.beds) {
      errors.push(`Total capacity (${totalCapacity}) does not match number of beds (${layout.value.beds})`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  const exportLayout = () => {
    if (!layout.value) return null
    
    return {
      ward_id: selectedWard.value?.id,
      layout: layout.value,
      exported_at: new Date().toISOString()
    }
  }
  
  const importLayout = (layoutData) => {
    if (layoutData && layoutData.layout) {
      layout.value = layoutData.layout
    }
  }
  
  // Initialize
  onMounted(() => {
    loadWards()
  })
  
  return {
    // State
    wards,
    selectedWard,
    layout,
    loading,
    error,
    
    // Computed
    wardLayouts,
    selectedWardLayout,
    
    // Methods
    loadWards,
    loadWardLayout,
    saveWardLayout,
    getDefaultLayout,
    createCustomLayout,
    updateLayout,
    addRoom,
    removeRoom,
    updateRoom,
    addFacility,
    removeFacility,
    updateFacility,
    getRoomCapacity,
    calculateTotalCapacity,
    validateLayout,
    exportLayout,
    importLayout
  }
}
