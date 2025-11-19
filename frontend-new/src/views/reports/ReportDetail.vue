    <template>
  <div class="report-detail-container">
    <!-- Header -->
    <div class="report-detail-header">
      <div class="report-detail-title-section">
        <button 
          @click="goBack" 
          class="report-detail-back-btn"
          :title="'العودة للقائمة'"
        >
          <svg class="report-detail-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="report-detail-title">{{ report?.title || 'تفاصيل التقرير' }}</h1>
      </div>
      
      <div class="report-detail-actions">
        <button 
          @click="editReport" 
          class="report-detail-action-btn report-detail-edit-btn"
          :disabled="!canEdit"
        >
          <svg class="report-detail-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          تعديل
        </button>
        
        <button 
          @click="generateReport" 
          class="report-detail-action-btn report-detail-generate-btn"
          :disabled="isGenerating"
        >
          <svg 
            v-if="!isGenerating"
            class="report-detail-action-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <svg 
            v-else
            class="report-detail-action-icon report-detail-spinning" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isGenerating ? 'جاري التوليد...' : 'توليد التقرير' }}
        </button>
        
        <button 
          @click="downloadReport" 
          class="report-detail-action-btn report-detail-download-btn"
          :disabled="!report?.last_generated_at"
        >
          <svg class="report-detail-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          تحميل
        </button>
      </div>
    </div>

    <!-- Report Information -->
    <div class="report-detail-info">
      <div class="report-detail-info-grid">
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">نوع التقرير:</label>
          <span class="report-detail-info-value">{{ report?.type || 'غير محدد' }}</span>
        </div>
        
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">التصنيف:</label>
          <span class="report-detail-info-value">{{ report?.category?.name || 'غير مصنف' }}</span>
        </div>
        
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">تاريخ الإنشاء:</label>
          <span class="report-detail-info-value">{{ formatDate(report?.created_at) }}</span>
        </div>
        
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">آخر توليد:</label>
          <span class="report-detail-info-value">{{ formatDate(report?.last_generated_at) || 'لم يتم التوليد بعد' }}</span>
        </div>
        
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">عدد مرات التوليد:</label>
          <span class="report-detail-info-value">{{ report?.generation_count || 0 }}</span>
        </div>
        
        <div class="report-detail-info-item">
          <label class="report-detail-info-label">الحالة:</label>
          <span 
            class="report-detail-info-value report-detail-status"
            :class="getStatusClass(report)"
          >
            {{ getStatusText(report) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Report Description -->
    <div class="report-detail-description">
      <h3 class="report-detail-description-title">وصف التقرير</h3>
      <p class="report-detail-description-text">
        {{ report?.description || 'لا يوجد وصف متاح لهذا التقرير.' }}
      </p>
    </div>

    <!-- Report Parameters -->
    <div v-if="report?.parameters && report.parameters.length > 0" class="report-detail-parameters">
      <h3 class="report-detail-parameters-title">معاملات التقرير</h3>
      <div class="report-detail-parameters-list">
        <div 
          v-for="param in report.parameters" 
          :key="param.name"
          class="report-detail-parameter-item"
        >
          <label class="report-detail-parameter-label">{{ param.label }}:</label>
          <span class="report-detail-parameter-value">{{ param.value || param.default || 'غير محدد' }}</span>
        </div>
      </div>
    </div>

    <!-- Report History -->
    <div class="report-detail-history">
      <h3 class="report-detail-history-title">تاريخ التوليد</h3>
      <div v-if="reportHistory.length > 0" class="report-detail-history-list">
        <div 
          v-for="history in reportHistory" 
          :key="history.id"
          class="report-detail-history-item"
        >
          <div class="report-detail-history-info">
            <span class="report-detail-history-date">{{ formatDate(history.generated_at) }}</span>
            <span class="report-detail-history-user">بواسطة: {{ history.generated_by?.name || 'مستخدم غير معروف' }}</span>
          </div>
          <div class="report-detail-history-actions">
            <button 
              @click="downloadHistoryReport(history.id)"
              class="report-detail-history-download-btn"
            >
              <svg class="report-detail-history-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              تحميل
            </button>
          </div>
        </div>
      </div>
      <div v-else class="report-detail-history-empty">
        <svg class="report-detail-history-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="report-detail-history-empty-text">لا يوجد تاريخ توليد متاح</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="report-detail-loading">
      <div class="report-detail-loading-spinner"></div>
      <p class="report-detail-loading-text">جاري تحميل تفاصيل التقرير...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="report-detail-error">
      <svg class="report-detail-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="report-detail-error-text">{{ error }}</p>
      <button @click="loadReport" class="report-detail-error-retry-btn">
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
const isGenerating = ref(false)
const error = ref(null)
const reportHistory = ref([])

// Computed properties
const report = computed(() => {
  const id = props.reportId || route.params.id
  return reportsStore.reports.find(r => r.id == id)
})

const canEdit = computed(() => {
  return report.value && report.value.type !== 'system'
})

// Methods
const loadReport = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const id = props.reportId || route.params.id
    await reportsStore.fetchReport(id)
    await loadReportHistory(id)
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء تحميل التقرير'
  } finally {
    isLoading.value = false
  }
}

const loadReportHistory = async () => {
  try {
    // This would typically call an API endpoint
    // For now, we'll use mock data
    reportHistory.value = [
      {
        id: 1,
        generated_at: new Date().toISOString(),
        generated_by: { name: 'أحمد محمد' }
      }
    ]
  } catch (err) {
    console.error('Error loading report history:', err)
  }
}

const goBack = () => {
  router.back()
}

const editReport = () => {
  if (report.value) {
    router.push(`/reports/${report.value.id}/edit`)
  }
}

const generateReport = async () => {
  try {
    isGenerating.value = true
    error.value = null
    
    const id = props.reportId || route.params.id
    await reportsStore.generateReport(id)
    
    // Reload the report to get updated data
    await loadReport()
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء توليد التقرير'
  } finally {
    isGenerating.value = false
  }
}

const downloadReport = async () => {
  try {
    const id = props.reportId || route.params.id
    await reportsStore.downloadReport(id)
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء تحميل التقرير'
  }
}

const downloadHistoryReport = async (historyId) => {
  try {
    await reportsStore.downloadReportHistory(historyId)
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء تحميل التقرير'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'تاريخ غير صحيح'
  }
}

const getStatusClass = (report) => {
  if (!report) return 'report-detail-status-unknown'
  
  if (report.is_scheduled) return 'report-detail-status-scheduled'
  if (report.is_public) return 'report-detail-status-public'
  return 'report-detail-status-private'
}

const getStatusText = (report) => {
  if (!report) return 'غير محدد'
  
  if (report.is_scheduled) return 'مجدول'
  if (report.is_public) return 'عام'
  return 'خاص'
}

// Lifecycle
onMounted(() => {
  loadReport()
})
</script>

<style scoped>
@import '@/assets/css/reports/reportDetail.css';
</style>
