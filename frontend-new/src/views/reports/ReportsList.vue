<template>
  <div class="reports-list">
    <!-- Header -->
    <div class="reports-list-header">
      <div class="reports-list-title">
        <h1 class="reports-list-title-text">قائمة التقارير</h1>
        <p class="reports-list-title-description">إدارة وعرض جميع التقارير المتاحة</p>
      </div>
      <div class="reports-list-actions">
        <button 
          class="reports-list-action-btn reports-list-action-btn-primary"
          @click="openReportBuilder"
        >
          <svg class="reports-list-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إنشاء تقرير جديد
        </button>
        <button 
          class="reports-list-action-btn reports-list-action-btn-secondary"
          @click="refreshData"
        >
          <svg class="reports-list-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="reports-list-filters">
      <div class="reports-list-filter-group">
        <label class="reports-list-filter-label">البحث</label>
        <input 
          type="text"
          class="reports-list-filter-input"
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="البحث في التقارير..."
        />
      </div>

      <div class="reports-list-filter-group">
        <label class="reports-list-filter-label">الفئة</label>
        <select 
          class="reports-list-filter-select"
          v-model="selectedCategory"
          @change="applyFilters"
        >
          <option value="">جميع الفئات</option>
          <option 
            v-for="category in reportCategories" 
            :key="category?.id" 
            :value="category?.id"
          >
            {{ category?.name || 'غير محدد' }}
          </option>
        </select>
      </div>

      <div class="reports-list-filter-group">
        <label class="reports-list-filter-label">النوع</label>
        <select 
          class="reports-list-filter-select"
          v-model="selectedType"
          @change="applyFilters"
        >
          <option value="">جميع الأنواع</option>
          <option value="standard">عادي</option>
          <option value="custom">مخصص</option>
          <option value="scheduled">مجدول</option>
        </select>
      </div>

      <div class="reports-list-filter-group">
        <label class="reports-list-filter-label">الحالة</label>
        <select 
          class="reports-list-filter-select"
          v-model="selectedStatus"
          @change="applyFilters"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="scheduled">مجدول</option>
        </select>
      </div>

      <div class="reports-list-filter-actions">
        <button 
          class="reports-list-filter-btn reports-list-filter-btn-clear"
          @click="clearFilters"
        >
          مسح الفلاتر
        </button>
        <button 
          class="reports-list-filter-btn reports-list-filter-btn-export"
          @click="exportReports"
        >
          تصدير
        </button>
      </div>
    </div>

    <!-- Reports Table -->
    <div class="reports-list-table-container">
      <table class="reports-list-table">
        <thead class="reports-list-table-header">
          <tr>
            <th class="reports-list-table-th">
              <input 
                type="checkbox" 
                class="reports-list-checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
              />
            </th>
            <th class="reports-list-table-th" @click="sortByField('title')">
              <div class="reports-list-table-th-content">
                اسم التقرير
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th" @click="sortByField('category')">
              <div class="reports-list-table-th-content">
                الفئة
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th" @click="sortByField('type')">
              <div class="reports-list-table-th-content">
                النوع
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th" @click="sortByField('status')">
              <div class="reports-list-table-th-content">
                الحالة
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th" @click="sortByField('generation_count')">
              <div class="reports-list-table-th-content">
                عدد التوليدات
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th" @click="sortByField('last_generated_at')">
              <div class="reports-list-table-th-content">
                آخر توليد
                <svg class="reports-list-sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </th>
            <th class="reports-list-table-th">الإجراءات</th>
          </tr>
        </thead>
        <tbody class="reports-list-table-body">
          <tr 
            v-for="report in paginatedReports" 
            :key="report?.id"
            class="reports-list-table-row"
            :class="{ 'reports-list-table-row-selected': selectedReports.includes(report?.id) }"
          >
            <td class="reports-list-table-td">
              <input 
                type="checkbox" 
                class="reports-list-checkbox"
                :value="report?.id"
                v-model="selectedReports"
              />
            </td>
            <td class="reports-list-table-td">
              <div class="reports-list-report-info">
                <div class="reports-list-report-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="reports-list-report-details">
                  <h3 class="reports-list-report-title">{{ report?.title || 'تقرير غير محدد' }}</h3>
                  <p class="reports-list-report-description">{{ report?.description || 'لا يوجد وصف' }}</p>
                </div>
              </div>
            </td>
            <td class="reports-list-table-td">
              <span class="reports-list-category-badge">
                {{ report?.category?.name || 'غير مصنف' }}
              </span>
            </td>
            <td class="reports-list-table-td">
              <span class="reports-list-type-badge" :class="getTypeClass(report?.type)">
                {{ getTypeText(report?.type) }}
              </span>
            </td>
            <td class="reports-list-table-td">
              <span class="reports-list-status-badge" :class="getStatusClass(report)">
                {{ getStatusText(report) }}
              </span>
            </td>
            <td class="reports-list-table-td">
              <span class="reports-list-count">{{ report?.generation_count || 0 }}</span>
            </td>
            <td class="reports-list-table-td">
              <span class="reports-list-date">{{ formatDate(report?.last_generated_at) }}</span>
            </td>
            <td class="reports-list-table-td">
              <div class="reports-list-actions">
                <button 
                  class="reports-list-action reports-list-action-generate"
                  @click="generateReport(report)"
                  :disabled="isGeneratingReport"
                  title="توليد التقرير"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </button>
                <button 
                  class="reports-list-action reports-list-action-edit"
                  @click="editReport(report)"
                  title="تعديل التقرير"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button 
                  class="reports-list-action reports-list-action-download"
                  @click="downloadReport(report)"
                  title="تحميل التقرير"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </button>
                <button 
                  class="reports-list-action reports-list-action-delete"
                  @click="deleteReport(report)"
                  title="حذف التقرير"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="reports-list-pagination">
      <div class="reports-list-pagination-info">
        <span class="reports-list-pagination-text">
          عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredReports.length) }} من {{ filteredReports.length }} تقرير
        </span>
      </div>
      <div class="reports-list-pagination-controls">
        <button 
          class="reports-list-pagination-btn"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          السابق
        </button>
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="reports-list-pagination-btn"
          :class="{ 'reports-list-pagination-btn-active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button 
          class="reports-list-pagination-btn"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          التالي
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="reports-list-loading">
      <div class="reports-list-loading-spinner"></div>
      <p class="reports-list-loading-text">جاري تحميل التقارير...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredReports.length === 0" class="reports-list-empty">
      <div class="reports-list-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <h3 class="reports-list-empty-title">لا توجد تقارير</h3>
      <p class="reports-list-empty-description">ابدأ بإنشاء تقرير جديد أو استخدم الفلاتر للبحث</p>
      <button 
        class="reports-list-empty-action"
        @click="openReportBuilder"
      >
        إنشاء تقرير جديد
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportsManager } from '@/scripts/reports/reportsManager'

