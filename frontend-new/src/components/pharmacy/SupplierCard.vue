<template>
  <div class="supplier-card">
    <div class="supplier-card__header">
      <div class="supplier-card__icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div class="supplier-card__status">
        <span class="status-badge" :class="`status-badge--${supplier.status}`">
          {{ getStatusText(supplier.status) }}
        </span>
      </div>
    </div>

    <div class="supplier-card__content">
      <h3 class="supplier-card__title">{{ supplier.name }}</h3>
      <p class="supplier-card__contact">{{ supplier.contact_person }}</p>
      <p class="supplier-card__phone">{{ formatPhone(supplier.phone) }}</p>
      <p class="supplier-card__email">{{ supplier.email }}</p>
      
      <div class="supplier-card__details">
        <div class="detail-item">
          <span class="detail-label">العنوان:</span>
          <span class="detail-value">{{ supplier.address }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المدينة:</span>
          <span class="detail-value">{{ supplier.city }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الرصيد المستحق:</span>
          <span class="detail-value" :class="{ 'text-red-600': supplier.outstanding_balance > 0 }">
            {{ formatPrice(supplier.outstanding_balance || 0) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الرصيد المتاح:</span>
          <span class="detail-value" :class="{ 'text-green-600': supplier.available_credit > 0 }">
            {{ formatPrice(supplier.available_credit || 0) }}
          </span>
        </div>
      </div>
    </div>

    <div class="supplier-card__actions">
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
        @click="handleViewOrders" 
        class="action-btn action-btn--orders"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        الطلبات
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
import { useSupplierCardManager } from './SupplierCard.js'

const props = defineProps({
  supplier: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: true
  },
  canDelete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'viewOrders', 'delete'])

const manager = useSupplierCardManager(props, emit)

// Expose manager methods
const { getStatusText, formatPhone, formatPrice, handleEdit, handleViewOrders, handleDelete } = manager
</script>

<style scoped>
@import './SupplierCard.css';
</style>
