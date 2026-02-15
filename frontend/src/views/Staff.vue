<template>
  <div class="staff-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الموظفين</h1>
      <p class="page-subtitle">إدارة بيانات الموظفين والأدوار</p>
    </div>

    <div class="staff-content">
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
            <i class="fas fa-user-md"></i>
          </div>
          <div class="stat-content">
            <h3>الأطباء</h3>
            <p class="stat-number">{{ staffStats.doctors }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-user-nurse"></i>
          </div>
          <div class="stat-content">
            <h3>الممرضين</h3>
            <p class="stat-number">{{ staffStats.nurses }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="stat-content">
            <h3>الموظفين الإداريين</h3>
            <p class="stat-number">{{ staffStats.admin }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>إجمالي الموظفين</h3>
            <p class="stat-number">{{ staffStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="staff-table-container">
        <div class="table-header">
          <h2>قائمة الموظفين</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="exportStaff" :disabled="loading">
              <i class="fas fa-download"></i>
              تصدير البيانات
            </button>
            <button class="btn btn-primary" @click="showAddStaffModal = true">
              <i class="fas fa-plus"></i>
              إضافة موظف جديد
            </button>
          </div>
        </div>
        
        <div class="table-filters">
          <input 
            type="text" 
            placeholder="البحث عن موظف..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleSearch"
          >
          <select class="filter-select" v-model="selectedDepartment" @change="handleFilterChange">
            <option value="all">جميع الأقسام</option>
            <option value="الباطنة">الباطنة</option>
            <option value="الجراحة">الجراحة</option>
            <option value="الطوارئ">الطوارئ</option>
            <option value="الإدارة">الإدارة</option>
          </select>
          <select class="filter-select" v-model="selectedRole" @change="handleFilterChange">
            <option value="all">جميع الأدوار</option>
            <option value="طبيب">طبيب</option>
            <option value="ممرض">ممرض</option>
            <option value="إداري">إداري</option>
          </select>
          <button class="btn btn-secondary" @click="clearFilters">
            <i class="fas fa-times"></i>
            مسح الفلاتر
          </button>
        </div>

        <div class="table-wrapper">
          <div v-if="loading && staff.length === 0" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
          
          <div v-else-if="filteredStaff.length === 0 && !loading" class="empty-state">
            <i class="fas fa-users"></i>
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على موظفين مطابقين للمعايير المحددة</p>
            <button class="btn btn-primary" @click="clearFilters">
              <i class="fas fa-refresh"></i>
              إعادة تعيين الفلاتر
            </button>
          </div>
          
          <table v-else class="staff-table">
            <thead>
              <tr>
                <th @click="sortBy('id')" class="sortable">
                  الرقم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'id' && sortDirection === 'asc', 'fa-sort-down': sortField === 'id' && sortDirection === 'desc'}"></i>
                </th>
                <th @click="sortBy('name')" class="sortable">
                  الاسم
                  <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'name' && sortDirection === 'asc', 'fa-sort-down': sortField === 'name' && sortDirection === 'desc'}"></i>
                </th>
                <th>الدور</th>
                <th>القسم</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in paginatedStaff" :key="member.id">
                <td>{{ member.id }}</td>
                <td>
                  <div class="staff-info">
                    <div class="staff-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="staff-details">
                      <strong>{{ member.name }}</strong>
                      <small>{{ member.position }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" :class="member.role">
                    {{ member.role }}
                  </span>
                </td>
                <td>{{ member.department }}</td>
                <td>{{ member.phone }}</td>
                <td>{{ member.email }}</td>
                <td>
                  <span class="status-badge" :class="member.status">
                    {{ member.status === 'active' ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="عرض" @click="viewStaff(member.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="تعديل" @click="editStaff(member.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-icon" 
                      :class="member.status === 'active' ? 'btn-warning' : 'btn-success'"
                      :title="member.status === 'active' ? 'إيقاف' : 'تفعيل'"
                      @click="toggleStaffStatus(member.id)"
                    >
                      <i :class="member.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="حذف" @click="handleDeleteStaff(member.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredStaff.length > 0" class="pagination-container">
          <div class="pagination-info">
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredStaff.length) }} من {{ filteredStaff.length }} نتيجة
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
          <p>هل أنت متأكد من حذف هذا الموظف؟ هذا الإجراء لا يمكن التراجع عنه.</p>
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
  name: 'StaffView'
})
import { ref, computed, onMounted } from 'vue'
import { useStaff } from '@/scripts/views/staff'

const {
  staff,
  loading,
  error,
  searchQuery,
  selectedDepartment,
  selectedRole,
  filteredStaff,
  staffStats,
  loadStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  clearError
} = useStaff()

// Additional reactive data
const showAddStaffModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('')
const sortDirection = ref('asc')
const successMessage = ref('')
const showDeleteConfirm = ref(false)
const staffToDelete = ref(null)

// Computed properties
const totalPages = computed(() => Math.ceil(filteredStaff.length / itemsPerPage.value))

const paginatedStaff = computed(() => {
  let sorted = [...filteredStaff]
  
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
  selectedDepartment.value = 'all'
  selectedRole.value = 'all'
}

const exportStaff = async () => {
  try {
    console.log('Exporting staff...')
  } catch (error) {
    console.error('Export error:', error)
  }
}

const viewStaff = (id) => {
  console.log('View staff:', id)
}

const editStaff = (id) => {
  console.log('Edit staff:', id)
}

const handleDeleteStaff = (id) => {
  staffToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!staffToDelete.value) return
  
  try {
    await deleteStaff(staffToDelete.value)
    successMessage.value = 'تم حذف الموظف بنجاح'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting staff:', error)
  } finally {
    showDeleteConfirm.value = false
    staffToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  staffToDelete.value = null
}

const clearSuccess = () => {
  successMessage.value = ''
}

onMounted(() => {
  loadStaff()
})
</script>

<style scoped>
@import '@/assets/css/views/staff.css';
</style>
