<template>
  <div class="result-entry-container">
    <div class="page-header">
      <h1 class="page-title">Result Entry</h1>
      <div class="header-actions">
        <button @click="showBulkEntry = true" class="bulk-btn">
          <i class="fas fa-upload"></i>
          Bulk Entry
        </button>
        <button @click="showTemplateModal = true" class="template-btn">
          <i class="fas fa-file-alt"></i>
          Templates
        </button>
      </div>
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
          <option value="verified">Verified</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Test Category:</label>
        <select v-model="filters.category" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="category in testCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
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

    <!-- Pending Results List -->
    <div class="results-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Loading pending results...
      </div>

      <div v-else-if="filteredSamples.length === 0" class="empty-state">
        <i class="fas fa-clipboard-check"></i>
        <p>No pending results found</p>
      </div>

      <div v-else class="samples-grid">
        <div 
          v-for="sample in paginatedSamples" 
          :key="sample.id" 
          class="sample-card"
          :class="{ 'has-results': sample.results?.length > 0 }"
        >
          <div class="sample-header">
            <div class="sample-info">
              <h4>{{ sample.sample_id }}</h4>
              <p>{{ sample.lab_request_item?.lab_request?.patient?.name }}</p>
              <span class="sample-type">{{ sample.sample_type }}</span>
            </div>
            <div class="sample-status">
              <span :class="`status-${sample.status}`">{{ sample.status }}</span>
            </div>
          </div>

          <div class="test-info">
            <h5>{{ sample.lab_request_item?.lab_test?.name }}</h5>
            <p>{{ sample.lab_request_item?.lab_test?.description }}</p>
          </div>

          <div class="result-actions">
            <button 
              @click="enterResult(sample)" 
              class="enter-btn"
              :disabled="sample.results?.length > 0"
            >
              <i class="fas fa-edit"></i>
              {{ sample.results?.length > 0 ? 'Edit Result' : 'Enter Result' }}
            </button>
            <button @click="viewSample(sample)" class="view-btn">
              <i class="fas fa-eye"></i>
              View
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

    <!-- Result Entry Modal -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Enter Test Result</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedSample" class="result-form-container">
          <div class="sample-info-header">
            <h4>{{ selectedSample.sample_id }}</h4>
            <p>{{ selectedSample.lab_request_item?.lab_request?.patient?.name }} - {{ selectedSample.lab_request_item?.lab_test?.name }}</p>
          </div>

          <form @submit.prevent="saveResult" class="result-form">
            <div class="form-section">
              <h5>Test Information</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>Test Name</label>
                  <input type="text" :value="selectedSample.lab_request_item?.lab_test?.name" readonly>
                </div>
                <div class="form-group">
                  <label>Normal Range</label>
                  <input type="text" :value="getNormalRange(selectedSample.lab_request_item?.lab_test)" readonly>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h5>Result Entry</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>Result Value *</label>
                  <input 
                    type="text" 
                    v-model="formData.result_value" 
                    required
                    :placeholder="`Enter value in ${selectedSample.lab_request_item?.lab_test?.unit || 'units'}`"
                  >
                </div>
                <div class="form-group">
                  <label>Result Status *</label>
                  <select v-model="formData.result_status" required>
                    <option value="normal">Normal</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="critical">Critical</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Reference Range</label>
                  <input type="text" v-model="formData.reference_range" placeholder="e.g., 3.5-5.0">
                </div>
                <div class="form-group">
                  <label>Tested Date *</label>
                  <input type="date" v-model="formData.tested_date" required>
                </div>
              </div>

              <div class="form-group">
                <label>Comments</label>
                <textarea 
                  v-model="formData.comments" 
                  rows="3" 
                  placeholder="Additional comments, notes, or observations..."
                ></textarea>
              </div>
            </div>

            <div class="form-section">
              <h5>Quality Control</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>Tested By *</label>
                  <select v-model="formData.tested_by" required>
                    <option value="">Select Technician</option>
                    <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                      {{ technician.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Verified By</label>
                  <select v-model="formData.verified_by">
                    <option value="">Select Verifier</option>
                    <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                      {{ technician.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Verification Date</label>
                <input type="date" v-model="formData.verified_date">
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="save-btn" :disabled="saving">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                {{ saving ? 'Saving...' : 'Save Result' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bulk Entry Modal -->
    <div v-if="showBulkEntry" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Bulk Result Entry</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="bulk-entry-content">
          <div class="upload-section">
            <h4>Upload CSV File</h4>
            <div class="file-upload">
              <input 
                type="file" 
                @change="handleFileUpload" 
                accept=".csv"
                ref="fileInput"
              >
              <div class="upload-area" @click="$refs.fileInput.click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload CSV file or drag and drop</p>
                <small>CSV format: sample_id, result_value, result_status, comments</small>
              </div>
            </div>
          </div>

          <div v-if="bulkData.length > 0" class="preview-section">
            <h4>Preview Data</h4>
            <div class="bulk-preview">
              <table>
                <thead>
                  <tr>
                    <th>Sample ID</th>
                    <th>Result Value</th>
                    <th>Status</th>
                    <th>Comments</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in bulkData" :key="index">
                    <td>{{ row.sample_id }}</td>
                    <td>{{ row.result_value }}</td>
                    <td>{{ row.result_status }}</td>
                    <td>{{ row.comments }}</td>
                    <td>
                      <button @click="removeBulkRow(index)" class="remove-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bulk-actions">
              <button @click="processBulkEntry" class="process-btn" :disabled="processing">
                <i v-if="processing" class="fas fa-spinner fa-spin"></i>
                {{ processing ? 'Processing...' : 'Process All Results' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Modal -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Result Templates</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="templates-content">
          <div class="template-list">
            <div v-for="template in resultTemplates" :key="template.id" class="template-item">
              <h5>{{ template.name }}</h5>
              <p>{{ template.description }}</p>
              <div class="template-actions">
                <button @click="useTemplate(template)" class="use-btn">
                  Use Template
                </button>
                <button @click="editTemplate(template)" class="edit-btn">
                  Edit
                </button>
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
import { formatDate } from '@/utils/labHelpers'

export default {
  name: 'ResultEntry',
  setup() {
    const laboratoryStore = useLaboratoryStore()

    // Reactive data
    const loading = ref(false)
    const saving = ref(false)
    const processing = ref(false)
    const showResultModal = ref(false)
    const showBulkEntry = ref(false)
    const showTemplateModal = ref(false)
    const selectedSample = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10

    const filters = ref({
      status: '',
      category: '',
      startDate: '',
      endDate: '',
      search: ''
    })

    const formData = ref({
      result_value: '',
      result_status: 'normal',
      reference_range: '',
      comments: '',
      tested_by: '',
      verified_by: '',
      tested_date: '',
      verified_date: ''
    })

    const bulkData = ref([])

    // Computed properties
    const samples = computed(() => laboratoryStore.samples)
    const testCategories = computed(() => laboratoryStore.testCategories)
    const technicians = computed(() => laboratoryStore.technicians)
    const resultTemplates = computed(() => laboratoryStore.resultTemplates)

    const filteredSamples = computed(() => {
      let filtered = samples.value.filter(s => s.status === 'received' || s.status === 'processing')

      if (filters.value.status) {
        filtered = filtered.filter(s => s.status === filters.value.status)
      }

      if (filters.value.category) {
        filtered = filtered.filter(s => 
          s.lab_request_item?.lab_test?.category_id === filters.value.category
        )
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
          laboratoryStore.fetchTestCategories(),
          laboratoryStore.fetchTechnicians(),
          laboratoryStore.fetchResultTemplates()
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

    const enterResult = (sample) => {
      selectedSample.value = sample
      formData.value = {
        result_value: sample.results?.[0]?.result_value || '',
        result_status: sample.results?.[0]?.result_status || 'normal',
        reference_range: sample.results?.[0]?.reference_range || '',
        comments: sample.results?.[0]?.comments || '',
        tested_by: sample.results?.[0]?.tested_by || '',
        verified_by: sample.results?.[0]?.verified_by || '',
        tested_date: sample.results?.[0]?.tested_date || new Date().toISOString().split('T')[0],
        verified_date: sample.results?.[0]?.verified_date || ''
      }
      showResultModal.value = true
    }

    const viewSample = (sample) => {
      selectedSample.value = sample
      // Could open a view modal here
    }

    const saveResult = async () => {
      saving.value = true
      try {
        const resultData = {
          ...formData.value,
          sample_id: selectedSample.value.id
        }
        
        if (selectedSample.value.results?.[0]) {
          await laboratoryStore.updateLabResult(selectedSample.value.results[0].id, resultData)
        } else {
          await laboratoryStore.createLabResult(resultData)
        }
        
        closeModal()
      } catch (error) {
        console.error('Error saving result:', error)
      } finally {
        saving.value = false
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const csv = e.target.result
          const lines = csv.split('\n')
          // const headers = lines[0].split(',')
          
          bulkData.value = lines.slice(1).map(line => {
            const values = line.split(',')
            return {
              sample_id: values[0],
              result_value: values[1],
              result_status: values[2],
              comments: values[3] || ''
            }
          }).filter(row => row.sample_id)
        }
        reader.readAsText(file)
      }
    }

    const removeBulkRow = (index) => {
      bulkData.value.splice(index, 1)
    }

    const processBulkEntry = async () => {
      processing.value = true
      try {
        for (const row of bulkData.value) {
          await laboratoryStore.createBulkResult(row)
        }
        bulkData.value = []
        closeModal()
      } catch (error) {
        console.error('Error processing bulk entry:', error)
      } finally {
        processing.value = false
      }
    }

    const useTemplate = (template) => {
      // Apply template to current form
      formData.value = { ...formData.value, ...template.data }
      showTemplateModal.value = false
    }

    const editTemplate = (template) => {
      // Open template editor
      console.log('Edit template:', template)
    }

    const getNormalRange = (test) => {
      if (!test) return ''
      return test.normal_range_male || test.normal_range_female || 'N/A'
    }

    const closeModal = () => {
      showResultModal.value = false
      showBulkEntry.value = false
      showTemplateModal.value = false
      selectedSample.value = null
      bulkData.value = []
      formData.value = {
        result_value: '',
        result_status: 'normal',
        reference_range: '',
        comments: '',
        tested_by: '',
        verified_by: '',
        tested_date: '',
        verified_date: ''
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
      showResultModal,
      showBulkEntry,
      showTemplateModal,
      selectedSample,
      currentPage,
      filters,
      formData,
      bulkData,
      samples,
      testCategories,
      technicians,
      resultTemplates,
      filteredSamples,
      totalPages,
      paginatedSamples,
      applyFilters,
      enterResult,
      viewSample,
      saveResult,
      handleFileUpload,
      removeBulkRow,
      processBulkEntry,
      useTemplate,
      editTemplate,
      getNormalRange,
      closeModal,
      formatDate
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/laboratory.css';
</style>
