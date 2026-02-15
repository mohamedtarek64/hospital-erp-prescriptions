<template>
  <div class="bed-card" :class="bedStatusClass">
    <div class="bed-header">
      <div class="bed-info">
        <h4 class="bed-number">{{ bed.bed_number }}</h4>
        <p class="bed-type">{{ getBedTypeText(bed.bed_type) }}</p>
      </div>
      <div class="bed-status">
        <span :class="['status-badge', bed.status]">
          {{ getStatusText(bed.status) }}
        </span>
      </div>
    </div>

    <div class="bed-details" v-if="bed.patient">
      <div class="patient-info">
        <div class="patient-name">
          <i class="icon">👤</i>
          <span>{{ bed.patient.name }}</span>
        </div>
        <div class="admission-date">
          <i class="icon">📅</i>
          <span>{{ formatDate(bed.patient.admission_date) }}</span>
        </div>
      </div>
    </div>

    <div class="bed-details" v-else>
      <div class="empty-bed">
        <i class="icon">🛏️</i>
        <span>سرير فارغ</span>
      </div>
    </div>

    <div class="bed-actions">
      <button 
        v-if="bed.status === 'available'" 
        @click="assignBed" 
        class="btn btn-success"
      >
        <i class="icon">➕</i>
        تعيين
      </button>
      <button 
        v-if="bed.status === 'occupied'" 
        @click="viewPatient" 
        class="btn btn-info"
      >
        <i class="icon">👁️</i>
        عرض المريض
      </button>
      <button 
        v-if="bed.status === 'occupied'" 
        @click="dischargePatient" 
        class="btn btn-warning"
      >
        <i class="icon">🚪</i>
        خروج
      </button>
      <button @click="maintenanceBed" class="btn btn-secondary">
        <i class="icon">🔧</i>
        صيانة
      </button>
    </div>

    <div class="maintenance-info" v-if="bed.last_maintenance">
      <small class="text-gray-500">
        آخر صيانة: {{ formatDate(bed.last_maintenance) }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { useBedCard } from '@/scripts/ward-management/bedCard'

/**
 * Component props
 */
const props = defineProps({
  bed: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && value.bed_number
    }
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['assignBed', 'viewPatient', 'dischargePatient', 'maintenanceBed'])

// Get bed card functionality
const {
  bedStatusClass,
  getBedTypeText,
  getStatusText,
  formatDate,
  assignBed,
  viewPatient,
  dischargePatient,
  maintenanceBed
} = useBedCard(props, emit)
</script>

<style scoped>
@import '@/assets/css/ward-management/bedCard.css';
</style>
