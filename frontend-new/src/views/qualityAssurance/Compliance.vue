<template>
  <div class="compliance-container">
    <!-- Header -->
    <div class="compliance-header">
      <div class="compliance-title-section">
        <h1 class="compliance-title">إدارة الامتثال</h1>
        <p class="compliance-subtitle">تتبع ومراقبة الامتثال للمعايير واللوائح</p>
      </div>
      <div class="compliance-actions">
        <button 
          @click="openCreateModal"
          class="compliance-create-btn"
        >
          <svg class="compliance-create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة سجل امتثال
        </button>
        <button 
          @click="refreshData"
          :disabled="loading"
          class="compliance-refresh-btn"
        >
          <svg class="compliance-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Compliance Overview -->
    <div class="compliance-overview">
      <div class="compliance-overview-card">
        <div class="compliance-overview-icon compliance-overview-icon-compliant">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="compliance-overview-content">
          <h3 class="compliance-overview-title">متوافق</h3>
          <p class="compliance-overview-value">{{ statistics?.compliant_records || 0 }}</p>
          <p class="compliance-overview-percentage">{{ getCompliancePercentage() }}%</p>
        </div>
      </div>

      <div class="compliance-overview-card">
        <div class="compliance-overview-icon compliance-overview-icon-partial">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="compliance-overview-content">
          <h3 class="compliance-overview-title">متوافق جزئياً</h3>
          <p class="compliance-overview-value">{{ statistics?.partially_compliant_records || 0 }}</p>
        </div>
      </div>

      <div class="compliance-overview-card">
        <div class="compliance-overview-icon compliance-overview-icon-non-compliant">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="compliance-overview-content">
          <h3 class="compliance-overview-title">غير متوافق</h3>
          <p class="compliance-overview-value">{{ statistics?.non_compliant_records || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="compliance-filters">
      <div class="compliance-search">
        <div class="compliance-search-input-wrapper">
          <svg class="compliance-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في سجلات الامتثال..."
            class="compliance-search-input"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="compliance-filter-controls">
        <select 
          v-model="statusFilter"
          @change="handleFilterChange"
          class="compliance-filter-select"
        >
          <option value="">جميع الحالات</option>
          <option value="compliant">متوافق</option>
          <option value="partially_compliant">متوافق جزئياً</option>
          <option value="non_compliant">غير متوافق</option>
        </select>
        
        <select 
          v-model="standardFilter"
          @change="handleFilterChange"
          class="compliance-filter-select"
        >
          <option value="">جميع المعايير</option>
          <option v-for="standard in standardsList" :key="standard.id" :value="standard.id">
            {{ standard.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="compliance-loading">
      <div class="compliance-loading-spinner"></div>
      <p class="compliance-loading-text">جاري تحميل سجلات الامتثال...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="compliance-error">
      <div class="compliance-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="compliance-error-title">خطأ في تحميل البيانات</h3>
      <p class="compliance-error-message">{{ error }}</p>
      <button @click="refreshData" class="compliance-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Compliance Records Table -->
    <div v-else class="compliance-table-container">
      <div class="compliance-table-header">
        <h2 class="compliance-table-title">سجلات الامتثال</h2>
        <div class="compliance-table-actions">
          <button @click="exportComplianceData" class="compliance-export-btn">
            <svg class="compliance-export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            تصدير البيانات
          </button>
        </div>
      </div>

      <div class="compliance-table">
        <div class="compliance-table-header-row">
          <div class="compliance-table-cell compliance-table-cell-title">العنوان</div>
          <div class="compliance-table-cell compliance-table-cell-standard">المعيار</div>
          <div class="compliance-table-cell compliance-table-cell-date">تاريخ الامتثال</div>
          <div class="compliance-table-cell compliance-table-cell-status">الحالة</div>
          <div class="compliance-table-cell compliance-table-cell-reviewer">المراجع</div>
          <div class="compliance-table-cell compliance-table-cell-actions">الإجراءات</div>
        </div>

        <div 
          v-for="record in filteredComplianceRecords" 
          :key="record.id"
          class="compliance-table-row"
          @click="openEditModal(record)"
        >
          <div class="compliance-table-cell compliance-table-cell-title">
            <h4 class="compliance-record-title">{{ record.title }}</h4>
            <p class="compliance-record-description">{{ record.description || 'لا يوجد وصف' }}</p>
          </div>
          <div class="compliance-table-cell compliance-table-cell-standard">
            <span class="compliance-standard-name">{{ record.standard?.name || 'غير محدد' }}</span>
          </div>
          <div class="compliance-table-cell compliance-table-cell-date">
            <span class="compliance-date">{{ formatDate(record.compliance_date) }}</span>
          </div>
          <div class="compliance-table-cell compliance-table-cell-status">
            <span 
              class="compliance-status-badge"
              :class="`compliance-status-${record.status}`"
            >
              {{ getStatusText(record.status) }}
            </span>
          </div>
          <div class="compliance-table-cell compliance-table-cell-reviewer">
            <span class="compliance-reviewer">{{ record.reviewed_by?.name || 'غير محدد' }}</span>
          </div>
          <div class="compliance-table-cell compliance-table-cell-actions">
            <div class="compliance-actions">
              <button 
                @click.stop="updateComplianceStatus(record)"
                class="compliance-action-btn"
                :class="getStatusActionClass(record.status)"
              >
                <svg class="compliance-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <button 
                @click.stop="deleteComplianceRecord(record.id)"
                class="compliance-action-btn compliance-action-delete"
              >
                <svg class="compliance-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredComplianceRecords.length === 0" class="compliance-empty">
      <div class="compliance-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="compliance-empty-title">لا توجد سجلات امتثال</h3>
      <p class="compliance-empty-message">لم يتم العثور على سجلات امتثال تطابق معايير البحث</p>
      <button @click="openCreateModal" class="compliance-empty-action-btn">
        إضافة سجل امتثال
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="compliance-modal-overlay" @click="closeModal">
      <div class="compliance-modal" @click.stop>
        <div class="compliance-modal-header">
          <h2 class="compliance-modal-title">
            {{ editingRecord ? 'تعديل سجل الامتثال' : 'إضافة سجل امتثال جديد' }}
          </h2>
          <button @click="closeModal" class="compliance-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveComplianceRecord" class="compliance-modal-form">
          <div class="compliance-modal-form-group">
            <label class="compliance-modal-form-label">عنوان السجل *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="compliance-modal-form-input"
              placeholder="أدخل عنوان سجل الامتثال"
            />
          </div>
          
          <div class="compliance-modal-form-group">
            <label class="compliance-modal-form-label">الوصف</label>
            <textarea
              v-model="formData.description"
              class="compliance-modal-form-textarea"
              placeholder="أدخل وصف سجل الامتثال"
              rows="4"
            ></textarea>
          </div>
          
          <div class="compliance-modal-form-row">
            <div class="compliance-modal-form-group">
              <label class="compliance-modal-form-label">المعيار</label>
              <select v-model="formData.standard_id" class="compliance-modal-form-select">
                <option value="">اختر المعيار</option>
                <option v-for="standard in standardsList" :key="standard.id" :value="standard.id">
                  {{ standard.name }}
                </option>
              </select>
            </div>
            
            <div class="compliance-modal-form-group">
              <label class="compliance-modal-form-label">تاريخ الامتثال</label>
              <input
                v-model="formData.compliance_date"
                type="date"
                class="compliance-modal-form-input"
              />
            </div>
          </div>
          
          <div class="compliance-modal-form-row">
            <div class="compliance-modal-form-group">
              <label class="compliance-modal-form-label">حالة الامتثال</label>
              <select v-model="formData.status" class="compliance-modal-form-select">
                <option value="compliant">متوافق</option>
                <option value="partially_compliant">متوافق جزئياً</option>
                <option value="non_compliant">غير متوافق</option>
              </select>
            </div>
            
            <div class="compliance-modal-form-group">
              <label class="compliance-modal-form-label">المراجع</label>
              <select v-model="formData.reviewed_by_id" class="compliance-modal-form-select">
                <option value="">اختر المراجع</option>
                <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
                  {{ staff.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="compliance-modal-form-group">
            <label class="compliance-modal-form-label">ملاحظات</label>
            <textarea
              v-model="formData.notes"
              class="compliance-modal-form-textarea"
              placeholder="أدخل ملاحظات حول الامتثال"
              rows="3"
            ></textarea>
          </div>
          
          <div class="compliance-modal-form-actions">
            <button 
              type="button" 
              @click="closeModal"
              class="compliance-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="compliance-modal-form-save-btn"
            >
              <span v-if="saving" class="compliance-modal-form-saving-spinner"></span>
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQualityAssuranceManager } from '@/scripts/qualityAssurance/qualityAssuranceManager'
import '@/assets/css/qualityAssurance/compliance.css'

defineOptions({
  name: 'ComplianceView'
})

const {
  // State
  loading,
  error,
  statistics,
  
  // Computed
  filteredComplianceRecords,
  
  // Methods
  loadComplianceRecords,
  createComplianceRecord,
  updateComplianceRecord,
  deleteComplianceRecord,
  updateComplianceStatus,
  formatDate,
  getStatusText
} = useQualityAssuranceManager()

// Local state
const searchQuery = ref('')
const statusFilter = ref('')
const standardFilter = ref('')
const showModal = ref(false)
const editingRecord = ref(null)
const saving = ref(false)
const standardsList = ref([])
const staffList = ref([])

// Form data
const formData = ref({
  title: '',
  description: '',
  standard_id: '',
  compliance_date: '',
  status: 'compliant',
  reviewed_by_id: '',
  notes: ''
})

// Local methods
const refreshData = async () => {
  await loadComplianceRecords()
}

const handleSearch = () => {
  // Search is handled by the manager's computed property
}

const handleFilterChange = () => {
  // Filtering is handled by the manager's computed property
}

const getCompliancePercentage = () => {
  const total = (statistics.value?.compliant_records || 0) + 
                (statistics.value?.partially_compliant_records || 0) + 
                (statistics.value?.non_compliant_records || 0)
  
  if (total === 0) return 0
  
  const compliant = statistics.value?.compliant_records || 0
  return Math.round((compliant / total) * 100)
}

const openCreateModal = () => {
  editingRecord.value = null
  formData.value = {
    title: '',
    description: '',
    standard_id: '',
    compliance_date: new Date().toISOString().split('T')[0],
    status: 'compliant',
    reviewed_by_id: '',
    notes: ''
  }
  showModal.value = true
}

const openEditModal = (record) => {
  editingRecord.value = record
  formData.value = {
    title: record.title,
    description: record.description || '',
    standard_id: record.standard_id || '',
    compliance_date: record.compliance_date || '',
    status: record.status,
    reviewed_by_id: record.reviewed_by_id || '',
    notes: record.notes || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRecord.value = null
}

const saveComplianceRecord = async () => {
  saving.value = true
  try {
    if (editingRecord.value) {
      await updateComplianceRecord(editingRecord.value.id, formData.value)
    } else {
      await createComplianceRecord(formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving compliance record:', error)
  } finally {
    saving.value = false
  }
}

const getStatusActionClass = (status) => {
  switch (status) {
    case 'non_compliant':
      return 'compliance-action-improve'
    case 'partially_compliant':
      return 'compliance-action-complete'
    case 'compliant':
      return 'compliance-action-review'
    default:
      return 'compliance-action-default'
  }
}

const exportComplianceData = () => {
  // Implementation for exporting compliance data
  console.log('Exporting compliance data...')
}

onMounted(() => {
  loadComplianceRecords()
  // Load standards and staff lists
  standardsList.value = [
    { id: 1, name: 'معيار سلامة المرضى' },
    { id: 2, name: 'معيار الرعاية السريرية' },
    { id: 3, name: 'معيار مكافحة العدوى' }
  ]
  staffList.value = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' }
  ]
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/compliance.css';
</style>
