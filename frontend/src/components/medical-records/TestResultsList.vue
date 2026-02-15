<template>
  <div class="test-results-container">
    <div class="test-results-header">
      <h3 class="test-results-title">نتائج الفحوصات الطبية</h3>
      <button 
        @click="showAddForm = true"
        class="add-test-btn"
        v-if="canAddTest"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        إضافة فحص
      </button>
    </div>

    <!-- Test Results List -->
    <div v-if="tests.length === 0" class="empty-tests">
      <div class="empty-icon">🔬</div>
      <p class="empty-text">لا توجد فحوصات طبية مسجلة</p>
      <button 
        v-if="canAddTest"
        @click="showAddForm = true"
        class="empty-action-btn"
      >
        إضافة أول فحص
      </button>
    </div>

    <div v-else class="tests-grid">
      <div 
        v-for="test in tests" 
        :key="test.id"
        class="test-card"
        :class="{ 'overdue': isOverdue(test), 'abnormal': isAbnormal(test) }"
      >
        <div class="test-header-card">
          <div class="test-info">
            <h4 class="test-name">{{ test.test_name }}</h4>
            <div class="test-meta">
              <span class="test-type">{{ getTestTypeText(test.test_type) }}</span>
              <span class="test-date">{{ formatDate(test.test_date) }}</span>
            </div>
          </div>
          <div class="test-badges">
            <span class="status-badge" :class="getTestStatusColor(test.status)">
              {{ getTestStatusText(test.status) }}
            </span>
            <span v-if="isOverdue(test)" class="overdue-badge">
              متأخر
            </span>
            <span v-else-if="isAbnormal(test)" class="abnormal-badge">
              غير طبيعي
            </span>
          </div>
        </div>
        
        <div class="test-details">
          <div v-if="test.results" class="test-results">
            <div class="detail-row">
              <span class="detail-label">النتائج:</span>
              <span class="detail-value">{{ test.results }}</span>
            </div>
          </div>
          
          <div v-if="test.normal_range" class="test-range">
            <div class="detail-row">
              <span class="detail-label">المدى الطبيعي:</span>
              <span class="detail-value">{{ test.normal_range }}</span>
            </div>
          </div>
          
          <div v-if="test.notes" class="test-notes">
            <div class="detail-row">
              <span class="detail-label">ملاحظات:</span>
              <span class="detail-value">{{ test.notes }}</span>
            </div>
          </div>
          
          <div v-if="test.results_date" class="test-results-date">
            <div class="detail-row">
              <span class="detail-label">تاريخ النتائج:</span>
              <span class="detail-value">{{ formatDate(test.results_date) }}</span>
            </div>
          </div>
        </div>
        
        <div class="test-actions">
          <button 
            @click="viewTest(test)"
            class="action-btn view-btn"
            title="عرض التفاصيل"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            عرض
          </button>
          
          <button 
            @click="editTest(test)"
            class="action-btn edit-btn"
            v-if="canEditTest(test)"
            title="تعديل"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            تعديل
          </button>
          
          <button 
            @click="updateTestResults(test)"
            class="action-btn results-btn"
            v-if="canUpdateResults(test)"
            title="تحديث النتائج"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            نتائج
          </button>
          
          <button 
            @click="deleteTest(test)"
            class="action-btn delete-btn"
            v-if="canDeleteTest(test)"
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

    <!-- Add/Edit Test Modal -->
    <div v-if="showAddForm || showEditForm" class="test-modal">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditForm ? 'تعديل الفحص الطبي' : 'إضافة فحص طبي جديد' }}
          </h3>
          <button @click="closeModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم الفحص *</label>
            <input
              v-model="form.test_name"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.test_name }"
              placeholder="أدخل اسم الفحص"
              required
            />
            <span v-if="errors.test_name" class="form-error">
              {{ errors.test_name }}
            </span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع الفحص *</label>
              <select
                v-model="form.test_type"
                class="form-select"
                :class="{ 'form-input-error': errors.test_type }"
                required
              >
                <option value="">اختر نوع الفحص</option>
                <option value="blood">فحص دم</option>
                <option value="urine">فحص بول</option>
                <option value="imaging">فحص تصويري</option>
                <option value="cardiac">فحص قلبي</option>
                <option value="neurological">فحص عصبي</option>
                <option value="other">فحص آخر</option>
              </select>
              <span v-if="errors.test_type" class="form-error">
                {{ errors.test_type }}
              </span>
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ الفحص *</label>
              <input
                v-model="form.test_date"
                type="date"
                class="form-input"
                :class="{ 'form-input-error': errors.test_date }"
                required
              />
              <span v-if="errors.test_date" class="form-error">
                {{ errors.test_date }}
              </span>
            </div>
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

    <!-- Update Results Modal -->
    <div v-if="showResultsModal" class="results-modal">
      <div class="modal-overlay" @click="closeResultsModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">تحديث نتائج الفحص</h3>
          <button @click="closeResultsModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleResultsSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">النتائج *</label>
            <textarea
              v-model="resultsForm.results"
              class="form-textarea"
              rows="4"
              placeholder="أدخل نتائج الفحص"
              required
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المدى الطبيعي</label>
              <input
                v-model="resultsForm.normal_range"
                type="text"
                class="form-input"
                placeholder="مثال: 70-140 mg/dL"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ النتائج *</label>
              <input
                v-model="resultsForm.results_date"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات إضافية</label>
            <textarea
              v-model="resultsForm.notes"
              class="form-textarea"
              rows="3"
              placeholder="أدخل ملاحظات إضافية (اختياري)"
            ></textarea>
          </div>
        </form>
        
        <div class="modal-footer">
          <button @click="closeResultsModal" class="btn btn-outline">
            إلغاء
          </button>
          <button 
            @click="handleResultsSubmit"
            class="btn btn-success"
            :disabled="loading"
          >
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            تحديث النتائج
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, isOverdue } from '@/utils/medicalHelpers'
import { TestResultsManager } from '@/scripts/medical-records/testResultsManager'

const props = defineProps({
  tests: {
    type: Array,
    default: () => []
  },
  medicalRecordId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['test-added', 'test-updated', 'test-deleted', 'results-updated'])

const authStore = useAuthStore()
const testResultsManager = new TestResultsManager()

// Get reactive data and methods from manager
const {
  showAddForm,
  showEditForm,
  showResultsModal,
  loading,
  errors,
  editingTest,
  form,
  resultsForm
} = testResultsManager.getReactiveData()

const {
  canAddTest,
  canEditTest,
  canUpdateResults,
  canDeleteTest,
  resetForm,
  editTest,
  closeModal,
  closeResultsModal,
  validateForm,
  handleSubmit,
  updateTestResults,
  handleResultsSubmit,
  deleteTest,
  viewTest,
  getTestTypeText,
  getTestStatusText,
  getTestStatusColor,
  isAbnormal
} = testResultsManager.getMethods(props, emit, authStore)

// Lifecycle
onMounted(() => {
  testResultsManager.initializeForm()
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';
@import '@/assets/css/test-results.css';
</style>
