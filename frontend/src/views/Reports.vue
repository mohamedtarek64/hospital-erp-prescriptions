<template>
  <div class="reports-page">
    <div class="page-header">
      <h1 class="page-title">التقارير والإحصائيات</h1>
      <p class="page-subtitle">تقارير شاملة عن أداء المستشفى</p>
    </div>

    <div class="reports-content">
      <!-- Error Message -->
      <div v-if="error" class="alert alert-error mb-4">
        <div class="alert-content">
          <i class="fas fa-exclamation-circle"></i>
          <div class="alert-text">
            <strong>خطأ في التحميل</strong>
            <p>{{ error }}</p>
          </div>
        </div>
        <button @click="clearError" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success mb-4">
        <div class="alert-content">
          <i class="fas fa-check-circle"></i>
          <div class="alert-text">
            <strong>تم بنجاح</strong>
            <p>{{ successMessage }}</p>
          </div>
        </div>
        <button @click="clearSuccess" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي التقارير</h3>
            <p class="stat-number">{{ reportsStats.totalReports }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>منشورة</h3>
            <p class="stat-number">{{ reportsStats.publishedReports }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-edit"></i>
          </div>
          <div class="stat-content">
            <h3>مسودات</h3>
            <p class="stat-number">{{ reportsStats.draftReports }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>مجدولة</h3>
            <p class="stat-number">{{ reportsStats.activeSchedules }}</p>
          </div>
        </div>
            </div>

      <div class="reports-table-container">
        <div class="table-header">
          <h2>قائمة التقارير</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportReports" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddReportModal = true">
              <i class="fas fa-plus"></i>
              إنشاء تقرير جديد
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن تقرير..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedCategory" @change="handleFilterChange">
            <option value="">جميع الفئات</option>
            <option value="financial">مالي</option>
            <option value="medical">طبي</option>
            <option value="operational">تشغيلي</option>
            <option value="administrative">إداري</option>
            <option value="statistical">إحصائي</option>
          </select>
          <select class="filter-select" v-model="selectedStatus" @change="handleFilterChange">
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
            <option value="archived">مؤرشف</option>
          </select>
          <select class="filter-select" v-model="selectedDateRange" @change="handleFilterChange">
            <option value="">جميع التواريخ</option>
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>
          <button class="btn btn-secondary" @click="clearFilters">
            <i class="fas fa-times"></i>
            مسح الفلاتر
          </button>
        </div>

        <div class="table-wrapper">
          <div v-if="loading && reports.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredReports.length === 0 && !loading" class="empty-state">
            <i class="fas fa-chart-bar"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على تقارير مطابقة للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
          </div>
          
          <div v-else class="reports-grid">
            <div class="report-card" v-for="report in paginatedReports" :key="report.id">
              <div class="report-header">
                <div class="report-title">
                  <h3>{{ report.title }}</h3>
                  <span class="report-category" :class="getCategoryClass(report.category)">
                    {{ getCategoryText(report.category) }}
                  </span>
                </div>
                <div class="report-status">
                  <span class="status-badge" :class="getStatusClass(report.status)">
                    {{ getStatusText(report.status) }}
                  </span>
                </div>
              </div>
              
              <div class="report-body">
                <p class="report-description">{{ report.description }}</p>
                <div class="report-meta">
                  <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>{{ formatDate(report.created_at) }}</span>
                  </div>
                  <div class="meta-item" v-if="report.file_size">
                    <i class="fas fa-file"></i>
                    <span>{{ formatFileSize(report.file_size) }}</span>
                  </div>
                  <div class="meta-item" v-if="report.views">
                    <i class="fas fa-eye"></i>
                    <span>{{ report.views }} مشاهدة</span>
                  </div>
                </div>
              </div>
              
              <div class="report-actions">
                <button class="btn-icon" title="عرض" @click="viewReport(report.id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" title="تعديل" @click="editReport(report.id)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-success" title="تحميل" @click="downloadReport(report.id)">
                  <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon btn-primary" title="مشاركة" @click="shareReport(report.id)">
                  <i class="fas fa-share"></i>
                </button>
                <button v-if="report.status === 'draft'" class="btn-icon btn-success" title="نشر" @click="publishReport(report.id)">
                  <i class="fas fa-publish"></i>
                </button>
                <button v-if="report.status === 'published'" class="btn-icon btn-warning" title="إلغاء النشر" @click="unpublishReport(report.id)">
                  <i class="fas fa-unpublish"></i>
                </button>
                <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteReport(report.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredReports.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredReports.length) }} من {{ filteredReports.length }} نتيجة
          </div>
          <div class="pagination-controls">
            <button
              class="btn btn-sm"
              :disabled="currentPage === 1"
              @click="currentPage = 1"
            >
              الأول
            </button>
            <button
              class="btn btn-sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              السابق
            </button>
            <span class="page-info">
              صفحة {{ currentPage }} من {{ totalPages }}
            </span>
            <button
              class="btn btn-sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              التالي
            </button>
            <button
              class="btn btn-sm"
              :disabled="currentPage === totalPages"
              @click="currentPage = totalPages"
            >
              الأخير
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>تأكيد الحذف</h3>
          <button @click="cancelDelete" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>هل أنت متأكد من حذف هذا التقرير؟ هذا الإجراء لا يمكن التراجع عنه.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-secondary">
            إلغاء
          </button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="loading">
            <i class="fas fa-trash"></i>
            حذف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ReportsView'
})

