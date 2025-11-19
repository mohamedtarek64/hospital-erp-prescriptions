import { ref, computed } from 'vue'
import { usePatientsStore } from '@/stores/patients'

/**
 * Manager class for Medical Record Create functionality
 * Handles form state, validation, and patient selection
 */
export class MedicalRecordCreateManager {
  constructor() {
    this.patientsStore = usePatientsStore()
    
    // Form data
    this.form = ref({
      patient_id: '',
      appointment_id: '',
      chief_complaint: '',
      examination_notes: '',
      diagnosis: '',
      treatment_plan: '',
      follow_up_date: '',
      status: 'active',
      priority: 'medium',
      additional_notes: ''
    })
    
    // UI state
    this.loading = ref(false)
    this.errors = ref({})
    this.searchQuery = ref('')
    this.showPatientDropdown = ref(false)
    this.selectedPatient = ref(null)
    
    // Computed
    this.filteredPatients = computed(() => {
      if (!this.searchQuery.value) return []
      return this.patientsStore.patients.filter(patient => 
        patient.name.toLowerCase().includes(this.searchQuery.value.toLowerCase()) ||
        patient.phone.includes(this.searchQuery.value)
      )
    })
    
    this.today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
  }
  
  /**
   * Get all reactive data
   */
  getReactiveData() {
    return {
      form: this.form,
      loading: this.loading,
      errors: this.errors,
      searchQuery: this.searchQuery,
      showPatientDropdown: this.showPatientDropdown,
      filteredPatients: this.filteredPatients,
      selectedPatient: this.selectedPatient,
      today: this.today
    }
  }
  
  /**
   * Get all methods
   */
  getMethods(router, medicalRecordsStore, authStore) {
    return {
      searchPatients: this.searchPatients.bind(this),
      selectPatient: this.selectPatient.bind(this),
      removePatient: this.removePatient.bind(this),
      handleSubmit: this.handleSubmit.bind(this, router, medicalRecordsStore, authStore)
    }
  }
  
  /**
   * Initialize form with default values
   */
  initializeForm() {
    this.form.value = {
      patient_id: '',
      appointment_id: '',
      chief_complaint: '',
      examination_notes: '',
      diagnosis: '',
      treatment_plan: '',
      follow_up_date: '',
      status: 'active',
      priority: 'medium',
      additional_notes: ''
    }
    this.errors.value = {}
    this.selectedPatient.value = null
    this.searchQuery.value = ''
  }
  
  /**
   * Search for patients
   */
  async searchPatients() {
    if (this.searchQuery.value.length > 2) {
      try {
        await this.patientsStore.searchPatients(this.searchQuery.value)
        this.showPatientDropdown.value = true
      } catch (error) {
        console.error('Failed to search patients:', error)
      }
    } else {
      this.showPatientDropdown.value = false
    }
  }
  
  /**
   * Select a patient
   */
  selectPatient(patient) {
    this.selectedPatient.value = patient
    this.form.value.patient_id = patient.id
    this.searchQuery.value = ''
    this.showPatientDropdown.value = false
    this.errors.value.patient_id = null
  }
  
  /**
   * Remove selected patient
   */
  removePatient() {
    this.selectedPatient.value = null
    this.form.value.patient_id = ''
    this.searchQuery.value = ''
  }
  
  /**
   * Validate form
   */
  validateForm() {
    this.errors.value = {}
    
    if (!this.form.value.patient_id) {
      this.errors.value.patient_id = 'يجب اختيار المريض'
    }
    
    if (!this.form.value.chief_complaint?.trim()) {
      this.errors.value.chief_complaint = 'يجب إدخال الشكوى الرئيسية'
    }
    
    if (!this.form.value.status) {
      this.errors.value.status = 'يجب اختيار الحالة'
    }
    
    return Object.keys(this.errors.value).length === 0
  }
  
  /**
   * Handle form submission
   */
  async handleSubmit(router, medicalRecordsStore, authStore) {
    if (!this.validateForm()) {
      return
    }
    
    this.loading.value = true
    
    try {
      const recordData = {
        ...this.form.value,
        doctor_id: authStore.user.id,
        created_at: new Date().toISOString()
      }
      
      await medicalRecordsStore.createMedicalRecord(recordData)
      
      // Show success message
      alert('تم إنشاء السجل الطبي بنجاح')
      
      // Navigate back or to records list
      router.push('/medical-records')
      
    } catch (error) {
      console.error('Failed to create medical record:', error)
      
      if (error.response?.data?.errors) {
        this.errors.value = error.response.data.errors
      } else {
        alert('حدث خطأ أثناء إنشاء السجل الطبي')
      }
    } finally {
      this.loading.value = false
    }
  }
}