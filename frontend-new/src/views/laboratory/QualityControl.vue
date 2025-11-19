<template>
  <div class="quality-control-container">
    <div class="page-header">
      <h1 class="page-title">Quality Control</h1>
      <div class="header-actions">
        <button @click="showControlModal = true" class="add-btn">
          <i class="fas fa-plus"></i>
          Add Control
        </button>
        <button @click="showBatchModal = true" class="batch-btn">
          <i class="fas fa-layer-group"></i>
          Batch Entry
        </button>
      </div>
    </div>

    <!-- Quality Control Dashboard -->
    <div class="qc-dashboard">
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>{{ qualityStats.passed }}</h3>
            <p>Tests Passed</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon warning">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <h3>{{ qualityStats.failed }}</h3>
            <p>Tests Failed</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon info">
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <h3>{{ qualityStats.pending }}</h3>
            <p>Pending Review</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon success">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-content">
            <h3>{{ qualityStats.passRate }}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Test Type:</label>
        <select v-model="filters.testType" @change="applyFilters">
          <option value="">All Tests</option>
          <option v-for="test in availableTests" :key="test.id" :value="test.id">
            {{ test.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
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
          placeholder="Search by control ID or test name..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Quality Control List -->
    <div class="qc-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading quality control data...
      </div>

      <div v-else-if="filteredControls.length === 0" class="empty-state">
        <i class="fas fa-clipboard-check"></i>
        <p>No quality control records found</p>
      </div>

      <div v-else class="controls-grid">
        <div 
          v-for="control in paginatedControls" 
          :key="control.id" 
          class="control-card"
          :class="`status-${control.status}`"
        >
          <div class="control-header">
            <div class="control-info">
              <h4>{{ control.control_id }}</h4>
              <p>{{ control.lab_test?.name }}</p>
              <span class="control-type">{{ control.control_type }}</span>
            </div>
            <div class="control-status">
              <span :class="`status-${control.status}`">{{ control.status }}</span>
            </div>
          </div>

          <div class="control-details">
            <div class="detail-row">
              <label>Expected Value:</label>
              <span>{{ control.expected_value }} {{ control.lab_test?.unit }}</span>
            </div>
            <div class="detail-row">
              <label>Actual Value:</label>
              <span :class="getValueClass(control)">{{ control.actual_value }} {{ control.lab_test?.unit }}</span>
            </div>
            <div class="detail-row">
              <label>Deviation:</label>
              <span :class="getDeviationClass(control)">{{ control.deviation }}%</span>
            </div>
          </div>

          <div class="control-meta">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ control.tested_by_user?.name }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(control.test_date) }}</span>
            </div>
          </div>

          <div v-if="control.notes" class="control-notes">
            <h5>Notes:</h5>
            <p>{{ control.notes }}</p>
          </div>

          <div class="control-actions">
            <button @click="viewControl(control)" class="view-btn">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="editControl(control)" class="edit-btn">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="retestControl(control)" class="retest-btn">
              <i class="fas fa-redo"></i>
              Retest
            </button>
          </div>
        </div>
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

    <!-- Control Entry Modal -->
    <div v-if="showControlModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showControlModal ? 'Add Quality Control' : 'Edit Quality Control' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveControl" class="control-form">
          <div class="form-row">
            <div class="form-group">
              <label>Test *</label>
              <select v-model="formData.lab_test_id" required>
                <option value="">Select Test</option>
                <option v-for="test in availableTests" :key="test.id" :value="test.id">
                  {{ test.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Control Type *</label>
              <select v-model="formData.control_type" required>
                <option value="positive">Positive Control</option>
                <option value="negative">Negative Control</option>
                <option value="calibration">Calibration</option>
                <option value="blank">Blank</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expected Value *</label>
              <input 
                type="number" 
                v-model="formData.expected_value" 
                step="0.01" 
                required
                :placeholder="`Enter expected value in ${getSelectedTestUnit()}`"
              >
            </div>

            <div class="form-group">
              <label>Actual Value *</label>
              <input 
                type="number" 
                v-model="formData.actual_value" 
                step="0.01" 
                required
                :placeholder="`Enter actual value in ${getSelectedTestUnit()}`"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Test Date *</label>
              <input type="date" v-model="formData.test_date" required>
            </div>

            <div class="form-group">
              <label>Tested By *</label>
              <select v-model="formData.tested_by" required>
                <option value="">Select Technician</option>
                <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                  {{ technician.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea 
              v-model="formData.notes" 
              rows="3" 
              placeholder="Additional notes, observations, or issues..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Saving...' : 'Save Control' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Quality Control Details</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedControl" class="control-details-view">
          <div class="detail-section">
            <h4>Control Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Control ID:</label>
                <span>{{ selectedControl.control_id }}</span>
              </div>
              <div class="detail-item">
                <label>Test:</label>
                <span>{{ selectedControl.lab_test?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Control Type:</label>
                <span class="control-type">{{ selectedControl.control_type }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="`status-${selectedControl.status}`">
                  {{ selectedControl.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Test Results</h4>
            <div class="results-comparison">
              <div class="result-item">
                <label>Expected Value:</label>
                <span class="expected-value">{{ selectedControl.expected_value }} {{ selectedControl.lab_test?.unit }}</span>
              </div>
              <div class="result-item">
                <label>Actual Value:</label>
                <span :class="`actual-value ${getValueClass(selectedControl)}`">
                  {{ selectedControl.actual_value }} {{ selectedControl.lab_test?.unit }}
                </span>
              </div>
              <div class="result-item">
                <label>Deviation:</label>
                <span :class="`deviation ${getDeviationClass(selectedControl)}`">
                  {{ selectedControl.deviation }}%
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Test Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Test Date:</label>
                <span>{{ formatDate(selectedControl.test_date) }}</span>
              </div>
              <div class="detail-item">
                <label>Tested By:</label>
                <span>{{ selectedControl.tested_by_user?.name }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedControl.notes" class="detail-section">
            <h4>Notes</h4>
            <p>{{ selectedControl.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Entry Modal -->
    <div v-if="showBatchModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Batch Quality Control Entry</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="batch-entry-content">
          <div class="batch-form">
            <div class="form-section">
              <h4>Batch Information</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Test *</label>
                  <select v-model="batchData.lab_test_id" required>
                    <option value="">Select Test</option>
                    <option v-for="test in availableTests" :key="test.id" :value="test.id">
                      {{ test.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Test Date *</label>
                  <input type="date" v-model="batchData.test_date" required>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Control Entries</h4>
              <div class="batch-entries">
                <div v-for="(entry, index) in batchData.entries" :key="index" class="batch-entry">
                  <div class="entry-header">
                    <h5>Control {{ index + 1 }}</h5>
                    <button @click="removeBatchEntry(index)" class="remove-btn">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div class="entry-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Control Type</label>
                        <select v-model="entry.control_type">
                          <option value="positive">Positive Control</option>
                          <option value="negative">Negative Control</option>
                          <option value="calibration">Calibration</option>
                          <option value="blank">Blank</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Expected Value</label>
                        <input type="number" v-model="entry.expected_value" step="0.01">
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Actual Value</label>
                        <input type="number" v-model="entry.actual_value" step="0.01">
                      </div>
                      <div class="form-group">
                        <label>Notes</label>
                        <input type="text" v-model="entry.notes" placeholder="Optional notes">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button @click="addBatchEntry" class="add-entry-btn">
                <i class="fas fa-plus"></i>
                Add Control Entry
              </button>
            </div>

            <div class="form-actions">
              <button @click="closeModal" class="cancel-btn">
                Cancel
              </button>
              <button @click="processBatchEntry" class="save-btn" :disabled="processing">
                <i v-if="processing" class="fas fa-spinner fa-spin"></i>
                {{ processing ? 'Processing...' : 'Process Batch' }}
              </button>
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
import { formatDate } from '@/utils/labHelpers'

export default {
  name: 'QualityControl',
  setup() {
    const laboratoryStore = useLaboratoryStore()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const processing = ref(false)
    const showControlModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const showBatchModal = ref(false)
    const selectedControl = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 12

    const filters = ref({
      testType: '',
      status: '',
      startDate: '',
      endDate: '',
      search: ''
    })

    const formData = ref({
      lab_test_id: '',
      control_type: 'positive',
      expected_value: '',
      actual_value: '',
      test_date: '',
      tested_by: '',
      notes: ''
    })

    const batchData = ref({
      lab_test_id: '',
      test_date: '',
      entries: [
        {
          control_type: 'positive',
          expected_value: '',
          actual_value: '',
          notes: ''
        }
      ]
    })

    // Computed properties
    const qualityControls = computed(() => laboratoryStore.qualityControls)
    const availableTests = computed(() => laboratoryStore.labTests)
    const technicians = computed(() => laboratoryStore.technicians)

    const qualityStats = computed(() => {
      const controls = qualityControls.value
      const passed = controls.filter(c => c.status === 'passed').length
      const failed = controls.filter(c => c.status === 'failed').length
      const pending = controls.filter(c => c.status === 'pending').length
      const total = controls.length
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

      return { passed, failed, pending, passRate }
    })

    const filteredControls = computed(() => {
      let filtered = qualityControls.value

      if (filters.value.testType) {
        filtered = filtered.filter(c => c.lab_test_id === filters.value.testType)
      }

      if (filters.value.status) {
        filtered = filtered.filter(c => c.status === filters.value.status)
      }

      if (filters.value.startDate) {
        filtered = filtered.filter(c => c.test_date >= filters.value.startDate)
      }

      if (filters.value.endDate) {
        filtered = filtered.filter(c => c.test_date <= filters.value.endDate)
      }

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(c => 
          c.control_id?.toLowerCase().includes(search) ||
          c.lab_test?.name?.toLowerCase().includes(search)
        )
      }

      return filtered
    })

    const totalPages = computed(() => 
      Math.ceil(filteredControls.value.length / itemsPerPage)
    )

    const paginatedControls = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredControls.value.slice(start, end)
    })

    // Methods
    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          laboratoryStore.fetchQualityControls(),
          laboratoryStore.fetchLabTests(),
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

    const viewControl = (control) => {
      selectedControl.value = control
      showViewModal.value = true
    }

    const editControl = (control) => {
      selectedControl.value = control
      formData.value = {
        lab_test_id: control.lab_test_id,
        control_type: control.control_type,
        expected_value: control.expected_value,
        actual_value: control.actual_value,
        test_date: control.test_date,
        tested_by: control.tested_by,
        notes: control.notes || ''
      }
      showEditModal.value = true
    }

    const retestControl = async (control) => {
      if (confirm('Are you sure you want to retest this control?')) {
        try {
          await laboratoryStore.retestQualityControl(control.id)
        } catch (error) {
          console.error('Error retesting control:', error)
        }
      }
    }

    const saveControl = async () => {
      saving.value = true
      try {
        if (showControlModal.value) {
          await laboratoryStore.createQualityControl(formData.value)
        } else {
          await laboratoryStore.updateQualityControl(selectedControl.value.id, formData.value)
        }
        closeModal()
      } catch (error) {
        console.error('Error saving control:', error)
      } finally {
        saving.value = false
      }
    }

    const addBatchEntry = () => {
      batchData.value.entries.push({
        control_type: 'positive',
        expected_value: '',
        actual_value: '',
        notes: ''
      })
    }

    const removeBatchEntry = (index) => {
      if (batchData.value.entries.length > 1) {
        batchData.value.entries.splice(index, 1)
      }
    }

    const processBatchEntry = async () => {
      processing.value = true
      try {
        await laboratoryStore.createBatchQualityControls(batchData.value)
        closeModal()
      } catch (error) {
        console.error('Error processing batch:', error)
      } finally {
        processing.value = false
      }
    }

    const getSelectedTestUnit = () => {
      const test = availableTests.value.find(t => t.id === formData.value.lab_test_id)
      return test?.unit || 'units'
    }

    const getValueClass = (control) => {
      if (control.status === 'failed') return 'failed'
      if (control.status === 'passed') return 'passed'
      return 'pending'
    }

    const getDeviationClass = (control) => {
      const deviation = Math.abs(control.deviation)
      if (deviation > 10) return 'high'
      if (deviation > 5) return 'medium'
      return 'low'
    }

    const closeModal = () => {
      showControlModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      showBatchModal.value = false
      selectedControl.value = null
      formData.value = {
        lab_test_id: '',
        control_type: 'positive',
        expected_value: '',
        actual_value: '',
        test_date: '',
        tested_by: '',
        notes: ''
      }
      batchData.value = {
        lab_test_id: '',
        test_date: '',
        entries: [
          {
            control_type: 'positive',
            expected_value: '',
            actual_value: '',
            notes: ''
          }
        ]
      }
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      loading,
      saving,
      processing,
      showControlModal,
      showEditModal,
      showViewModal,
      showBatchModal,
      selectedControl,
      currentPage,
      filters,
      formData,
      batchData,
      qualityControls,
      availableTests,
      technicians,
      qualityStats,
      filteredControls,
      totalPages,
      paginatedControls,
      applyFilters,
      viewControl,
      editControl,
      retestControl,
      saveControl,
      addBatchEntry,
      removeBatchEntry,
      processBatchEntry,
      getSelectedTestUnit,
      getValueClass,
      getDeviationClass,
      closeModal,
      formatDate
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/laboratory.css';
</style>
