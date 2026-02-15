<template>
  <div class="training-container">
    <!-- Header -->
    <div class="training-header">
      <div class="training-title-section">
        <h1 class="training-title">إدارة التدريب</h1>
        <p class="training-subtitle">إدارة برامج التدريب وسجلات الموظفين</p>
      </div>
      <div class="training-actions">
        <button 
          @click="openCreateModal"
          class="training-create-btn"
        >
          <svg class="training-create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة برنامج تدريب
        </button>
        <button 
          @click="refreshData"
          :disabled="loading"
          class="training-refresh-btn"
        >
          <svg class="training-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Training Statistics -->
    <div class="training-stats">
      <div class="training-stat-card">
        <div class="training-stat-icon training-stat-icon-total">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <div class="training-stat-content">
          <h3 class="training-stat-title">إجمالي البرامج</h3>
          <p class="training-stat-value">{{ statistics?.total_programs || 0 }}</p>
        </div>
      </div>

      <div class="training-stat-card">
        <div class="training-stat-icon training-stat-icon-completed">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="training-stat-content">
          <h3 class="training-stat-title">مكتملة</h3>
          <p class="training-stat-value">{{ statistics?.completed_trainings || 0 }}</p>
        </div>
      </div>

      <div class="training-stat-card">
        <div class="training-stat-icon training-stat-icon-pending">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="training-stat-content">
          <h3 class="training-stat-title">قيد التنفيذ</h3>
          <p class="training-stat-value">{{ statistics?.pending_trainings || 0 }}</p>
        </div>
      </div>

      <div class="training-stat-card">
        <div class="training-stat-icon training-stat-icon-overdue">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="training-stat-content">
          <h3 class="training-stat-title">متأخرة</h3>
          <p class="training-stat-value">{{ statistics?.overdue_trainings || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="training-tabs">
      <div class="training-tab-nav">
        <button 
          @click="activeTab = 'programs'"
          :class="['training-tab-btn', { 'training-tab-btn-active': activeTab === 'programs' }]"
        >
          برامج التدريب
        </button>
        <button 
          @click="activeTab = 'assignments'"
          :class="['training-tab-btn', { 'training-tab-btn-active': activeTab === 'assignments' }]"
        >
          تعيينات الموظفين
        </button>
      </div>
    </div>

    <!-- Training Programs Tab -->
    <div v-if="activeTab === 'programs'" class="training-programs">
      <!-- Filters -->
      <div class="training-filters">
        <div class="training-search">
          <div class="training-search-input-wrapper">
            <svg class="training-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث في برامج التدريب..."
              class="training-search-input"
              @input="handleSearch"
            />
          </div>
        </div>
        
        <div class="training-filter-controls">
          <select 
            v-model="statusFilter"
            @change="handleFilterChange"
            class="training-filter-select"
          >
            <option value="">جميع الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="pending">قيد التنفيذ</option>
            <option value="overdue">متأخر</option>
          </select>
        </div>
      </div>

      <!-- Programs Grid -->
      <div class="training-programs-grid">
        <div 
          v-for="program in filteredTrainingRecords" 
          :key="program.id"
          class="training-program-card"
          @click="openEditModal(program)"
        >
          <div class="training-program-header">
            <div class="training-program-title-section">
              <h3 class="training-program-title">{{ program.course_name }}</h3>
              <span 
                class="training-program-status"
                :class="`training-program-status-${program.status}`"
              >
                {{ getStatusText(program.status) }}
              </span>
            </div>
            <div class="training-program-actions">
              <button 
                @click.stop="assignStaffToTraining(program)"
                class="training-program-action-btn training-program-action-assign"
              >
                <svg class="training-program-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
              <button 
                @click.stop="deleteTrainingRecord(program.id)"
                class="training-program-action-btn training-program-action-delete"
              >
                <svg class="training-program-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="training-program-content">
            <p class="training-program-description">{{ program.description || 'لا يوجد وصف' }}</p>
            
            <div class="training-program-meta">
              <div class="training-program-meta-item">
                <span class="training-program-meta-label">المزود:</span>
                <span class="training-program-meta-value">{{ program.provider || 'غير محدد' }}</span>
              </div>
              <div class="training-program-meta-item">
                <span class="training-program-meta-label">تاريخ الإكمال:</span>
                <span class="training-program-meta-value">{{ formatDate(program.completion_date) }}</span>
              </div>
              <div class="training-program-meta-item">
                <span class="training-program-meta-label">تاريخ الاستحقاق:</span>
                <span class="training-program-meta-value">{{ formatDate(program.due_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Staff Assignments Tab -->
    <div v-if="activeTab === 'assignments'" class="training-assignments">
      <!-- Staff Assignments Table -->
      <div class="training-assignments-table">
        <div class="training-assignments-header">
          <h2 class="training-assignments-title">تعيينات الموظفين</h2>
          <div class="training-assignments-actions">
            <button @click="exportAssignmentsData" class="training-export-btn">
              <svg class="training-export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              تصدير البيانات
            </button>
          </div>
        </div>

        <div class="training-assignments-list">
          <div 
            v-for="assignment in staffTrainingRecords" 
            :key="assignment.id"
            class="training-assignment-item"
            @click="openAssignmentModal(assignment)"
          >
            <div class="training-assignment-header">
              <div class="training-assignment-info">
                <h4 class="training-assignment-staff">{{ assignment.staff?.name || 'غير محدد' }}</h4>
                <h5 class="training-assignment-course">{{ assignment.training_record?.course_name || 'غير محدد' }}</h5>
              </div>
              <div class="training-assignment-status">
                <span 
                  class="training-assignment-status-badge"
                  :class="`training-assignment-status-${assignment.status}`"
                >
                  {{ getAssignmentStatusText(assignment.status) }}
                </span>
              </div>
            </div>
            
            <div class="training-assignment-content">
              <div class="training-assignment-meta">
                <div class="training-assignment-meta-item">
                  <span class="training-assignment-meta-label">تاريخ التعيين:</span>
                  <span class="training-assignment-meta-value">{{ formatDate(assignment.assigned_date) }}</span>
                </div>
                <div class="training-assignment-meta-item">
                  <span class="training-assignment-meta-label">تاريخ الإكمال:</span>
                  <span class="training-assignment-meta-value">{{ formatDate(assignment.completed_date) }}</span>
                </div>
                <div class="training-assignment-meta-item">
                  <span class="training-assignment-meta-label">تاريخ الاستحقاق:</span>
                  <span class="training-assignment-meta-value">{{ formatDate(assignment.training_record?.due_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="training-loading">
      <div class="training-loading-spinner"></div>
      <p class="training-loading-text">جاري تحميل بيانات التدريب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="training-error">
      <div class="training-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="training-error-title">خطأ في تحميل البيانات</h3>
      <p class="training-error-message">{{ error }}</p>
      <button @click="refreshData" class="training-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredTrainingRecords.length === 0 && activeTab === 'programs'" class="training-empty">
      <div class="training-empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </div>
      <h3 class="training-empty-title">لا توجد برامج تدريب</h3>
      <p class="training-empty-message">لم يتم العثور على برامج تدريب تطابق معايير البحث</p>
      <button @click="openCreateModal" class="training-empty-action-btn">
        إضافة برنامج تدريب
      </button>
    </div>

    <!-- Create/Edit Training Program Modal -->
    <div v-if="showModal" class="training-modal-overlay" @click="closeModal">
      <div class="training-modal" @click.stop>
        <div class="training-modal-header">
          <h2 class="training-modal-title">
            {{ editingRecord ? 'تعديل برنامج التدريب' : 'إضافة برنامج تدريب جديد' }}
          </h2>
          <button @click="closeModal" class="training-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveTrainingRecord" class="training-modal-form">
          <div class="training-modal-form-group">
            <label class="training-modal-form-label">اسم الدورة *</label>
            <input
              v-model="formData.course_name"
              type="text"
              required
              class="training-modal-form-input"
              placeholder="أدخل اسم الدورة التدريبية"
            />
          </div>
          
          <div class="training-modal-form-group">
            <label class="training-modal-form-label">الوصف</label>
            <textarea
              v-model="formData.description"
              class="training-modal-form-textarea"
              placeholder="أدخل وصف الدورة التدريبية"
              rows="4"
            ></textarea>
          </div>
          
          <div class="training-modal-form-row">
            <div class="training-modal-form-group">
              <label class="training-modal-form-label">المزود</label>
              <input
                v-model="formData.provider"
                type="text"
                class="training-modal-form-input"
                placeholder="أدخل اسم المزود"
              />
            </div>
            
            <div class="training-modal-form-group">
              <label class="training-modal-form-label">الحالة</label>
              <select v-model="formData.status" class="training-modal-form-select">
                <option value="completed">مكتمل</option>
                <option value="pending">قيد التنفيذ</option>
                <option value="overdue">متأخر</option>
              </select>
            </div>
          </div>
          
          <div class="training-modal-form-row">
            <div class="training-modal-form-group">
              <label class="training-modal-form-label">تاريخ الإكمال</label>
              <input
                v-model="formData.completion_date"
                type="date"
                class="training-modal-form-input"
              />
            </div>
            
            <div class="training-modal-form-group">
              <label class="training-modal-form-label">تاريخ الاستحقاق</label>
              <input
                v-model="formData.due_date"
                type="date"
                class="training-modal-form-input"
              />
            </div>
          </div>
          
          <div class="training-modal-form-actions">
            <button 
              type="button" 
              @click="closeModal"
              class="training-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="training-modal-form-save-btn"
            >
              <span v-if="saving" class="training-modal-form-saving-spinner"></span>
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Staff Assignment Modal -->
    <div v-if="showAssignmentModal" class="training-assignment-modal-overlay" @click="closeAssignmentModal">
      <div class="training-assignment-modal" @click.stop>
        <div class="training-assignment-modal-header">
          <h2 class="training-assignment-modal-title">تعيين موظف للتدريب</h2>
          <button @click="closeAssignmentModal" class="training-assignment-modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveStaffAssignment" class="training-assignment-modal-form">
          <div class="training-assignment-modal-form-group">
            <label class="training-assignment-modal-form-label">الموظف *</label>
            <select v-model="assignmentFormData.staff_id" class="training-assignment-modal-form-select" required>
              <option value="">اختر الموظف</option>
              <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
                {{ staff.name }}
              </option>
            </select>
          </div>
          
          <div class="training-assignment-modal-form-group">
            <label class="training-assignment-modal-form-label">برنامج التدريب *</label>
            <select v-model="assignmentFormData.training_record_id" class="training-assignment-modal-form-select" required>
              <option value="">اختر برنامج التدريب</option>
              <option v-for="program in trainingRecords" :key="program.id" :value="program.id">
                {{ program.course_name }}
              </option>
            </select>
          </div>
          
          <div class="training-assignment-modal-form-row">
            <div class="training-assignment-modal-form-group">
              <label class="training-assignment-modal-form-label">تاريخ التعيين</label>
              <input
                v-model="assignmentFormData.assigned_date"
                type="date"
                class="training-assignment-modal-form-input"
              />
            </div>
            
            <div class="training-assignment-modal-form-group">
              <label class="training-assignment-modal-form-label">الحالة</label>
              <select v-model="assignmentFormData.status" class="training-assignment-modal-form-select">
                <option value="assigned">معين</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="failed">فشل</option>
              </select>
            </div>
          </div>
          
          <div class="training-assignment-modal-form-actions">
            <button 
              type="button" 
              @click="closeAssignmentModal"
              class="training-assignment-modal-form-cancel-btn"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="training-assignment-modal-form-save-btn"
            >
              <span v-if="saving" class="training-assignment-modal-form-saving-spinner"></span>
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQualityAssuranceManager } from '@/scripts/qualityAssurance/qualityAssuranceManager'
import '@/assets/css/qualityAssurance/training.css'

defineOptions({
  name: 'TrainingView'
})

const {
  // State
  loading,
  error,
  trainingRecords,
  staffTrainingRecords,
  statistics,
  
  // Computed
  filteredTrainingRecords,
  
  // Methods
  loadTrainingRecords,
  loadStaffTrainingRecords,
  createTrainingRecord,
  updateTrainingRecord,
  deleteTrainingRecord,
  assignStaffTraining,
  updateStaffTraining,
  formatDate,
  getStatusText
} = useQualityAssuranceManager()

// Local state
const activeTab = ref('programs')
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const showAssignmentModal = ref(false)
const editingRecord = ref(null)
const editingAssignment = ref(null)
const saving = ref(false)
const staffList = ref([])

// Form data
const formData = ref({
  course_name: '',
  description: '',
  provider: '',
  status: 'pending',
  completion_date: '',
  due_date: ''
})

const assignmentFormData = ref({
  staff_id: '',
  training_record_id: '',
  assigned_date: '',
  status: 'assigned'
})

// Local methods
const refreshData = async () => {
  await loadTrainingRecords()
  await loadStaffTrainingRecords()
}

const handleSearch = () => {
  // Search is handled by the manager's computed property
}

const handleFilterChange = () => {
  // Filtering is handled by the manager's computed property
}

const openCreateModal = () => {
  editingRecord.value = null
  formData.value = {
    course_name: '',
    description: '',
    provider: '',
    status: 'pending',
    completion_date: '',
    due_date: ''
  }
  showModal.value = true
}

const openEditModal = (record) => {
  editingRecord.value = record
  formData.value = {
    course_name: record.course_name,
    description: record.description || '',
    provider: record.provider || '',
    status: record.status,
    completion_date: record.completion_date || '',
    due_date: record.due_date || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRecord.value = null
}

const saveTrainingRecord = async () => {
  saving.value = true
  try {
    if (editingRecord.value) {
      await updateTrainingRecord(editingRecord.value.id, formData.value)
    } else {
      await createTrainingRecord(formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving training record:', error)
  } finally {
    saving.value = false
  }
}

const assignStaffToTraining = (program) => {
  assignmentFormData.value = {
    staff_id: '',
    training_record_id: program.id,
    assigned_date: new Date().toISOString().split('T')[0],
    status: 'assigned'
  }
  showAssignmentModal.value = true
}

const openAssignmentModal = (assignment) => {
  editingAssignment.value = assignment
  assignmentFormData.value = {
    staff_id: assignment.staff_id,
    training_record_id: assignment.training_record_id,
    assigned_date: assignment.assigned_date || '',
    status: assignment.status
  }
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  editingAssignment.value = null
}

const saveStaffAssignment = async () => {
  saving.value = true
  try {
    if (editingAssignment.value) {
      await updateStaffTraining(editingAssignment.value.id, assignmentFormData.value)
    } else {
      await assignStaffTraining(assignmentFormData.value)
    }
    closeAssignmentModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving staff assignment:', error)
  } finally {
    saving.value = false
  }
}

const getAssignmentStatusText = (status) => {
  const statusMap = {
    'assigned': 'معين',
    'in_progress': 'قيد التنفيذ',
    'completed': 'مكتمل',
    'failed': 'فشل'
  }
  return statusMap[status] || status
}

const exportAssignmentsData = () => {
  // Implementation for exporting assignments data
  console.log('Exporting assignments data...')
}

onMounted(() => {
  loadTrainingRecords()
  loadStaffTrainingRecords()
  // Load staff list
  staffList.value = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' },
    { id: 4, name: 'سارة أحمد' },
    { id: 5, name: 'علي محمود' }
  ]
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/training.css';
</style>
