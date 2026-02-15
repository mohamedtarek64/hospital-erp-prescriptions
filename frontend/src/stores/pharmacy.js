import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const usePharmacyStore = defineStore('pharmacy', () => {
  // State
  const medicines = ref([])
  const suppliers = ref([])
  const purchaseOrders = ref([])
  const prescriptions = ref([])
  const inventory = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalMedicines = computed(() => medicines.value.length)
  const totalSuppliers = computed(() => suppliers.value.length)
  const totalPurchaseOrders = computed(() => purchaseOrders.value.length)
  const totalPrescriptions = computed(() => prescriptions.value.length)
  const totalInventoryItems = computed(() => inventory.value.length)

  const pendingPrescriptions = computed(() => 
    prescriptions.value.filter(p => p.status === 'pending')
  )

  const dispensedPrescriptions = computed(() => 
    prescriptions.value.filter(p => p.status === 'dispensed')
  )

  const pendingPurchaseOrders = computed(() => 
    purchaseOrders.value.filter(o => o.status === 'pending')
  )

  const approvedPurchaseOrders = computed(() => 
    purchaseOrders.value.filter(o => o.status === 'approved')
  )

  const lowStockMedicines = computed(() => 
    inventory.value.filter(item => 
      item.currentStock <= item.minStock
    )
  )

  const expiredMedicines = computed(() => {
    const today = new Date()
    return inventory.value.filter(item => 
      new Date(item.expiryDate) < today
    )
  })

  const totalRevenue = computed(() => 
    dispensedPrescriptions.value.reduce((sum, p) => sum + p.totalPrice, 0)
  )

  const totalExpenses = computed(() => 
    purchaseOrders.value
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  )

  const profit = computed(() => totalRevenue.value - totalExpenses.value)

  // Additional computed properties for the view
  const stats = computed(() => ({
    totalMedicines: medicines.value.length,
    lowStockMedicines: lowStockMedicines.value.length,
    totalSuppliers: suppliers.value.length,
    pendingOrders: pendingPurchaseOrders.value.length,
    pendingPrescriptions: pendingPrescriptions.value.length
  }))

  const recentOrders = computed(() => {
    return purchaseOrders.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  const recentPrescriptions = computed(() => {
    return prescriptions.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  const urgentMedicines = computed(() => {
    return lowStockMedicines.value.slice(0, 5)
  })

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

  // Legacy Medicine Actions removed - using API-based functions below








  return {
    // State
    medicines,
    suppliers,
    purchaseOrders,
    prescriptions,
    inventory,
    loading,
    error,
    
    // Getters
    totalMedicines,
    totalSuppliers,
    totalPurchaseOrders,
    totalPrescriptions,
    totalInventoryItems,
    pendingPrescriptions,
    dispensedPrescriptions,
    pendingPurchaseOrders,
    approvedPurchaseOrders,
    lowStockMedicines,
    expiredMedicines,
    totalRevenue,
    totalExpenses,
    profit,
    stats,
    recentOrders,
    recentPrescriptions,
    urgentMedicines,
    
    // Actions
    setLoading,
    setError,
    clearError,
    
    // API Actions
    fetchMedicines: async () => {
      try {
        loading.value = true
        const response = await apiClient.get('/api/pharmacy/medicines')
        medicines.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch medicines'
        throw err
      } finally {
        loading.value = false
      }
    },
    
    fetchSuppliers: async () => {
      try {
        const response = await apiClient.get('/api/pharmacy/suppliers')
        suppliers.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch suppliers'
        throw err
      }
    },
    
    fetchOrders: async () => {
      try {
        const response = await apiClient.get('/api/pharmacy/orders')
        purchaseOrders.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch orders'
        throw err
      }
    },
    
    fetchPrescriptions: async () => {
      try {
        const response = await apiClient.get('/api/pharmacy/prescriptions')
        prescriptions.value = response.data.data || response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to fetch prescriptions'
        throw err
      }
    },

    createMedicine: async (medicineData) => {
      try {
        loading.value = true
        const response = await apiClient.post('/api/pharmacy/medicines', medicineData)
        medicines.value.unshift(response.data)
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create medicine'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    updateMedicine: async (id, medicineData) => {
      try {
        loading.value = true
        const response = await apiClient.put(`/api/pharmacy/medicines/${id}`, medicineData)
        const index = medicines.value.findIndex(m => m.id === id)
        if (index !== -1) {
          medicines.value[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update medicine'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    deleteMedicine: async (id) => {
      try {
        loading.value = true
        await apiClient.delete(`/api/pharmacy/medicines/${id}`)
        medicines.value = medicines.value.filter(m => m.id !== id)
        return { success: true }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete medicine'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    createSupplier: async (supplierData) => {
      try {
        loading.value = true
        const response = await apiClient.post('/api/pharmacy/suppliers', supplierData)
        suppliers.value.unshift(response.data)
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create supplier'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    updateSupplier: async (id, supplierData) => {
      try {
        loading.value = true
        const response = await apiClient.put(`/api/pharmacy/suppliers/${id}`, supplierData)
        const index = suppliers.value.findIndex(s => s.id === id)
        if (index !== -1) {
          suppliers.value[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update supplier'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    deleteSupplier: async (id) => {
      try {
        loading.value = true
        await apiClient.delete(`/api/pharmacy/suppliers/${id}`)
        suppliers.value = suppliers.value.filter(s => s.id !== id)
        return { success: true }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete supplier'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    createOrder: async (orderData) => {
      try {
        loading.value = true
        const response = await apiClient.post('/api/pharmacy/orders', orderData)
        purchaseOrders.value.unshift(response.data)
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create order'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    updateOrder: async (id, orderData) => {
      try {
        loading.value = true
        const response = await apiClient.put(`/api/pharmacy/orders/${id}`, orderData)
        const index = purchaseOrders.value.findIndex(o => o.id === id)
        if (index !== -1) {
          purchaseOrders.value[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update order'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    deleteOrder: async (id) => {
      try {
        loading.value = true
        await apiClient.delete(`/api/pharmacy/orders/${id}`)
        purchaseOrders.value = purchaseOrders.value.filter(o => o.id !== id)
        return { success: true }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to delete order'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    },

    processPrescription: async (id) => {
      try {
        loading.value = true
        const response = await apiClient.patch(`/api/pharmacy/prescriptions/${id}/process`)
        const index = prescriptions.value.findIndex(p => p.id === id)
        if (index !== -1) {
          prescriptions.value[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to process prescription'
        return { success: false, message: error.value }
      } finally {
        loading.value = false
      }
    }
  }
})
