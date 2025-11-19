<template>
  <div class="diagnosis-list-container">
    <div class="diagnosis-header">
      <h3 class="diagnosis-title">التشخيصات</h3>
      <button 
        @click="showAddForm = true"
        class="add-diagnosis-btn"
        v-if="canAddDiagnosis"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        إضافة تشخيص
      </button>
    </div>

    <!-- Diagnosis List -->
    <div v-if="diagnoses.length === 0" class="empty-diagnoses">
      <div class="empty-icon">🔍</div>
      <p class="empty-text">لا توجد تشخيصات مسجلة</p>
      <button 
        v-if="canAddDiagnosis"
        @click="showAddForm = true"
        class="empty-action-btn"
      >
        إضافة أول تشخيص
      </button>
    </div>

    <div v-else class="diagnoses-grid">
      <div 
        v-for="diagnosis in diagnoses" 
        :key="diagnosis.id"
        class="diagnosis-card"
      >
        <div class="diagnosis-header-card">
          <div class="diagnosis-info">
            <h4 class="diagnosis-name">{{ diagnosis.diagnosis_name }}</h4>
            <div class="diagnosis-meta">
              <span v-if="diagnosis.icd_code" class="icd-code">
                ICD: {{ diagnosis.icd_code }}
              </span>
              <span class="diagnosis-date">{{ formatDate(diagnosis.diagnosis_date) }}</span>
            </div>
          </div>
          <div class="diagnosis-badges">
            <span class="severity-badge" :class="getSeverityColor(diagnosis.severity)">
              {{ getSeverityText(diagnosis.severity) }}
            </span>
            <span class="status-badge" :class="getStatusColor(diagnosis.status)">
              {{ getStatusText(diagnosis.status) }}
            </span>
          </div>
        </div>
        
        <div v-if="diagnosis.notes" class="diagnosis-notes">
          <p class="notes-text">{{ diagnosis.notes }}</p>
        </div>
        
        <div class="diagnosis-actions">
          <button 
            @click="editDiagnosis(diagnosis)"
            class="action-btn edit-btn"
            v-if="canEditDiagnosis(diagnosis)"
            title="تعديل"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            تعديل
          </button>
          
          <button 
            @click="deleteDiagnosis(diagnosis)"
            class="action-btn delete-btn"
            v-if="canDeleteDiagnosis(diagnosis)"
            title="حذف"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            حذف
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Diagnosis Modal -->
    <div v-if="showAddForm || showEditForm" class="diagnosis-modal">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditForm ? 'تعديل التشخيص' : 'إضافة تشخيص جديد' }}
          </h3>
          <button @click="closeModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم التشخيص *</label>
            <input
              v-model="form.diagnosis_name"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.diagnosis_name }"
              placeholder="أدخل اسم التشخيص"
              required
            />
            <span v-if="errors.diagnosis_name" class="form-error">
              {{ errors.diagnosis_name }}
            </span>
          </div>
          
          <div class="form-group">
            <label class="form-label">رمز ICD</label>
            <input
              v-model="form.icd_code"
              type="text"
              class="form-input"
              placeholder="أدخل رمز ICD (اختياري)"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">شدة التشخيص *</label>
              <select
                v-model="form.severity"
                class="form-select"
                required
              >
                <option value="">اختر الشدة</option>
                <option value="mild">خفيف</option>
                <option value="moderate">متوسط</option>
                <option value="severe">شديد</option>
                <option value="critical">حرج</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">الحالة *</label>
              <select
                v-model="form.status"
                class="form-select"
                required
              >
                <option value="">اختر الحالة</option>
                <option value="active">نشط</option>
                <option value="resolved">محلول</option>
                <option value="chronic">مزمن</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">تاريخ التشخيص *</label>
            <input
              v-model="form.diagnosis_date"
              type="date"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea
              v-model="form.notes"
              class="form-textarea"
              rows="3"
              placeholder="أدخل ملاحظات إضافية (اختياري)"
            ></textarea>
          </div>
        </form>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-outline">
            إلغاء
          </button>
          <button 
            @click="handleSubmit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ showEditForm ? 'تحديث' : 'إضافة' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, getSeverityColor, getStatusColor } from '@/utils/medicalHelpers'
import { DiagnosisManager } from '@/scripts/medical-records/diagnosisManager'

const props = defineProps({
  diagnoses: {
    type: Array,
    default: () => []
  },
  medicalRecordId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['diagnosis-added', 'diagnosis-updated', 'diagnosis-deleted'])

const authStore = useAuthStore()
const diagnosisManager = new DiagnosisManager()

// Get reactive data and methods from manager
const {
  showAddForm,
  showEditForm,
  loading,
  errors,
  editingDiagnosis,
  form
} = diagnosisManager.getReactiveData()

const {
  canAddDiagnosis,
  canEditDiagnosis,
  canDeleteDiagnosis,
  resetForm,
  openAddForm,
  editDiagnosis,
  closeModal,
  validateForm,
  handleSubmit,
  addDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  getSeverityText,
  getStatusText
} = diagnosisManager.getMethods(props, emit, authStore)

// Lifecycle
onMounted(() => {
  diagnosisManager.initializeForm()
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';

/* Additional styles for diagnosis list */
.diagnosis-list-container {
  @apply w-full;
}

.diagnosis-header {
  @apply flex justify-between items-center mb-6;
}

.diagnosis-title {
  @apply text-lg font-semibold text-gray-900;
}

.add-diagnosis-btn {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200;
}

.empty-diagnoses {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl text-gray-400 mb-4;
}

.empty-text {
  @apply text-gray-600 mb-4;
}

.empty-action-btn {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200;
}

.diagnoses-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.diagnosis-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200;
}

.diagnosis-header-card {
  @apply flex justify-between items-start mb-3;
}

.diagnosis-info {
  @apply flex-1;
}

.diagnosis-name {
  @apply text-sm font-medium text-gray-900 mb-1;
}

.diagnosis-meta {
  @apply flex items-center space-x-3 space-x-reverse text-xs text-gray-500;
}

.icd-code {
  @apply font-mono bg-gray-100 px-2 py-1 rounded;
}

.diagnosis-date {
  @apply text-gray-600;
}

.diagnosis-badges {
  @apply flex flex-col space-y-2 space-y-reverse;
}

.severity-badge,
.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full text-center;
}

.diagnosis-notes {
  @apply mb-3;
}

.notes-text {
  @apply text-sm text-gray-600;
}

.diagnosis-actions {
  @apply flex justify-end space-x-2 space-x-reverse;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-input-error {
  @apply border-red-300 focus:border-red-500 focus:ring-red-500;
}
</style>
