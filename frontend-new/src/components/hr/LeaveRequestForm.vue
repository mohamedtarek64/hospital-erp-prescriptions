<template>
  <div class="leave-request-form">
    <div class="form-header">
      <h3 class="text-lg font-semibold text-gray-900">Leave Request Form</h3>
      <p class="text-sm text-gray-600">Submit a new leave request</p>
    </div>

    <form @submit.prevent="submitLeaveRequest" class="space-y-6">
      <!-- Employee Selection -->
      <div class="form-group">
        <label for="employee_id" class="form-label">Employee</label>
        <select
          id="employee_id"
          v-model="form.employee_id"
          class="form-select"
          :class="{ 'border-red-500': errors.employee_id }"
          required
        >
          <option value="">Select Employee</option>
          <option
            v-for="employee in employees"
            :key="employee.id"
            :value="employee.id"
          >
            {{ employee.name }} ({{ employee.employee_id }})
          </option>
        </select>
        <div v-if="errors.employee_id" class="error-message">
          {{ errors.employee_id }}
        </div>
      </div>

      <!-- Leave Type -->
      <div class="form-group">
        <label for="leave_type" class="form-label">Leave Type</label>
        <select
          id="leave_type"
          v-model="form.leave_type"
          class="form-select"
          :class="{ 'border-red-500': errors.leave_type }"
          required
        >
          <option value="">Select Leave Type</option>
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal Leave</option>
          <option value="maternity">Maternity Leave</option>
          <option value="paternity">Paternity Leave</option>
          <option value="emergency">Emergency Leave</option>
        </select>
        <div v-if="errors.leave_type" class="error-message">
          {{ errors.leave_type }}
        </div>
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="start_date" class="form-label">Start Date</label>
          <input
            id="start_date"
            v-model="form.start_date"
            type="date"
            class="form-input"
            :class="{ 'border-red-500': errors.start_date }"
            required
          />
          <div v-if="errors.start_date" class="error-message">
            {{ errors.start_date }}
          </div>
        </div>

        <div class="form-group">
          <label for="end_date" class="form-label">End Date</label>
          <input
            id="end_date"
            v-model="form.end_date"
            type="date"
            class="form-input"
            :class="{ 'border-red-500': errors.end_date }"
            required
          />
          <div v-if="errors.end_date" class="error-message">
            {{ errors.end_date }}
          </div>
        </div>
      </div>

      <!-- Duration Display -->
      <div v-if="form.start_date && form.end_date" class="duration-display">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <CalendarIcon class="h-5 w-5 text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">
              Duration: {{ calculateDuration() }} days
            </span>
          </div>
        </div>
      </div>

      <!-- Reason -->
      <div class="form-group">
        <label for="reason" class="form-label">Reason for Leave</label>
        <textarea
          id="reason"
          v-model="form.reason"
          rows="4"
          class="form-textarea"
          :class="{ 'border-red-500': errors.reason }"
          placeholder="Please provide a detailed reason for your leave request..."
          required
        ></textarea>
        <div v-if="errors.reason" class="error-message">
          {{ errors.reason }}
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="form-group">
        <label for="emergency_contact" class="form-label">Emergency Contact</label>
        <input
          id="emergency_contact"
          v-model="form.emergency_contact"
          type="text"
          class="form-input"
          :class="{ 'border-red-500': errors.emergency_contact }"
          placeholder="Emergency contact person and phone number"
        />
        <div v-if="errors.emergency_contact" class="error-message">
          {{ errors.emergency_contact }}
        </div>
      </div>

      <!-- Supporting Documents -->
      <div class="form-group">
        <label class="form-label">Supporting Documents</label>
        <div class="file-upload-area">
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            @change="handleFileUpload"
            class="hidden"
          />
          <button
            type="button"
            @click="$refs.fileInput.click()"
            class="file-upload-button"
          >
            <DocumentIcon class="h-5 w-5 mr-2" />
            Upload Documents
          </button>
          <p class="text-xs text-gray-500 mt-2">
            Supported formats: PDF, JPG, PNG, DOC, DOCX
          </p>
        </div>

        <!-- Uploaded Files List -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Uploaded Files:</h4>
          <div class="space-y-2">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="file-item"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <DocumentIcon class="h-4 w-4 text-gray-400 mr-2" />
                  <span class="text-sm text-gray-700">{{ file.name }}</span>
                  <span class="text-xs text-gray-500 ml-2">
                    ({{ formatFileSize(file.size) }})
                  </span>
                </div>
                <button
                  type="button"
                  @click="removeFile(index)"
                  class="remove-file-button"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="resetForm"
          class="btn-secondary"
          :disabled="isSubmitting"
        >
          Reset
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
          <span v-else>Submit Leave Request</span>
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="success-message">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 text-green-600 mr-2" />
        <span class="text-green-800">Leave request submitted successfully!</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useHRStore } from '@/stores/hr'
