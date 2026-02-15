<template>
  <div class="prescription-list-container">
    <div class="prescription-header">
      <h3 class="prescription-title">الوصفات الطبية</h3>
      <button 
        @click="showAddForm = true"
        class="add-prescription-btn"
        v-if="canAddPrescription"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        إضافة وصفة
      </button>
    </div>

    <!-- Prescription List -->
    <div v-if="prescriptions.length === 0" class="empty-prescriptions">
      <div class="empty-icon">💊</div>
      <p class="empty-text">لا توجد وصفات طبية مسجلة</p>
      <button 
        v-if="canAddPrescription"
        @click="showAddForm = true"
        class="empty-action-btn"
      >
        إضافة أول وصفة
      </button>
    </div>

    <div v-else class="prescriptions-grid">
      <div 
        v-for="prescription in prescriptions" 
        :key="prescription.id"
        class="prescription-card"
        :class="{ 'expired': isExpired(prescription), 'needs-renewal': needsRenewal(prescription) }"
      >
        <div class="prescription-header-card">
          <div class="prescription-info">
            <h4 class="medication-name">{{ prescription.medication_name }}</h4>
            <div class="prescription-meta">
              <span class="dosage">{{ prescription.dosage }}</span>
              <span class="frequency">{{ prescription.frequency }}</span>
              <span class="duration">{{ prescription.duration }}</span>
            </div>
          </div>
          <div class="prescription-badges">
            <span class="status-badge" :class="getStatusColor(prescription.status)">
              {{ getStatusText(prescription.status) }}
            </span>
            <span v-if="isExpired(prescription)" class="expired-badge">
              منتهي الصلاحية
            </span>
            <span v-else-if="needsRenewal(prescription)" class="renewal-badge">
              يحتاج تجديد
            </span>
          </div>
        </div>
        
        <div class="prescription-details">
          <div class="detail-row">
            <span class="detail-label">تاريخ الوصفة:</span>
            <span class="detail-value">{{ formatDate(prescription.prescribed_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">تاريخ البدء:</span>
            <span class="detail-value">{{ formatDate(prescription.start_date) }}</span>
          </div>
          <div v-if="prescription.end_date" class="detail-row">
            <span class="detail-label">تاريخ الانتهاء:</span>
            <span class="detail-value">{{ formatDate(prescription.end_date) }}</span>
          </div>
          <div v-if="prescription.instructions" class="detail-row">
            <span class="detail-label">التعليمات:</span>
            <span class="detail-value">{{ prescription.instructions }}</span>
          </div>
        </div>
        
        <div class="prescription-actions">
          <button 
            @click="editPrescription(prescription)"
            class="action-btn edit-btn"
            v-if="canEditPrescription(prescription)"
            title="تعديل"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            تعديل
          </button>
          
          <button 
            @click="discontinuePrescription(prescription)"
            class="action-btn discontinue-btn"
            v-if="canDiscontinuePrescription(prescription)"
            title="إيقاف"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
            </svg>
            إيقاف
          </button>
          
          <button 
            @click="deletePrescription(prescription)"
            class="action-btn delete-btn"
            v-if="canDeletePrescription(prescription)"
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

    <!-- Add/Edit Prescription Modal -->
    <div v-if="showAddForm || showEditForm" class="prescription-modal">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditForm ? 'تعديل الوصفة الطبية' : 'إضافة وصفة طبية جديدة' }}
          </h3>
          <button @click="closeModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم الدواء *</label>
            <input
              v-model="form.medication_name"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.medication_name }"
              placeholder="أدخل اسم الدواء"
              required
            />
            <span v-if="errors.medication_name" class="form-error">
              {{ errors.medication_name }}
            </span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الجرعة *</label>
              <input
                v-model="form.dosage"
                type="text"
                class="form-input"
                :class="{ 'form-input-error': errors.dosage }"
                placeholder="مثال: 500mg"
                required
              />
              <span v-if="errors.dosage" class="form-error">
                {{ errors.dosage }}
              </span>
            </div>
            
            <div class="form-group">
              <label class="form-label">التكرار *</label>
              <input
                v-model="form.frequency"
                type="text"
                class="form-input"
                :class="{ 'form-input-error': errors.frequency }"
                placeholder="مثال: مرتين يومياً"
                required
              />
              <span v-if="errors.frequency" class="form-error">
                {{ errors.frequency }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">المدة *</label>
            <input
              v-model="form.duration"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.duration }"
              placeholder="مثال: 7 أيام"
              required
            />
            <span v-if="errors.duration" class="form-error">
              {{ errors.duration }}
            </span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ الوصفة *</label>
              <input
                v-model="form.prescribed_date"
                type="date"
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ البدء *</label>
              <input
                v-model="form.start_date"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">تاريخ الانتهاء</label>
            <input
              v-model="form.end_date"
              type="date"
              class="form-input"
              placeholder="اختياري"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">التعليمات</label>
            <textarea
              v-model="form.instructions"
              class="form-textarea"
              rows="3"
              placeholder="أدخل تعليمات خاصة بالدواء (اختياري)"
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
import { formatDate, getStatusColor, isOverdue } from '@/utils/medicalHelpers'
import { PrescriptionManager } from '@/scripts/medical-records/prescriptionManager'

