<template>
  <div class="audits-container">
    <!-- Header -->
    <div class="audits-header">
      <div class="audits-title-section">
        <h1 class="audits-title">إدارة التدقيقات</h1>
        <p class="audits-subtitle">إدارة وتتبع عمليات التدقيق الداخلي والخارجي</p>
      </div>
      <div class="audits-actions">
        <button 
          @click="openCreateModal"
          class="audits-create-btn"
        >
          <svg class="audits-create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة تدقيق جديد
        </button>
        <button 
          @click="refreshData"
          :disabled="loading"
          class="audits-refresh-btn"
        >
          <svg class="audits-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="audits-filters">
      <div class="audits-search">
        <div class="audits-search-input-wrapper">
          <svg class="audits-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في التدقيقات..."
            class="audits-search-input"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="audits-filter-controls">
        <select 
          v-model="statusFilter"
          @change="handleFilterChange"
          class="audits-filter-select"
        >
          <option value="">جميع الحالات</option>
          <option value="scheduled">مجدول</option>
          <option value="in_progress">قيد التنفيذ</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
        
        <select 
          v-model="typeFilter"
          @change="handleFilterChange"
          class="audits-filter-select"
        >
          <option value="">جميع الأنواع</option>
          <option value="internal">داخلي</option>
          <option value="external">خارجي</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="audits-loading">
      <div class="audits-loading-spinner"></div>
      <p class="audits-loading-text">جاري تحميل التدقيقات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="audits-error">
      <div class="audits-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="audits-error-title">خطأ في تحميل البيانات</h3>
      <p class="audits-error-message">{{ error }}</p>
      <button @click="refreshData" class="audits-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Audits Grid -->
    <div v-else class="audits-grid">
      <div 
        v-for="audit in filteredAudits" 
        :key="audit.id"
        class="audits-card"
        @click="openEditModal(audit)"
      >
        <div class="audits-card-header">
          <div class="audits-card-title-section">
            <h3 class="audits-card-title">{{ audit.title }}</h3>
            <div class="audits-card-badges">
              <span 
                class="audits-card-status"
                :class="`audits-card-status-${audit.status}`"
              >
                {{ getStatusText(audit.status) }}
              </span>
              <span 
                class="audits-card-type"
                :class="`audits-card-type-${audit.type}`"
              >
                {{ getTypeText(audit.type) }}
              </span>
            </div>
          </div>
          <div class="audits-card-actions">
            <button 
              @click.stop="updateAuditStatus(audit)"
              class="audits-card-action-btn"
              :class="getStatusActionClass(audit.status)"
            >
              <svg class="audits-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            <button 
              @click.stop="deleteAudit(audit.id)"
              class="audits-card-action-btn audits-card-action-delete"
            >
              <svg class="audits-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="audits-card-content">
          <p class="audits-card-description">{{ audit.description || 'لا يوجد وصف' }}</p>
          
          <div class="audits-card-meta">
            <div class="audits-card-meta-item">
              <span class="audits-card-meta-label">تاريخ التدقيق:</span>
              <span class="audits-card-meta-value">{{ formatDate(audit.audit_date) }}</span>
            </div>
            <div class="audits-card-meta-item">
              <span class="audits-card-meta-label">المدقق:</span>
              <span class="audits-card-meta-value">{{ audit.auditor?.name || 'غير محدد' }}</span>
            </div>
            <div class="audits-card-meta-item">
              <span class="audits-card-meta-label">تاريخ الاستحقاق:</span>
              <span class="audits-card-meta-value">{{ formatDate(audit.due_date) }}</span>
            </div>
          </div>

          <div v-if="audit.findings" class="audits-card-findings">
            <h4 class="audits-card-findings-title">النتائج:</h4>
            <p class="audits-card-findings-text">{{ audit.findings }}</p>
          </div>

          <div v-if="audit.recommendations" class="audits-card-recommendations">
            <h4 class="audits-card-recommendations-title">التوصيات:</h4>
            <p class="audits-card-recommendations-text">{{ audit.recommendations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredAudits.length === 0" class="audits-empty">
      <div class="audits-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      </div>
      <h3 class="audits-empty-title">لا توجد تدقيقات</h3>
      <p class="audits-empty-message">لم يتم العثور على تدقيقات تطابق معايير البحث</p>
      <button @click="openCreateModal" class="audits-empty-action-btn">
        إضافة تدقيق جديد
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="audits-modal-overlay" @click="closeModal">
      <div class="audits-modal" @click.stop>
        <div class="audits-modal-header">
          <h2 class="audits-modal-title">
            {{ editingAudit ? 'تعديل التدقيق' : 'إضافة تدقيق جديد' }}
          </h2>
          <button @click="closeModal" class="audits-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveAudit" class="audits-modal-form">
          <div class="audits-modal-form-group">
            <label class="audits-modal-form-label">عنوان التدقيق *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="audits-modal-form-input"
              placeholder="أدخل عنوان التدقيق"
            />
          </div>
          
          <div class="audits-modal-form-group">
            <label class="audits-modal-form-label">الوصف</label>
            <textarea
              v-model="formData.description"
              class="audits-modal-form-textarea"
              placeholder="أدخل وصف التدقيق"
              rows="4"
            ></textarea>
          </div>
          
          <div class="audits-modal-form-row">
            <div class="audits-modal-form-group">
              <label class="audits-modal-form-label">نوع التدقيق</label>
              <select v-model="formData.type" class="audits-modal-form-select">
                <option value="internal">داخلي</option>
                <option value="external">خارجي</option>
              </select>
            </div>
            
            <div class="audits-modal-form-group">
              <label class="audits-modal-form-label">الحالة</label>
              <select v-model="formData.status" class="audits-modal-form-select">
                <option value="scheduled">مجدول</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
          
          <div class="audits-modal-form-row">
            <div class="audits-modal-form-group">
              <label class="audits-modal-form-label">تاريخ التدقيق</label>
              <input
                v-model="formData.audit_date"
                type="date"
                class="audits-modal-form-input"
              />
            </div>
            
            <div class="audits-modal-form-group">
              <label class="audits-modal-form-label">تاريخ الاستحقاق</label>
              <input
                v-model="formData.due_date"
                type="date"
                class="audits-modal-form-input"
              />
            </div>
          </div>
          
          <div class="audits-modal-form-group">
            <label class="audits-modal-form-label">المدقق</label>
            <select v-model="formData.auditor_id" class="audits-modal-form-select">
              <option value="">اختر المدقق</option>
              <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
                {{ staff.name }}
              </option>
            </select>
          </div>
          
          <div class="audits-modal-form-group">
            <label class="audits-modal-form-label">النتائج</label>
            <textarea
              v-model="formData.findings"
              class="audits-modal-form-textarea"
              placeholder="أدخل نتائج التدقيق"
              rows="3"
            ></textarea>
          </div>
          
          <div class="audits-modal-form-group">
            <label class="audits-modal-form-label">التوصيات</label>
            <textarea
              v-model="formData.recommendations"
              class="audits-modal-form-textarea"
              placeholder="أدخل توصيات التدقيق"
              rows="3"
            ></textarea>
          </div>
          
          <div class="audits-modal-form-actions">
            <button 
              type="button" 
              @click="closeModal"
              class="audits-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="audits-modal-form-save-btn"
            >
              <span v-if="saving" class="audits-modal-form-saving-spinner"></span>
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

defineOptions({
  name: 'AuditsView'
})
import { useQualityAssuranceManager } from '@/scripts/qualityAssurance/qualityAssuranceManager'
import '@/assets/css/qualityAssurance/audits.css'

const {
  // State
  loading,
  error,
  
  // Computed
  filteredAudits,
  
  // Methods
  loadAudits,
  createAudit,
  updateAudit,
  deleteAudit,
  updateAuditStatus,
  formatDate,
  getStatusText,
  getTypeText
} = useQualityAssuranceManager()

// Local state
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const showModal = ref(false)
const editingAudit = ref(null)
const saving = ref(false)
const staffList = ref([])

// Form data
const formData = ref({
  title: '',
  description: '',
  type: 'internal',
  status: 'scheduled',
  audit_date: '',
  due_date: '',
  auditor_id: '',
  findings: '',
  recommendations: ''
})

// Local methods
const refreshData = async () => {
  await loadAudits()
}

const handleSearch = () => {
  // Search is handled by the manager's computed property
}

const handleFilterChange = () => {
  // Filtering is handled by the manager's computed property
}

const openCreateModal = () => {
  editingAudit.value = null
  formData.value = {
    title: '',
    description: '',
    type: 'internal',
    status: 'scheduled',
    audit_date: '',
    due_date: '',
    auditor_id: '',
    findings: '',
    recommendations: ''
  }
  showModal.value = true
}

const openEditModal = (audit) => {
  editingAudit.value = audit
  formData.value = {
    title: audit.title,
    description: audit.description || '',
    type: audit.type,
    status: audit.status,
    audit_date: audit.audit_date || '',
    due_date: audit.due_date || '',
    auditor_id: audit.auditor_id || '',
    findings: audit.findings || '',
    recommendations: audit.recommendations || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAudit.value = null
}

const saveAudit = async () => {
  saving.value = true
  try {
    if (editingAudit.value) {
      await updateAudit(editingAudit.value.id, formData.value)
    } else {
      await createAudit(formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving audit:', error)
  } finally {
    saving.value = false
  }
}

const getStatusActionClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'audits-card-action-start'
    case 'in_progress':
      return 'audits-card-action-complete'
    case 'completed':
      return 'audits-card-action-review'
    default:
      return 'audits-card-action-default'
  }
}

onMounted(() => {
  loadAudits()
  // Load staff list for auditor selection
  // This would typically come from a staff API
  staffList.value = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' }
  ]
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/audits.css';
</style>
