<template>
  <div class="report-builder">
    <!-- Header -->
    <div class="report-builder-header">
      <div class="report-builder-title">
        <h1 class="report-builder-title-text">منشئ التقارير</h1>
        <p class="report-builder-title-description">إنشاء تقرير جديد مخصص</p>
      </div>
      <div class="report-builder-actions">
        <button 
          class="report-builder-action-btn report-builder-action-btn-secondary"
          @click="goBack"
        >
          <svg class="report-builder-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          العودة
        </button>
        <button 
          class="report-builder-action-btn report-builder-action-btn-primary"
          @click="saveReport"
          :disabled="!isFormValid || isSaving"
        >
          <svg class="report-builder-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ isSaving ? 'جاري الحفظ...' : 'حفظ التقرير' }}
        </button>
      </div>
    </div>

    <!-- Form -->
    <div class="report-builder-form">
      <div class="report-builder-form-section">
        <h2 class="report-builder-form-section-title">معلومات أساسية</h2>
        
        <div class="report-builder-form-group">
          <label class="report-builder-form-label">اسم التقرير *</label>
          <input 
            type="text"
            class="report-builder-form-input"
            v-model="reportForm.title"
            placeholder="أدخل اسم التقرير"
            :class="{ 'report-builder-form-input-error': errors.title }"
          />
          <span v-if="errors.title" class="report-builder-form-error">{{ errors.title }}</span>
        </div>

        <div class="report-builder-form-group">
          <label class="report-builder-form-label">وصف التقرير</label>
          <textarea 
            class="report-builder-form-textarea"
            v-model="reportForm.description"
            placeholder="أدخل وصف التقرير"
            rows="3"
          ></textarea>
        </div>

        <div class="report-builder-form-row">
          <div class="report-builder-form-group">
            <label class="report-builder-form-label">فئة التقرير *</label>
            <select 
              class="report-builder-form-select"
              v-model="reportForm.category_id"
              :class="{ 'report-builder-form-input-error': errors.category_id }"
            >
              <option value="">اختر الفئة</option>
              <option 
                v-for="category in reportCategories" 
                :key="category?.id" 
                :value="category?.id"
              >
                {{ category?.name || 'غير محدد' }}
              </option>
            </select>
            <span v-if="errors.category_id" class="report-builder-form-error">{{ errors.category_id }}</span>
          </div>

          <div class="report-builder-form-group">
            <label class="report-builder-form-label">نوع التقرير *</label>
            <select 
              class="report-builder-form-select"
              v-model="reportForm.type"
              :class="{ 'report-builder-form-input-error': errors.type }"
            >
              <option value="">اختر النوع</option>
              <option value="standard">عادي</option>
              <option value="custom">مخصص</option>
              <option value="scheduled">مجدول</option>
            </select>
            <span v-if="errors.type" class="report-builder-form-error">{{ errors.type }}</span>
          </div>
        </div>
      </div>

      <div class="report-builder-form-section">
        <h2 class="report-builder-form-section-title">إعدادات التقرير</h2>
        
        <div class="report-builder-form-row">
          <div class="report-builder-form-group">
            <label class="report-builder-form-label">نطاق البيانات</label>
            <select 
              class="report-builder-form-select"
              v-model="reportForm.data_range"
            >
              <option value="all">جميع البيانات</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">هذا الربع</option>
              <option value="year">هذا العام</option>
              <option value="custom">مخصص</option>
            </select>
          </div>

          <div class="report-builder-form-group" v-if="reportForm.data_range === 'custom'">
            <label class="report-builder-form-label">تاريخ البداية</label>
            <input 
              type="date"
              class="report-builder-form-input"
              v-model="reportForm.start_date"
            />
          </div>

          <div class="report-builder-form-group" v-if="reportForm.data_range === 'custom'">
            <label class="report-builder-form-label">تاريخ النهاية</label>
            <input 
              type="date"
              class="report-builder-form-input"
              v-model="reportForm.end_date"
            />
          </div>
        </div>

        <div class="report-builder-form-row">
          <div class="report-builder-form-group">
            <label class="report-builder-form-label">تنسيق التقرير</label>
            <select 
              class="report-builder-form-select"
              v-model="reportForm.format"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div class="report-builder-form-group">
            <label class="report-builder-form-label">اللغة</label>
            <select 
              class="report-builder-form-select"
              v-model="reportForm.language"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div class="report-builder-form-section">
        <h2 class="report-builder-form-section-title">الحقول المطلوبة</h2>
        
        <div class="report-builder-fields">
          <div 
            v-for="(field, index) in reportForm.fields" 
            :key="index"
            class="report-builder-field"
          >
            <div class="report-builder-field-header">
              <h3 class="report-builder-field-title">حقل {{ index + 1 }}</h3>
              <button 
                class="report-builder-field-remove"
                @click="removeField(index)"
                type="button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="report-builder-form-row">
              <div class="report-builder-form-group">
                <label class="report-builder-form-label">اسم الحقل</label>
                <input 
                  type="text"
                  class="report-builder-form-input"
                  v-model="field.name"
                  placeholder="اسم الحقل"
                />
              </div>
              
              <div class="report-builder-form-group">
                <label class="report-builder-form-label">نوع الحقل</label>
                <select 
                  class="report-builder-form-select"
                  v-model="field.type"
                >
                  <option value="text">نص</option>
                  <option value="number">رقم</option>
                  <option value="date">تاريخ</option>
                  <option value="boolean">نعم/لا</option>
                  <option value="select">قائمة</option>
                </select>
              </div>
            </div>

            <div class="report-builder-form-group">
              <label class="report-builder-form-label">وصف الحقل</label>
              <input 
                type="text"
                class="report-builder-form-input"
                v-model="field.description"
                placeholder="وصف الحقل"
              />
            </div>

            <div class="report-builder-form-group" v-if="field.type === 'select'">
              <label class="report-builder-form-label">خيارات القائمة</label>
              <input 
                type="text"
                class="report-builder-form-input"
                v-model="field.options"
                placeholder="خيار1, خيار2, خيار3"
              />
            </div>
          </div>
        </div>

        <button 
          class="report-builder-add-field"
          @click="addField"
          type="button"
        >
          <svg class="report-builder-add-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة حقل
        </button>
      </div>

      <div class="report-builder-form-section">
        <h2 class="report-builder-form-section-title">إعدادات إضافية</h2>
        
        <div class="report-builder-form-group">
          <label class="report-builder-form-checkbox">
            <input 
              type="checkbox"
              v-model="reportForm.is_public"
            />
            <span class="report-builder-form-checkbox-text">تقرير عام (يمكن للجميع الوصول إليه)</span>
          </label>
        </div>

        <div class="report-builder-form-group">
          <label class="report-builder-form-checkbox">
            <input 
              type="checkbox"
              v-model="reportForm.is_scheduled"
            />
            <span class="report-builder-form-checkbox-text">تقرير مجدول</span>
          </label>
        </div>

        <div class="report-builder-form-group" v-if="reportForm.is_scheduled">
          <label class="report-builder-form-label">تكرار التقرير</label>
          <select 
            class="report-builder-form-select"
            v-model="reportForm.schedule_frequency"
          >
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="quarterly">ربعي</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>

        <div class="report-builder-form-group">
          <label class="report-builder-form-label">ملاحظات</label>
          <textarea 
            class="report-builder-form-textarea"
            v-model="reportForm.notes"
            placeholder="أي ملاحظات إضافية"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="report-builder-preview">
      <h2 class="report-builder-preview-title">معاينة التقرير</h2>
      <div class="report-builder-preview-content">
        <div class="report-builder-preview-header">
          <h3 class="report-builder-preview-report-title">{{ reportForm.title || 'اسم التقرير' }}</h3>
          <p class="report-builder-preview-report-description">{{ reportForm.description || 'وصف التقرير' }}</p>
        </div>
        
        <div class="report-builder-preview-fields">
          <div 
            v-for="(field, index) in reportForm.fields" 
            :key="index"
            class="report-builder-preview-field"
          >
            <label class="report-builder-preview-field-label">{{ field.name || `حقل ${index + 1}` }}</label>
            <div class="report-builder-preview-field-value">
              <span v-if="field.type === 'text'">نص</span>
              <span v-else-if="field.type === 'number'">123</span>
              <span v-else-if="field.type === 'date'">2024-01-01</span>
              <span v-else-if="field.type === 'boolean'">نعم</span>
              <span v-else-if="field.type === 'select'">{{ field.options?.split(',')[0] || 'خيار' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isSaving" class="report-builder-loading">
      <div class="report-builder-loading-spinner"></div>
      <p class="report-builder-loading-text">جاري حفظ التقرير...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsManager } from '@/scripts/reports/reportsManager'
import '@/assets/css/reports.css'

const router = useRouter()

// Use the reports manager
const {
  reportCategories
} = useReportsManager()

// Local reactive state
const isSaving = ref(false)
const errors = ref({})

const reportForm = ref({
  title: '',
  description: '',
  category_id: '',
  type: '',
  data_range: 'all',
  start_date: '',
  end_date: '',
  format: 'pdf',
  language: 'ar',
  fields: [
    {
      name: '',
      type: 'text',
      description: '',
      options: ''
    }
  ],
  is_public: false,
  is_scheduled: false,
  schedule_frequency: 'daily',
  notes: ''
})

// Computed properties
const isFormValid = computed(() => {
  return reportForm.value.title && 
         reportForm.value.category_id && 
         reportForm.value.type &&
         reportForm.value.fields.some(field => field.name)
})

// Methods
const goBack = () => {
  router.go(-1)
}

const saveReport = async () => {
  if (!isFormValid.value) return

  try {
    isSaving.value = true
    errors.value = {}

    // Validate form
    if (!reportForm.value.title) {
      errors.value.title = 'اسم التقرير مطلوب'
    }
    if (!reportForm.value.category_id) {
      errors.value.category_id = 'فئة التقرير مطلوبة'
    }
    if (!reportForm.value.type) {
      errors.value.type = 'نوع التقرير مطلوب'
    }

    if (Object.keys(errors.value).length > 0) {
      return
    }

    // Save report
    console.log('Saving report:', reportForm.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Navigate back to reports list
    router.push('/reports')
  } catch (error) {
    console.error('Error saving report:', error)
  } finally {
    isSaving.value = false
  }
}

const addField = () => {
  reportForm.value.fields.push({
    name: '',
    type: 'text',
    description: '',
    options: ''
  })
}

const removeField = (index) => {
  if (reportForm.value.fields.length > 1) {
    reportForm.value.fields.splice(index, 1)
  }
}

// Lifecycle
onMounted(() => {
  // Initialize form if needed
})
</script>

<style scoped>
@import '@/assets/css/reports/reportBuilder.css';
</style>
