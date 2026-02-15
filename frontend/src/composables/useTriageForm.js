import { ref, reactive, computed, watch } from 'vue'

export function useTriageForm(props, emit) {
  // Reactive state
  const isSubmitting = ref(false)
  const error = ref(null)

  // Form data
  const form = reactive({
    patient_name: '',
    age: '',
    gender: '',
    contact_number: '',
    chief_complaint: '',
    vital_signs: {
      heart_rate: '',
      systolic_bp: '',
      diastolic_bp: '',
      temperature: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    pain_scale: 0,
    pain_location: '',
    triage_level: '',
    assessment_notes: ''
  })

  // Triage levels
  const triageLevels = [
    {
      value: 'critical',
      name: 'Critical',
      description: 'Immediate life-threatening condition',
      response_time: 'Immediate',
      icon: 'fas fa-exclamation-triangle'
    },
    {
      value: 'high',
      name: 'High Priority',
      description: 'Urgent condition requiring prompt attention',
      response_time: 'Within 10 minutes',
      icon: 'fas fa-exclamation-circle'
    },
    {
      value: 'medium',
      name: 'Medium Priority',
      description: 'Moderate condition requiring attention',
      response_time: 'Within 30 minutes',
      icon: 'fas fa-exclamation'
    },
    {
      value: 'low',
      name: 'Low Priority',
      description: 'Non-urgent condition',
      response_time: 'Within 2 hours',
      icon: 'fas fa-info-circle'
    }
  ]

  // Computed properties
  const isEditing = computed(() => !!props.assessment)
  const isFormValid = computed(() => {
    return form.patient_name && 
           form.age && 
           form.gender && 
           form.chief_complaint && 
           form.triage_level
  })

  // Methods
  const selectTriageLevel = (level) => {
    form.triage_level = level
  }

  const resetForm = () => {
    Object.assign(form, {
      patient_name: '',
      age: '',
      gender: '',
      contact_number: '',
      chief_complaint: '',
      vital_signs: {
        heart_rate: '',
        systolic_bp: '',
        diastolic_bp: '',
        temperature: '',
        respiratory_rate: '',
        oxygen_saturation: ''
      },
      pain_scale: 0,
      pain_location: '',
      triage_level: '',
      assessment_notes: ''
    })
    error.value = null
  }

  const submitAssessment = async () => {
    if (!isFormValid.value) {
      error.value = 'Please fill in all required fields'
      return
    }

    isSubmitting.value = true
    error.value = null

    try {
      const assessmentData = {
        ...form,
        patient_id: props.patient?.id,
        assessed_by: 'current_user_id', // This should come from auth
        assessed_at: new Date().toISOString()
      }

      emit('submit', assessmentData)
    } catch (err) {
      error.value = err.message || 'Failed to submit assessment'
    } finally {
      isSubmitting.value = false
    }
  }

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Watch for patient changes
  watch(() => props.patient, (newPatient) => {
    if (newPatient) {
      form.patient_name = newPatient.name || ''
      form.age = newPatient.age || ''
      form.gender = newPatient.gender || ''
      form.contact_number = newPatient.phone || ''
    }
  }, { immediate: true })

  // Watch for assessment changes (editing mode)
  watch(() => props.assessment, (newAssessment) => {
    if (newAssessment) {
      Object.assign(form, {
        patient_name: newAssessment.patient_name || '',
        age: newAssessment.age || '',
        gender: newAssessment.gender || '',
        contact_number: newAssessment.contact_number || '',
        chief_complaint: newAssessment.chief_complaint || '',
        vital_signs: {
          heart_rate: newAssessment.vital_signs?.heart_rate || '',
          systolic_bp: newAssessment.vital_signs?.systolic_bp || '',
          diastolic_bp: newAssessment.vital_signs?.diastolic_bp || '',
          temperature: newAssessment.vital_signs?.temperature || '',
          respiratory_rate: newAssessment.vital_signs?.respiratory_rate || '',
          oxygen_saturation: newAssessment.vital_signs?.oxygen_saturation || ''
        },
        pain_scale: newAssessment.pain_scale || 0,
        pain_location: newAssessment.pain_location || '',
        triage_level: newAssessment.triage_level || '',
        assessment_notes: newAssessment.assessment_notes || ''
      })
    }
  }, { immediate: true })

  return {
    // State
    form,
    triageLevels,
    isSubmitting,
    isEditing,
    isFormValid,
    error,
    
    // Methods
    submitAssessment,
    resetForm,
    selectTriageLevel,
    formatTime
  }
}
