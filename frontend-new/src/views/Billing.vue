<template>
  <div class="billing-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الفواتير والمدفوعات</h1>
      <p class="page-subtitle">إدارة فواتير المرضى والمدفوعات</p>
    </div>

    <div class="billing-content">
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
            <i class="fas fa-file-invoice"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي الفواتير</h3>
            <p class="stat-number">{{ billingStats.totalInvoices }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>الفواتير المدفوعة</h3>
            <p class="stat-number">{{ billingStats.paidInvoices }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
            </div>
          <div class="stat-content">
            <h3>في الانتظار</h3>
            <p class="stat-number">{{ billingStats.pendingInvoices }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي الإيرادات</h3>
            <p class="stat-number">{{ formatPrice(billingStats.totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <div class="billing-table-container">
        <div class="table-header">
          <h2>قائمة الفواتير</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportInvoices" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddInvoiceModal = true">
              <i class="fas fa-plus"></i>
              إنشاء فاتورة جديدة
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن فاتورة..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedStatus" @change="handleFilterChange">
            <option value="">جميع الحالات</option>
            <option value="paid">مدفوع</option>
            <option value="pending">في الانتظار</option>
            <option value="overdue">متأخر</option>
            <option value="cancelled">ملغي</option>
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
          <div v-if="loading && invoices.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredInvoices.length === 0 && !loading" class="empty-state">
            <i class="fas fa-file-invoice"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على فواتير مطابقة للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
          </div>
          
          <table v-else class="billing-table">
            <thead>
              <tr>
                <th @click="sortBy('id')" class="sortable">
                  الرقم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'id' && sortDirection === 'asc', 'fa-sort-down': sortField === 'id' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('patient_name')" class="sortable">
                  المريض
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'patient_name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'patient_name' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('amount')" class="sortable">
                  المبلغ
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'amount' && sortDirection === 'asc', 'fa-sort-down': sortField === 'amount' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('created_at')" class="sortable">
                  التاريخ
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'created_at' && sortDirection === 'asc', 'fa-sort-down': sortField === 'created_at' && sortDirection === 'desc'}"></i>
                </th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in paginatedInvoices" :key="invoice.id">
                <td>{{ invoice.invoice_number || invoice.id }}</td>
                <td>
                  <div class="patient-info">
                    <strong>{{ invoice.patient_name }}</strong>
                    <small>{{ invoice.patient_phone }}</small>
                  </div>
                </td>
                <td>{{ formatPrice(invoice.amount) }}</td>
                <td>{{ formatDate(invoice.created_at) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(invoice.status)">
                    {{ getStatusText(invoice.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="عرض" @click="viewInvoice(invoice.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="تعديل" @click="editInvoice(invoice.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button v-if="invoice.status === 'pending'" class="btn-icon btn-success" title="تسجيل دفعة" @click="showPaymentModal(invoice)">
                      <i class="fas fa-money-bill-wave"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteInvoice(invoice.id)">
                      <i class="fas fa-trash"></i>
                    </button>
              </div>
                </td>
              </tr>
            </tbody>
          </table>
              </div>

        <!-- Pagination -->
        <div v-if="filteredInvoices.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} من {{ filteredInvoices.length }} نتيجة
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
          <p>هل أنت متأكد من حذف هذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
  name: 'BillingView'
})

import { ref, computed, onMounted } from 'vue'
import { useBilling } from '@/scripts/views/billing'

const {
  invoices,
  loading,
  error,
  searchQuery,
  selectedStatus,
  selectedDateRange,
  filteredInvoices,
  billingStats,
  recentInvoices,
  recentPayments,
  loadBillingData,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  addService,
  updateService,
  deleteService,
  clearError,
  handleSearch,
  handleFilterChange,
  clearFilters,
  exportInvoices,
  formatPrice,
  formatDate,
  getStatusText,
  getStatusClass
} = useBilling()

// Additional reactive data
const showAddInvoiceModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const invoiceToDelete = ref(null)

// Computed properties
const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage.value))

const paginatedInvoices = computed(() => {
  let sorted = [...filteredInvoices.value]

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

const viewInvoice = async (id) => {
  try {
    // Navigate to invoice details page
    console.log('View invoice:', id)
  } catch (error) {
    console.error('Error viewing invoice:', error)
  }
}

const editInvoice = async (id) => {
  try {
    // Navigate to invoice edit page
    console.log('Edit invoice:', id)
  } catch (error) {
    console.error('Error editing invoice:', error)
  }
}

const showPaymentModal = (invoice) => {
  // Show payment modal for the invoice
  console.log('Show payment modal for invoice:', invoice)
}

const handleDeleteInvoice = async (id) => {
  invoiceToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!invoiceToDelete.value) return

  try {
    await deleteInvoice(invoiceToDelete.value)
    successMessage.value = 'تم حذف الفاتورة بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting invoice:', error)
  } finally {
    showDeleteConfirm.value = false
    invoiceToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  invoiceToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadBillingData()
})
</script>

<style scoped>
@import '@/assets/css/views/patients.css';

.billing-page {
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

.billing-content {
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

.billing-table-container {
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

.billing-table {
  width: 100%;
  border-collapse: collapse;
}

.billing-table th,
.billing-table td {
  padding: 15px;
  text-align: right;
  border-bottom: 1px solid #e9ecef;
}

.billing-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  user-select: none;
}

.billing-table th.sortable:hover {
  background: #e9ecef;
}

.billing-table th i {
  margin-left: 5px;
  opacity: 0.5;
}

.billing-table tbody tr:hover {
  background: #f8f9fa;
}

.patient-info strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 5px;
}

.patient-info small {
  color: #6c757d;
  font-size: 0.85rem;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-overdue {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background: #e2e3e5;
  color: #383d41;
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
  .billing-content {
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
