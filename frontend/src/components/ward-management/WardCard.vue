<template>
  <div class="ward-card">
    <div class="ward-header">
      <div class="ward-info">
        <h3 class="ward-name">{{ ward.name }}</h3>
        <p class="ward-type">{{ ward.type }}</p>
      </div>
      <div class="ward-status">
        <span :class="['status-badge', ward.status]">
          {{ getStatusText(ward.status) }}
        </span>
      </div>
    </div>

    <div class="ward-details">
      <div class="detail-item">
        <i class="icon">🏥</i>
        <span>الطابق: {{ ward.floor }}</span>
      </div>
      <div class="detail-item">
        <i class="icon">🛏️</i>
        <span>السعة: {{ ward.capacity }}</span>
      </div>
      <div class="detail-item">
        <i class="icon">👩‍⚕️</i>
        <span>رئيسة التمريض: {{ ward.head_nurse?.name || 'غير محدد' }}</span>
      </div>
    </div>

    <div class="ward-stats">
      <div class="stat-item">
        <span class="stat-value">{{ occupancyRate }}%</span>
        <span class="stat-label">معدل الإشغال</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ availableBeds }}</span>
        <span class="stat-label">أسرة متاحة</span>
      </div>
    </div>

    <div class="ward-actions">
      <button @click="viewDetails" class="btn btn-primary">
        <i class="icon">👁️</i>
        عرض التفاصيل
      </button>
      <button @click="editWard" class="btn btn-secondary">
        <i class="icon">✏️</i>
        تعديل
      </button>
      <button @click="viewLayout" class="btn btn-info">
        <i class="icon">🗺️</i>
        عرض التخطيط
      </button>
    </div>
  </div>
</template>

<script setup>
import { useWardCard } from '@/scripts/ward-management/wardCard'

/**
 * Component props
 */
const props = defineProps({
  ward: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && value.name
    }
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['viewDetails', 'editWard', 'viewLayout'])

// Get ward card functionality
const {
  occupancyRate,
  availableBeds,
  getStatusText,
  viewDetails,
  editWard,
  viewLayout
} = useWardCard(props, emit)
</script>

<style scoped>
@import '@/assets/css/ward-management/wardCard.css';
</style>
