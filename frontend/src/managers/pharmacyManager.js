import { ref } from 'vue'
import { useMedicineManager } from './medicineManager'
import { useSupplierManager } from './supplierManager'

export class PharmacyManager {
  constructor() {
    // Reactive state
    this.activeTab = ref('medicines')
    this.showAddMedicineModal = ref(false)
    this.showAddSupplierModal = ref(false)
    this.editingMedicine = ref(null)
    this.editingSupplier = ref(null)

    // Managers
    this.medicineManager = useMedicineManager()
    this.supplierManager = useSupplierManager()
  }

  // Event handlers
  handleEditMedicine(medicine) {
    this.editingMedicine.value = medicine
    this.showAddMedicineModal.value = true
  }

  handleDispenseMedicine(medicine) {
    // Handle medicine dispensing logic
    console.log('Dispensing medicine:', medicine)
  }

  async handleDeleteMedicine(medicine) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
      await this.medicineManager.deleteMedicine(medicine.id)
    }
  }

  handleEditSupplier(supplier) {
    this.editingSupplier.value = supplier
    this.showAddSupplierModal.value = true
  }

  handleViewSupplierOrders(supplier) {
    // Handle viewing supplier orders logic
    console.log('Viewing orders for supplier:', supplier)
  }

  async handleDeleteSupplier(supplier) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      await this.supplierManager.deleteSupplier(supplier.id)
    }
  }

  async handleMedicineSubmit(medicineData) {
    if (this.editingMedicine.value) {
      await this.medicineManager.updateMedicine(this.editingMedicine.value.id, medicineData)
    } else {
      await this.medicineManager.createMedicine(medicineData)
    }
    
    this.showAddMedicineModal.value = false
    this.editingMedicine.value = null
  }

  async handleSupplierSubmit(supplierData) {
    if (this.editingSupplier.value) {
      await this.supplierManager.updateSupplier(this.editingSupplier.value.id, supplierData)
    } else {
      await this.supplierManager.createSupplier(supplierData)
    }
    
    this.showAddSupplierModal.value = false
    this.editingSupplier.value = null
  }

  // Initialize data
  async initializeData() {
    await Promise.all([
      this.medicineManager.fetchMedicines(),
      this.supplierManager.fetchSuppliers(),
      this.medicineManager.loadCategories(),
      this.medicineManager.loadManufacturers(),
      this.supplierManager.getCities(),
      this.supplierManager.getCountries()
    ])
  }

  // Tab management
  setActiveTab(tab) {
    this.activeTab.value = tab
  }

  // Modal management
  openAddMedicineModal() {
    this.showAddMedicineModal.value = true
    this.editingMedicine.value = null
  }

  openAddSupplierModal() {
    this.showAddSupplierModal.value = true
    this.editingSupplier.value = null
  }

  closeAddMedicineModal() {
    this.showAddMedicineModal.value = false
    this.editingMedicine.value = null
  }

  closeAddSupplierModal() {
    this.showAddSupplierModal.value = false
    this.editingSupplier.value = null
  }

  // Getters for computed values
  get isMedicinesTabActive() {
    return this.activeTab.value === 'medicines'
  }

  get isSuppliersTabActive() {
    return this.activeTab.value === 'suppliers'
  }

  get isInventoryTabActive() {
    return this.activeTab.value === 'inventory'
  }

  get canAddMedicine() {
    // TODO: Implement proper permission system
    return true
  }

  get canAddSupplier() {
    // TODO: Implement proper permission system
    return true
  }

  get canEditMedicine() {
    // TODO: Implement proper permission system
    return true
  }

  get canEditSupplier() {
    // TODO: Implement proper permission system
    return true
  }

  get canDeleteMedicine() {
    // TODO: Implement proper permission system
    return true
  }

  get canDeleteSupplier() {
    // TODO: Implement proper permission system
    return true
  }
}

export function usePharmacyManager() {
  const manager = new PharmacyManager()
  
  // Return reactive references and methods
  return {
    // Reactive state
    activeTab: manager.activeTab,
    showAddMedicineModal: manager.showAddMedicineModal,
    showAddSupplierModal: manager.showAddSupplierModal,
    editingMedicine: manager.editingMedicine,
    editingSupplier: manager.editingSupplier,

    // Managers
    medicineManager: manager.medicineManager,
    supplierManager: manager.supplierManager,

    // Methods
    handleEditMedicine: manager.handleEditMedicine.bind(manager),
    handleDispenseMedicine: manager.handleDispenseMedicine.bind(manager),
    handleDeleteMedicine: manager.handleDeleteMedicine.bind(manager),
    handleEditSupplier: manager.handleEditSupplier.bind(manager),
    handleViewSupplierOrders: manager.handleViewSupplierOrders.bind(manager),
    handleDeleteSupplier: manager.handleDeleteSupplier.bind(manager),
    handleMedicineSubmit: manager.handleMedicineSubmit.bind(manager),
    handleSupplierSubmit: manager.handleSupplierSubmit.bind(manager),
    initializeData: manager.initializeData.bind(manager),
    setActiveTab: manager.setActiveTab.bind(manager),
    openAddMedicineModal: manager.openAddMedicineModal.bind(manager),
    openAddSupplierModal: manager.openAddSupplierModal.bind(manager),
    closeAddMedicineModal: manager.closeAddMedicineModal.bind(manager),
    closeAddSupplierModal: manager.closeAddSupplierModal.bind(manager),

    // Computed getters
    isMedicinesTabActive: manager.isMedicinesTabActive,
    isSuppliersTabActive: manager.isSuppliersTabActive,
    isInventoryTabActive: manager.isInventoryTabActive,
    canAddMedicine: manager.canAddMedicine,
    canAddSupplier: manager.canAddSupplier,
    canEditMedicine: manager.canEditMedicine,
    canEditSupplier: manager.canEditSupplier,
    canDeleteMedicine: manager.canDeleteMedicine,
    canDeleteSupplier: manager.canDeleteSupplier
  }
}