import { useAttendanceStore } from '@/stores/attendance'
import { CalendarIcon, DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'LeaveRequestForm',
  components: {
    CalendarIcon,
    DocumentIcon,
    XMarkIcon,
    CheckCircleIcon
  },
  setup() {
    const hrStore = useHRStore()
    const attendanceStore = useAttendanceStore()

    const form = reactive({
      employee_id: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: '',
      emergency_contact: '',
      documents: []
    })

    const errors = reactive({})
    const isSubmitting = ref(false)
    const showSuccessMessage = ref(false)
    const uploadedFiles = ref([])

    const employees = computed(() => hrStore.employees)

    const calculateDuration = () => {
      if (!form.start_date || !form.end_date) return 0
      
      const start = new Date(form.start_date)
      const end = new Date(form.end_date)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      return diffDays
    }

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          uploadedFiles.value.push(file)
        } else {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        }
      })
    }

    const removeFile = (index) => {
      uploadedFiles.value.splice(index, 1)
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const validateForm = () => {
      const newErrors = {}

      if (!form.employee_id) {
        newErrors.employee_id = 'Please select an employee'
      }

      if (!form.leave_type) {
        newErrors.leave_type = 'Please select a leave type'
      }

      if (!form.start_date) {
        newErrors.start_date = 'Please select a start date'
      }

      if (!form.end_date) {
        newErrors.end_date = 'Please select an end date'
      }

      if (form.start_date && form.end_date) {
        const start = new Date(form.start_date)
        const end = new Date(form.end_date)
        
        if (end < start) {
          newErrors.end_date = 'End date must be after start date'
        }

        if (start < new Date()) {
          newErrors.start_date = 'Start date cannot be in the past'
        }
      }

      if (!form.reason || form.reason.trim().length < 10) {
        newErrors.reason = 'Please provide a detailed reason (at least 10 characters)'
      }

      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }

    const submitLeaveRequest = async () => {
      if (!validateForm()) return

      isSubmitting.value = true
      showSuccessMessage.value = false

      try {
        const formData = new FormData()
        formData.append('employee_id', form.employee_id)
        formData.append('leave_type', form.leave_type)
        formData.append('start_date', form.start_date)
        formData.append('end_date', form.end_date)
        formData.append('reason', form.reason)
        formData.append('emergency_contact', form.emergency_contact)

        // Add uploaded files
        uploadedFiles.value.forEach((file, index) => {
          formData.append(`documents[${index}]`, file)
        })

        await attendanceStore.submitLeaveRequest(formData)
        
        showSuccessMessage.value = true
        resetForm()
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          showSuccessMessage.value = false
        }, 5000)

      } catch (error) {
        console.error('Error submitting leave request:', error)
        alert('Failed to submit leave request. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (key === 'documents') {
          form[key] = []
        } else {
          form[key] = ''
        }
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      uploadedFiles.value = []
      showSuccessMessage.value = false
    }

    onMounted(() => {
      hrStore.fetchEmployees()
    })

    return {
      form,
      errors,
      isSubmitting,
      showSuccessMessage,
      uploadedFiles,
      employees,
      calculateDuration,
      handleFileUpload,
      removeFile,
      formatFileSize,
      submitLeaveRequest,
      resetForm
    }
  }
}
</script>
