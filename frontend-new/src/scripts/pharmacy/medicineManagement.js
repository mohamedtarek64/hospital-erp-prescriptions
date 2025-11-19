/**
 * Medicine Management Logic
 * Handles medicine data, CRUD operations, and business logic
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Medicine Management Manager
 */
export class MedicineManagementManager {
  constructor() {
    this.authStore = useAuthStore()
    
    // Initialize reactive data
    this.medicines = ref([
      {
        id: 1,
        name: 'باراسيتامول',
        description: 'مسكن للآلام وخافض للحرارة',
        price: 15,
        stock: 50,
        category: 'مسكنات',
        manufacturer: 'شركة الأدوية المصرية',
        expiryDate: '2025-12-31',
        batchNumber: 'BATCH001',
        prescriptionRequired: false
      },
      {
        id: 2,
        name: 'أموكسيسيلين',
        description: 'مضاد حيوي واسع الطيف',
        price: 25,
        stock: 30,
        category: 'مضادات حيوية',
        manufacturer: 'شركة الأدوية العربية',
        expiryDate: '2025-06-30',
        batchNumber: 'BATCH002',
        prescriptionRequired: true
      },
      {
        id: 3,
        name: 'إيبوبروفين',
        description: 'مضاد للالتهابات ومسكن للآلام',
        price: 20,
        stock: 5,
        category: 'مضادات التهاب',
        manufacturer: 'شركة الأدوية الدولية',
        expiryDate: '2025-09-15',
        batchNumber: 'BATCH003',
        prescriptionRequired: false
      },
      {
        id: 4,
        name: 'أوميبرازول',
        description: 'مثبط مضخة البروتون لعلاج قرحة المعدة',
        price: 35,
        stock: 25,
        category: 'معدة وأمعاء',
        manufacturer: 'شركة الأدوية المتقدمة',
        expiryDate: '2025-11-20',
        batchNumber: 'BATCH004',
        prescriptionRequired: true
      },
      {
        id: 5,
        name: 'فيتامين د',
        description: 'مكمل غذائي لفيتامين د',
        price: 40,
        stock: 15,
        category: 'فيتامينات',
        manufacturer: 'شركة المكملات الغذائية',
        expiryDate: '2026-01-10',
        batchNumber: 'BATCH005',
        prescriptionRequired: false
      }
    ])
    
    this.showAddForm = ref(false)
    this.showEditForm = ref(false)
    this.selectedMedicine = ref(null)
    this.searchQuery = ref('')
    this.selectedCategory = ref('')
    this.sortBy = ref('name')
    this.sortOrder = ref('asc')
  }

  /**
   * Get reactive data
   */
  getReactiveData() {
    return {
      medicines: this.medicines,
      showAddForm: this.showAddForm,
      showEditForm: this.showEditForm,
      selectedMedicine: this.selectedMedicine,
      searchQuery: this.searchQuery,
      selectedCategory: this.selectedCategory,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      user: computed(() => this.authStore.user)
    }
  }

