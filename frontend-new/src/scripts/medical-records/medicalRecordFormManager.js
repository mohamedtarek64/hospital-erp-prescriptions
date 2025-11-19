import { ref, watch } from 'vue'
import { getInitialFormData } from '@/utils/medicalHelpers'

export class MedicalRecordFormManager {
  constructor() {
    this.form = ref({})
    this.errors = ref({})
    this.isSubmitting = ref(false)
    this.isLoading = ref(false)
    this.originalData = ref(null)
  }

  initializeForm(record = null, patients = [], doctors = [], departments = []) {
    this.originalData.value = record
    this.form.value = getInitialFormData(record)
    this.errors.value = {}
    
    // Set up watchers for validation
    this.setupValidationWatchers()
    
    return {
      form: this.form,
      errors: this.errors,
      isSubmitting: this.isSubmitting,
      isLoading: this.isLoading,
      patients: ref(patients),
      doctors: ref(doctors),
      departments: ref(departments),
      filteredDoctors: this.getFilteredDoctors.bind(this),
      validateField: this.validateField.bind(this),
      validateForm: this.validateForm.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
      resetForm: this.resetForm.bind(this),
      cancelEdit: this.cancelEdit.bind(this),
      addDiagnosis: this.addDiagnosis.bind(this),
      removeDiagnosis: this.removeDiagnosis.bind(this),
      addPrescription: this.addPrescription.bind(this),
      removePrescription: this.removePrescription.bind(this),
      addMedicalTest: this.addMedicalTest.bind(this),
      removeMedicalTest: this.removeMedicalTest.bind(this),
      addAttachment: this.addAttachment.bind(this),
      removeAttachment: this.removeAttachment.bind(this),
      getPatientInfo: this.getPatientInfo.bind(this),
      getDoctorInfo: this.getDoctorInfo.bind(this),
      formatDateForInput: this.formatDateForInput.bind(this),
      parseDateFromInput: this.parseDateFromInput.bind(this)
    }
  }

  // Setup validation watchers
  setupValidationWatchers() {
    watch(() => this.form.value.patient_id, () => {
      this.validateField('patient_id')
    })

    watch(() => this.form.value.doctor_id, () => {
      this.validateField('doctor_id')
    })

    watch(() => this.form.value.chief_complaint, () => {
      this.validateField('chief_complaint')
    })

    watch(() => this.form.value.examination_date, () => {
      this.validateField('examination_date')
    })
  }

  // Get filtered doctors based on selected department
  getFilteredDoctors(departmentId) {
    if (!departmentId) return this.doctors.value
    return this.doctors.value.filter(doctor => doctor.department_id === departmentId)
  }

  // Field validation
  validateField(fieldName) {
    const field = this.form.value[fieldName]
    let error = ''

    switch (fieldName) {
      case 'patient_id':
        if (!field) {
          error = 'يجب اختيار المريض'
        }
        break

      case 'doctor_id':
        if (!field) {
          error = 'يجب اختيار الطبيب'
        }
        break

      case 'chief_complaint':
        if (!field || field.trim().length < 10) {
          error = 'يجب كتابة الشكوى الرئيسية (10 أحرف على الأقل)'
        }
        break

      case 'examination_date':
        if (!field) {
          error = 'يجب تحديد تاريخ الفحص'
        } else {
          const examDate = new Date(field)
          const today = new Date()
          if (examDate > today) {
            error = 'تاريخ الفحص لا يمكن أن يكون في المستقبل'
          }
        }
        break

      case 'follow_up_date':
        if (field) {
          const followUpDate = new Date(field)
          const examDate = new Date(this.form.value.examination_date)
          if (followUpDate <= examDate) {
            error = 'تاريخ المتابعة يجب أن يكون بعد تاريخ الفحص'
          }
        }
        break

      case 'priority':
        if (!field) {
          error = 'يجب تحديد الأولوية'
        }
        break

      case 'status':
        if (!field) {
          error = 'يجب تحديد الحالة'
        }
        break
    }

    if (error) {
      this.errors.value[fieldName] = error
    } else {
      delete this.errors.value[fieldName]
    }

    return !error
  }

