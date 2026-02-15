<template>
  <div class="sample-tracking-container">
    <div class="page-header">
      <h1 class="page-title">Sample Tracking</h1>
      <button @click="showCollectionModal = true" class="add-btn">
        <i class="fas fa-plus"></i>
        Record Collection
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All Status</option>
          <option value="collected">Collected</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Sample Type:</label>
        <select v-model="filters.sampleType" @change="applyFilters">
          <option value="">All Types</option>
          <option value="blood">Blood</option>
          <option value="urine">Urine</option>
          <option value="tissue">Tissue</option>
          <option value="swab">Swab</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Date Range:</label>
        <input type="date" v-model="filters.startDate" @change="applyFilters">
        <input type="date" v-model="filters.endDate" @change="applyFilters">
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.search" 
          @input="applyFilters"
          placeholder="Search by sample ID or patient name..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Sample Tracking List -->
    <div class="samples-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading samples...
      </div>

      <div v-else-if="filteredSamples.length === 0" class="empty-state">
        <i class="fas fa-vial"></i>
        <p>No samples found</p>
      </div>

      <div v-else class="samples-grid">
        <SampleCard
          v-for="sample in paginatedSamples"
          :key="sample.id"
          :sample="sample"
          @view="viewSample"
          @edit="editSample"
          @update-status="updateSampleStatus"
          @track="trackSample"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Next
      </button>
    </div>

    <!-- Collection Modal -->
    <div v-if="showCollectionModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Record Sample Collection</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveCollection" class="collection-form">
          <div class="form-row">
            <div class="form-group">
              <label>Test Request *</label>
              <select v-model="formData.request_item_id" required>
                <option value="">Select Test Request</option>
                <option v-for="request in pendingRequests" :key="request.id" :value="request.id">
                  {{ request.lab_test?.name }} - {{ request.lab_request?.patient?.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Sample ID *</label>
              <input type="text" v-model="formData.sample_id" required placeholder="Auto-generated">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Collection Date *</label>
              <input type="date" v-model="formData.collection_date" required>
            </div>

            <div class="form-group">
              <label>Collection Time *</label>
              <input type="time" v-model="formData.collection_time" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Collected By *</label>
              <select v-model="formData.collected_by" required>
                <option value="">Select Collector</option>
                <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                  {{ technician.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Sample Type *</label>
              <select v-model="formData.sample_type" required>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="tissue">Tissue</option>
                <option value="swab">Swab</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Collection Notes</label>
            <textarea v-model="formData.notes" rows="3" placeholder="Collection notes, special handling instructions..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Saving...' : 'Record Collection' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Sample Details</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedSample" class="sample-details">
          <div class="detail-section">
            <h4>Sample Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Sample ID:</label>
                <span>{{ selectedSample.sample_id }}</span>
              </div>
              <div class="detail-item">
                <label>Patient:</label>
                <span>{{ selectedSample.lab_request_item?.lab_request?.patient?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Test:</label>
                <span>{{ selectedSample.lab_request_item?.lab_test?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Sample Type:</label>
                <span class="sample-type">{{ selectedSample.sample_type }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="`status-${selectedSample.status}`">
                  {{ selectedSample.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Collected By:</label>
                <span>{{ selectedSample.collected_by_user?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Collection Date:</label>
                <span>{{ formatDateTime(selectedSample.collection_date, selectedSample.collection_time) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedSample.notes" class="detail-section">
            <h4>Notes</h4>
            <p>{{ selectedSample.notes }}</p>
          </div>

          <div v-if="selectedSample.results?.length" class="detail-section">
            <h4>Test Results</h4>
            <div class="results-list">
              <div v-for="result in selectedSample.results" :key="result.id" class="result-item">
                <div class="result-info">
                  <h5>{{ result.lab_test?.name }}</h5>
                  <p>Result: {{ result.result_value }} {{ result.lab_test?.unit }}</p>
                  <p>Status: {{ result.result_status }}</p>
                </div>
                <div class="result-meta">
                  <span>Tested: {{ formatDate(result.tested_date) }}</span>
                  <span>Verified: {{ formatDate(result.verified_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tracking Modal -->
    <div v-if="showTrackingModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Sample Tracking</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="trackingSample" class="tracking-info">
          <div class="sample-header">
            <h4>{{ trackingSample.sample_id }}</h4>
            <span :class="`status-${trackingSample.status}`">
              {{ trackingSample.status }}
            </span>
          </div>

          <div class="tracking-timeline">
            <div class="timeline-item" :class="{ active: trackingSample.status === 'collected' }">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h5>Collected</h5>
                <p>{{ formatDateTime(trackingSample.collection_date, trackingSample.collection_time) }}</p>
                <p>By: {{ trackingSample.collected_by_user?.name }}</p>
              </div>
            </div>

            <div class="timeline-item" :class="{ active: trackingSample.status === 'in_transit' }">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h5>In Transit</h5>
                <p>Sample being transported to lab</p>
              </div>
            </div>

            <div class="timeline-item" :class="{ active: trackingSample.status === 'received' }">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h5>Received</h5>
                <p>Sample received at laboratory</p>
              </div>
            </div>

            <div class="timeline-item" :class="{ active: trackingSample.status === 'processing' }">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h5>Processing</h5>
                <p>Sample being processed</p>
              </div>
            </div>

            <div class="timeline-item" :class="{ active: trackingSample.status === 'completed' }">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h5>Completed</h5>
                <p>Test completed and results available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLaboratoryStore } from '@/stores/laboratory'
import SampleCard from '@/components/laboratory/SampleCard.vue'
import { formatDate, formatDateTime } from '@/utils/labHelpers'

export default {
  name: 'SampleTracking',
  components: {
    SampleCard
  },
  setup() {
    const laboratoryStore = useLaboratoryStore()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const showCollectionModal = ref(false)
    const showViewModal = ref(false)
    const showTrackingModal = ref(false)
    const selectedSample = ref(null)
    const trackingSample = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10

    const filters = ref({
      status: '',
      sampleType: '',
      startDate: '',
      endDate: '',
      search: ''
    })

    const formData = ref({
      request_item_id: '',
      sample_id: '',
      collection_date: '',
      collection_time: '',
      collected_by: '',
      sample_type: 'blood',
      notes: ''
    })

    // Computed properties
    const samples = computed(() => laboratoryStore.samples)
    const pendingRequests = computed(() => laboratoryStore.pendingRequests)
    const technicians = computed(() => laboratoryStore.technicians)

    const filteredSamples = computed(() => {
      let filtered = samples.value

      if (filters.value.status) {
        filtered = filtered.filter(s => s.status === filters.value.status)
      }

      if (filters.value.sampleType) {
        filtered = filtered.filter(s => s.sample_type === filters.value.sampleType)
      }

      if (filters.value.startDate) {
        filtered = filtered.filter(s => s.collection_date >= filters.value.startDate)
      }

      if (filters.value.endDate) {
        filtered = filtered.filter(s => s.collection_date <= filters.value.endDate)
      }

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(s => 
          s.sample_id?.toLowerCase().includes(search) ||
          s.lab_request_item?.lab_request?.patient?.name?.toLowerCase().includes(search)
        )
      }

      return filtered
    })

    const totalPages = computed(() => 
      Math.ceil(filteredSamples.value.length / itemsPerPage)
    )

    const paginatedSamples = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredSamples.value.slice(start, end)
    })

    // Methods
    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          laboratoryStore.fetchSamples(),
          laboratoryStore.fetchPendingRequests(),
          laboratoryStore.fetchTechnicians()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const viewSample = (sample) => {
      selectedSample.value = sample
      showViewModal.value = true
    }

    const editSample = (sample) => {
      selectedSample.value = sample
      formData.value = {
        request_item_id: sample.lab_request_item_id,
        sample_id: sample.sample_id,
        collection_date: sample.collection_date,
        collection_time: sample.collection_time,
        collected_by: sample.collected_by,
        sample_type: sample.sample_type,
        notes: sample.notes || ''
      }
      showCollectionModal.value = true
    }

    const updateSampleStatus = async (sample, status) => {
      try {
        await laboratoryStore.updateSampleStatus(sample.id, status)
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }

    const trackSample = (sample) => {
      trackingSample.value = sample
      showTrackingModal.value = true
    }

    const saveCollection = async () => {
      saving.value = true
      try {
        if (selectedSample.value) {
          await laboratoryStore.updateSample(selectedSample.value.id, formData.value)
        } else {
          await laboratoryStore.createSample(formData.value)
        }
        closeModal()
      } catch (error) {
        console.error('Error saving collection:', error)
      } finally {
        saving.value = false
      }
    }

    const closeModal = () => {
      showCollectionModal.value = false
      showViewModal.value = false
      showTrackingModal.value = false
      selectedSample.value = null
      trackingSample.value = null
      formData.value = {
        request_item_id: '',
        sample_id: '',
        collection_date: '',
        collection_time: '',
        collected_by: '',
        sample_type: 'blood',
        notes: ''
      }
    }

    // Lifecycle
    onMounted(() => {
      loadData()
      // Generate sample ID
      formData.value.sample_id = `SMP-${Date.now()}`
    })

    return {
      loading,
      saving,
      showCollectionModal,
      showViewModal,
      showTrackingModal,
      selectedSample,
      trackingSample,
      currentPage,
      filters,
      formData,
      samples,
      pendingRequests,
      technicians,
      filteredSamples,
      totalPages,
      paginatedSamples,
      applyFilters,
      viewSample,
      editSample,
      updateSampleStatus,
      trackSample,
      saveCollection,
      closeModal,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/laboratory.css';
</style>
