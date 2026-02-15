<template>
  <div class="test-requests-container">
    <div class="page-header">
      <h1 class="page-title">Test Requests</h1>
      <button @click="showCreateModal = true" class="add-btn">
        <i class="fas fa-plus"></i>
        New Request
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Priority:</label>
        <select v-model="filters.priority" @change="applyFilters">
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
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
          placeholder="Search by patient name or request ID..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Test Requests List -->
    <div class="requests-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading test requests...
      </div>

      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <i class="fas fa-flask"></i>
        <p>No test requests found</p>
      </div>

      <div v-else class="requests-grid">
        <TestRequestCard
          v-for="request in paginatedRequests"
          :key="request.id"
          :request="request"
          @view="viewRequest"
          @edit="editRequest"
          @delete="deleteRequest"
          @update-status="updateRequestStatus"
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

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Create Test Request' : 'Edit Test Request' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveRequest" class="request-form">
          <div class="form-row">
            <div class="form-group">
              <label>Patient *</label>
              <select v-model="formData.patient_id" required>
                <option value="">Select Patient</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.name }} ({{ patient.id_number }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Doctor *</label>
              <select v-model="formData.doctor_id" required>
                <option value="">Select Doctor</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Priority *</label>
              <select v-model="formData.priority" required>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div class="form-group">
              <label>Requested Date *</label>
              <input type="date" v-model="formData.requested_date" required>
            </div>
          </div>

          <div class="form-group">
            <label>Tests *</label>
            <div class="tests-selection">
              <div v-for="test in availableTests" :key="test.id" class="test-option">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="test.id" 
                    v-model="formData.test_ids"
                  >
                  <span class="checkmark"></span>
                  {{ test.name }} - ${{ test.price }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="formData.notes" rows="3" placeholder="Additional notes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Saving...' : 'Save Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Test Request Details</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedRequest" class="request-details">
          <div class="detail-section">
            <h4>Request Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Request ID:</label>
                <span>{{ selectedRequest.id }}</span>
              </div>
              <div class="detail-item">
                <label>Patient:</label>
                <span>{{ selectedRequest.patient?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Doctor:</label>
                <span>{{ selectedRequest.doctor?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Priority:</label>
                <span :class="`priority-${selectedRequest.priority}`">
                  {{ selectedRequest.priority }}
                </span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="`status-${selectedRequest.status}`">
                  {{ selectedRequest.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Requested Date:</label>
                <span>{{ formatDate(selectedRequest.requested_date) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Requested Tests</h4>
            <div class="tests-list">
              <div v-for="item in selectedRequest.test_items" :key="item.id" class="test-item">
                <div class="test-info">
                  <h5>{{ item.lab_test?.name }}</h5>
                  <p>{{ item.lab_test?.description }}</p>
                  <span class="test-price">${{ item.lab_test?.price }}</span>
                </div>
                <div class="test-status">
                  <span :class="`status-${item.status}`">{{ item.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedRequest.notes" class="detail-section">
            <h4>Notes</h4>
            <p>{{ selectedRequest.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLaboratoryStore } from '@/stores/laboratory'
import { usePatientsStore } from '@/stores/patients'
import TestRequestCard from '@/components/laboratory/TestRequestCard.vue'
import { formatDate } from '@/utils/labHelpers'

export default {
  name: 'TestRequests',
  components: {
    TestRequestCard
  },
  setup() {
    const laboratoryStore = useLaboratoryStore()
    const patientsStore = usePatientsStore()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const selectedRequest = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10

    const filters = ref({
      status: '',
      priority: '',
      startDate: '',
      endDate: '',
      search: ''
    })

    const formData = ref({
      patient_id: '',
      doctor_id: '',
      priority: 'normal',
      requested_date: '',
      test_ids: [],
      notes: ''
    })

    // Computed properties
    const requests = computed(() => laboratoryStore.testRequests)
    const patients = computed(() => patientsStore.patients)
    const doctors = computed(() => laboratoryStore.doctors)
    const availableTests = computed(() => laboratoryStore.labTests)

    const filteredRequests = computed(() => {
      let filtered = requests.value

      if (filters.value.status) {
        filtered = filtered.filter(r => r.status === filters.value.status)
      }

      if (filters.value.priority) {
        filtered = filtered.filter(r => r.priority === filters.value.priority)
      }

      if (filters.value.startDate) {
        filtered = filtered.filter(r => r.requested_date >= filters.value.startDate)
      }

      if (filters.value.endDate) {
        filtered = filtered.filter(r => r.requested_date <= filters.value.endDate)
      }

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(r => 
          r.patient?.name?.toLowerCase().includes(search) ||
          r.id.toString().includes(search)
        )
      }

      return filtered
    })

    const totalPages = computed(() => 
      Math.ceil(filteredRequests.value.length / itemsPerPage)
    )

    const paginatedRequests = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredRequests.value.slice(start, end)
    })

    // Methods
    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          laboratoryStore.fetchTestRequests(),
          laboratoryStore.fetchLabTests(),
          laboratoryStore.fetchDoctors(),
          patientsStore.fetchPatients()
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

    const viewRequest = (request) => {
      selectedRequest.value = request
      showViewModal.value = true
    }

    const editRequest = (request) => {
      selectedRequest.value = request
      formData.value = {
        patient_id: request.patient_id,
        doctor_id: request.doctor_id,
        priority: request.priority,
        requested_date: request.requested_date,
        test_ids: request.test_items?.map(item => item.lab_test_id) || [],
        notes: request.notes || ''
      }
      showEditModal.value = true
    }

    const deleteRequest = async (request) => {
      if (confirm('Are you sure you want to delete this test request?')) {
        try {
          await laboratoryStore.deleteTestRequest(request.id)
        } catch (error) {
          console.error('Error deleting request:', error)
        }
      }
    }

    const updateRequestStatus = async (request, status) => {
      try {
        await laboratoryStore.updateTestRequestStatus(request.id, status)
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }

    const saveRequest = async () => {
      saving.value = true
      try {
        if (showCreateModal.value) {
          await laboratoryStore.createTestRequest(formData.value)
        } else {
          await laboratoryStore.updateTestRequest(selectedRequest.value.id, formData.value)
        }
        closeModal()
      } catch (error) {
        console.error('Error saving request:', error)
      } finally {
        saving.value = false
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedRequest.value = null
      formData.value = {
        patient_id: '',
        doctor_id: '',
        priority: 'normal',
        requested_date: '',
        test_ids: [],
        notes: ''
      }
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      loading,
      saving,
      showCreateModal,
      showEditModal,
      showViewModal,
      selectedRequest,
      currentPage,
      filters,
      formData,
      requests,
      patients,
      doctors,
      availableTests,
      filteredRequests,
      totalPages,
      paginatedRequests,
      applyFilters,
      viewRequest,
      editRequest,
      deleteRequest,
      updateRequestStatus,
      saveRequest,
      closeModal,
      formatDate
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/laboratory.css';
</style>
