import { ref, computed, reactive } from 'vue'
import { usePharmacyStore } from '@/stores/pharmacy'
// import { formatDate, formatPrice } from '@/utils/pharmacyHelpers'

export function usePrescriptionFormManager(props, emit) {
  const pharmacyStore = usePharmacyStore()
  
  // Reactive State
  const form = reactive({
    patientId: '',
    doctorId: '',
    prescriptionDate: '',
    priority: 'normal',
    diagnosis: '',
    notes: '',
    medications: []
  })
  
  const errors = reactive({})
  const isSubmitting = ref(false)
  const patients = ref([])
  const doctors = ref([])
  const medicines = ref([])
  
  // Computed Properties
  const isEditing = computed(() => !!props.prescription)
  
  const totalQuantity = computed(() => {
    return form.medications.reduce((total, medication) => total + (medication.quantity || 0), 0)
  })
  
  const totalAmount = computed(() => {
    return form.medications.reduce((total, medication) => {
      const medicine = medicines.value.find(m => m.id === medication.medicineId)
      const price = medicine ? medicine.retailPrice : 0
      return total + ((medication.quantity || 0) * price)
    }, 0)
  })
  
  // Methods
  const initializeForm = async () => {
    await loadPatients()
    await loadDoctors()
    await loadMedicines()
    
    if (isEditing.value) {
      populateForm()
    } else {
      resetForm()
    }
  }
  
  const populateForm = () => {
    if (!props.prescription) return
    
    const prescription = props.prescription
    form.patientId = prescription.patientId || ''
    form.doctorId = prescription.doctorId || ''
    form.prescriptionDate = prescription.prescriptionDate || ''
    form.priority = prescription.priority || 'normal'
    form.diagnosis = prescription.diagnosis || ''
    form.notes = prescription.notes || ''
    form.medications = prescription.medications ? [...prescription.medications] : []
  }
  
  const resetForm = () => {
    form.patientId = ''
    form.doctorId = ''
    form.prescriptionDate = new Date().toISOString().split('T')[0]
    form.priority = 'normal'
    form.diagnosis = ''
    form.notes = ''
    form.medications = []
    clearErrors()
  }
  
  const loadPatients = async () => {
    try {
      // Mock data for now - replace with actual API call
      patients.value = [
        { id: 1, name: 'أحمد محمد', fileNumber: 'P001' },
        { id: 2, name: 'فاطمة علي', fileNumber: 'P002' },
        { id: 3, name: 'محمد حسن', fileNumber: 'P003' },
        { id: 4, name: 'عائشة أحمد', fileNumber: 'P004' },
        { id: 5, name: 'علي محمود', fileNumber: 'P005' }
      ]
    } catch (error) {
      console.error('Error loading patients:', error)
      patients.value = []
    }
  }
  
  const loadDoctors = async () => {
    try {
      // Mock data for now - replace with actual API call
      doctors.value = [
        { id: 1, name: 'محمد أحمد', specialization: 'طب عام' },
        { id: 2, name: 'أحمد علي', specialization: 'طب باطني' },
        { id: 3, name: 'فاطمة حسن', specialization: 'طب أطفال' },
        { id: 4, name: 'علي محمد', specialization: 'طب قلب' },
        { id: 5, name: 'حسن أحمد', specialization: 'طب عيون' }
      ]
    } catch (error) {
      console.error('Error loading doctors:', error)
      doctors.value = []
    }
  }
  
  const loadMedicines = async () => {
    try {
      medicines.value = pharmacyStore.medicines
      if (medicines.value.length === 0) {
        // Load from API if store is empty
        await pharmacyStore.fetchMedicines()
        medicines.value = pharmacyStore.medicines
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
      medicines.value = []
    }
  }
  
  const addMedication = () => {
    form.medications.push({
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    })
  }
  
  const removeMedication = (index) => {
    form.medications.splice(index, 1)
  }
  
  const getMedicationError = (index, field) => {
    const medicationErrors = errors[`medications.${index}.${field}`]
    return medicationErrors || ''
  }
  
  const validateForm = () => {
    clearErrors()
    let isValid = true
    
    // Basic validation
    if (!form.patientId) {
      errors.patientId = 'اختيار المريض مطلوب'
      isValid = false
    }
    
    if (!form.doctorId) {
      errors.doctorId = 'اختيار الطبيب مطلوب'
      isValid = false
    }
    
    if (!form.prescriptionDate) {
      errors.prescriptionDate = 'تاريخ الوصفة مطلوب'
      isValid = false
    }
    
    // Validate medications
    if (form.medications.length === 0) {
      errors.medications = 'يجب إضافة دواء واحد على الأقل'
      isValid = false
    }
    
    form.medications.forEach((medication, index) => {
      if (!medication.medicineId) {
        errors[`medications.${index}.medicineId`] = 'اختيار الدواء مطلوب'
        isValid = false
      }
      
      if (!medication.dosage) {
        errors[`medications.${index}.dosage`] = 'الجرعة مطلوبة'
        isValid = false
      }
      
      if (!medication.frequency) {
        errors[`medications.${index}.frequency`] = 'التكرار مطلوب'
        isValid = false
      }
      
      if (!medication.duration) {
        errors[`medications.${index}.duration`] = 'مدة العلاج مطلوبة'
        isValid = false
      }
      
      if (!medication.quantity || medication.quantity < 1) {
        errors[`medications.${index}.quantity`] = 'الكمية يجب أن تكون أكبر من صفر'
        isValid = false
      }
    })
    
    return isValid
  }
  
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      delete errors[key]
    })
  }
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    
    isSubmitting.value = true
    
    try {
      const prescriptionData = {
        ...form,
        totalQuantity: totalQuantity.value,
        totalAmount: totalAmount.value,
        status: 'pending'
      }
      
      if (isEditing.value) {
        await pharmacyStore.updatePrescription(props.prescription.id, prescriptionData)
      } else {
        await pharmacyStore.createPrescription(prescriptionData)
      }
      
      emit('submit', prescriptionData)
      resetForm()
    } catch (error) {
      console.error('Error submitting prescription:', error)
      // Handle error display
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    // State
    form,
    errors,
    isSubmitting,
    patients,
    doctors,
    medicines,
    
    // Computed
    isEditing,
    totalQuantity,
    totalAmount,
    
    // Methods
    initializeForm,
    populateForm,
    resetForm,
    addMedication,
    removeMedication,
    getMedicationError,
    validateForm,
    clearErrors,
    handleSubmit
  }
}
