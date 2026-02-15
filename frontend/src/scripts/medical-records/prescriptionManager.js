import { ref, computed } from 'vue'

export class PrescriptionManager {
  constructor() {
    // Reactive data
    this.showAddForm = ref(false)
    this.showEditForm = ref(false)
    this.loading = ref(false)
    this.errors = ref({})
    this.editingPrescription = ref(null)

    this.form = ref({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      prescribed_date: '',
      start_date: '',
      end_date: ''
    })
  }

  getReactiveData() {
    return {
      showAddForm: this.showAddForm,
      showEditForm: this.showEditForm,
      loading: this.loading,
      errors: this.errors,
      editingPrescription: this.editingPrescription,
      form: this.form
    }
  }

  getMethods(props, emit, authStore) {
    return {
      canAddPrescription: computed(() => {
        return authStore.user && ['admin', 'doctor'].includes(authStore.user.role)
      }),

      canEditPrescription: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      canDiscontinuePrescription: (prescription) => {
        if (!authStore.user) return false
        if (prescription.status === 'discontinued') return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      canDeletePrescription: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      resetForm: this.resetForm.bind(this),
      openAddForm: this.openAddForm.bind(this),
      editPrescription: this.editPrescription.bind(this),
      closeModal: this.closeModal.bind(this),
      validateForm: this.validateForm.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
      addPrescription: this.addPrescription.bind(this),
      updatePrescription: this.updatePrescription.bind(this),
      discontinuePrescription: this.discontinuePrescription.bind(this),
      deletePrescription: this.deletePrescription.bind(this),
      isExpired: this.isExpired.bind(this),
      needsRenewal: this.needsRenewal.bind(this),
      getStatusText: this.getStatusText.bind(this)
    }
  }

  // Methods
  resetForm() {
    this.form.value = {
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      prescribed_date: '',
      start_date: '',
      end_date: ''
    }
    this.errors.value = {}
  }

  openAddForm() {
    this.resetForm()
    const today = new Date().toISOString().split('T')[0]
    this.form.value.prescribed_date = today
    this.form.value.start_date = today
    this.showAddForm.value = true
  }

  editPrescription(prescription) {
    this.editingPrescription.value = prescription
    this.form.value = {
      medication_name: prescription.medication_name,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions || '',
      prescribed_date: prescription.prescribed_date,
      start_date: prescription.start_date,
      end_date: prescription.end_date || ''
    }
    this.showEditForm.value = true
  }

  closeModal() {
    this.showAddForm.value = false
    this.showEditForm.value = false
    this.editingPrescription.value = null
    this.resetForm()
  }

  validateForm() {
    this.errors.value = {}
    
    if (!this.form.value.medication_name?.trim()) {
      this.errors.value.medication_name = 'اسم الدواء مطلوب'
    }
    
    if (!this.form.value.dosage?.trim()) {
      this.errors.value.dosage = 'الجرعة مطلوبة'
    }
    
    if (!this.form.value.frequency?.trim()) {
      this.errors.value.frequency = 'التكرار مطلوب'
    }
    
    if (!this.form.value.duration?.trim()) {
      this.errors.value.duration = 'المدة مطلوبة'
    }
    
    if (!this.form.value.prescribed_date) {
      this.errors.value.prescribed_date = 'تاريخ الوصفة مطلوب'
    }
    
    if (!this.form.value.start_date) {
      this.errors.value.start_date = 'تاريخ البدء مطلوب'
    }
    
    if (this.form.value.start_date && this.form.value.end_date) {
      const startDate = new Date(this.form.value.start_date)
      const endDate = new Date(this.form.value.end_date)
      
      if (endDate <= startDate) {
        this.errors.value.end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
      }
    }
    
    return Object.keys(this.errors.value).length === 0
  }

  async handleSubmit() {
    if (!this.validateForm()) return
    
    this.loading.value = true
    
    try {
      const prescriptionData = {
        ...this.form.value,
        medical_record_id: this.medicalRecordId
      }
      
      if (this.showEditForm.value && this.editingPrescription.value) {
        // Update existing prescription
        const updatedPrescription = await this.updatePrescription(this.editingPrescription.value.id, prescriptionData)
        this.emit('prescription-updated', updatedPrescription)
      } else {
        // Add new prescription
        const newPrescription = await this.addPrescription(prescriptionData)
        this.emit('prescription-added', newPrescription)
      }
      
      this.closeModal()
    } catch (error) {
      console.error('Error saving prescription:', error)
    } finally {
      this.loading.value = false
    }
  }

  async addPrescription(data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPrescription = {
          id: Date.now(),
          ...data,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        resolve(newPrescription)
      }, 1000)
    })
  }

  async updatePrescription(id, data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedPrescription = {
          id,
          ...data,
          updated_at: new Date().toISOString()
        }
        resolve(updatedPrescription)
      }, 1000)
    })
  }

  async discontinuePrescription(prescription) {
    if (!confirm('هل أنت متأكد من إيقاف هذه الوصفة الطبية؟')) return
    
    try {
      // This would typically call an API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const discontinuedPrescription = {
        ...prescription,
        status: 'discontinued',
        updated_at: new Date().toISOString()
      }
      
      this.emit('prescription-discontinued', discontinuedPrescription)
    } catch (error) {
      console.error('Error discontinuing prescription:', error)
    }
  }

  async deletePrescription(prescription) {
    if (!confirm('هل أنت متأكد من حذف هذه الوصفة الطبية؟')) return
    
    try {
      // This would typically call an API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      this.emit('prescription-deleted', prescription)
    } catch (error) {
      console.error('Error deleting prescription:', error)
    }
  }

  isExpired(prescription) {
    if (!prescription.end_date) return false
    return this.isOverdue(prescription.end_date)
  }

  needsRenewal(prescription) {
    if (!prescription.end_date || prescription.status !== 'active') return false
    
    const endDate = new Date(prescription.end_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  isOverdue(date) {
    if (!date) return false
    
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return false
      
      return dateObj < new Date()
    } catch (error) {
      console.error('Error checking if date is overdue:', error)
      return false
    }
  }

  getStatusText(status) {
    const texts = {
      active: 'نشط',
      completed: 'مكتمل',
      discontinued: 'متوقف'
    }
    return texts[status] || status
  }

  initializeForm() {
    // Initialize form with current date
    const today = new Date().toISOString().split('T')[0]
    this.form.value.prescribed_date = today
    this.form.value.start_date = today
  }
}
