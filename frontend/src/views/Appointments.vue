<template>
  <div class="appointments-page">
    <div class="page-header">
      <h1 class="page-title">إدارة المواعيد</h1>
      <p class="page-subtitle">جدولة ومتابعة مواعيد المرضى</p>
    </div>

    <div class="appointments-content">
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
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي المواعيد</h3>
            <p class="stat-number">{{ appointments.length }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>مواعيد اليوم</h3>
            <p class="stat-number">{{ todaysAppointments.length }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-hourglass-half"></i>
            </div>
          <div class="stat-content">
            <h3>في الانتظار</h3>
            <p class="stat-number">{{ pendingAppointments.length }}</p>
          </div>
        </div>
      </div>

      <div class="appointments-table-container">
        <div class="table-header">
          <h2>قائمة المواعيد</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportAppointments" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddAppointmentModal = true">
            <i class="fas fa-plus"></i>
            حجز موعد جديد
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن موعد..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedStatus" @change="handleFilterChange">
            <option value="">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="in-progress">جاري</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <input 
            type="date" 
            class="filter-select" 
            v-model="selectedDate"
            @change="handleFilterChange"
          >
          <button class="btn btn-secondary" @click="clearFilters">
            <i class="fas fa-times"></i>
            مسح الفلاتر
          </button>
        </div>

        <div class="table-wrapper">
          <div v-if="loading && appointments.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredAppointments.length === 0 && !loading" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على مواعيد مطابقة للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
            </div>
          
          <table v-else class="appointments-table">
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
                <th @click="sortBy('doctor_name')" class="sortable">
                  الطبيب
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'doctor_name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'doctor_name' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('appointment_date')" class="sortable">
                  التاريخ
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'appointment_date' && sortDirection === 'asc', 'fa-sort-down': sortField === 'appointment_date' && sortDirection === 'desc'}"></i>
                </th>
                <th>الوقت</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in paginatedAppointments" :key="appointment.id">
                <td>{{ appointment.id }}</td>
                <td>
                <div class="patient-info">
                    <strong>{{ appointment.patient?.first_name }} {{ appointment.patient?.last_name }}</strong>
                    <small>{{ appointment.patient?.phone }}</small>
                </div>
                </td>
                <td>
                  <div class="doctor-info">
                    <strong>{{ appointment.doctor?.name }}</strong>
                    <small>{{ appointment.doctor?.department }}</small>
                </div>
                </td>
                <td>{{ formatDate(appointment.appointment_date) }}</td>
                <td>{{ formatTime(appointment.appointment_time) }}</td>
                <td>
                  <span class="status-badge" :class="appointment.status">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="عرض" @click="viewAppointment(appointment.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="تعديل" @click="editAppointment(appointment.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="appointment.status === 'pending'" 
                      class="btn-icon btn-success" 
                      title="بدء الموعد" 
                      @click="startAppointment(appointment.id)"
                    >
                    <i class="fas fa-play"></i>
                  </button>
                    <button 
                      v-if="appointment.status === 'in-progress'" 
                      class="btn-icon btn-primary" 
                      title="إنهاء الموعد" 
                      @click="completeAppointment(appointment.id)"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteAppointment(appointment.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredAppointments.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredAppointments.length) }} من {{ filteredAppointments.length }} نتيجة
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
          <p>هل أنت متأكد من حذف هذا الموعد؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
  name: 'AppointmentsView'
})
import { ref, computed, onMounted } from 'vue'
import { useAppointments } from '@/scripts/views/appointments'

const {
  appointments,
  loading,
  error,
  todaysAppointments,
  pendingAppointments,
  completedAppointments,
  loadAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  clearError
} = useAppointments()

// Additional reactive data
const showAddAppointmentModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const appointmentToDelete = ref(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedDate = ref('')

// Computed properties
const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / itemsPerPage.value))

const filteredAppointments = computed(() => {
  let filtered = appointments

  if (searchQuery.value) {
    filtered = filtered.filter(appointment =>
      appointment.patient?.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      appointment.patient?.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      appointment.doctor?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(appointment => appointment.status === selectedStatus.value)
  }

  if (selectedDate.value) {
    filtered = filtered.filter(appointment => 
      appointment.appointment_date?.split('T')[0] === selectedDate.value
    )
  }

  return filtered
})

const paginatedAppointments = computed(() => {
  let sorted = [...filteredAppointments.value]
  
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

const handleSearch = () => {
  // Search is handled by computed property
}

const handleFilterChange = () => {
  // Filtering is handled by computed property
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedDate.value = ''
}

const exportAppointments = async () => {
  try {
    // Implement export functionality
    console.log('Exporting appointments...')
  } catch (error) {
    console.error('Export error:', error)
  }
}

const formatDate = (date) => {
  if (!date) return 'غير محدد'
  return new Date(date).toLocaleDateString('ar-SA')
}

const formatTime = (time) => {
  if (!time) return 'غير محدد'
  return time
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'في الانتظار',
    'confirmed': 'مؤكد',
    'in-progress': 'جاري',
    'completed': 'مكتمل',
    'cancelled': 'ملغي'
  }
  return statusMap[status] || status
}

const viewAppointment = async (id) => {
  try {
    console.log('View appointment:', id)
  } catch (error) {
    console.error('Error viewing appointment:', error)
  }
}

const editAppointment = async (id) => {
  try {
    console.log('Edit appointment:', id)
  } catch (error) {
    console.error('Error editing appointment:', error)
  }
}

const handleDeleteAppointment = async (id) => {
  appointmentToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!appointmentToDelete.value) return
  
  try {
    await deleteAppointment(appointmentToDelete.value)
    successMessage.value = 'تم حذف الموعد بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting appointment:', error)
  } finally {
    showDeleteConfirm.value = false
    appointmentToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  appointmentToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
@import '@/assets/css/views/appointments.css';
</style>