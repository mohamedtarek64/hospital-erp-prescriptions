<template>
  <div class="settings-form">
    <div class="form-header">
      <h3 class="form-title">
        <i class="fas fa-cog mr-2 text-blue-500"></i>
        {{ isEditing ? 'Edit Setting' : 'Create Setting' }}
      </h3>
    </div>

    <form @submit.prevent="submitForm" class="form-content">
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Key *</label>
          <input
            v-model="form.key"
            type="text"
            required
            class="form-input"
            :disabled="isEditing"
            placeholder="e.g., app_name"
          >
          <p class="form-help">Unique identifier for this setting</p>
        </div>

        <div class="form-group">
          <label class="form-label">Type *</label>
          <select v-model="form.type" required class="form-select" @change="onTypeChange">
            <option value="">Select Type</option>
            <option v-for="type in types" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Category *</label>
          <input
            v-model="form.category"
            type="text"
            required
            class="form-input"
            placeholder="e.g., general, system, backup"
          >
        </div>

        <div class="form-group full-width">
          <label class="form-label">Value *</label>
          
          <!-- Boolean Input -->
          <div v-if="form.type === 'boolean'" class="boolean-input-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="booleanValue"
                class="checkbox"
              >
              <span class="checkbox-text">Enable this setting</span>
            </label>
          </div>

          <!-- Number Input -->
          <input
            v-else-if="form.type === 'integer' || form.type === 'float'"
            v-model="form.value"
            type="number"
            required
            :step="form.type === 'float' ? '0.01' : '1'"
            class="form-input"
            placeholder="Enter numeric value"
          >

          <!-- JSON Input -->
          <div v-else-if="form.type === 'json'" class="json-input-group">
            <textarea
              v-model="jsonValue"
              required
              class="form-textarea"
              rows="4"
              placeholder="Enter JSON value"
              @blur="validateJson"
            ></textarea>
            <div v-if="jsonError" class="form-error">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              {{ jsonError }}
            </div>
          </div>

          <!-- String Input -->
          <input
            v-else
            v-model="form.value"
            type="text"
            required
            class="form-input"
            placeholder="Enter value"
          >

          <p class="form-help">
            {{ getTypeHelp(form.type) }}
          </p>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Description</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            rows="2"
            placeholder="Describe what this setting does"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Visibility</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="form.is_public"
                class="checkbox"
              >
              <span class="checkbox-text">Public (visible to all users)</span>
            </label>
            <p class="form-help">Public settings can be accessed by all users</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          <i class="fas fa-times mr-2"></i>
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="isSubmitting || hasErrors"
          class="btn-primary"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save mr-2"></i>
          {{ isEditing ? 'Update Setting' : 'Create Setting' }}
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
import { useSettingsForm } from '@/scripts/admin/settingsForm'

/**
 * Component props
 */
const props = defineProps({
  setting: {
    type: Object,
    default: null
  },
  types: {
    type: Array,
    default: () => ['string', 'integer', 'float', 'boolean', 'json']
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['submit', 'cancel'])

// Get settings form functionality
const {
  form,
  booleanValue,
  jsonValue,
  jsonError,
  isEditing,
  isSubmitting,
  hasErrors,
  submitForm,
  onTypeChange,
  validateJson,
  getTypeHelp
} = useSettingsForm(props, emit)
</script>

<style scoped>
@import '@/assets/css/admin/settingsForm.css';
</style>
