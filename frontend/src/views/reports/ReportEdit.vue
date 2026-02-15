<template>
  <div class="report-edit-container">
    <!-- Header -->
    <div class="report-edit-header">
      <div class="report-edit-title-section">
        <button 
          @click="goBack" 
          class="report-edit-back-btn"
          :title="'العودة للتفاصيل'"
        >
          <svg class="report-edit-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="report-edit-title">تعديل التقرير</h1>
      </div>
      
      <div class="report-edit-actions">
        <button 
          @click="saveReport" 
          class="report-edit-action-btn report-edit-save-btn"
          :disabled="!isFormValid || isSaving"
        >
          <svg 
            v-if="!isSaving"
            class="report-edit-action-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg 
            v-else
            class="report-edit-action-icon report-edit-spinning" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
        </button>
        
        <button 
          @click="cancelEdit" 
          class="report-edit-action-btn report-edit-cancel-btn"
          :disabled="isSaving"
        >
          <svg class="report-edit-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          إلغاء
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="saveReport" class="report-edit-form">
      <div class="report-edit-form-grid">
        <!-- Basic Information -->
        <div class="report-edit-section">
          <h3 class="report-edit-section-title">المعلومات الأساسية</h3>
          
          <div class="report-edit-field">
            <label for="title" class="report-edit-label">
              عنوان التقرير <span class="report-edit-required">*</span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="report-edit-input"
              :class="{ 'report-edit-input-error': errors.title }"
              placeholder="أدخل عنوان التقرير"
              required
            />
            <span v-if="errors.title" class="report-edit-error">{{ errors.title }}</span>
          </div>

          <div class="report-edit-field">
            <label for="description" class="report-edit-label">وصف التقرير</label>
            <textarea
              id="description"
              v-model="form.description"
              class="report-edit-textarea"
              :class="{ 'report-edit-input-error': errors.description }"
              placeholder="أدخل وصف التقرير"
              rows="4"
            ></textarea>
            <span v-if="errors.description" class="report-edit-error">{{ errors.description }}</span>
          </div>

          <div class="report-edit-field">
            <label for="category" class="report-edit-label">
              التصنيف <span class="report-edit-required">*</span>
            </label>
            <select
              id="category"
              v-model="form.category_id"
              class="report-edit-select"
              :class="{ 'report-edit-input-error': errors.category_id }"
              required
            >
              <option value="">اختر التصنيف</option>
              <option 
                v-for="category in reportCategories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <span v-if="errors.category_id" class="report-edit-error">{{ errors.category_id }}</span>
          </div>
        </div>

        <!-- Report Settings -->
        <div class="report-edit-section">
          <h3 class="report-edit-section-title">إعدادات التقرير</h3>
          
          <div class="report-edit-field">
            <label class="report-edit-checkbox-label">
              <input
                v-model="form.is_public"
                type="checkbox"
                class="report-edit-checkbox"
              />
              <span class="report-edit-checkbox-text">تقرير عام (يمكن للجميع الوصول إليه)</span>
            </label>
          </div>

          <div class="report-edit-field">
            <label class="report-edit-checkbox-label">
              <input
                v-model="form.is_scheduled"
                type="checkbox"
                class="report-edit-checkbox"
              />
              <span class="report-edit-checkbox-text">تقرير مجدول</span>
            </label>
          </div>

          <div v-if="form.is_scheduled" class="report-edit-field">
            <label for="schedule_frequency" class="report-edit-label">تكرار الجدولة</label>
            <select
              id="schedule_frequency"
              v-model="form.schedule_frequency"
              class="report-edit-select"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
              <option value="quarterly">ربعي</option>
              <option value="yearly">سنوي</option>
            </select>
          </div>

          <div v-if="form.is_scheduled" class="report-edit-field">
            <label for="schedule_time" class="report-edit-label">وقت الجدولة</label>
            <input
              id="schedule_time"
              v-model="form.schedule_time"
              type="time"
              class="report-edit-input"
            />
          </div>
        </div>

        <!-- Report Parameters -->
        <div class="report-edit-section">
          <h3 class="report-edit-section-title">معاملات التقرير</h3>
          
          <div class="report-edit-parameters">
            <div 
              v-for="(param, index) in form.parameters" 
              :key="index"
              class="report-edit-parameter"
            >
              <div class="report-edit-parameter-header">
                <input
                  v-model="param.name"
                  type="text"
                  class="report-edit-input report-edit-parameter-name"
                  placeholder="اسم المعامل"
                />
                <button
                  @click="removeParameter(index)"
                  type="button"
                  class="report-edit-parameter-remove"
                  :title="'حذف المعامل'"
                >
                  <svg class="report-edit-parameter-remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div class="report-edit-parameter-fields">
                <input
                  v-model="param.label"
                  type="text"
                  class="report-edit-input report-edit-parameter-label"
                  placeholder="تسمية المعامل"
                />
                
                <select
                  v-model="param.type"
                  class="report-edit-select report-edit-parameter-type"
                >
                  <option value="text">نص</option>
                  <option value="number">رقم</option>
                  <option value="date">تاريخ</option>
                  <option value="select">قائمة منسدلة</option>
                </select>
                
                <input
                  v-model="param.default"
                  type="text"
                  class="report-edit-input report-edit-parameter-default"
                  placeholder="القيمة الافتراضية"
                />
              </div>
            </div>
            
            <button
              @click="addParameter"
              type="button"
              class="report-edit-add-parameter"
            >
              <svg class="report-edit-add-parameter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              إضافة معامل جديد
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Loading State -->
    <div v-if="isLoading" class="report-edit-loading">
      <div class="report-edit-loading-spinner"></div>
      <p class="report-edit-loading-text">جاري تحميل بيانات التقرير...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="report-edit-error">
      <svg class="report-edit-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="report-edit-error-text">{{ error }}</p>
      <button @click="loadReport" class="report-edit-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'

