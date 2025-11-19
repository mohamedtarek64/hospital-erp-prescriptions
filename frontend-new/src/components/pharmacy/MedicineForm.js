import { ref, computed, watch } from 'vue'
import { useMedicineManager } from '@/managers/medicineManager'
import { validateMedicineData } from '@/utils/pharmacyHelpers'

export class MedicineFormManager {
  constructor(props, emit) {
    this.props = props
    this.emit = emit
    this.medicineManager = useMedicineManager()
    
    this.form = ref({
      name: '',
      category: '',
      manufacturer: '',
      price: 0,
      unit: 'tablet',
      available_quantity: 0,
      low_stock_threshold: 10,
      storage_location: '',
      expiry_date: '',
      description: '',
      active_ingredient: '',
      dosage_form: '',
      prescription_required: false
    })
    
    this.errors = ref({})
    this.categories = ref([])
    this.manufacturers = ref([])
  }

  // Computed properties
  get isEditing() {
    return computed(() => !!this.props.medicine)
  }

  get minDate() {
    return computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })
  }

  // Methods
  async loadCategories() {
    try {
      const data = await this.medicineManager.getCategories()
      this.categories.value = data
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  async loadManufacturers() {
    try {
      const data = await this.medicineManager.getManufacturers()
      this.manufacturers.value = data
    } catch (error) {
      console.error('Error loading manufacturers:', error)
    }
  }

  resetForm() {
    this.form.value = {
      name: '',
      category: '',
      manufacturer: '',
      price: 0,
      unit: 'tablet',
      available_quantity: 0,
      low_stock_threshold: 10,
      storage_location: '',
      expiry_date: '',
      description: '',
      active_ingredient: '',
      dosage_form: '',
      prescription_required: false
    }
    this.errors.value = {}
  }

  validateForm() {
    const validation = validateMedicineData(this.form.value)
    this.errors.value = validation.errors
    return validation.isValid
  }

  handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    try {
      const formData = { ...this.form.value }
      
      // Convert empty strings to null for optional fields
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          formData[key] = null
        }
      })

      this.emit('submit', formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Lifecycle methods
  initializeForm() {
    // Initialize form with medicine data if editing
    watch(() => this.props.medicine, (newMedicine) => {
      if (newMedicine) {
        this.form.value = { ...newMedicine }
      } else {
        this.resetForm()
      }
    }, { immediate: true })
  }

  async initializeData() {
    await Promise.all([
      this.loadCategories(),
      this.loadManufacturers()
    ])
  }
}

// Composable function
export function useMedicineFormManager(props, emit) {
  return new MedicineFormManager(props, emit)
}
