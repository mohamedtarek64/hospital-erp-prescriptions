<template>
  <div class="patients-page">
    <div class="page-header">
      <h1 class="page-title">إدارة المرضى</h1>
      <p class="page-subtitle">إدارة بيانات المرضى والسجلات الطبية</p>
    </div>

    <div class="patients-content">
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
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي المرضى</h3>
            <p class="stat-number">{{ patients.length }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-content">
            <h3>مرضى جدد اليوم</h3>
            <p class="stat-number">{{ todayPatientsCount }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>مواعيد اليوم</h3>
            <p class="stat-number">{{ todayAppointmentsCount }}</p>
          </div>
        </div>
      </div>

      <div class="patients-table-container">
        <div class="table-header">
          <h2>قائمة المرضى</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportPatients" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddPatientModal = true">
              <i class="fas fa-plus"></i>
              إضافة مريض جديد
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن مريض..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedGender" @change="handleFilterChange">
            <option value="">جميع الجنسيات</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
          <select class="filter-select" v-model="selectedBloodGroup" @change="handleFilterChange">
            <option value="">جميع فصائل الدم</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <button class="btn btn-secondary" @click="clearFilters">
            <i class="fas fa-times"></i>
            مسح الفلاتر
          </button>
        </div>

        <div class="table-wrapper">
          <div v-if="loading && patients.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredPatients.length === 0 && !loading" class="empty-state">
            <i class="fas fa-users"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على مرضى مطابقين للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
          </div>
          
          <table v-else class="patients-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th @click="sortBy('id')" class="sortable">
                  الرقم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'id' && sortDirection === 'asc', 'fa-sort-down': sortField === 'id' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('first_name')" class="sortable">
                  الاسم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'first_name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'first_name' && sortDirection === 'desc'}"></i>
                </th>
                <th>العمر</th>
                <th>الهاتف</th>
                <th>الجنس</th>
                <th>فصيلة الدم</th>
                <th @click="sortBy('last_visit')" class="sortable">
                  آخر زيارة
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'last_visit' && sortDirection === 'asc', 'fa-sort-down': sortField === 'last_visit' && sortDirection === 'desc'}"></i>
                </th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in paginatedPatients" :key="patient.id" :class="{ 'selected': selectedPatients.includes(patient.id) }">
                <td>
                  <input type="checkbox" v-model="selectedPatients" :value="patient.id">
                </td>
                <td>{{ patient.id }}</td>
                <td>
                  <div class="patient-name">
                    <strong>{{ patient.first_name }} {{ patient.last_name }}</strong>
                    <small class="patient-email">{{ patient.email }}</small>
                  </div>
                </td>
                <td>{{ calculateAge(patient.date_of_birth) }}</td>
                <td>{{ patient.phone }}</td>
                <td>
                  <span class="gender-badge" :class="patient.gender">
                    {{ patient.gender === 'male' ? 'ذكر' : 'أنثى' }}
                  </span>
                </td>
                <td>
                  <span class="blood-group-badge">{{ patient.blood_group }}</span>
                </td>
                <td>{{ formatDate(patient.last_visit) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="عرض" @click="viewPatient(patient.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="تعديل" @click="editPatient(patient.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="السجلات الطبية" @click="viewMedicalRecords(patient.id)">
                      <i class="fas fa-file-medical"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="حذف" @click="handleDeletePatient(patient.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredPatients.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredPatients.length) }} من {{ filteredPatients.length }} نتيجة
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
          <p>هل أنت متأكد من حذف هذا المريض؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
  name: 'PatientsView'
})
import { ref, computed } from 'vue'
import { usePatients } from '@/scripts/views/patients'

const {
  patients,
  loading,
  error,
  searchQuery,
  selectedGender,
  selectedBloodGroup,
  filteredPatients,
  addPatient,
  updatePatient,
  deletePatient,
  clearError,
  clearFilters,
  handleSearch,
  handleFilterChange,
  todayPatientsCount,
  todayAppointmentsCount,
  calculateAge,
  formatDate
} = usePatients()

// Additional reactive data
const showAddPatientModal = ref(false)
const selectedPatients = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const patientToDelete = ref(null)

// Computed properties
const totalPages = computed(() => Math.ceil(filteredPatients.value.length / itemsPerPage.value))

const paginatedPatients = computed(() => {
  let sorted = [...filteredPatients.value]
  
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

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPatients.value = paginatedPatients.value.map(p => p.id)
  } else {
    selectedPatients.value = []
  }
}

const exportPatients = async () => {
  try {
    // Implement export functionality
    console.log('Exporting patients...')
  } catch (error) {
    console.error('Export error:', error)
  }
}

const viewMedicalRecords = (patientId) => {
  // Navigate to medical records page
  console.log('View medical records for patient:', patientId)
}

const viewPatient = async (id) => {
  try {
    // Navigate to patient details page
    console.log('View patient:', id)
  } catch (error) {
    console.error('Error viewing patient:', error)
  }
}

const editPatient = async (id) => {
  try {
    // Navigate to patient edit page
    console.log('Edit patient:', id)
  } catch (error) {
    console.error('Error editing patient:', error)
  }
}

const handleDeletePatient = async (id) => {
  patientToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!patientToDelete.value) return
  
  try {
    await deletePatient(patientToDelete.value)
    successMessage.value = 'تم حذف المريض بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting patient:', error)
  } finally {
    showDeleteConfirm.value = false
    patientToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  patientToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}
</script>

<style scoped>
@import '@/assets/css/views/patients.css';
</style>