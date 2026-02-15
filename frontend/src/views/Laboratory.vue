<template>
  <div class="laboratory-page">
    <div class="page-header">
      <h1 class="page-title">إدارة المختبر</h1>
      <p class="page-subtitle">إدارة الفحوصات المخبرية ونتائجها</p>
    </div>

    <div class="laboratory-content">
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
            <i class="fas fa-flask"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي الفحوصات</h3>
            <p class="stat-number">{{ laboratoryStats.totalTests }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>في الانتظار</h3>
            <p class="stat-number">{{ laboratoryStats.pendingTests }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-cogs"></i>
            </div>
          <div class="stat-content">
            <h3>قيد التنفيذ</h3>
            <p class="stat-number">{{ laboratoryStats.inProgressTests }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>مكتملة</h3>
            <p class="stat-number">{{ laboratoryStats.completedTests }}</p>
          </div>
        </div>
      </div>

      <div class="laboratory-table-container">
        <div class="table-header">
          <h2>قائمة الفحوصات</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportTests" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddTestModal = true">
              <i class="fas fa-plus"></i>
              إضافة فحص جديد
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن فحص..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedStatus" @change="handleFilterChange">
            <option value="">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <select class="filter-select" v-model="selectedTestType" @change="handleFilterChange">
            <option value="">جميع أنواع الفحوصات</option>
            <option value="blood">تحليل الدم</option>
            <option value="urine">تحليل البول</option>
            <option value="stool">تحليل البراز</option>
            <option value="culture">مزرعة</option>
          </select>
          <select class="filter-select" v-model="selectedPriority" @change="handleFilterChange">
            <option value="">جميع الأولويات</option>
            <option value="low">منخفض</option>
            <option value="normal">عادي</option>
            <option value="high">عالي</option>
            <option value="urgent">عاجل</option>
          </select>
          <button class="btn btn-secondary" @click="clearFilters">
            <i class="fas fa-times"></i>
            مسح الفلاتر
          </button>
        </div>

        <div class="table-wrapper">
          <div v-if="loading && tests.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredTests.length === 0 && !loading" class="empty-state">
            <i class="fas fa-flask"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على فحوصات مطابقة للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
          </div>
          
          <table v-else class="laboratory-table">
            <thead>
              <tr>
                <th @click="sortBy('id')" class="sortable">
                  الرقم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'id' && sortDirection === 'asc', 'fa-sort-down': sortField === 'id' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('test_name')" class="sortable">
                  نوع الفحص
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'test_name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'test_name' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('patient_name')" class="sortable">
                  المريض
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'patient_name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'patient_name' && sortDirection === 'desc'}"></i>
                </th>
                <th>الأولوية</th>
                <th @click="sortBy('created_at')" class="sortable">
                  التاريخ
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'created_at' && sortDirection === 'asc', 'fa-sort-down': sortField === 'created_at' && sortDirection === 'desc'}"></i>
                </th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="test in paginatedTests" :key="test.id">
                <td>{{ test.id }}</td>
                <td>
                  <div class="test-info">
                    <strong>{{ test.test_name }}</strong>
                    <small>{{ test.test_type }}</small>
                  </div>
                </td>
                <td>
                  <div class="patient-info">
                    <strong>{{ test.patient_name }}</strong>
                    <small>{{ test.patient_phone }}</small>
                  </div>
                </td>
                <td>
                  <span class="priority-badge" :class="getPriorityClass(test.priority)">
                    {{ getPriorityText(test.priority) }}
                  </span>
                </td>
                <td>{{ formatDate(test.created_at) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(test.status)">
                    {{ getStatusText(test.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="عرض" @click="viewTest(test.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="تعديل" @click="editTest(test.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button v-if="test.status === 'pending'" class="btn-icon btn-success" title="بدء الفحص" @click="startTest(test.id)">
                      <i class="fas fa-play"></i>
                    </button>
                    <button v-if="test.status === 'in_progress'" class="btn-icon btn-primary" title="إنهاء الفحص" @click="showCompleteModal(test)">
                      <i class="fas fa-check"></i>
                    </button>
                    <button v-if="test.status === 'pending'" class="btn-icon btn-warning" title="إلغاء الفحص" @click="showCancelModal(test)">
                      <i class="fas fa-times"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteTest(test.id)">
                      <i class="fas fa-trash"></i>
                    </button>
              </div>
                </td>
              </tr>
            </tbody>
          </table>
              </div>

        <!-- Pagination -->
        <div v-if="filteredTests.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredTests.length) }} من {{ filteredTests.length }} نتيجة
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
          <p>هل أنت متأكد من حذف هذا الفحص؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
  name: 'LaboratoryView'
})

import { ref, computed, onMounted } from 'vue'
import { useLaboratory } from '@/scripts/views/laboratory'

const {
  tests,
  testResults,
  specimens,
  testTypes,
  loading,
  error,
  searchQuery,
  selectedStatus,
  selectedTestType,
  selectedPriority,
  filteredTests,
  laboratoryStats,
  recentTests,
  urgentTests,
  todaysTests,
  loadLaboratoryData,
  addTest,
  updateTest,
  deleteTest,
  startTest,
  completeTest,
  cancelTest,
  addSpecimen,
  updateSpecimen,
  deleteSpecimen,
  addTestType,
  updateTestType,
  deleteTestType,
  clearError,
  handleSearch,
  handleFilterChange,
  clearFilters,
  exportTests,
  formatDate,
  formatTime,
  getStatusText,
  getStatusClass,
  getPriorityText,
  getPriorityClass
} = useLaboratory()

// Additional reactive data
const showAddTestModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const testToDelete = ref(null)

// Computed properties
const totalPages = computed(() => Math.ceil(filteredTests.value.length / itemsPerPage.value))

const paginatedTests = computed(() => {
  let sorted = [...filteredTests.value]

  if (sortField.value) {
    sorted.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sorted.slice(start, end)
})

// Methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const viewTest = async (id) => {
  try {
    // Navigate to test details page
    console.log('View test:', id)
  } catch (error) {
    console.error('Error viewing test:', error)
  }
}

const editTest = async (id) => {
  try {
    // Navigate to test edit page
    console.log('Edit test:', id)
  } catch (error) {
    console.error('Error editing test:', error)
  }
}

const showCompleteModal = (test) => {
  // Show complete test modal
  console.log('Show complete modal for test:', test)
}

const showCancelModal = (test) => {
  // Show cancel test modal
  console.log('Show cancel modal for test:', test)
}

const handleDeleteTest = async (id) => {
  testToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!testToDelete.value) return

  try {
    await deleteTest(testToDelete.value)
    successMessage.value = 'تم حذف الفحص بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting test:', error)
  } finally {
    showDeleteConfirm.value = false
    testToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  testToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadLaboratoryData()
})
</script>

<style scoped>
@import '@/assets/css/views/patients.css';

.laboratory-page {
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

.laboratory-content {
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

.laboratory-table-container {
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
  overflow-x: auto;
}

.laboratory-table {
  width: 100%;
  border-collapse: collapse;
}

.laboratory-table th,
.laboratory-table td {
  padding: 15px;
  text-align: right;
  border-bottom: 1px solid #e9ecef;
}

.laboratory-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  user-select: none;
}

.laboratory-table th.sortable:hover {
  background: #e9ecef;
}

.laboratory-table th i {
  margin-left: 5px;
  opacity: 0.5;
}

.laboratory-table tbody tr:hover {
  background: #f8f9fa;
}

.test-info strong, .patient-info strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 5px;
}

.test-info small, .patient-info small {
  color: #6c757d;
  font-size: 0.85rem;
}

.status-badge, .priority-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-in-progress {
  background: #cce5ff;
  color: #004085;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #e2e3e5;
  color: #383d41;
}

.priority-low {
  background: #e2e3e5;
  color: #383d41;
}

.priority-normal {
  background: #d1ecf1;
  color: #0c5460;
}

.priority-high {
  background: #fff3cd;
  color: #856404;
}

.priority-urgent {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 5px;
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
  .laboratory-content {
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
}
</style>
