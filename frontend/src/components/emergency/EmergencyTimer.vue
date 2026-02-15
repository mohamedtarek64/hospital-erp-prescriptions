<template>
  <div class="emergency-timer">
    <div class="timer-header">
      <h3 class="timer-title">
        <i class="fas fa-stopwatch mr-2 text-blue-500"></i>
        Emergency Response Timer
      </h3>
      <div class="timer-controls">
        <button 
          @click="toggleTimer"
          class="btn-toggle"
          :class="{ 'active': isRunning }"
          :disabled="!canStart"
        >
          <i :class="isRunning ? 'fas fa-pause' : 'fas fa-play'" class="mr-2"></i>
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>
        <button 
          @click="resetTimer"
          class="btn-reset"
          :disabled="isRunning"
        >
          <i class="fas fa-redo mr-2"></i>
          Reset
        </button>
      </div>
    </div>

    <div class="timer-display">
      <div class="time-main">
        <span class="time-value">{{ formattedTime }}</span>
        <span class="time-label">Response Time</span>
      </div>
      
      <div class="time-breakdown">
        <div class="time-segment">
          <span class="segment-value">{{ formattedDispatchTime }}</span>
          <span class="segment-label">Dispatch</span>
        </div>
        <div class="time-segment">
          <span class="segment-value">{{ formattedArrivalTime }}</span>
          <span class="segment-label">Arrival</span>
        </div>
        <div class="time-segment">
          <span class="segment-value">{{ formattedHospitalTime }}</span>
          <span class="segment-label">Hospital</span>
        </div>
      </div>
    </div>

    <div class="timer-milestones">
      <h4 class="milestones-title">Response Milestones</h4>
      <div class="milestones-list">
        <div 
          v-for="milestone in milestones" 
          :key="milestone.id"
          class="milestone-item"
          :class="{ 'completed': milestone.completed, 'current': milestone.current }"
        >
          <div class="milestone-icon">
            <i :class="milestone.icon" class="text-sm"></i>
          </div>
          <div class="milestone-content">
            <span class="milestone-name">{{ milestone.name }}</span>
            <span class="milestone-time">{{ milestone.time || '--:--' }}</span>
          </div>
          <div v-if="milestone.completed" class="milestone-check">
            <i class="fas fa-check text-green-500"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="timer-alerts">
      <div v-if="showWarning" class="alert-warning">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>Response time exceeds target of {{ targetTime }} minutes</span>
      </div>
      
      <div v-if="showCritical" class="alert-critical">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>Critical response time exceeded!</span>
      </div>
    </div>

    <!-- Timer Settings -->
    <div class="timer-settings">
      <h4 class="settings-title">Timer Settings</h4>
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">Target Response Time (minutes)</label>
          <input
            v-model="targetTime"
            type="number"
            min="1"
            max="60"
            class="setting-input"
          >
        </div>
        <div class="setting-item">
          <label class="setting-label">Emergency Type</label>
          <select v-model="emergencyType" class="setting-select">
            <option value="critical">Critical</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEmergencyTimer } from '@/composables/useEmergencyTimer'

/**
 * Component props
 */
const props = defineProps({
  emergencyCase: {
    type: Object,
    default: null
  },
  autoStart: {
    type: Boolean,
    default: false
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['milestone-reached', 'target-exceeded', 'critical-exceeded'])

// Get emergency timer functionality
const {
  isRunning,
  canStart,
  formattedTime,
  formattedDispatchTime,
  formattedArrivalTime,
  formattedHospitalTime,
  milestones,
  targetTime,
  emergencyType,
  showWarning,
  showCritical,
  toggleTimer,
  resetTimer
} = useEmergencyTimer(props, emit)
</script>

<style scoped>
@import '@/assets/css/emergency/emergency-timer.css';
</style>
