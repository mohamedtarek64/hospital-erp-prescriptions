/**
 * Bed Allocation Management
 * Handles bed allocation logic for ward management
 */

import { ref, computed, onMounted } from 'vue'
import { useWardStore } from '@/stores/ward'

export function useBedAllocation() {
  const wardStore = useWardStore()
  
  // State
  const beds = ref([])
  const patients = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedWard = ref(null)
  const selectedBed = ref(null)
  const selectedPatient = ref(null)
  
  // Computed
  const availableBeds = computed(() => {
    return beds.value.filter(bed => bed.status === 'available')
  })
  
  const occupiedBeds = computed(() => {
    return beds.value.filter(bed => bed.status === 'occupied')
  })
  
  const maintenanceBeds = computed(() => {
    return beds.value.filter(bed => bed.status === 'maintenance')
  })
  
  const bedStats = computed(() => {
    return {
      total: beds.value.length,
      available: availableBeds.value.length,
      occupied: occupiedBeds.value.length,
      maintenance: maintenanceBeds.value.length,
      occupancyRate: beds.value.length > 0 ? 
        ((occupiedBeds.value.length / beds.value.length) * 100).toFixed(1) : 0
    }
  })
  
  // Methods
  const loadBeds = async (wardId) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.fetchBeds(wardId)
      beds.value = wardStore.beds
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const loadPatients = async () => {
    try {
      await wardStore.fetchPatients()
      patients.value = wardStore.patients
    } catch (err) {
      error.value = err.message
    }
  }
  
  const allocateBed = async (bedId, patientId, admissionData) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.allocateBed(bedId, patientId, admissionData)
      await loadBeds(selectedWard.value?.id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const deallocateBed = async (bedId) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.deallocateBed(bedId)
      await loadBeds(selectedWard.value?.id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const transferBed = async (fromBedId, toBedId, patientId) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.transferBed(fromBedId, toBedId, patientId)
      await loadBeds(selectedWard.value?.id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const setBedMaintenance = async (bedId, maintenanceData) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.setBedMaintenance(bedId, maintenanceData)
      await loadBeds(selectedWard.value?.id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const clearMaintenance = async (bedId) => {
    loading.value = true
    error.value = null
    
    try {
      await wardStore.clearBedMaintenance(bedId)
      await loadBeds(selectedWard.value?.id)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  const getBedHistory = async (bedId) => {
    try {
      return await wardStore.getBedHistory(bedId)
    } catch (err) {
      error.value = err.message
      return []
    }
  }
  
  const searchBeds = (query) => {
    if (!query) return beds.value
    
    return beds.value.filter(bed => 
      bed.number.toString().includes(query) ||
      bed.ward_name?.toLowerCase().includes(query.toLowerCase()) ||
      bed.patient_name?.toLowerCase().includes(query.toLowerCase())
    )
  }
  
  const filterBedsByStatus = (status) => {
    return beds.value.filter(bed => bed.status === status)
  }
  
  const getBedByNumber = (bedNumber) => {
    return beds.value.find(bed => bed.number === bedNumber)
  }
  
  const getPatientBeds = (patientId) => {
    return beds.value.filter(bed => bed.patient_id === patientId)
  }
  
  const canAllocateBed = (bedId) => {
    const bed = beds.value.find(b => b.id === bedId)
    return bed && bed.status === 'available'
  }
  
  const canTransferBed = (fromBedId, toBedId) => {
    const fromBed = beds.value.find(b => b.id === fromBedId)
    const toBed = beds.value.find(b => b.id === toBedId)
    
    return fromBed && toBed && 
           fromBed.status === 'occupied' && 
           toBed.status === 'available'
  }
  
  // Initialize
  onMounted(() => {
    loadPatients()
  })
  
  return {
    // State
    beds,
    patients,
    loading,
    error,
    selectedWard,
    selectedBed,
    selectedPatient,
    
    // Computed
    availableBeds,
    occupiedBeds,
    maintenanceBeds,
    bedStats,
    
    // Methods
    loadBeds,
    loadPatients,
    allocateBed,
    deallocateBed,
    transferBed,
    setBedMaintenance,
    clearMaintenance,
    getBedHistory,
    searchBeds,
    filterBedsByStatus,
    getBedByNumber,
    getPatientBeds,
    canAllocateBed,
    canTransferBed
  }
}
