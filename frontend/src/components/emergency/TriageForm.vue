<template>
  <div class="triage-form">
    <div class="form-header">
      <h3 class="form-title">
        <i class="fas fa-stethoscope mr-2 text-blue-500"></i>
        Triage Assessment
      </h3>
      <div class="form-meta">
        <span class="patient-id">Patient ID: {{ patient?.id || 'N/A' }}</span>
        <span class="assessment-time">{{ formatTime(new Date()) }}</span>
      </div>
    </div>

    <form @submit.prevent="submitAssessment" class="form-content">
      <!-- Patient Information -->
      <div class="form-section">
        <h4 class="section-title">Patient Information</h4>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Patient Name *</label>
            <input
              v-model="form.patient_name"
              type="text"
              required
              class="form-input"
              placeholder="Enter patient name"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Age *</label>
            <input
              v-model="form.age"
              type="number"
              required
              min="0"
              max="120"
              class="form-input"
              placeholder="Enter age"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Gender *</label>
            <select v-model="form.gender" required class="form-select">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Contact Number</label>
            <input
              v-model="form.contact_number"
              type="tel"
              class="form-input"
              placeholder="Enter contact number"
            >
          </div>
        </div>
      </div>

      <!-- Chief Complaint -->
      <div class="form-section">
        <h4 class="section-title">Chief Complaint</h4>
        <div class="form-group">
          <label class="form-label">Primary Complaint *</label>
          <textarea
            v-model="form.chief_complaint"
            required
            class="form-textarea"
            rows="3"
            placeholder="Describe the primary complaint or reason for visit"
          ></textarea>
        </div>
      </div>

      <!-- Vital Signs -->
      <div class="form-section">
        <h4 class="section-title">Vital Signs</h4>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Heart Rate (BPM)</label>
            <input
              v-model="form.vital_signs.heart_rate"
              type="number"
              min="0"
              max="300"
              class="form-input"
              placeholder="e.g., 72"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Blood Pressure (Systolic)</label>
            <input
              v-model="form.vital_signs.systolic_bp"
              type="number"
              min="0"
              max="300"
              class="form-input"
              placeholder="e.g., 120"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Blood Pressure (Diastolic)</label>
            <input
              v-model="form.vital_signs.diastolic_bp"
              type="number"
              min="0"
              max="200"
              class="form-input"
              placeholder="e.g., 80"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Temperature (°C)</label>
            <input
              v-model="form.vital_signs.temperature"
              type="number"
              step="0.1"
              min="30"
              max="45"
              class="form-input"
              placeholder="e.g., 36.5"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Respiratory Rate</label>
            <input
              v-model="form.vital_signs.respiratory_rate"
              type="number"
              min="0"
              max="60"
              class="form-input"
              placeholder="e.g., 16"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Oxygen Saturation (%)</label>
            <input
              v-model="form.vital_signs.oxygen_saturation"
              type="number"
              min="0"
              max="100"
              class="form-input"
              placeholder="e.g., 98"
            >
          </div>
        </div>
      </div>

      <!-- Pain Assessment -->
      <div class="form-section">
        <h4 class="section-title">Pain Assessment</h4>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Pain Scale (0-10) *</label>
            <div class="pain-scale">
              <input
                v-model="form.pain_scale"
                type="range"
                min="0"
                max="10"
                step="1"
                class="pain-slider"
                required
              >
              <div class="pain-labels">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div class="pain-value">
                Pain Level: {{ form.pain_scale || 0 }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Pain Location</label>
            <input
              v-model="form.pain_location"
              type="text"
              class="form-input"
              placeholder="e.g., chest, abdomen, head"
            >
          </div>
        </div>
      </div>

      <!-- Triage Level -->
      <div class="form-section">
        <h4 class="section-title">Triage Assessment</h4>
        <div class="triage-levels">
          <div 
            v-for="level in triageLevels" 
            :key="level.value"
            class="triage-option"
            :class="{ 'selected': form.triage_level === level.value }"
            @click="selectTriageLevel(level.value)"
          >
            <div class="triage-icon" :class="`triage-${level.value}`">
              <i :class="level.icon"></i>
            </div>
            <div class="triage-info">
              <h5 class="triage-name">{{ level.name }}</h5>
              <p class="triage-description">{{ level.description }}</p>
              <span class="triage-time">{{ level.response_time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Notes -->
      <div class="form-section">
        <h4 class="section-title">Additional Notes</h4>
        <div class="form-group">
          <label class="form-label">Assessment Notes</label>
          <textarea
            v-model="form.assessment_notes"
            class="form-textarea"
            rows="3"
            placeholder="Any additional observations or notes"
          ></textarea>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          <i class="fas fa-undo mr-2"></i>
          Reset
        </button>
        <button 
          type="submit" 
          :disabled="isSubmitting || !isFormValid"
          class="btn-primary"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save mr-2"></i>
          {{ isEditing ? 'Update Assessment' : 'Submit Assessment' }}
        </button>
      </div>
    </form>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <h4 class="error-title">Error</h4>
        <p class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTriageForm } from '@/composables/useTriageForm'

/**
 * Component props
 */
const props = defineProps({
  patient: {
    type: Object,
    default: null
  },
  assessment: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['submit', 'cancel'])

// Get triage form functionality
const {
  form,
  triageLevels,
  isSubmitting,
  isEditing,
  isFormValid,
  error,
  submitAssessment,
  resetForm,
  selectTriageLevel,
  formatTime
} = useTriageForm(props, emit)
</script>

<style scoped>
@import '@/assets/css/emergency/triage-form.css';
</style>
