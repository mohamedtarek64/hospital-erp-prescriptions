<template>
  <div class="pharmacy-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الصيدلية</h1>
      <p class="page-subtitle">إدارة الأدوية والمخزون والوصفات الطبية</p>
    </div>

    <div class="pharmacy-content">
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
            <i class="fas fa-pills"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي الأدوية</h3>
            <p class="stat-number">{{ pharmacyStats.totalMedicines }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3>أدوية منخفضة المخزون</h3>
            <p class="stat-number">{{ pharmacyStats.lowStockMedicines }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-prescription"></i>
          </div>
          <div class="stat-content">
            <h3>وصفات اليوم</h3>
            <p class="stat-number">{{ pharmacyStats.pendingPrescriptions }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-truck"></i>
          </div>
          <div class="stat-content">
            <h3>طلبات معلقة</h3>
            <p class="stat-number">{{ pharmacyStats.pendingOrders }}</p>
          </div>
        </div>
      </div>

      <div class="pharmacy-tabs">
        <div class="tab-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>

        <!-- Medicines Tab -->
        <div v-if="activeTab === 'medicines'" class="tab-content">
          <div class="table-header">
            <h2>إدارة الأدوية</h2>
            <div class="header-actions">
              <button class="btn btn-secondary" @click="exportMedicines" :disabled="loading">
                <i class="fas fa-download"></i>
                تصدير البيانات
              </button>
              <button class="btn btn-primary" @click="showAddMedicineModal = true">
                <i class="fas fa-plus"></i>
                إضافة دواء جديد
              </button>
            </div>
          </div>
          
          <div class="table-filters">
            <input 
              type="text" 
              placeholder="البحث عن دواء..." 
              class="search-input"
              v-model="medicineSearchQuery"
              @input="handleMedicineSearch"
            >
            <select class="filter-select" v-model="selectedCategory" @change="handleMedicineFilter">
              <option value="">جميع الفئات</option>
              <option value="مضاد حيوي">مضاد حيوي</option>
              <option value="مسكن">مسكن</option>
              <option value="فيتامين">فيتامين</option>
            </select>
            <button class="btn btn-secondary" @click="clearMedicineFilters">
              <i class="fas fa-times"></i>
              مسح الفلاتر
            </button>
          </div>

          <div class="table-wrapper">
            <div v-if="loading && medicines.length === 0" class="loading-overlay">
              <div class="loading-spinner"></div>
              <p>جاري تحميل البيانات...</p>
            </div>
            
            <div v-else-if="filteredMedicines.length === 0 && !loading" class="empty-state">
              <i class="fas fa-pills"></i>
              <h3>لا توجد نتائج</h3>
              <p>لم يتم العثور على أدوية مطابقة للمعايير المحددة</p>
              <button class="btn btn-primary" @click="clearMedicineFilters">
                <i class="fas fa-refresh"></i>
                إعادة تعيين الفلاتر
              </button>
            </div>
            
            <table v-else class="medicines-table">
              <thead>
                <tr>
                  <th @click="sortBy('id')" class="sortable">
                    الرقم
                    <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'id' && sortDirection === 'asc', 'fa-sort-down': sortField === 'id' && sortDirection === 'desc'}"></i>
                  </th>
                  <th @click="sortBy('name')" class="sortable">
                    اسم الدواء
                    <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'name' && sortDirection === 'desc'}"></i>
                  </th>
                  <th>الفئة</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="medicine in paginatedMedicines" :key="medicine.id">
                  <td>{{ medicine.id }}</td>
                  <td>
                    <div class="medicine-info">
                      <strong>{{ medicine.name }}</strong>
                      <small>{{ medicine.generic_name }}</small>
                    </div>
                  </td>
                  <td>{{ medicine.category }}</td>
                  <td>
                    <span class="quantity-badge" :class="getQuantityClass(medicine.quantity)">
                      {{ medicine.quantity }}
                    </span>
                  </td>
                  <td>{{ formatPrice(medicine.price) }}</td>
                  <td>{{ formatDate(medicine.expiry_date) }}</td>
                  <td>
                    <span class="status-badge" :class="getStockStatus(medicine.quantity)">
                      {{ getStockStatusText(medicine.quantity) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon" title="عرض" @click="viewMedicine(medicine.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon" title="تعديل" @click="editMedicine(medicine.id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteMedicine(medicine.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Prescriptions Tab -->
        <div v-if="activeTab === 'prescriptions'" class="tab-content">
          <div class="table-header">
            <h2>الوصفات الطبية</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="showAddPrescriptionModal = true">
                <i class="fas fa-plus"></i>
                وصفة جديدة
              </button>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table class="prescriptions-table">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>المريض</th>
                  <th>الطبيب</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prescription in recentPrescriptions" :key="prescription.id">
                  <td>{{ prescription.id }}</td>
                  <td>{{ prescription.patient_name }}</td>
                  <td>{{ prescription.doctor_name }}</td>
                  <td>{{ formatDate(prescription.date) }}</td>
                  <td>
                    <span class="status-badge" :class="prescription.status">
                      {{ getPrescriptionStatusText(prescription.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon" title="عرض" @click="viewPrescription(prescription.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        v-if="prescription.status === 'pending'" 
                        class="btn-icon btn-success" 
                        title="معالجة" 
                        @click="handleProcessPrescription(prescription.id)"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Suppliers Tab -->
        <div v-if="activeTab === 'suppliers'" class="tab-content">
          <div class="table-header">
            <h2>الموردين</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="showAddSupplierModal = true">
                <i class="fas fa-plus"></i>
                مورد جديد
              </button>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table class="suppliers-table">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>اسم المورد</th>
                  <th>جهة الاتصال</th>
                  <th>الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="supplier in suppliers" :key="supplier.id">
                  <td>{{ supplier.id }}</td>
                  <td>{{ supplier.name }}</td>
                  <td>{{ supplier.contact_person }}</td>
                  <td>{{ supplier.phone }}</td>
                  <td>{{ supplier.email }}</td>
                  <td>
                    <span class="status-badge" :class="supplier.status">
                      {{ supplier.status === 'active' ? 'نشط' : 'غير نشط' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon" title="عرض" @click="viewSupplier(supplier.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon" title="تعديل" @click="editSupplier(supplier.id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteSupplier(supplier.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
          <p>هل أنت متأكد من الحذف؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
        <p>هل أنت متأكد من حذف هذا العنصر؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
</template>

<script setup>
defineOptions({
  name: 'PharmacyView'
})

import { ref, computed, onMounted } from 'vue'
import { usePharmacy } from '@/scripts/views/pharmacy'

const {
  medicines,
  suppliers,
  orders,
  prescriptions,
  loading,
  error,
  pharmacyStats,
  recentOrders,
  recentPrescriptions,
  urgentMedicines,
  loadPharmacyData,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addOrder,
  updateOrder,
  deleteOrder,
  processPrescription,
  clearError
} = usePharmacy()

// Additional reactive data
const activeTab = ref('medicines')
const showAddMedicineModal = ref(false)
const showAddSupplierModal = ref(false)
const showAddPrescriptionModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)
const deleteType = ref('')
const medicineSearchQuery = ref('')
const selectedCategory = ref('')

// Tabs configuration
const tabs = [
  { id: 'medicines', name: 'الأدوية', icon: 'fas fa-pills' },
  { id: 'prescriptions', name: 'الوصفات', icon: 'fas fa-prescription' },
  { id: 'suppliers', name: 'الموردين', icon: 'fas fa-truck' }
]

// Computed properties
const filteredMedicines = computed(() => {
  let filtered = medicines

  if (medicineSearchQuery.value) {
    filtered = filtered.filter(medicine =>
      medicine.name?.toLowerCase().includes(medicineSearchQuery.value.toLowerCase()) ||
      medicine.generic_name?.toLowerCase().includes(medicineSearchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(medicine => medicine.category === selectedCategory.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredMedicines.value.length / itemsPerPage.value))

const paginatedMedicines = computed(() => {
  let sorted = [...filteredMedicines.value]
  
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

const handleMedicineSearch = () => {
  // Search is handled by computed property
}

const handleMedicineFilter = () => {
  // Filtering is handled by computed property
}

const clearMedicineFilters = () => {
  medicineSearchQuery.value = ''
  selectedCategory.value = ''
}

const exportMedicines = async () => {
  try {
    console.log('Exporting medicines...')
  } catch (error) {
    console.error('Export error:', error)
  }
}

const formatPrice = (price) => {
  if (!price) return 'غير محدد'
  return `$${price.toFixed(2)}`
}

const formatDate = (date) => {
  if (!date) return 'غير محدد'
  return new Date(date).toLocaleDateString('ar-SA')
}

const getQuantityClass = (quantity) => {
  if (quantity <= 10) return 'low'
  if (quantity <= 50) return 'medium'
  return 'high'
}

const getStockStatus = (quantity) => {
  if (quantity <= 10) return 'low-stock'
  if (quantity <= 50) return 'medium-stock'
  return 'in-stock'
}

const getStockStatusText = (quantity) => {
  if (quantity <= 10) return 'مخزون منخفض'
  if (quantity <= 50) return 'مخزون متوسط'
  return 'متوفر'
}

const getPrescriptionStatusText = (status) => {
  const statusMap = {
    'pending': 'في الانتظار',
    'processing': 'قيد المعالجة',
    'completed': 'مكتمل',
    'cancelled': 'ملغي'
  }
  return statusMap[status] || status
}

// Medicine actions
const viewMedicine = (id) => {
  console.log('View medicine:', id)
}

const editMedicine = (id) => {
  console.log('Edit medicine:', id)
}

const handleDeleteMedicine = (id) => {
  itemToDelete.value = id
  deleteType.value = 'medicine'
  showDeleteConfirm.value = true
}

// Prescription actions
const viewPrescription = (id) => {
  console.log('View prescription:', id)
}

const handleProcessPrescription = async (id) => {
  try {
    await processPrescription(id)
    successMessage.value = 'تم معالجة الوصفة بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error processing prescription:', error)
  }
}

// Supplier actions
const viewSupplier = (id) => {
  console.log('View supplier:', id)
}

const editSupplier = (id) => {
  console.log('Edit supplier:', id)
}

const handleDeleteSupplier = (id) => {
  itemToDelete.value = id
  deleteType.value = 'supplier'
  showDeleteConfirm.value = true
}

// Delete confirmation
const confirmDelete = async () => {
  if (!itemToDelete.value) return
  
  try {
    if (deleteType.value === 'medicine') {
      await deleteMedicine(itemToDelete.value)
    } else if (deleteType.value === 'supplier') {
      await deleteSupplier(itemToDelete.value)
    }
    
    successMessage.value = 'تم الحذف بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting item:', error)
  } finally {
    showDeleteConfirm.value = false
    itemToDelete.value = null
    deleteType.value = ''
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  itemToDelete.value = null
  deleteType.value = ''
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadPharmacyData()
})
</script>

<style scoped>
@import '@/assets/css/views/pharmacy.css';
</style>