  /**
   * Get computed properties
   */
  getComputedProperties() {
    return {
      filteredMedicines: computed(() => {
        let filtered = this.medicines.value

        // Filter by search query
        if (this.searchQuery.value) {
          const query = this.searchQuery.value.toLowerCase()
          filtered = filtered.filter(medicine =>
            medicine.name.toLowerCase().includes(query) ||
            medicine.description.toLowerCase().includes(query) ||
            medicine.category.toLowerCase().includes(query)
          )
        }

        // Filter by category
        if (this.selectedCategory.value) {
          filtered = filtered.filter(medicine =>
            medicine.category === this.selectedCategory.value
          )
        }

        // Sort medicines
        filtered.sort((a, b) => {
          let aValue = a[this.sortBy.value]
          let bValue = b[this.sortBy.value]

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (this.sortOrder.value === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      }),

      lowStockMedicines: computed(() => {
        return this.medicines.value.filter(medicine => medicine.stock < 10)
      }),

      expiredMedicines: computed(() => {
        const today = new Date()
        return this.medicines.value.filter(medicine => {
          const expiryDate = new Date(medicine.expiryDate)
          return expiryDate < today
        })
      }),

      categories: computed(() => {
        const categories = [...new Set(this.medicines.value.map(medicine => medicine.category))]
        return categories.sort()
      }),

      totalMedicines: computed(() => this.medicines.value.length),
      totalValue: computed(() => {
        return this.medicines.value.reduce((total, medicine) => {
          return total + (medicine.price * medicine.stock)
        }, 0)
      })
    }
  }

  /**
   * Get all methods
   */
  getMethods() {
    return {
      getRoleName: this.getRoleName.bind(this),
      showAddMedicineForm: this.showAddMedicineForm.bind(this),
      showEditMedicineForm: this.showEditMedicineForm.bind(this),
      hideForms: this.hideForms.bind(this),
      addMedicine: this.addMedicine.bind(this),
      updateMedicine: this.updateMedicine.bind(this),
      deleteMedicine: this.deleteMedicine.bind(this),
      searchMedicines: this.searchMedicines.bind(this),
      filterByCategory: this.filterByCategory.bind(this),
      sortMedicines: this.sortMedicines.bind(this),
      getStockStatus: this.getStockStatus.bind(this),
      getExpiryStatus: this.getExpiryStatus.bind(this),
      exportMedicines: this.exportMedicines.bind(this),
      importMedicines: this.importMedicines.bind(this)
    }
  }

  /**
   * Get role name in Arabic
   */
  getRoleName(role) {
    const roles = {
      'admin': 'مدير',
      'doctor': 'طبيب',
      'nurse': 'ممرض/ممرضة',
      'receptionist': 'موظف استقبال',
      'pharmacist': 'صيدلي',
      'technician': 'فني'
    }
    return roles[role] || role
  }

  /**
   * Show add medicine form
   */
  showAddMedicineForm() {
    this.showAddForm.value = true
    this.showEditForm.value = false
    this.selectedMedicine.value = null
  }

  /**
   * Show edit medicine form
   */
  showEditMedicineForm(medicine) {
    this.showEditForm.value = true
    this.showAddForm.value = false
    this.selectedMedicine.value = { ...medicine }
  }

  /**
   * Hide all forms
   */
  hideForms() {
    this.showAddForm.value = false
    this.showEditForm.value = false
    this.selectedMedicine.value = null
  }

  /**
   * Add new medicine
   */
  addMedicine(medicineData) {
    const newMedicine = {
      id: Date.now(), // Simple ID generation
      ...medicineData,
      stock: parseInt(medicineData.stock) || 0,
      price: parseFloat(medicineData.price) || 0
    }
    
    this.medicines.value.push(newMedicine)
    this.hideForms()
    
    // Show success message
    console.log('Medicine added successfully:', newMedicine.name)
  }

  /**
   * Update existing medicine
   */
  updateMedicine(medicineData) {
    const index = this.medicines.value.findIndex(medicine => medicine.id === medicineData.id)
    if (index !== -1) {
      this.medicines.value[index] = {
        ...this.medicines.value[index],
        ...medicineData,
        stock: parseInt(medicineData.stock) || 0,
        price: parseFloat(medicineData.price) || 0
      }
      this.hideForms()
      
      // Show success message
      console.log('Medicine updated successfully:', medicineData.name)
    }
  }

  /**
   * Delete medicine
   */
  deleteMedicine(medicineId) {
    const index = this.medicines.value.findIndex(medicine => medicine.id === medicineId)
    if (index !== -1) {
      const medicineName = this.medicines.value[index].name
      this.medicines.value.splice(index, 1)
      
      // Show success message
      console.log('Medicine deleted successfully:', medicineName)
    }
  }

  /**
   * Search medicines
   */
  searchMedicines(query) {
    this.searchQuery.value = query
  }

  /**
   * Filter medicines by category
   */
  filterByCategory(category) {
    this.selectedCategory.value = category
  }

  /**
   * Sort medicines
   */
  sortMedicines(by, order = 'asc') {
    this.sortBy.value = by
    this.sortOrder.value = order
  }

  /**
   * Get stock status
   */
  getStockStatus(stock) {
    if (stock === 0) return { status: 'out-of-stock', text: 'نفد المخزون', class: 'out-of-stock' }
    if (stock < 10) return { status: 'low-stock', text: 'مخزون منخفض', class: 'low-stock' }
    if (stock < 50) return { status: 'medium-stock', text: 'مخزون متوسط', class: 'medium-stock' }
    return { status: 'good-stock', text: 'مخزون جيد', class: 'good-stock' }
  }

  /**
   * Get expiry status
   */
  getExpiryStatus(expiryDate) {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'منتهي الصلاحية', class: 'expired' }
    if (daysUntilExpiry < 30) return { status: 'expiring-soon', text: 'ينتهي قريباً', class: 'expiring-soon' }
    if (daysUntilExpiry < 90) return { status: 'expiring', text: 'ينتهي خلال 3 أشهر', class: 'expiring' }
    return { status: 'valid', text: 'صالح', class: 'valid' }
  }

  /**
   * Export medicines data
   */
  exportMedicines() {
    const dataStr = JSON.stringify(this.medicines.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'medicines-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Import medicines data
   */
  importMedicines(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (Array.isArray(importedData)) {
          this.medicines.value = importedData
          console.log('Medicines imported successfully')
        } else {
          console.error('Invalid file format')
        }
      } catch (error) {
        console.error('Error importing medicines:', error)
      }
    }
    reader.readAsText(file)
  }
}

/**
 * Composable function for medicine management
 */
export function useMedicineManagement() {
  const manager = new MedicineManagementManager()
  
  return {
    ...manager.getReactiveData(),
    ...manager.getComputedProperties(),
    ...manager.getMethods()
  }
}
