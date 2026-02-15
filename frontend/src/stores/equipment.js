import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useEquipmentStore = defineStore('equipment', () => {
  // State
  const equipment = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalEquipment = computed(() => equipment.value.length)
  const operationalEquipment = computed(() => 
    equipment.value.filter(item => item.status === 'operational')
  )
  const maintenanceEquipment = computed(() => 
    equipment.value.filter(item => item.status === 'maintenance')
  )
  const outOfServiceEquipment = computed(() => 
    equipment.value.filter(item => item.status === 'out_of_service')
  )
  const totalValue = computed(() => 
    equipment.value.reduce((sum, item) => sum + (item.purchase_price || 0), 0)
  )

  // Actions
  const fetchEquipment = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/equipment')
      equipment.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch equipment'
      console.error('Error fetching equipment:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/equipment/categories')
      categories.value = response.data.data
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const addEquipment = async (equipmentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/equipment', equipmentData)
      equipment.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add equipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEquipment = async (id, equipmentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.put(`/api/equipment/${id}`, equipmentData)
      const index = equipment.value.findIndex(item => item.id === id)
      if (index !== -1) {
        equipment.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update equipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEquipment = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete(`/api/equipment/${id}`)
      equipment.value = equipment.value.filter(item => item.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete equipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEquipmentById = (id) => {
    return equipment.value.find(item => item.id === id)
  }

  const searchEquipment = (query) => {
    if (!query) return equipment.value
    return equipment.value.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase())
    )
  }

  const filterEquipmentByCategory = (categoryId) => {
    if (!categoryId) return equipment.value
    return equipment.value.filter(item => item.category_id === categoryId)
  }

  const filterEquipmentByStatus = (status) => {
    if (!status) return equipment.value
    return equipment.value.filter(item => item.status === status)
  }

  const filterEquipmentByLocation = (location) => {
    if (!location) return equipment.value
    return equipment.value.filter(item => item.location === location)
  }

  return {
    // State
    equipment,
    categories,
    loading,
    error,
    
    // Getters
    totalEquipment,
    operationalEquipment,
    maintenanceEquipment,
    outOfServiceEquipment,
    totalValue,
    
    // Actions
    fetchEquipment,
    fetchCategories,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById,
    searchEquipment,
    filterEquipmentByCategory,
    filterEquipmentByStatus,
    filterEquipmentByLocation
  }
})
