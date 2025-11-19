<template>
  <div class="incidents-container">
    <!-- Header -->
    <div class="incidents-header">
      <div class="incidents-title-section">
        <h1 class="incidents-title">إدارة الحوادث</h1>
        <p class="incidents-subtitle">تسجيل ومتابعة الحوادث والتحقيقات</p>
      </div>
      <div class="incidents-actions">
        <button 
          @click="openCreateModal"
          class="incidents-create-btn"
        >
          <svg class="incidents-create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          تسجيل حادث جديد
        </button>
        <button 
          @click="refreshData"
          :disabled="loading"
          class="incidents-refresh-btn"
        >
          <svg class="incidents-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="incidents-stats">
      <div class="incidents-stat-card">
        <div class="incidents-stat-icon incidents-stat-icon-total">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="incidents-stat-content">
          <h3 class="incidents-stat-title">إجمالي الحوادث</h3>
          <p class="incidents-stat-value">{{ statistics?.total_incidents || 0 }}</p>
        </div>
      </div>

      <div class="incidents-stat-card">
        <div class="incidents-stat-icon incidents-stat-icon-critical">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="incidents-stat-content">
          <h3 class="incidents-stat-title">حرجة</h3>
          <p class="incidents-stat-value">{{ statistics?.critical_incidents || 0 }}</p>
        </div>
      </div>

      <div class="incidents-stat-card">
        <div class="incidents-stat-icon incidents-stat-icon-resolved">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="incidents-stat-content">
          <h3 class="incidents-stat-title">محلولة</h3>
          <p class="incidents-stat-value">{{ statistics?.resolved_incidents || 0 }}</p>
        </div>
      </div>

      <div class="incidents-stat-card">
        <div class="incidents-stat-icon incidents-stat-icon-pending">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="incidents-stat-content">
          <h3 class="incidents-stat-title">قيد التحقيق</h3>
          <p class="incidents-stat-value">{{ statistics?.pending_incidents || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="incidents-filters">
      <div class="incidents-search">
        <div class="incidents-search-input-wrapper">
          <svg class="incidents-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في الحوادث..."
            class="incidents-search-input"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="incidents-filter-controls">
        <select 
          v-model="statusFilter"
          @change="handleFilterChange"
          class="incidents-filter-select"
        >
          <option value="">جميع الحالات</option>
          <option value="reported">مبلغ عنه</option>
          <option value="investigating">قيد التحقيق</option>
          <option value="resolved">محلول</option>
          <option value="closed">مغلق</option>
        </select>
        
        <select 
          v-model="severityFilter"
          @change="handleFilterChange"
          class="incidents-filter-select"
        >
          <option value="">جميع المستويات</option>
          <option value="low">منخفض</option>
          <option value="medium">متوسط</option>
          <option value="high">عالي</option>
          <option value="critical">حرج</option>
        </select>

        <select 
          v-model="typeFilter"
          @change="handleFilterChange"
          class="incidents-filter-select"
        >
          <option value="">جميع الأنواع</option>
          <option value="patient_safety">سلامة المرضى</option>
          <option value="medication_error">خطأ دوائي</option>
          <option value="equipment_failure">عطل معدات</option>
          <option value="staff_injury">إصابة موظف</option>
          <option value="other">أخرى</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="incidents-loading">
      <div class="incidents-loading-spinner"></div>
      <p class="incidents-loading-text">جاري تحميل الحوادث...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="incidents-error">
      <div class="incidents-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="incidents-error-title">خطأ في تحميل البيانات</h3>
      <p class="incidents-error-message">{{ error }}</p>
      <button @click="refreshData" class="incidents-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Incidents List -->
    <div v-else class="incidents-list">
      <div 
        v-for="incident in filteredIncidents" 
        :key="incident.id"
        class="incidents-item"
        @click="openEditModal(incident)"
      >
        <div class="incidents-item-header">
          <div class="incidents-item-title-section">
            <h3 class="incidents-item-title">{{ incident.title }}</h3>
            <div class="incidents-item-badges">
              <span 
                class="incidents-item-severity"
                :class="`incidents-item-severity-${incident.severity}`"
              >
                {{ getSeverityText(incident.severity) }}
              </span>
              <span 
                class="incidents-item-status"
                :class="`incidents-item-status-${incident.status}`"
              >
                {{ getStatusText(incident.status) }}
              </span>
              <span 
                class="incidents-item-type"
                :class="`incidents-item-type-${incident.type}`"
              >
                {{ getTypeText(incident.type) }}
              </span>
            </div>
          </div>
          <div class="incidents-item-actions">
            <button 
              @click.stop="updateIncidentStatus(incident)"
              class="incidents-item-action-btn"
              :class="getStatusActionClass(incident.status)"
            >
              <svg class="incidents-item-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            <button 
              @click.stop="deleteIncident(incident.id)"
              class="incidents-item-action-btn incidents-item-action-delete"
            >
              <svg class="incidents-item-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="incidents-item-content">
          <p class="incidents-item-description">{{ incident.description }}</p>
          
          <div class="incidents-item-meta">
            <div class="incidents-item-meta-item">
              <span class="incidents-item-meta-label">تاريخ الحادث:</span>
              <span class="incidents-item-meta-value">{{ formatDateTime(incident.incident_date) }}</span>
            </div>
            <div class="incidents-item-meta-item">
              <span class="incidents-item-meta-label">أبلغ عنه:</span>
              <span class="incidents-item-meta-value">{{ incident.reported_by?.name || 'غير محدد' }}</span>
            </div>
            <div v-if="incident.closure_date" class="incidents-item-meta-item">
              <span class="incidents-item-meta-label">تاريخ الإغلاق:</span>
              <span class="incidents-item-meta-value">{{ formatDate(incident.closure_date) }}</span>
            </div>
          </div>

          <div v-if="incident.root_cause_analysis" class="incidents-item-analysis">
            <h4 class="incidents-item-analysis-title">تحليل السبب الجذري:</h4>
            <p class="incidents-item-analysis-text">{{ incident.root_cause_analysis }}</p>
          </div>

          <div v-if="incident.corrective_actions" class="incidents-item-actions-section">
            <h4 class="incidents-item-actions-title">الإجراءات التصحيحية:</h4>
            <p class="incidents-item-actions-text">{{ incident.corrective_actions }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredIncidents.length === 0" class="incidents-empty">
      <div class="incidents-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <h3 class="incidents-empty-title">لا توجد حوادث</h3>
      <p class="incidents-empty-message">لم يتم العثور على حوادث تطابق معايير البحث</p>
      <button @click="openCreateModal" class="incidents-empty-action-btn">
        تسجيل حادث جديد
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="incidents-modal-overlay" @click="closeModal">
      <div class="incidents-modal" @click.stop>
        <div class="incidents-modal-header">
          <h2 class="incidents-modal-title">
            {{ editingIncident ? 'تعديل الحادث' : 'تسجيل حادث جديد' }}
          </h2>
          <button @click="closeModal" class="incidents-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveIncident" class="incidents-modal-form">
          <div class="incidents-modal-form-group">
            <label class="incidents-modal-form-label">عنوان الحادث *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="incidents-modal-form-input"
              placeholder="أدخل عنوان الحادث"
            />
          </div>
          
          <div class="incidents-modal-form-group">
            <label class="incidents-modal-form-label">وصف الحادث *</label>
            <textarea
              v-model="formData.description"
              required
              class="incidents-modal-form-textarea"
              placeholder="أدخل وصف مفصل للحادث"
              rows="4"
            ></textarea>
          </div>
          
          <div class="incidents-modal-form-row">
            <div class="incidents-modal-form-group">
              <label class="incidents-modal-form-label">نوع الحادث</label>
              <select v-model="formData.type" class="incidents-modal-form-select">
                <option value="patient_safety">سلامة المرضى</option>
                <option value="medication_error">خطأ دوائي</option>
                <option value="equipment_failure">عطل معدات</option>
                <option value="staff_injury">إصابة موظف</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            
            <div class="incidents-modal-form-group">
              <label class="incidents-modal-form-label">مستوى الخطورة</label>
              <select v-model="formData.severity" class="incidents-modal-form-select">
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="critical">حرج</option>
              </select>
            </div>
          </div>
          
          <div class="incidents-modal-form-row">
            <div class="incidents-modal-form-group">
              <label class="incidents-modal-form-label">تاريخ الحادث</label>
              <input
                v-model="formData.incident_date"
                type="datetime-local"
                class="incidents-modal-form-input"
              />
            </div>
            
            <div class="incidents-modal-form-group">
              <label class="incidents-modal-form-label">الحالة</label>
              <select v-model="formData.status" class="incidents-modal-form-select">
                <option value="reported">مبلغ عنه</option>
                <option value="investigating">قيد التحقيق</option>
                <option value="resolved">محلول</option>
                <option value="closed">مغلق</option>
              </select>
            </div>
          </div>
          
          <div class="incidents-modal-form-group">
            <label class="incidents-modal-form-label">تحليل السبب الجذري</label>
            <textarea
              v-model="formData.root_cause_analysis"
              class="incidents-modal-form-textarea"
              placeholder="أدخل تحليل السبب الجذري للحادث"
              rows="3"
            ></textarea>
          </div>
          
          <div class="incidents-modal-form-group">
            <label class="incidents-modal-form-label">الإجراءات التصحيحية</label>
            <textarea
              v-model="formData.corrective_actions"
              class="incidents-modal-form-textarea"
              placeholder="أدخل الإجراءات التصحيحية المتخذة"
              rows="3"
            ></textarea>
          </div>
          
          <div class="incidents-modal-form-actions">
            <button 
              type="button" 
              @click="closeModal"
              class="incidents-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="incidents-modal-form-save-btn"
            >
              <span v-if="saving" class="incidents-modal-form-saving-spinner"></span>
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
import '@/assets/css/qualityAssurance/incidents.css'

defineOptions({
  name: 'IncidentsView'
})

const {
  // State
  loading,
  error,
  statistics,
  
  // Computed
  filteredIncidents,
  
  // Methods
  loadIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  updateIncidentStatus,
  formatDate,
  formatDateTime,
  getStatusText,
  getSeverityText,
  getTypeText
} = useQualityAssuranceManager()

// Local state
const searchQuery = ref('')
const statusFilter = ref('')
const severityFilter = ref('')
const typeFilter = ref('')
const showModal = ref(false)
const editingIncident = ref(null)
const saving = ref(false)

// Form data
const formData = ref({
  title: '',
  description: '',
  type: 'other',
  severity: 'medium',
  status: 'reported',
  incident_date: '',
  root_cause_analysis: '',
  corrective_actions: ''
})

// Local methods
const refreshData = async () => {
  await loadIncidents()
}

const handleSearch = () => {
  // Search is handled by the manager's computed property
}

const handleFilterChange = () => {
  // Filtering is handled by the manager's computed property
}

const openCreateModal = () => {
  editingIncident.value = null
  formData.value = {
    title: '',
    description: '',
    type: 'other',
    severity: 'medium',
    status: 'reported',
    incident_date: new Date().toISOString().slice(0, 16),
    root_cause_analysis: '',
    corrective_actions: ''
  }
  showModal.value = true
}

const openEditModal = (incident) => {
  editingIncident.value = incident
  formData.value = {
    title: incident.title,
    description: incident.description,
    type: incident.type,
    severity: incident.severity,
    status: incident.status,
    incident_date: incident.incident_date ? new Date(incident.incident_date).toISOString().slice(0, 16) : '',
    root_cause_analysis: incident.root_cause_analysis || '',
    corrective_actions: incident.corrective_actions || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingIncident.value = null
}

const saveIncident = async () => {
  saving.value = true
  try {
    if (editingIncident.value) {
      await updateIncident(editingIncident.value.id, formData.value)
    } else {
      await createIncident(formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving incident:', error)
  } finally {
    saving.value = false
  }
}

const getStatusActionClass = (status) => {
  switch (status) {
    case 'reported':
      return 'incidents-item-action-investigate'
    case 'investigating':
      return 'incidents-item-action-resolve'
    case 'resolved':
      return 'incidents-item-action-close'
    default:
      return 'incidents-item-action-default'
  }
}

onMounted(() => {
  loadIncidents()
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/incidents.css';
</style>
