<template>
  <div class="test-request-card" :class="`status-${request.status}`">
    <div class="card-header">
      <div class="request-info">
        <h4>Request #{{ request.id }}</h4>
        <p class="patient-name">{{ request.patient?.name }}</p>
        <span class="request-date">{{ formatDate(request.requested_date) }}</span>
      </div>
      <div class="request-status">
        <span :class="`status-${request.status}`">{{ formatStatus(request.status) }}</span>
        <span :class="`priority-${request.priority}`">{{ formatPriority(request.priority) }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="doctor-info">
        <i class="fas fa-user-md"></i>
        <span>{{ request.doctor?.name }}</span>
      </div>

      <div class="tests-info">
        <h5>Requested Tests ({{ request.test_items?.length || 0 }})</h5>
        <div class="tests-list">
          <div 
            v-for="item in request.test_items" 
            :key="item.id" 
            class="test-item"
          >
            <span class="test-name">{{ item.lab_test?.name }}</span>
            <span class="test-status" :class="`status-${item.status}`">
              {{ formatStatus(item.status) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="request.notes" class="request-notes">
        <h5>Notes:</h5>
        <p>{{ request.notes }}</p>
      </div>
    </div>

    <div class="card-actions">
      <button @click="$emit('view', request)" class="view-btn">
        <i class="fas fa-eye"></i>
        View
      </button>
      <button @click="$emit('edit', request)" class="edit-btn">
        <i class="fas fa-edit"></i>
        Edit
      </button>
      <div class="status-dropdown">
        <select @change="updateStatus($event, request)" :value="request.status">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <button @click="$emit('delete', request)" class="delete-btn">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { formatDate, formatStatus, formatPriority } from '@/utils/labHelpers'

export default {
  name: 'TestRequestCard',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'delete', 'update-status'],
  setup(props, { emit }) {
    const updateStatus = (event, request) => {
      const newStatus = event.target.value
      emit('update-status', request, newStatus)
    }

    return {
      updateStatus,
      formatDate,
      formatStatus,
      formatPriority
    }
  }
}
</script>

<style scoped>
.test-request-card {
  @apply bg-white rounded-lg shadow-md border border-gray-200 p-4 transition-all duration-200 hover:shadow-lg;
}

.test-request-card.status-pending {
  @apply border-l-4 border-l-yellow-400;
}

.test-request-card.status-in_progress {
  @apply border-l-4 border-l-blue-400;
}

.test-request-card.status-completed {
  @apply border-l-4 border-l-green-400;
}

.test-request-card.status-cancelled {
  @apply border-l-4 border-l-red-400;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.request-info h4 {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.patient-name {
  @apply text-sm text-gray-600 mb-1;
}

.request-date {
  @apply text-xs text-gray-500;
}

.request-status {
  @apply flex flex-col items-end space-y-1;
}

.status-pending {
  @apply px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800;
}

.status-in_progress {
  @apply px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800;
}

.status-completed {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-cancelled {
  @apply px-2 py-1 text-xs rounded-full bg-red-100 text-red-800;
}

.priority-urgent {
  @apply px-2 py-1 text-xs rounded-full bg-red-100 text-red-800;
}

.priority-high {
  @apply px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800;
}

.priority-normal {
  @apply px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800;
}

.priority-low {
  @apply px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800;
}

.card-content {
  @apply space-y-3 mb-4;
}

.doctor-info {
  @apply flex items-center text-sm text-gray-600;
}

.doctor-info i {
  @apply mr-2 text-blue-500;
}

.tests-info h5 {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.tests-list {
  @apply space-y-1;
}

.test-item {
  @apply flex justify-between items-center text-xs;
}

.test-name {
  @apply text-gray-600;
}

.test-status {
  @apply px-2 py-1 rounded-full text-xs;
}

.request-notes {
  @apply bg-gray-50 p-2 rounded;
}

.request-notes h5 {
  @apply text-xs font-medium text-gray-700 mb-1;
}

.request-notes p {
  @apply text-xs text-gray-600;
}

.card-actions {
  @apply flex items-center justify-between pt-3 border-t border-gray-200;
}

.view-btn, .edit-btn, .delete-btn {
  @apply px-3 py-1 text-xs rounded transition-colors duration-200;
}

.view-btn {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.edit-btn {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.delete-btn {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.status-dropdown select {
  @apply text-xs border border-gray-300 rounded px-2 py-1 bg-white;
}
</style>
