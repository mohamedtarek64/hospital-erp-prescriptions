<template>
  <div class="sample-card" :class="`status-${sample.status}`">
    <div class="card-header">
      <div class="sample-info">
        <h4>{{ sample.sample_id }}</h4>
        <p class="patient-name">{{ sample.lab_request_item?.lab_request?.patient?.name }}</p>
        <span class="sample-type">{{ formatSampleType(sample.sample_type) }}</span>
      </div>
      <div class="sample-status">
        <span :class="`status-${sample.status}`">{{ formatStatus(sample.status) }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="test-info">
        <h5>{{ sample.lab_request_item?.lab_test?.name }}</h5>
        <p class="test-description">{{ sample.lab_request_item?.lab_test?.description }}</p>
      </div>

      <div class="collection-info">
        <div class="info-item">
          <i class="fas fa-calendar"></i>
          <span>{{ formatDate(sample.collection_date) }}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-clock"></i>
          <span>{{ sample.collection_time }}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-user"></i>
          <span>{{ sample.collected_by_user?.name }}</span>
        </div>
      </div>

      <div v-if="sample.notes" class="sample-notes">
        <h5>Notes:</h5>
        <p>{{ sample.notes }}</p>
      </div>

      <div v-if="sample.results?.length > 0" class="results-preview">
        <h5>Results:</h5>
        <div class="results-list">
          <div 
            v-for="result in sample.results" 
            :key="result.id" 
            class="result-item"
          >
            <span class="result-value" :class="getResultClass(result)">
              {{ result.result_value }} {{ sample.lab_request_item?.lab_test?.unit }}
            </span>
            <span class="result-status" :class="`status-${result.result_status}`">
              {{ formatResultStatus(result.result_status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button @click="$emit('view', sample)" class="view-btn">
        <i class="fas fa-eye"></i>
        View
      </button>
      <button @click="$emit('edit', sample)" class="edit-btn">
        <i class="fas fa-edit"></i>
        Edit
      </button>
      <button @click="$emit('track', sample)" class="track-btn">
        <i class="fas fa-map-marker-alt"></i>
        Track
      </button>
      <div class="status-dropdown">
        <select @change="updateStatus($event, sample)" :value="sample.status">
          <option value="collected">Collected</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatStatus, formatSampleType, formatResultStatus } from '@/utils/labHelpers'

export default {
  name: 'SampleCard',
  props: {
    sample: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'track', 'update-status'],
  setup(props, { emit }) {
    const updateStatus = (event, sample) => {
      const newStatus = event.target.value
      emit('update-status', sample, newStatus)
    }

    const getResultClass = (result) => {
      switch (result.result_status) {
        case 'normal':
          return 'normal'
        case 'abnormal':
          return 'abnormal'
        case 'critical':
          return 'critical'
        default:
          return 'pending'
      }
    }

    return {
      updateStatus,
      getResultClass,
      formatDate,
      formatStatus,
      formatSampleType,
      formatResultStatus
    }
  }
}
</script>

<style scoped>
.sample-card {
  @apply bg-white rounded-lg shadow-md border border-gray-200 p-4 transition-all duration-200 hover:shadow-lg;
}

.sample-card.status-collected {
  @apply border-l-4 border-l-blue-400;
}

.sample-card.status-in_transit {
  @apply border-l-4 border-l-yellow-400;
}

.sample-card.status-received {
  @apply border-l-4 border-l-green-400;
}

.sample-card.status-processing {
  @apply border-l-4 border-l-purple-400;
}

.sample-card.status-completed {
  @apply border-l-4 border-l-green-500;
}

.sample-card.status-rejected {
  @apply border-l-4 border-l-red-400;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.sample-info h4 {
  @apply text-lg font-semibold text-gray-800 mb-1;
}

.patient-name {
  @apply text-sm text-gray-600 mb-1;
}

.sample-type {
  @apply text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800;
}

.sample-status {
  @apply flex flex-col items-end;
}

.status-collected {
  @apply px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800;
}

.status-in_transit {
  @apply px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800;
}

.status-received {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-processing {
  @apply px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800;
}

.status-completed {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-rejected {
  @apply px-2 py-1 text-xs rounded-full bg-red-100 text-red-800;
}

.card-content {
  @apply space-y-3 mb-4;
}

.test-info h5 {
  @apply text-sm font-medium text-gray-800 mb-1;
}

.test-description {
  @apply text-xs text-gray-600;
}

.collection-info {
  @apply space-y-1;
}

.info-item {
  @apply flex items-center text-xs text-gray-600;
}

.info-item i {
  @apply mr-2 text-gray-400 w-3;
}

.sample-notes {
  @apply bg-gray-50 p-2 rounded;
}

.sample-notes h5 {
  @apply text-xs font-medium text-gray-700 mb-1;
}

.sample-notes p {
  @apply text-xs text-gray-600;
}

.results-preview {
  @apply bg-green-50 p-2 rounded;
}

.results-preview h5 {
  @apply text-xs font-medium text-gray-700 mb-2;
}

.results-list {
  @apply space-y-1;
}

.result-item {
  @apply flex justify-between items-center;
}

.result-value {
  @apply text-xs font-medium;
}

.result-value.normal {
  @apply text-green-700;
}

.result-value.abnormal {
  @apply text-orange-700;
}

.result-value.critical {
  @apply text-red-700;
}

.result-value.pending {
  @apply text-gray-700;
}

.result-status {
  @apply px-2 py-1 text-xs rounded-full;
}

.result-status.status-normal {
  @apply bg-green-100 text-green-800;
}

.result-status.status-abnormal {
  @apply bg-orange-100 text-orange-800;
}

.result-status.status-critical {
  @apply bg-red-100 text-red-800;
}

.result-status.status-pending {
  @apply bg-gray-100 text-gray-800;
}

.card-actions {
  @apply flex items-center justify-between pt-3 border-t border-gray-200;
}

.view-btn, .edit-btn, .track-btn {
  @apply px-3 py-1 text-xs rounded transition-colors duration-200;
}

.view-btn {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.edit-btn {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.track-btn {
  @apply bg-purple-100 text-purple-700 hover:bg-purple-200;
}

.status-dropdown select {
  @apply text-xs border border-gray-300 rounded px-2 py-1 bg-white;
}
</style>
