import { ref, onMounted, computed } from 'vue'
import { usePharmacyStore } from '@/stores/pharmacy'

export function usePharmacy() {
  const pharmacyStore = usePharmacyStore()

  const loadPharmacyData = async () => {
    try {
      await pharmacyStore.fetchMedicines()
      await pharmacyStore.fetchSuppliers()
      await pharmacyStore.fetchOrders()
      await pharmacyStore.fetchPrescriptions()
    } catch (error) {
      console.error('Error loading pharmacy data:', error)
    }
  }

  const pharmacyStats = computed(() => {
    return pharmacyStore.stats
  })

  const recentOrders = computed(() => {
    return pharmacyStore.recentOrders
  })

  const recentPrescriptions = computed(() => {
    return pharmacyStore.recentPrescriptions
  })

  const urgentMedicines = computed(() => {
    return pharmacyStore.urgentMedicines
  })

  const addMedicine = async (medicineData) => {
    try {
      const result = await pharmacyStore.createMedicine(medicineData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding medicine:', error)
      throw error
    }
  }

  const updateMedicine = async (id, medicineData) => {
    try {
      const result = await pharmacyStore.updateMedicine(id, medicineData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating medicine:', error)
      throw error
    }
  }

  const deleteMedicine = async (id) => {
    try {
      const result = await pharmacyStore.deleteMedicine(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting medicine:', error)
      throw error
    }
  }

  const addSupplier = async (supplierData) => {
    try {
      const result = await pharmacyStore.createSupplier(supplierData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding supplier:', error)
      throw error
    }
  }

  const updateSupplier = async (id, supplierData) => {
    try {
      const result = await pharmacyStore.updateSupplier(id, supplierData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating supplier:', error)
      throw error
    }
  }

  const deleteSupplier = async (id) => {
    try {
      const result = await pharmacyStore.deleteSupplier(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting supplier:', error)
      throw error
    }
  }

  const addOrder = async (orderData) => {
    try {
      const result = await pharmacyStore.createOrder(orderData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding order:', error)
      throw error
    }
  }

  const updateOrder = async (id, orderData) => {
    try {
      const result = await pharmacyStore.updateOrder(id, orderData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  const deleteOrder = async (id) => {
    try {
      const result = await pharmacyStore.deleteOrder(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  const processPrescription = async (id) => {
    try {
      const result = await pharmacyStore.processPrescription(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error processing prescription:', error)
      throw error
    }
  }

  onMounted(() => {
    loadPharmacyData()
  })

  return {
    medicines: pharmacyStore.medicines,
    suppliers: pharmacyStore.suppliers,
    orders: pharmacyStore.orders,
    prescriptions: pharmacyStore.prescriptions,
    loading: pharmacyStore.loading,
    error: pharmacyStore.error,
    pharmacyStats,
    recentOrders,
    recentPrescriptions,
    urgentMedicines,
    loadPharmacyData,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addOrder,
    updateOrder,
    deleteOrder,
    processPrescription,
    clearError: pharmacyStore.clearError
  }
}
