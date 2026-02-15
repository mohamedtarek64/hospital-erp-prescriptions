<template>
  <div class="alert-notification" :class="getAlertClass(alert)">
    <div class="alert-header">
      <div class="alert-icon">
        <i :class="getAlertIcon(alert.alert_type)" class="text-lg"></i>
      </div>
      <div class="alert-info">
        <h4 class="alert-title">{{ alert.title }}</h4>
        <div class="alert-meta">
          <span class="alert-type">{{ formatAlertType(alert.alert_type) }}</span>
          <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
        </div>
      </div>
      <div class="alert-actions">
        <button 
          v-if="alert.status === 'pending'"
          @click="acknowledgeAlert"
          class="btn-acknowledge"
          :disabled="isProcessing"
        >
          <i class="fas fa-check mr-1"></i>
          Acknowledge
        </button>
        <button 
          v-if="alert.status === 'acknowledged'"
          @click="resolveAlert"
          class="btn-resolve"
          :disabled="isProcessing"
        >
          <i class="fas fa-check-circle mr-1"></i>
          Resolve
        </button>
        <button 
          @click="dismissAlert"
          class="btn-dismiss"
          :disabled="isProcessing"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="alert-content">
      <p class="alert-message">{{ alert.message }}</p>
      
      <div v-if="alert.patient" class="patient-info">
        <div class="patient-details">
          <span class="patient-name">{{ getPatientName(alert.patient) }}</span>
          <span class="patient-id">ID: {{ alert.patient.id }}</span>
        </div>
      </div>

      <div v-if="alert.location" class="location-info">
        <i class="fas fa-map-marker-alt mr-2"></i>
        <span>{{ alert.location }}</span>
      </div>

      <div v-if="alert.emergency_case" class="case-info">
        <div class="case-details">
          <span class="case-number">Case: {{ alert.emergency_case.case_number }}</span>
          <span class="case-priority" :class="`priority-${alert.emergency_case.priority}`">
            {{ alert.emergency_case.priority.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <div class="alert-footer">
      <div class="alert-status">
        <span class="status-badge" :class="getStatusClass(alert.status)">
          {{ formatStatus(alert.status) }}
        </span>
        <span v-if="alert.acknowledged_by" class="acknowledged-by">
          Acknowledged by {{ getStaffName(alert.acknowledged_by) }}
        </span>
      </div>
      
      <div class="alert-timer" v-if="alert.status === 'pending'">
        <i class="fas fa-clock mr-1"></i>
        <span>{{ getAlertAge(alert.created_at) }}</span>
      </div>
    </div>

    <!-- Processing Overlay -->
    <div v-if="isProcessing" class="processing-overlay">
      <i class="fas fa-spinner fa-spin text-white"></i>
    </div>
  </div>
</template>

<script setup>
import { useAlertNotification } from '@/composables/useAlertNotification'

/**
 * Component props
 */
const props = defineProps({
  alert: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['acknowledge', 'resolve', 'dismiss'])

// Get alert notification functionality
const {
  isProcessing,
  getAlertClass,
  getAlertIcon,
  getStatusClass,
  formatAlertType,
  formatStatus,
  formatTime,
  getAlertAge,
  getPatientName,
  getStaffName,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert
} = useAlertNotification(props, emit)
</script>

<style scoped>
@import '@/assets/css/emergency/alert-notification.css';
</style>
