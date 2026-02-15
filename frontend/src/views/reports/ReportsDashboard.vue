<template>
  <div class="reports-dashboard">
    <!-- Header -->
    <div class="reports-dashboard-header">
      <div class="reports-dashboard-title">
        <h1 class="reports-dashboard-title-text">التقارير والتحليلات</h1>
        <p class="reports-dashboard-title-description">إدارة وتوليد التقارير الشاملة للمستشفى</p>
      </div>
      <div class="reports-dashboard-actions">
        <button 
          class="reports-dashboard-action-btn reports-dashboard-action-btn-primary"
          @click="openReportBuilder"
        >
          <svg class="reports-dashboard-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إنشاء تقرير جديد
        </button>
        <button 
          class="reports-dashboard-action-btn reports-dashboard-action-btn-secondary"
          @click="refreshData"
        >
          <svg class="reports-dashboard-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="reports-dashboard-stats">
      <div class="reports-dashboard-stat-card">
        <div class="reports-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="reports-dashboard-stat-card-content">
          <h3 class="reports-dashboard-stat-card-title">إجمالي التقارير</h3>
          <p class="reports-dashboard-stat-card-value">{{ reportStats?.total || 0 }}</p>
        </div>
      </div>

      <div class="reports-dashboard-stat-card">
        <div class="reports-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="reports-dashboard-stat-card-content">
          <h3 class="reports-dashboard-stat-card-title">التقارير المجدولة</h3>
          <p class="reports-dashboard-stat-card-value">{{ reportStats?.scheduled || 0 }}</p>
        </div>
      </div>

      <div class="reports-dashboard-stat-card">
        <div class="reports-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="reports-dashboard-stat-card-content">
          <h3 class="reports-dashboard-stat-card-title">التقارير العامة</h3>
          <p class="reports-dashboard-stat-card-value">{{ reportStats?.public || 0 }}</p>
        </div>
      </div>

      <div class="reports-dashboard-stat-card">
        <div class="reports-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div class="reports-dashboard-stat-card-content">
          <h3 class="reports-dashboard-stat-card-title">التوليدات الأخيرة</h3>
          <p class="reports-dashboard-stat-card-value">{{ reportStats?.recent || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="reports-dashboard-filters">
      <div class="reports-dashboard-filter-group">
        <label class="reports-dashboard-filter-label">الفئة</label>
        <select 
          class="reports-dashboard-filter-select"
          v-model="selectedReportType"
          @change="applyFilters"
        >
          <option value="all">جميع الفئات</option>
          <option 
            v-for="category in reportCategories" 
            :key="category?.id" 
            :value="category?.id"
          >
            {{ category?.name || 'غير محدد' }}
          </option>
        </select>
      </div>

      <div class="reports-dashboard-filter-group">
        <label class="reports-dashboard-filter-label">النوع</label>
        <select 
          class="reports-dashboard-filter-select"
          v-model="filters.type"
          @change="applyFilters"
        >
          <option value="">جميع الأنواع</option>
          <option value="standard">عادي</option>
          <option value="custom">مخصص</option>
          <option value="scheduled">مجدول</option>
        </select>
      </div>

      <div class="reports-dashboard-filter-group">
        <label class="reports-dashboard-filter-label">البحث</label>
        <input 
          type="text"
          class="reports-dashboard-filter-input"
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="البحث في التقارير..."
        />
      </div>
    </div>

    <!-- Reports Grid -->
    <div class="reports-dashboard-grid">
      <div 
        v-for="report in filteredReports" 
        :key="report?.id"
        class="reports-dashboard-card"
      >
        <div class="reports-dashboard-card-header">
          <div class="reports-dashboard-card-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="reports-dashboard-card-actions">
            <button 
              class="reports-dashboard-card-action"
              @click="generateReport(report?.type || 'standard', { report_id: report?.id })"
              :disabled="isGeneratingReport"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
            <button 
              class="reports-dashboard-card-action"
              @click="editReport(report)"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              class="reports-dashboard-card-action"
              @click="deleteReport(report)"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="reports-dashboard-card-content">
          <h3 class="reports-dashboard-card-title">{{ report?.title || 'تقرير غير محدد' }}</h3>
          <p class="reports-dashboard-card-description">{{ report?.description || 'لا يوجد وصف' }}</p>
          
          <div class="reports-dashboard-card-meta">
            <span class="reports-dashboard-card-meta-item">
              <svg class="reports-dashboard-card-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              {{ report?.category?.name || 'غير مصنف' }}
            </span>
            <span class="reports-dashboard-card-meta-item">
              <svg class="reports-dashboard-card-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ report?.generation_count || 0 }} توليد
            </span>
          </div>
        </div>

        <div class="reports-dashboard-card-footer">
          <div class="reports-dashboard-card-status">
            <span 
              class="reports-dashboard-card-status-badge"
              :class="getStatusClass(report)"
            >
              {{ getStatusText(report) }}
            </span>
          </div>
          <div class="reports-dashboard-card-date">
            {{ formatDate(report?.last_generated_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="reports-dashboard-loading">
      <div class="reports-dashboard-loading-spinner"></div>
      <p class="reports-dashboard-loading-text">جاري تحميل التقارير...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredReports.length === 0" class="reports-dashboard-empty">
      <div class="reports-dashboard-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <h3 class="reports-dashboard-empty-title">لا توجد تقارير</h3>
      <p class="reports-dashboard-empty-description">ابدأ بإنشاء تقرير جديد أو استخدم القوالب المتاحة</p>
      <button 
        class="reports-dashboard-empty-action"
        @click="openReportBuilder"
      >
        إنشاء تقرير جديد
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReportsManager } from '@/scripts/reports/reportsManager'
import '@/assets/css/reports.css'

// Use the reports manager
const {
  isLoading,
  selectedReportType,
  searchQuery,
  isGeneratingReport,
  filteredReports,
  reportStats,
  reportCategories,
  generateReport,
  navigateToCreateReport,
  navigateToReport,
  refreshData
} = useReportsManager()

// Local reactive state
const filters = ref({
  type: ''
})

// Local methods for template
const openReportBuilder = () => {
  navigateToCreateReport()
}

const editReport = (report) => {
  if (report?.id) {
    navigateToReport(report.id)
  }
}

const deleteReport = async (report) => {
  if (report?.id && confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
    try {
      // This would call the delete method from the manager
      console.log('Deleting report:', report.id)
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }
}

const applyFilters = () => {
  // Filters are handled by the manager
}

const debouncedSearch = () => {
  // Search is handled by the manager
}

const getStatusClass = (report) => {
  if (!report) return 'reports-dashboard-card-status-badge-private'
  if (report.is_scheduled) return 'reports-dashboard-card-status-badge-scheduled'
  if (report.is_public) return 'reports-dashboard-card-status-badge-public'
  return 'reports-dashboard-card-status-badge-private'
}

const getStatusText = (report) => {
  if (!report) return 'غير محدد'
  if (report.is_scheduled) return 'مجدول'
  if (report.is_public) return 'عام'
  return 'خاص'
}

const formatDate = (date) => {
  if (!date) return 'لم يتم التوليد'
  return new Date(date).toLocaleDateString('ar-SA')
}
</script>

<style scoped>
@import '@/assets/css/reports/reportsDashboard.css';
</style>
