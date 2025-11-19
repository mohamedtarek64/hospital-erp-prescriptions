import { ref, reactive, computed } from 'vue'

/**
 * Settings Form Composable
 * 
 * Manages settings form functionality
 */
export const useSettingsForm = (props, emit) => {
  // Reactive data
  const form = reactive({
    key: '',
    value: '',
    type: '',
    description: '',
    category: '',
    is_public: false
  })
  
  const booleanValue = ref(false)
  const jsonValue = ref('')
  const jsonError = ref('')
  const isSubmitting = ref(false)

  // Computed
  const isEditing = computed(() => !!props.setting)
  const hasErrors = computed(() => !!jsonError.value)

  // Methods
  const submitForm = async () => {
    try {
      isSubmitting.value = true
      
      // Prepare form data
      let formData = { ...form }
      
      // Handle different value types
      if (form.type === 'boolean') {
        formData.value = booleanValue.value
      } else if (form.type === 'json') {
        formData.value = jsonValue.value
      }
      
      emit('submit', formData)
    } catch (err) {
      console.error('Form submission error:', err)
    } finally {
      isSubmitting.value = false
    }
  }

  const onTypeChange = () => {
    // Reset values when type changes
    form.value = ''
    booleanValue.value = false
    jsonValue.value = ''
    jsonError.value = ''
  }

  const validateJson = () => {
    if (form.type === 'json' && jsonValue.value) {
      try {
        JSON.parse(jsonValue.value)
        jsonError.value = ''
      } catch (err) {
        jsonError.value = 'Invalid JSON format'
      }
    }
  }

  const getTypeHelp = (type) => {
    const helpTexts = {
      string: 'Enter a text value',
      integer: 'Enter a whole number',
      float: 'Enter a decimal number',
      boolean: 'Enable or disable this setting',
      json: 'Enter valid JSON format'
    }
    return helpTexts[type] || 'Enter a value'
  }

  const onMountedHandler = () => {
    // Initialize form with existing setting data
    if (props.setting) {
      form.key = props.setting.key
      form.value = props.setting.value
      form.type = props.setting.type
      form.description = props.setting.description || ''
      form.category = props.setting.category
      form.is_public = props.setting.is_public
      
      // Set type-specific values
      if (form.type === 'boolean') {
        booleanValue.value = form.value === 'true' || form.value === true || form.value === '1' || form.value === 1
      } else if (form.type === 'json') {
        jsonValue.value = typeof form.value === 'string' ? form.value : JSON.stringify(form.value, null, 2)
      }
    }
  }

  return {
    // Reactive data
    form,
    booleanValue,
    jsonValue,
    jsonError,
    isSubmitting,
    isEditing,
    hasErrors,

    // Methods
    submitForm,
    onTypeChange,
    validateJson,
    getTypeHelp,
    onMountedHandler
  }
}
