import { ref, computed } from 'vue'

export class DiagnosisManager {
  constructor() {
    // Reactive data
    this.showAddForm = ref(false)
    this.showEditForm = ref(false)
    this.loading = ref(false)
    this.errors = ref({})
    this.editingDiagnosis = ref(null)

    this.form = ref({
      diagnosis_name: '',
      icd_code: '',
      severity: '',
      status: '',
      diagnosis_date: '',
      notes: ''
    })
  }

  getReactiveData() {
    return {
      showAddForm: this.showAddForm,
      showEditForm: this.showEditForm,
      loading: this.loading,
      errors: this.errors,
      editingDiagnosis: this.editingDiagnosis,
      form: this.form
    }
  }

  getMethods(props, emit, authStore) {
    return {
      canAddDiagnosis: computed(() => {
        return authStore.user && ['admin', 'doctor'].includes(authStore.user.role)
      }),

      canEditDiagnosis: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      canDeleteDiagnosis: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      resetForm: this.resetForm.bind(this),
      openAddForm: this.openAddForm.bind(this),
      editDiagnosis: this.editDiagnosis.bind(this),
      closeModal: this.closeModal.bind(this),
      validateForm: this.validateForm.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
      addDiagnosis: this.addDiagnosis.bind(this),
      updateDiagnosis: this.updateDiagnosis.bind(this),
      deleteDiagnosis: this.deleteDiagnosis.bind(this),
      getSeverityText: this.getSeverityText.bind(this),
      getStatusText: this.getStatusText.bind(this)
    }
  }

  // Methods
  resetForm() {
    this.form.value = {
      diagnosis_name: '',
      icd_code: '',
      severity: '',
      status: '',
      diagnosis_date: '',
      notes: ''
    }
    this.errors.value = {}
  }

  openAddForm() {
    this.resetForm()
    this.form.value.diagnosis_date = new Date().toISOString().split('T')[0]
    this.showAddForm.value = true
  }

  editDiagnosis(diagnosis) {
    this.editingDiagnosis.value = diagnosis
    this.form.value = {
      diagnosis_name: diagnosis.diagnosis_name,
      icd_code: diagnosis.icd_code || '',
      severity: diagnosis.severity,
      status: diagnosis.status,
      diagnosis_date: diagnosis.diagnosis_date,
      notes: diagnosis.notes || ''
    }
    this.showEditForm.value = true
  }

  closeModal() {
    this.showAddForm.value = false
    this.showEditForm.value = false
    this.editingDiagnosis.value = null
    this.resetForm()
  }

  validateForm() {
    this.errors.value = {}
    
    if (!this.form.value.diagnosis_name?.trim()) {
      this.errors.value.diagnosis_name = 'اسم التشخيص مطلوب'
    }
    
    if (!this.form.value.severity) {
      this.errors.value.severity = 'شدة التشخيص مطلوبة'
    }
    
    if (!this.form.value.status) {
      this.errors.value.status = 'حالة التشخيص مطلوبة'
    }
    
    if (!this.form.value.diagnosis_date) {
      this.errors.value.diagnosis_date = 'تاريخ التشخيص مطلوب'
    }
    
    return Object.keys(this.errors.value).length === 0
  }

  async handleSubmit() {
    if (!this.validateForm()) return
    
    this.loading.value = true
    
    try {
      const diagnosisData = {
        ...this.form.value,
        medical_record_id: this.medicalRecordId
      }
      
      if (this.showEditForm.value && this.editingDiagnosis.value) {
        // Update existing diagnosis
        const updatedDiagnosis = await this.updateDiagnosis(this.editingDiagnosis.value.id, diagnosisData)
        this.emit('diagnosis-updated', updatedDiagnosis)
      } else {
        // Add new diagnosis
        const newDiagnosis = await this.addDiagnosis(diagnosisData)
        this.emit('diagnosis-added', newDiagnosis)
      }
      
      this.closeModal()
    } catch (error) {
      console.error('Error saving diagnosis:', error)
    } finally {
      this.loading.value = false
    }
  }

  async addDiagnosis(data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDiagnosis = {
          id: Date.now(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        resolve(newDiagnosis)
      }, 1000)
    })
  }

  async updateDiagnosis(id, data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedDiagnosis = {
          id,
          ...data,
          updated_at: new Date().toISOString()
        }
        resolve(updatedDiagnosis)
      }, 1000)
    })
  }

  async deleteDiagnosis(diagnosis) {
    if (!confirm('هل أنت متأكد من حذف هذا التشخيص؟')) return
    
    try {
      // This would typically call an API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      this.emit('diagnosis-deleted', diagnosis)
    } catch (error) {
      console.error('Error deleting diagnosis:', error)
    }
  }

  getSeverityText(severity) {
    const texts = {
      mild: 'خفيف',
      moderate: 'متوسط',
      severe: 'شديد',
      critical: 'حرج'
    }
    return texts[severity] || severity
  }

  getStatusText(status) {
    const texts = {
      active: 'نشط',
      resolved: 'محلول',
      chronic: 'مزمن'
    }
    return texts[status] || status
  }

  initializeForm() {
    // Initialize form with current date
    this.form.value.diagnosis_date = new Date().toISOString().split('T')[0]
  }
}
