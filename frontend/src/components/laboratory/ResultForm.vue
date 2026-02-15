<template>
  <div class="result-form-container">
    <form @submit.prevent="submitResult" class="result-form">
      <div class="form-header">
        <h3>Enter Test Result</h3>
        <div class="sample-info">
          <span class="sample-id">{{ sample.sample_id }}</span>
          <span class="test-name">{{ sample.lab_request_item?.lab_test?.name }}</span>
        </div>
      </div>

      <div class="form-sections">
        <!-- Test Information -->
        <div class="form-section">
          <h4>Test Information</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Test Name</label>
              <input 
                type="text" 
                :value="sample.lab_request_item?.lab_test?.name" 
                readonly 
                class="readonly-input"
              >
            </div>
            <div class="form-group">
              <label>Normal Range</label>
              <input 
                type="text" 
                :value="getNormalRange()" 
                readonly 
                class="readonly-input"
              >
            </div>
          </div>
        </div>

        <!-- Result Entry -->
        <div class="form-section">
          <h4>Result Entry</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Result Value *</label>
              <input 
                type="text" 
                v-model="formData.result_value" 
                required
                :placeholder="`Enter value in ${getUnit()}`"
                class="result-input"
                :class="{ 'error': errors.result_value }"
              >
              <span v-if="errors.result_value" class="error-message">{{ errors.result_value }}</span>
            </div>
            <div class="form-group">
              <label>Result Status *</label>
              <select v-model="formData.result_status" required>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
                <option value="critical">Critical</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Reference Range</label>
              <input 
                type="text" 
                v-model="formData.reference_range" 
                :placeholder="getNormalRange()"
              >
            </div>
            <div class="form-group">
              <label>Tested Date *</label>
              <input 
                type="date" 
                v-model="formData.tested_date" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>Comments</label>
            <textarea 
              v-model="formData.comments" 
              rows="3" 
              placeholder="Additional comments, notes, or observations..."
            ></textarea>
          </div>
        </div>

        <!-- Quality Control -->
        <div class="form-section">
          <h4>Quality Control</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Tested By *</label>
              <select v-model="formData.tested_by" required>
                <option value="">Select Technician</option>
                <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                  {{ technician.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Verified By</label>
              <select v-model="formData.verified_by">
                <option value="">Select Verifier</option>
                <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                  {{ technician.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Verification Date</label>
            <input 
              type="date" 
              v-model="formData.verified_date"
              :disabled="!formData.verified_by"
            >
          </div>
        </div>

        <!-- Validation Rules -->
        <div class="form-section">
          <h4>Validation</h4>
          <div class="validation-rules">
            <div class="rule-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.validated"
                  :disabled="!canValidate"
                >
                <span class="checkmark"></span>
                Result validated against normal ranges
              </label>
            </div>
            <div class="rule-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.quality_checked"
                >
                <span class="checkmark"></span>
                Quality control checks performed
              </label>
            </div>
            <div class="rule-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.equipment_calibrated"
                >
                <span class="checkmark"></span>
                Equipment calibration verified
              </label>
            </div>
          </div>
        </div>

        <!-- Critical Value Alert -->
        <div v-if="isCriticalValue" class="critical-alert">
          <div class="alert-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Critical Value Alert</h4>
          </div>
          <p>This result is outside the critical range and requires immediate attention.</p>
          <div class="form-group">
            <label>Critical Value Notification Sent To:</label>
            <input 
              type="text" 
              v-model="formData.critical_notification"
              placeholder="Enter physician or department notified"
            >
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="cancel-btn">
          Cancel
        </button>
        <button type="button" @click="saveDraft" class="draft-btn" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          {{ saving ? 'Saving...' : 'Save Draft' }}
        </button>
        <button type="submit" class="submit-btn" :disabled="saving || !isFormValid">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          {{ saving ? 'Submitting...' : 'Submit Result' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ResultForm',
  props: {
    sample: {
      type: Object,
      required: true
    },
    technicians: {
      type: Array,
      default: () => []
    },
    existingResult: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel', 'save-draft'],
  setup(props, { emit }) {
    const saving = ref(false)
    const errors = ref({})

    const formData = ref({
      result_value: '',
      result_status: 'normal',
      reference_range: '',
      comments: '',
      tested_by: '',
      verified_by: '',
      tested_date: new Date().toISOString().split('T')[0],
      verified_date: '',
      validated: false,
      quality_checked: false,
      equipment_calibrated: false,
      critical_notification: ''
    })

    // Initialize form with existing result if provided
    if (props.existingResult) {
      formData.value = {
        ...formData.value,
        ...props.existingResult
      }
    }

    // Computed properties
    const getNormalRange = () => {
      const test = props.sample.lab_request_item?.lab_test
      if (!test) return 'N/A'
      return test.normal_range_male || test.normal_range_female || 'N/A'
    }

    const getUnit = () => {
      return props.sample.lab_request_item?.lab_test?.unit || 'units'
    }

    const isCriticalValue = computed(() => {
      return formData.value.result_status === 'critical'
    })

    const canValidate = computed(() => {
      return formData.value.result_value && formData.value.reference_range
    })

    const isFormValid = computed(() => {
      return formData.value.result_value && 
             formData.value.result_status && 
             formData.value.tested_by && 
             formData.value.tested_date
    })

    // Watch for changes to update reference range
    watch(() => formData.value.result_value, (newValue) => {
      if (newValue && !formData.value.reference_range) {
        formData.value.reference_range = getNormalRange()
      }
      validateResult()
    })

    // Methods
    const validateResult = () => {
      errors.value = {}
      
      if (!formData.value.result_value) {
        errors.value.result_value = 'Result value is required'
        return
      }

      const numericValue = parseFloat(formData.value.result_value)
      if (isNaN(numericValue)) {
        errors.value.result_value = 'Result value must be a number'
        return
      }

      // Additional validation logic can be added here
    }

    const submitResult = async () => {
      validateResult()
      
      if (Object.keys(errors.value).length > 0) {
        return
      }

      saving.value = true
      try {
        const resultData = {
          ...formData.value,
          sample_id: props.sample.id
        }
        emit('submit', resultData)
      } catch (error) {
        console.error('Error submitting result:', error)
      } finally {
        saving.value = false
      }
    }

    const saveDraft = async () => {
      saving.value = true
      try {
        const draftData = {
          ...formData.value,
          sample_id: props.sample.id,
          status: 'draft'
        }
        emit('save-draft', draftData)
      } catch (error) {
        console.error('Error saving draft:', error)
      } finally {
        saving.value = false
      }
    }

    return {
      saving,
      errors,
      formData,
      getNormalRange,
      getUnit,
      isCriticalValue,
      canValidate,
      isFormValid,
      submitResult,
      saveDraft
    }
  }
}
</script>

<style scoped>
.result-form-container {
  @apply max-w-4xl mx-auto p-6;
}

.result-form {
  @apply bg-white rounded-lg shadow-lg p-6;
}

.form-header {
  @apply mb-6 pb-4 border-b border-gray-200;
}

.form-header h3 {
  @apply text-xl font-semibold text-gray-800 mb-2;
}

.sample-info {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.sample-id {
  @apply font-medium text-blue-600;
}

.test-name {
  @apply font-medium;
}

.form-sections {
  @apply space-y-6;
}

.form-section {
  @apply space-y-4;
}

.form-section h4 {
  @apply text-lg font-medium text-gray-800 border-b border-gray-200 pb-2;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.readonly-input {
  @apply bg-gray-100 text-gray-600 cursor-not-allowed;
}

.result-input {
  @apply font-medium;
}

.result-input.error {
  @apply border-red-500 focus:ring-red-500;
}

.error-message {
  @apply text-sm text-red-600;
}

.validation-rules {
  @apply space-y-3;
}

.rule-item {
  @apply flex items-center;
}

.checkbox-label {
  @apply flex items-center cursor-pointer;
}

.checkbox-label input[type="checkbox"] {
  @apply mr-3;
}

.checkmark {
  @apply text-sm text-gray-600;
}

.critical-alert {
  @apply bg-red-50 border border-red-200 rounded-lg p-4;
}

.alert-header {
  @apply flex items-center mb-2;
}

.alert-header i {
  @apply text-red-500 mr-2;
}

.alert-header h4 {
  @apply text-red-800 font-medium;
}

.critical-alert p {
  @apply text-red-700 text-sm mb-3;
}

.form-actions {
  @apply flex justify-end space-x-3 pt-6 border-t border-gray-200;
}

.cancel-btn {
  @apply px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200;
}

.draft-btn {
  @apply px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200;
}

.submit-btn {
  @apply px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
