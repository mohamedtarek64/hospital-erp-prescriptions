<template>
  <div class="medicine-card" :class="{ 'medicine-card--low-stock': isLowStock, 'medicine-card--out-of-stock': isOutOfStock }">
    <div class="medicine-card__header">
      <div class="medicine-card__icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <div class="medicine-card__status" v-if="medicine.stock_status">
        <span class="status-badge" :class="`status-badge--${medicine.stock_status}`">
          {{ getStatusText(medicine.stock_status) }}
        </span>
      </div>
    </div>

    <div class="medicine-card__content">
      <h3 class="medicine-card__title">{{ medicine.name }}</h3>
      <p class="medicine-card__category">{{ medicine.category }}</p>
      <p class="medicine-card__manufacturer">{{ medicine.manufacturer }}</p>
      
      <div class="medicine-card__details">
        <div class="detail-item">
          <span class="detail-label">السعر:</span>
          <span class="detail-value">{{ formatPrice(medicine.price) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الكمية المتاحة:</span>
          <span class="detail-value" :class="{ 'text-red-600': isLowStock }">
            {{ medicine.available_quantity || 0 }}
          </span>
        </div>
        <div class="detail-item" v-if="medicine.expiry_date">
          <span class="detail-label">تاريخ الانتهاء:</span>
          <span class="detail-value" :class="{ 'text-red-600': isExpiringSoon }">
            {{ formatDate(medicine.expiry_date) }}
          </span>
        </div>
      </div>
    </div>

    <div class="medicine-card__actions">
      <button 
        @click="handleEdit" 
        class="action-btn action-btn--edit"
        :disabled="!canEdit"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        تعديل
      </button>
      
      <button 
        @click="handleDispense" 
        class="action-btn action-btn--dispense"
        :disabled="!canDispense"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        صرف
      </button>
      
      <button 
        @click="handleDelete" 
        class="action-btn action-btn--delete"
        :disabled="!canDelete"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        حذف
      </button>
    </div>
  </div>
</template>

<script setup>
import { useMedicineCardManager } from './MedicineCard.js'

const props = defineProps({
  medicine: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: true
  },
  canDispense: {
    type: Boolean,
    default: true
  },
  canDelete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'dispense', 'delete'])

const manager = useMedicineCardManager(props, emit)

// Expose manager methods and computed properties
const { isLowStock, isOutOfStock, isExpiringSoon } = manager
const { getStatusText, formatPrice, formatDate, handleEdit, handleDispense, handleDelete } = manager
</script>

<style scoped>
@import './MedicineCard.css';
</style>
