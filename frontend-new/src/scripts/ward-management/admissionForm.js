/**
 * Admission Form JavaScript
 * Handles admission form functionality and data management
 */

import { ref, computed, watch } from 'vue'

/**
 * Admission Form Composable
 */
export function useAdmissionForm(props, emit) {
  /**
   * Reactive data
   */
  const isSubmitting = ref(false)

  const form = ref({
    patient_id: '',
    bed_id: '',
    admission_type: '',
    referring_doctor_id: '',
    admission_date: '',
    admission_time: '',
    diagnosis: '',
    notes: ''
  })

  /**
   * Computed properties
   */
  const selectedPatient = computed(() => {
    return props.patients.find(p => p.id === form.value.patient_id)
  })

  const selectedBed = computed(() => {
    return props.availableBeds.find(b => b.id === form.value.bed_id)
  })

  /**
   * Methods
   */
  const getBedTypeText = (type) => {
    const typeMap = {
      standard: 'عادي',
      private: 'خاص',
      icu: 'عناية مركزة',
      emergency: 'طوارئ',
      isolation: 'عزل'
    }
    return typeMap[type] || type
  }

  const onPatientChange = () => {
    // Auto-fill some fields based on patient selection
    if (selectedPatient.value) {
      // Could auto-fill referring doctor if patient has a primary doctor
      console.log('Selected patient:', selectedPatient.value)
    }
  }

  const onBedChange = () => {
    // Show bed details when selected
    if (selectedBed.value) {
      console.log('Selected bed:', selectedBed.value)
    }
  }

  const submitForm = async () => {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
      // Validate form
      if (!form.value.patient_id || !form.value.bed_id || !form.value.admission_type) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة')
      }

      // Prepare form data
      const formData = {
        ...form.value,
        admission_date: form.value.admission_date,
        admission_time: form.value.admission_time
      }

      // Emit submit event
      emit('submit', formData)

      // Reset form
      resetForm()
    } catch (error) {
      console.error('Error submitting admission form:', error)
      alert(error.message || 'حدث خطأ أثناء حفظ القبول')
    } finally {
      isSubmitting.value = false
    }
  }

  const closeForm = () => {
    emit('close')
  }

  const resetForm = () => {
    form.value = {
      patient_id: '',
      bed_id: '',
      admission_type: '',
      referring_doctor_id: '',
      admission_date: '',
      admission_time: '',
      diagnosis: '',
      notes: ''
    }
  }

  /**
   * Watchers
   */
  const watchShow = () => {
    watch(() => props.show, (newValue) => {
      if (newValue) {
        // Set default values when form opens
        const now = new Date()
        form.value.admission_date = now.toISOString().split('T')[0]
        form.value.admission_time = now.toTimeString().slice(0, 5)
      } else {
        resetForm()
      }
    })
  }

  return {
    // Reactive data
    isSubmitting,
    form,
    
    // Computed properties
    selectedPatient,
    selectedBed,
    
    // Methods
    getBedTypeText,
    onPatientChange,
    onBedChange,
    submitForm,
    closeForm,
    resetForm,
    
    // Watchers
    watchShow
  }
}