const props = defineProps({
  prescriptions: {
    type: Array,
    default: () => []
  },
  medicalRecordId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['prescription-added', 'prescription-updated', 'prescription-deleted', 'prescription-discontinued'])

const authStore = useAuthStore()
const prescriptionManager = new PrescriptionManager()

// Get reactive data and methods from manager
const {
  showAddForm,
  showEditForm,
  loading,
  errors,
  editingPrescription,
  form
} = prescriptionManager.getReactiveData()

const {
  canAddPrescription,
  canEditPrescription,
  canDiscontinuePrescription,
  canDeletePrescription,
  resetForm,
  openAddForm,
  editPrescription,
  closeModal,
  validateForm,
  handleSubmit,
  addPrescription,
  updatePrescription,
  discontinuePrescription,
  deletePrescription,
  isExpired,
  needsRenewal,
  getStatusText
} = prescriptionManager.getMethods(props, emit, authStore)

// Lifecycle
onMounted(() => {
  prescriptionManager.initializeForm()
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';

/* Additional styles for prescription list */
.prescription-list-container {
  @apply w-full;
}

.prescription-header {
  @apply flex justify-between items-center mb-6;
}

.prescription-title {
  @apply text-lg font-semibold text-gray-900;
}

.add-prescription-btn {
  @apply inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200;
}

.empty-prescriptions {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl text-gray-400 mb-4;
}

.empty-text {
  @apply text-gray-600 mb-4;
}

.empty-action-btn {
  @apply inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200;
}

.prescriptions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.prescription-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200;
}

.prescription-card.expired {
  @apply border-red-300 bg-red-50;
}

.prescription-card.needs-renewal {
  @apply border-orange-300 bg-orange-50;
}

.prescription-header-card {
  @apply flex justify-between items-start mb-3;
}

.prescription-info {
  @apply flex-1;
}

.medication-name {
  @apply text-sm font-medium text-gray-900 mb-1;
}

.prescription-meta {
  @apply flex items-center space-x-3 space-x-reverse text-xs text-gray-600;
}

.dosage,
.frequency,
.duration {
  @apply bg-gray-100 px-2 py-1 rounded;
}

.prescription-badges {
  @apply flex flex-col space-y-2 space-y-reverse;
}

.status-badge,
.expired-badge,
.renewal-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full text-center;
}

.expired-badge {
  @apply bg-red-100 text-red-800;
}

.renewal-badge {
  @apply bg-orange-100 text-orange-800;
}

.prescription-details {
  @apply mb-3 space-y-2;
}

.detail-row {
  @apply flex justify-between items-start text-sm;
}

.detail-label {
  @apply font-medium text-gray-700;
}

.detail-value {
  @apply text-gray-900 text-right;
}

.prescription-actions {
  @apply flex justify-end space-x-2 space-x-reverse;
}

.discontinue-btn {
  @apply text-orange-600 hover:text-orange-700 hover:bg-orange-50;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-input-error {
  @apply border-red-300 focus:border-red-500 focus:ring-red-500;
}
</style>