import { ref, computed, onMounted } from 'vue'
import { useReports } from '@/scripts/views/reports'

const {
  reports,
  reportTemplates,
  scheduledReports,
  loading,
  error,
  searchQuery,
  selectedCategory,
  selectedStatus,
  selectedDateRange,
  filteredReports,
  reportsStats,
  recentReports,
  popularReports,
  loadReportsData,
  addReport,
  updateReport,
  deleteReport,
  publishReport,
  unpublishReport,
  generateReport,
  downloadReport,
  shareReport,
  addReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  scheduleReport,
  updateScheduledReport,
  deleteScheduledReport,
  clearError,
  handleSearch,
  handleFilterChange,
  clearFilters,
  exportReports,
  formatDate,
  formatFileSize,
  getStatusText,
  getStatusClass,
  getCategoryText,
  getCategoryClass
} = useReports()

// Additional reactive data
const showAddReportModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(12)
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const reportToDelete = ref(null)

// Computed properties
const totalPages = computed(() => Math.ceil(filteredReports.value.length / itemsPerPage.value))

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredReports.value.slice(start, end)
})

// Methods
const viewReport = async (id) => {
  try {
    // Navigate to report details page
    console.log('View report:', id)
  } catch (error) {
    console.error('Error viewing report:', error)
  }
}

const editReport = async (id) => {
  try {
    // Navigate to report edit page
    console.log('Edit report:', id)
  } catch (error) {
    console.error('Error editing report:', error)
  }
}

const handleDeleteReport = async (id) => {
  reportToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!reportToDelete.value) return

  try {
    await deleteReport(reportToDelete.value)
    successMessage.value = 'تم حذف التقرير بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting report:', error)
  } finally {
    showDeleteConfirm.value = false
    reportToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  reportToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadReportsData()
})
</script>

<style scoped>
@import '@/assets/css/views/patients.css';

.reports-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.reports-content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content h3 {
  font-size: 0.9rem;
  margin-bottom: 5px;
  opacity: 0.9;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.reports-table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.table-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.table-filters {
  display: flex;
  gap: 15px;
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 200px;
}

.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.table-wrapper {
  padding: 30px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.report-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.report-title h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.report-category {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-financial {
  background: #e3f2fd;
  color: #1976d2;
}

.category-medical {
  background: #e8f5e8;
  color: #388e3c;
}

.category-operational {
  background: #fff3e0;
  color: #f57c00;
}

.category-administrative {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-statistical {
  background: #e0f2f1;
  color: #00695c;
}

.report-status {
  margin-left: 10px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-draft {
  background: #fff3cd;
  color: #856404;
}

.status-published {
  background: #d4edda;
  color: #155724;
}

.status-archived {
  background: #e2e3e5;
  color: #383d41;
}

.report-body {
  margin-bottom: 20px;
}

.report-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-size: 0.8rem;
}

.meta-item i {
  font-size: 0.75rem;
}

.report-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.btn-icon {
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  transform: translateY(-1px);
}

.btn-icon.btn-success {
  background: #28a745;
  color: white;
}

.btn-icon.btn-primary {
  background: #007bff;
  color: white;
}

.btn-icon.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-icon.btn-danger {
  background: #dc3545;
  color: white;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 10px;
}

.loading-state, .loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #495057;
}

.alert {
  padding: 15px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 30px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 30px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .reports-content {
    padding: 20px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .table-filters {
    flex-direction: column;
  }
  
  .search-input, .filter-select {
    min-width: auto;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .report-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .report-actions {
    justify-content: center;
  }
}
</style>