  // Form validation
  validateForm() {
    const requiredFields = [
      'patient_id',
      'doctor_id',
      'chief_complaint',
      'examination_date',
      'priority',
      'status'
    ]

    let isValid = true

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false
      }
    })

    // Validate diagnoses if any
    if (this.form.value.diagnoses && this.form.value.diagnoses.length > 0) {
      this.form.value.diagnoses.forEach((diagnosis, index) => {
        if (!diagnosis.name || diagnosis.name.trim().length < 3) {
          this.errors.value[`diagnoses.${index}.name`] = 'اسم التشخيص يجب أن يكون 3 أحرف على الأقل'
          isValid = false
        }
      })
    }

    // Validate prescriptions if any
    if (this.form.value.prescriptions && this.form.value.prescriptions.length > 0) {
      this.form.value.prescriptions.forEach((prescription, index) => {
        if (!prescription.medication || prescription.medication.trim().length < 3) {
          this.errors.value[`prescriptions.${index}.medication`] = 'اسم الدواء يجب أن يكون 3 أحرف على الأقل'
          isValid = false
        }
      })
    }

    return isValid
  }

  // Form submission
  async handleSubmit(emit) {
    if (!this.validateForm()) {
      return false
    }

    this.isSubmitting.value = true

    try {
      // Prepare data for submission
      const submitData = this.prepareSubmitData()
      
      // Emit submit event
      emit('submit', submitData)
      
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      this.isSubmitting.value = false
    }
  }

  // Prepare data for submission
  prepareSubmitData() {
    const data = { ...this.form.value }

    // Clean up empty arrays
    if (data.diagnoses && data.diagnoses.length === 0) {
      delete data.diagnoses
    }

    if (data.prescriptions && data.prescriptions.length === 0) {
      delete data.prescriptions
    }

    if (data.medical_tests && data.medical_tests.length === 0) {
      delete data.medical_tests
    }

    if (data.attachments && data.attachments.length === 0) {
      delete data.attachments
    }

    // Format dates
    if (data.examination_date) {
      data.examination_date = this.parseDateFromInput(data.examination_date)
    }

    if (data.follow_up_date) {
      data.follow_up_date = this.parseDateFromInput(data.follow_up_date)
    }

    return data
  }

  // Reset form
  resetForm() {
    this.form.value = getInitialFormData()
    this.errors.value = {}
  }

  // Cancel edit and restore original data
  cancelEdit() {
    if (this.originalData.value) {
      this.form.value = { ...this.originalData.value }
    } else {
      this.resetForm()
    }
    this.errors.value = {}
  }

  // Add new diagnosis
  addDiagnosis() {
    if (!this.form.value.diagnoses) {
      this.form.value.diagnoses = []
    }

    this.form.value.diagnoses.push({
      name: '',
      description: '',
      severity: 'medium',
      icd_code: ''
    })
  }

  // Remove diagnosis
  removeDiagnosis(index) {
    this.form.value.diagnoses.splice(index, 1)
  }

  // Add new prescription
  addPrescription() {
    if (!this.form.value.prescriptions) {
      this.form.value.prescriptions = []
    }

    this.form.value.prescriptions.push({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    })
  }

  // Remove prescription
  removePrescription(index) {
    this.form.value.prescriptions.splice(index, 1)
  }

  // Add new medical test
  addMedicalTest() {
    if (!this.form.value.medical_tests) {
      this.form.value.medical_tests = []
    }

    this.form.value.medical_tests.push({
      test_name: '',
      test_type: '',
      status: 'pending',
      results: '',
      notes: ''
    })
  }

  // Remove medical test
  removeMedicalTest(index) {
    this.form.value.medical_tests.splice(index, 1)
  }

  // Add new attachment
  addAttachment() {
    if (!this.form.value.attachments) {
      this.form.value.attachments = []
    }

    this.form.value.attachments.push({
      file_name: '',
      file_type: '',
      file_size: 0,
      description: ''
    })
  }

  // Remove attachment
  removeAttachment(index) {
    this.form.value.attachments.splice(index, 1)
  }

  // Get patient information
  getPatientInfo(patientId) {
    if (!patientId) return null
    
    const patient = this.patients.value.find(p => p.id === patientId)
    if (!patient) return null

    return {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      medical_history: patient.medical_history
    }
  }

  // Get doctor information
  getDoctorInfo(doctorId) {
    if (!doctorId) return null
    
    const doctor = this.doctors.value.find(d => d.id === doctorId)
    if (!doctor) return null

    return {
      name: doctor.name,
      department: doctor.department,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email
    }
  }

  // Format date for input field
  formatDateForInput(date) {
    if (!date) return ''
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    
    return dateObj.toISOString().split('T')[0]
  }

  // Parse date from input field
  parseDateFromInput(dateString) {
    if (!dateString) return null
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    return date.toISOString()
  }

  // Get form status
  getFormStatus() {
    return {
      isDirty: this.isFormDirty(),
      isValid: Object.keys(this.errors.value).length === 0,
      hasChanges: this.hasFormChanges()
    }
  }

  // Check if form is dirty
  isFormDirty() {
    if (!this.originalData.value) {
      return Object.keys(this.form.value).some(key => 
        this.form.value[key] !== '' && 
        this.form.value[key] !== null && 
        this.form.value[key] !== undefined
      )
    }

    return JSON.stringify(this.form.value) !== JSON.stringify(this.originalData.value)
  }

  // Check if form has changes
  hasFormChanges() {
    if (!this.originalData.value) return false
    
    const original = JSON.stringify(this.originalData.value)
    const current = JSON.stringify(this.form.value)
    
    return original !== current
  }

  // Get validation summary
  getValidationSummary() {
    const errorCount = Object.keys(this.errors.value).length
    const fieldCount = Object.keys(this.form.value).length
    
    return {
      errorCount,
      fieldCount,
      isValid: errorCount === 0,
      errorFields: Object.keys(this.errors.value),
      successRate: fieldCount > 0 ? ((fieldCount - errorCount) / fieldCount * 100).toFixed(1) : 100
    }
  }
}