// Props
const props = defineProps({
  reportId: {
    type: [String, Number],
    required: true
  }
})

// Composables
const route = useRoute()
const router = useRouter()
const reportsStore = useReportsStore()

// Reactive state
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref(null)
const errors = ref({})

const form = ref({
  title: '',
  description: '',
  category_id: '',
  is_public: false,
  is_scheduled: false,
  schedule_frequency: 'daily',
  schedule_time: '09:00',
  parameters: []
})

// Computed properties
const report = computed(() => {
  const id = props.reportId || route.params.id
  return reportsStore.reports.find(r => r.id == id)
})

const reportCategories = computed(() => reportsStore.reportCategories)

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.category_id && 
         !Object.keys(errors.value).length
})

// Methods
const loadReport = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const id = props.reportId || route.params.id
    await reportsStore.fetchReport(id)
    await reportsStore.fetchReportCategories()
    
    // Populate form with report data
    if (report.value) {
      form.value = {
        title: report.value.title || '',
        description: report.value.description || '',
        category_id: report.value.category?.id || '',
        is_public: report.value.is_public || false,
        is_scheduled: report.value.is_scheduled || false,
        schedule_frequency: report.value.schedule_frequency || 'daily',
        schedule_time: report.value.schedule_time || '09:00',
        parameters: report.value.parameters || []
      }
    }
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء تحميل التقرير'
  } finally {
    isLoading.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'عنوان التقرير مطلوب'
  }
  
  if (!form.value.category_id) {
    errors.value.category_id = 'تصنيف التقرير مطلوب'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveReport = async () => {
  if (!validateForm()) return
  
  try {
    isSaving.value = true
    error.value = null
    
    const id = props.reportId || route.params.id
    await reportsStore.updateReport(id, form.value)
    
    // Navigate back to report detail
    router.push(`/reports/${id}`)
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء حفظ التقرير'
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  router.back()
}

const goBack = () => {
  router.back()
}

const addParameter = () => {
  form.value.parameters.push({
    name: '',
    label: '',
    type: 'text',
    default: ''
  })
}

const removeParameter = (index) => {
  form.value.parameters.splice(index, 1)
}

// Lifecycle
onMounted(() => {
  loadReport()
})
</script>

<style scoped>
@import '@/assets/css/reports/reportEdit.css';
</style>
