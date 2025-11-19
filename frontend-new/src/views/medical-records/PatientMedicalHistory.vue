<template>
  <div class="patient-medical-history">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">جاري تحميل التاريخ الطبي...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">خطأ في التحميل</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="loadPatientHistory" class="btn btn-primary">إعادة المحاولة</button>
    </div>

    <!-- Patient History Content -->
    <div v-else-if="patient" class="patient-history-content">
      <!-- Patient Header -->
      <div class="patient-header">
        <div class="header-content">
          <div class="breadcrumb">
            <router-link to="/patients" class="breadcrumb-link">المرضى</router-link>
            <span class="breadcrumb-separator">/</span>
            <router-link :to="`/patients/${patient.id}`" class="breadcrumb-link">{{ patient.name }}</router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">التاريخ الطبي</span>
          </div>
          <h1 class="patient-title">التاريخ الطبي</h1>
          <div class="patient-info">
            <div class="patient-avatar">{{ patient.name.charAt(0) }}</div>
            <div class="patient-details">
              <h2 class="patient-name">{{ patient.name }}</h2>
              <div class="patient-meta">
                <span v-if="patient.age">العمر: {{ patient.age }} سنة</span>
                <span v-if="patient.gender" class="mr-2">| الجنس: {{ getGenderText(patient.gender) }}</span>
                <span v-if="patient.phone" class="mr-2">| الهاتف: {{ patient.phone }}</span>
                <span v-if="patient.email" class="mr-2">| البريد: {{ patient.email }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button @click="$router.go(-1)" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            رجوع
          </button>
          <button @click="createNewRecord" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            سجل طبي جديد
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="statistics-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.totalRecords }}</h3>
            <p class="stat-label">إجمالي السجلات</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🟢</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.activeRecords }}</h3>
            <p class="stat-label">السجلات النشطة</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.completedRecords }}</h3>
            <p class="stat-label">السجلات المكتملة</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.followUpDue }}</h3>
            <p class="stat-label">متابعة مطلوبة</p>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="filters-content">
          <div class="search-box">
            <input
              v-model="filters.search"
              @input="handleSearch"
              type="text"
              placeholder="البحث في السجلات الطبية..."
              class="search-input"
            />
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="filter-controls">
            <select v-model="filters.status" @change="handleFilterChange" class="filter-select">
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="pending">في الانتظار</option>
              <option value="cancelled">ملغي</option>
            </select>
            <select v-model="filters.dateRange" @change="handleFilterChange" class="filter-select">
              <option value="">جميع التواريخ</option>
              <option value="last_week">الأسبوع الماضي</option>
              <option value="last_month">الشهر الماضي</option>
              <option value="last_3_months">آخر 3 أشهر</option>
              <option value="last_year">السنة الماضية</option>
            </select>
            <button @click="clearFilters" class="btn btn-outline">مسح الفلاتر</button>
          </div>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="content-tabs">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ 'active': activeTab === tab.id }"
          >
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Medical Records Tab -->
          <div v-if="activeTab === 'records'" class="tab-panel">
            <div v-if="filteredRecords.length === 0" class="empty-state">
              <div class="empty-icon">📋</div>
              <p class="empty-text">لا توجد سجلات طبية متاحة</p>
              <button @click="createNewRecord" class="btn btn-primary">إنشاء سجل طبي جديد</button>
            </div>
            <div v-else class="records-grid">
              <div
                v-for="record in paginatedRecords"
                :key="record.id"
                class="record-card"
                @click="viewRecord(record)"
              >
                <div class="record-header">
                  <div class="record-status" :class="getStatusClass(record.status)">
                    {{ getStatusText(record.status) }}
                  </div>
                  <span class="record-date">{{ formatDate(record.examination_date) }}</span>
                </div>
                <div class="record-content">
                  <h4 class="record-complaint">{{ record.chief_complaint }}</h4>
                  <div class="record-meta">
                    <span v-if="record.doctor?.name" class="doctor-name">الطبيب: {{ record.doctor.name }}</span>
                    <span v-if="record.follow_up_date" class="follow-up-date">
                      المتابعة: {{ formatDate(record.follow_up_date) }}
                    </span>
                  </div>
                </div>
                <div class="record-stats">
                  <span v-if="record.diagnoses?.length" class="stat-item">التشخيصات: {{ record.diagnoses.length }}</span>
                  <span v-if="record.prescriptions?.length" class="stat-item">الوصفات: {{ record.prescriptions.length }}</span>
                  <span v-if="record.medical_tests?.length" class="stat-item">الفحوصات: {{ record.medical_tests.length }}</span>
                </div>
              </div>
            </div>
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                السابق
              </button>
              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  class="page-btn"
                  :class="{ 'active': page === currentPage }"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                التالي
              </button>
            </div>
          </div>

          <!-- Timeline Tab -->
          <div v-if="activeTab === 'timeline'" class="tab-panel">
            <MedicalTimeline :timeline-items="timelineItems" />
          </div>

          <!-- Diagnoses Tab -->
          <div v-if="activeTab === 'diagnoses'" class="tab-panel">
            <div v-if="allDiagnoses.length === 0" class="empty-state">
              <div class="empty-icon">🔍</div>
              <p class="empty-text">لا توجد تشخيصات مسجلة</p>
            </div>
            <div v-else class="diagnoses-list">
              <div v-for="diagnosis in allDiagnoses" :key="diagnosis.id" class="diagnosis-item">
                <div class="diagnosis-header">
                  <h4 class="diagnosis-name">{{ diagnosis.diagnosis_name }}</h4>
                  <div class="diagnosis-badges">
                    <span class="severity-badge" :class="getSeverityClass(diagnosis.severity)">
                      {{ getSeverityText(diagnosis.severity) }}
                    </span>
                    <span class="status-badge" :class="getStatusClass(diagnosis.status)">
                      {{ getStatusText(diagnosis.status) }}
                    </span>
                  </div>
                </div>
                <div class="diagnosis-details">
                  <span class="diagnosis-date">{{ formatDate(diagnosis.diagnosis_date) }}</span>
                  <span v-if="diagnosis.icd_code" class="icd-code">ICD: {{ diagnosis.icd_code }}</span>
                </div>
                <p v-if="diagnosis.notes" class="diagnosis-notes">{{ diagnosis.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Prescriptions Tab -->
          <div v-if="activeTab === 'prescriptions'" class="tab-panel">
            <div v-if="allPrescriptions.length === 0" class="empty-state">
              <div class="empty-icon">💊</div>
              <p class="empty-text">لا توجد وصفات طبية مسجلة</p>
            </div>
            <div v-else class="prescriptions-list">
              <div v-for="prescription in allPrescriptions" :key="prescription.id" class="prescription-item">
                <div class="prescription-header">
                  <h4 class="medication-name">{{ prescription.medication_name }}</h4>
                  <div class="prescription-badges">
                    <span class="status-badge" :class="getStatusClass(prescription.status)">
                      {{ getStatusText(prescription.status) }}
                    </span>
                    <span v-if="isExpired(prescription)" class="expired-badge">منتهي الصلاحية</span>
                  </div>
                </div>
                <div class="prescription-details">
                  <span class="dosage">{{ prescription.dosage }}</span>
                  <span class="frequency">{{ prescription.frequency }}</span>
                  <span class="duration">{{ prescription.duration }}</span>
                  <span class="prescribed-date">{{ formatDate(prescription.prescribed_date) }}</span>
                </div>
                <p v-if="prescription.instructions" class="prescription-instructions">{{ prescription.instructions }}</p>
              </div>
            </div>
          </div>

          <!-- Tests Tab -->
          <div v-if="activeTab === 'tests'" class="tab-panel">
            <div v-if="allTests.length === 0" class="empty-state">
              <div class="empty-icon">🔬</div>
              <p class="empty-text">لا توجد فحوصات طبية مسجلة</p>
            </div>
            <div v-else class="tests-list">
              <div v-for="test in allTests" :key="test.id" class="test-item">
                <div class="test-header">
                  <h4 class="test-name">{{ test.test_name }}</h4>
                  <div class="test-badges">
                    <span class="status-badge" :class="getTestStatusClass(test.status)">
                      {{ getTestStatusText(test.status) }}
                    </span>
                    <span v-if="isOverdue(test.test_date)" class="overdue-badge">متأخر</span>
                  </div>
                </div>
                <div class="test-details">
                  <span class="test-type">{{ getTestTypeText(test.test_type) }}</span>
                  <span class="test-date">{{ formatDate(test.test_date) }}</span>
                  <span v-if="test.results_date" class="results-date">النتائج: {{ formatDate(test.results_date) }}</span>
                </div>
                <div v-if="test.results" class="test-results">
                  <strong>النتائج:</strong> {{ test.results }}
                  <span v-if="test.normal_range" class="normal-range">(المدى الطبيعي: {{ test.normal_range }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'
import { formatDate, isOverdue, getStatusColor, getSeverityColor, getTestStatusColor, getTestTypeText, getTestStatusText } from '@/utils/medicalHelpers'
import MedicalTimeline from '@/components/medical-records/MedicalTimeline.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const medicalRecordsStore = useMedicalRecordsStore()

// Reactive data
const loading = ref(true)
const error = ref(null)
const patient = ref(null)
const medicalRecords = ref([])
const activeTab = ref('records')

// Filters and pagination
const filters = ref({
  search: '',
  status: '',
  dateRange: ''
})

const currentPage = ref(1)
const perPage = ref(10)

// Computed properties
const statistics = computed(() => {
  const total = medicalRecords.value.length
  const active = medicalRecords.value.filter(r => r.status === 'active').length
  const completed = medicalRecords.value.filter(r => r.status === 'completed').length
  const followUpDue = medicalRecords.value.filter(r => 
    r.status === 'active' && 
    r.follow_up_date && 
    new Date(r.follow_up_date) <= new Date()
  ).length

  return { totalRecords: total, activeRecords: active, completedRecords: completed, followUpDue }
})

const tabs = computed(() => [
  { id: 'records', label: 'السجلات الطبية', count: medicalRecords.value.length },
  { id: 'timeline', label: 'الجدول الزمني' },
  { id: 'diagnoses', label: 'التشخيصات', count: allDiagnoses.value.length },
  { id: 'prescriptions', label: 'الوصفات الطبية', count: allPrescriptions.value.length },
  { id: 'tests', label: 'الفحوصات الطبية', count: allTests.value.length }
])

const filteredRecords = computed(() => {
  let filtered = medicalRecords.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(record => 
      record.chief_complaint?.toLowerCase().includes(search) ||
      record.diagnosis?.toLowerCase().includes(search) ||
      record.treatment_plan?.toLowerCase().includes(search) ||
      record.doctor?.name?.toLowerCase().includes(search)
    )
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(record => record.status === filters.value.status)
  }

  // Date range filter
  if (filters.value.dateRange) {
    const now = new Date()
    const ranges = {
      last_week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      last_month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      last_3_months: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      last_year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }
    
    if (ranges[filters.value.dateRange]) {
      filtered = filtered.filter(record => 
        new Date(record.examination_date) >= ranges[filters.value.dateRange]
      )
    }
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / perPage.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredRecords.value.slice(start, end)
})

const allDiagnoses = computed(() => {
  const diagnoses = []
  medicalRecords.value.forEach(record => {
    if (record.diagnoses) {
      diagnoses.push(...record.diagnoses.map(d => ({ ...d, recordId: record.id })))
    }
  })
  return diagnoses.sort((a, b) => new Date(b.diagnosis_date) - new Date(a.diagnosis_date))
})

const allPrescriptions = computed(() => {
  const prescriptions = []
  medicalRecords.value.forEach(record => {
    if (record.prescriptions) {
      prescriptions.push(...record.prescriptions.map(p => ({ ...p, recordId: record.id })))
    }
  })
  return prescriptions.sort((a, b) => new Date(b.prescribed_date) - new Date(a.prescribed_date))
})

const allTests = computed(() => {
  const tests = []
  medicalRecords.value.forEach(record => {
    if (record.medical_tests) {
      tests.push(...record.medical_tests.map(t => ({ ...t, recordId: record.id })))
    }
  })
  return tests.sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
})

const timelineItems = computed(() => {
  const items = []
  
  // Add medical records
  medicalRecords.value.forEach(record => {
    items.push({
      id: `record-${record.id}`,
      type: 'examination',
      date: record.examination_date,
      description: record.chief_complaint,
      doctor: record.doctor,
      recordId: record.id
    })
  })
  
  // Add diagnoses
  allDiagnoses.value.forEach(diagnosis => {
    items.push({
      id: `diagnosis-${diagnosis.id}`,
      type: 'diagnosis',
      date: diagnosis.diagnosis_date,
      description: diagnosis.diagnosis_name,
      severity: diagnosis.severity,
      status: diagnosis.status,
      recordId: diagnosis.recordId
    })
  })
  
  // Add prescriptions
  allPrescriptions.value.forEach(prescription => {
    items.push({
      id: `prescription-${prescription.id}`,
      type: 'prescription',
      date: prescription.prescribed_date,
      description: prescription.medication_name,
      status: prescription.status,
      recordId: prescription.recordId
    })
  })
  
  // Add tests
  allTests.value.forEach(test => {
    items.push({
      id: `test-${test.id}`,
      type: 'test',
      date: test.test_date,
      description: test.test_name,
      status: test.status,
      results: test.results,
      recordId: test.recordId
    })
  })
  
  return items.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Methods
const loadPatientHistory = async () => {
  loading.value = true
  error.value = null
  
  try {
    const patientId = route.params.patientId
    const records = await medicalRecordsStore.fetchPatientRecords(patientId)
    medicalRecords.value = records
    
    // Load patient info (in real app, this would come from a patient store)
    patient.value = {
      id: patientId,
      name: 'أحمد محمد علي', // This would come from API
      age: 35,
      gender: 'male',
      phone: '0123456789',
      email: 'ahmed@example.com'
    }
  } catch (err) {
    error.value = 'فشل في تحميل التاريخ الطبي'
    console.error('Error loading patient history:', err)
  } finally {
    loading.value = false
  }
}

const createNewRecord = () => {
  router.push(`/medical-records/create?patient_id=${patient.value.id}`)
}

const viewRecord = (record) => {
  router.push(`/medical-records/${record.id}`)
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = { search: '', status: '', dateRange: '' }
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Utility methods
const getStatusClass = (status) => {
  const classes = {
    active: 'status-active',
    completed: 'status-completed',
    pending: 'status-pending',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-default'
}

const getStatusText = (status) => {
  const texts = {
    active: 'نشط',
    completed: 'مكتمل',
    pending: 'في الانتظار',
    cancelled: 'ملغي'
  }
  return texts[status] || status
}

const getSeverityClass = (severity) => {
  const classes = {
    mild: 'severity-mild',
    moderate: 'severity-moderate',
    severe: 'severity-severe',
    critical: 'severity-critical'
  }
  return classes[severity] || 'severity-default'
}

const getSeverityText = (severity) => {
  const texts = {
    mild: 'خفيف',
    moderate: 'متوسط',
    severe: 'شديد',
    critical: 'حرج'
  }
  return texts[severity] || severity
}

const getTestStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    in_progress: 'status-in-progress',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-default'
}

const getTestStatusTextDuplicate = (status) => {
  const texts = {
    pending: 'في الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return texts[status] || status
}

// getTestTypeText is imported from @/utils/medicalHelpers

const getGenderText = (gender) => {
  return gender === 'male' ? 'ذكر' : 'أنثى'
}

const isExpired = (prescription) => {
  if (!prescription.end_date) return false
  return new Date(prescription.end_date) < new Date()
}

// Watchers
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadPatientHistory()
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';
</style>
