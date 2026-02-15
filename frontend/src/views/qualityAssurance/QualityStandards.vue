<template>
  <div class="quality-standards-container">
    <!-- Header -->
    <div class="quality-standards-header">
      <div class="quality-standards-title-section">
        <h1 class="quality-standards-title">إدارة معايير الجودة</h1>
        <p class="quality-standards-subtitle">إدارة وتتبع معايير الجودة والامتثال</p>
      </div>
      <div class="quality-standards-actions">
        <button 
          @click="openCreateModal"
          class="quality-standards-create-btn"
        >
          <svg class="quality-standards-create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة معيار جديد
        </button>
        <button 
          @click="refreshData"
          :disabled="loading"
          class="quality-standards-refresh-btn"
        >
          <svg class="quality-standards-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="quality-standards-filters">
      <div class="quality-standards-search">
        <div class="quality-standards-search-input-wrapper">
          <svg class="quality-standards-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في المعايير..."
            class="quality-standards-search-input"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="quality-standards-filter-controls">
        <select 
          v-model="statusFilter"
          @change="handleFilterChange"
          class="quality-standards-filter-select"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="draft">مسودة</option>
        </select>
        
        <select 
          v-model="categoryFilter"
          @change="handleFilterChange"
          class="quality-standards-filter-select"
        >
          <option value="">جميع الفئات</option>
          <option value="patient_safety">سلامة المرضى</option>
          <option value="clinical_care">الرعاية السريرية</option>
          <option value="infection_control">مكافحة العدوى</option>
          <option value="medication_safety">سلامة الأدوية</option>
          <option value="documentation">التوثيق</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="quality-standards-loading">
      <div class="quality-standards-loading-spinner"></div>
      <p class="quality-standards-loading-text">جاري تحميل المعايير...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="quality-standards-error">
      <div class="quality-standards-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="quality-standards-error-title">خطأ في تحميل البيانات</h3>
      <p class="quality-standards-error-message">{{ error }}</p>
      <button @click="refreshData" class="quality-standards-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Standards Grid -->
    <div v-else class="quality-standards-grid">
      <div 
        v-for="standard in filteredStandards" 
        :key="standard.id"
        class="quality-standards-card"
        @click="openEditModal(standard)"
      >
        <div class="quality-standards-card-header">
          <div class="quality-standards-card-title-section">
            <h3 class="quality-standards-card-title">{{ standard.name }}</h3>
            <span 
              class="quality-standards-card-status"
              :class="`quality-standards-card-status-${standard.status}`"
            >
              {{ getStatusText(standard.status) }}
            </span>
          </div>
          <div class="quality-standards-card-actions">
            <button 
              @click.stop="toggleStandardStatus(standard)"
              class="quality-standards-card-action-btn"
              :class="standard.status === 'active' ? 'quality-standards-card-action-deactivate' : 'quality-standards-card-action-activate'"
            >
              <svg v-if="standard.status === 'active'" class="quality-standards-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
              <svg v-else class="quality-standards-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
            <button 
              @click.stop="deleteStandard(standard.id)"
              class="quality-standards-card-action-btn quality-standards-card-action-delete"
            >
              <svg class="quality-standards-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="quality-standards-card-content">
          <p class="quality-standards-card-description">{{ standard.description || 'لا يوجد وصف' }}</p>
          
          <div class="quality-standards-card-meta">
            <div class="quality-standards-card-meta-item">
              <span class="quality-standards-card-meta-label">الفئة:</span>
              <span class="quality-standards-card-meta-value">{{ getCategoryText(standard.category) }}</span>
            </div>
            <div class="quality-standards-card-meta-item">
              <span class="quality-standards-card-meta-label">الإصدار:</span>
              <span class="quality-standards-card-meta-value">{{ standard.version || 'غير محدد' }}</span>
            </div>
            <div class="quality-standards-card-meta-item">
              <span class="quality-standards-card-meta-label">تاريخ السريان:</span>
              <span class="quality-standards-card-meta-value">{{ formatDate(standard.effective_date) }}</span>
            </div>
            <div class="quality-standards-card-meta-item">
              <span class="quality-standards-card-meta-label">تاريخ المراجعة:</span>
              <span class="quality-standards-card-meta-value">{{ formatDate(standard.review_date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredStandards.length === 0" class="quality-standards-empty">
      <div class="quality-standards-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="quality-standards-empty-title">لا توجد معايير</h3>
      <p class="quality-standards-empty-message">لم يتم العثور على معايير جودة تطابق معايير البحث</p>
      <button @click="openCreateModal" class="quality-standards-empty-action-btn">
        إضافة معيار جديد
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="quality-standards-modal-overlay" @click="closeModal">
      <div class="quality-standards-modal" @click.stop>
        <div class="quality-standards-modal-header">
          <h2 class="quality-standards-modal-title">
            {{ editingStandard ? 'تعديل المعيار' : 'إضافة معيار جديد' }}
          </h2>
          <button @click="closeModal" class="quality-standards-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveStandard" class="quality-standards-modal-form">
          <div class="quality-standards-modal-form-group">
            <label class="quality-standards-modal-form-label">اسم المعيار *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="quality-standards-modal-form-input"
              placeholder="أدخل اسم المعيار"
            />
          </div>
          
          <div class="quality-standards-modal-form-group">
            <label class="quality-standards-modal-form-label">الوصف</label>
            <textarea
              v-model="formData.description"
              class="quality-standards-modal-form-textarea"
              placeholder="أدخل وصف المعيار"
              rows="4"
            ></textarea>
          </div>
          
          <div class="quality-standards-modal-form-row">
            <div class="quality-standards-modal-form-group">
              <label class="quality-standards-modal-form-label">الفئة</label>
              <select v-model="formData.category" class="quality-standards-modal-form-select">
                <option value="">اختر الفئة</option>
                <option value="patient_safety">سلامة المرضى</option>
                <option value="clinical_care">الرعاية السريرية</option>
                <option value="infection_control">مكافحة العدوى</option>
                <option value="medication_safety">سلامة الأدوية</option>
                <option value="documentation">التوثيق</option>
              </select>
            </div>
            
            <div class="quality-standards-modal-form-group">
              <label class="quality-standards-modal-form-label">الإصدار</label>
              <input
                v-model="formData.version"
                type="text"
                class="quality-standards-modal-form-input"
                placeholder="مثال: 1.0"
              />
            </div>
          </div>
          
          <div class="quality-standards-modal-form-row">
            <div class="quality-standards-modal-form-group">
              <label class="quality-standards-modal-form-label">تاريخ السريان</label>
              <input
                v-model="formData.effective_date"
                type="date"
                class="quality-standards-modal-form-input"
              />
            </div>
            
            <div class="quality-standards-modal-form-group">
              <label class="quality-standards-modal-form-label">تاريخ المراجعة</label>
              <input
                v-model="formData.review_date"
                type="date"
                class="quality-standards-modal-form-input"
              />
            </div>
          </div>
          
          <div class="quality-standards-modal-form-group">
            <label class="quality-standards-modal-form-label">الحالة</label>
            <select v-model="formData.status" class="quality-standards-modal-form-select">
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="draft">مسودة</option>
            </select>
          </div>
          
          <div class="quality-standards-modal-form-actions">
            <button 
              type="button" 
              @click="closeModal"
              class="quality-standards-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="quality-standards-modal-form-save-btn"
            >
              <span v-if="saving" class="quality-standards-modal-form-saving-spinner"></span>
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
import '@/assets/css/qualityAssurance/qualityStandards.css'

const {
  // State
  loading,
  error,
  
  // Computed
  filteredStandards,
  
  // Methods
  loadQualityStandards,
  createQualityStandard,
  updateQualityStandard,
  toggleStandardStatus,
  formatDate,
  getStatusText,
  getCategoryText
} = useQualityAssuranceManager()

// Local state
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const showModal = ref(false)
const editingStandard = ref(null)
const saving = ref(false)

// Form data
const formData = ref({
  name: '',
  description: '',
  category: '',
  version: '',
  effective_date: '',
  review_date: '',
  status: 'active'
})

// Local methods
const refreshData = async () => {
  await loadQualityStandards()
}

const handleSearch = () => {
  // Search is handled by the manager's computed property
}

const handleFilterChange = () => {
  // Filtering is handled by the manager's computed property
}

const openCreateModal = () => {
  editingStandard.value = null
  formData.value = {
    name: '',
    description: '',
    category: '',
    version: '',
    effective_date: '',
    review_date: '',
    status: 'active'
  }
  showModal.value = true
}

const openEditModal = (standard) => {
  editingStandard.value = standard
  formData.value = {
    name: standard.name,
    description: standard.description || '',
    category: standard.category || '',
    version: standard.version || '',
    effective_date: standard.effective_date || '',
    review_date: standard.review_date || '',
    status: standard.status
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingStandard.value = null
}

const saveStandard = async () => {
  saving.value = true
  try {
    if (editingStandard.value) {
      await updateQualityStandard(editingStandard.value.id, formData.value)
    } else {
      await createQualityStandard(formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving standard:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadQualityStandards()
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/qualityStandards.css';
</style>