// Use the reports manager
const {
  isLoading,
  searchQuery,
  isGeneratingReport,
  filteredReports,
  reportCategories,
  generateReport,
  downloadReport,
  navigateToCreateReport,
  navigateToReport,
  refreshData
} = useReportsManager()

// Local reactive state
const selectedReports = ref([])
const selectedCategory = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const selectAll = ref(false)

// Computed properties
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredReports.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
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
      console.log('Deleting report:', report.id)
      // This would call the delete method from the manager
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are handled by the manager
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

const exportReports = () => {
  console.log('Exporting reports:', selectedReports.value)
}

const debouncedSearch = () => {
  currentPage.value = 1
  // Search is handled by the manager
}

const sortByField = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedReports.value = paginatedReports.value.map(report => report?.id).filter(Boolean)
  } else {
    selectedReports.value = []
  }
}

const getTypeClass = (type) => {
  const typeClasses = {
    standard: 'reports-list-type-badge-standard',
    custom: 'reports-list-type-badge-custom',
    scheduled: 'reports-list-type-badge-scheduled'
  }
  return typeClasses[type] || 'reports-list-type-badge-standard'
}

const getTypeText = (type) => {
  const typeTexts = {
    standard: 'عادي',
    custom: 'مخصص',
    scheduled: 'مجدول'
  }
  return typeTexts[type] || 'عادي'
}

const getStatusClass = (report) => {
  if (!report) return 'reports-list-status-badge-inactive'
  if (report.is_scheduled) return 'reports-list-status-badge-scheduled'
  if (report.is_public) return 'reports-list-status-badge-active'
  return 'reports-list-status-badge-inactive'
}

const getStatusText = (report) => {
  if (!report) return 'غير نشط'
  if (report.is_scheduled) return 'مجدول'
  if (report.is_public) return 'نشط'
  return 'غير نشط'
}

const formatDate = (date) => {
  if (!date) return 'لم يتم التوليد'
  return new Date(date).toLocaleDateString('ar-SA')
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
@import '@/assets/css/reports/reportsList.css';
</style>
