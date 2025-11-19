<template>
  <div class="medical-record-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">جاري تحميل السجل الطبي...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">خطأ في التحميل</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="loadMedicalRecord" class="btn btn-primary">إعادة المحاولة</button>
    </div>

    <!-- Medical Record Content -->
    <div v-else-if="medicalRecord" class="medical-record-content">
      <!-- Header -->
      <div class="record-header">
        <div class="header-content">
          <div class="breadcrumb">
            <router-link to="/medical-records" class="breadcrumb-link">السجلات الطبية</router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">السجل رقم {{ medicalRecord.id }}</span>
          </div>
          <h1 class="record-title">السجل الطبي</h1>
          <div class="record-meta">
            <span class="record-number">رقم السجل: {{ medicalRecord.id }}</span>
            <span class="record-date">تاريخ الفحص: {{ formatDate(medicalRecord.examination_date) }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="$router.go(-1)" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            رجوع
          </button>
          <button v-if="canEdit" @click="editRecord" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            تعديل
          </button>
        </div>
      </div>

      <!-- Record Status Banner -->
      <div class="status-banner" :class="getStatusClass(medicalRecord.status)">
        <div class="status-content">
          <span class="status-icon">{{ getStatusIcon(medicalRecord.status) }}</span>
          <span class="status-text">{{ getStatusText(medicalRecord.status) }}</span>
          <span v-if="medicalRecord.priority" class="priority-badge" :class="getPriorityClass(medicalRecord.priority)">
            {{ getPriorityText(medicalRecord.priority) }}
          </span>
        </div>
        <div v-if="medicalRecord.follow_up_date" class="follow-up-info">
          <span class="follow-up-label">تاريخ المتابعة:</span>
          <span class="follow-up-date" :class="getFollowUpClass(medicalRecord.follow_up_date)">
            {{ formatDate(medicalRecord.follow_up_date) }}
            <span v-if="isOverdue(medicalRecord.follow_up_date)" class="overdue-indicator">
              (متأخر)
            </span>
          </span>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Column - Patient & Medical Info -->
        <div class="left-column">
          <!-- Patient Information Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">معلومات المريض</h3>
            </div>
            <div class="card-content">
              <div class="patient-info">
                <div class="patient-avatar">{{ medicalRecord.patient?.name?.charAt(0) || '?' }}</div>
                <div class="patient-details">
                  <h4 class="patient-name">{{ medicalRecord.patient?.name || 'غير محدد' }}</h4>
                  <div class="patient-meta">
                    <span v-if="medicalRecord.patient?.age">العمر: {{ medicalRecord.patient.age }} سنة</span>
                    <span v-if="medicalRecord.patient?.gender" class="mr-2">| الجنس: {{ getGenderText(medicalRecord.patient.gender) }}</span>
                    <span v-if="medicalRecord.patient?.phone" class="mr-2">| الهاتف: {{ medicalRecord.patient.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Medical Information Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">المعلومات الطبية</h3>
            </div>
            <div class="card-content">
              <div class="medical-info">
                <div class="info-section">
                  <h4 class="section-title">الشكوى الرئيسية</h4>
                  <p class="section-content">{{ medicalRecord.chief_complaint || 'غير محدد' }}</p>
                </div>
                
                <div v-if="medicalRecord.examination_notes" class="info-section">
                  <h4 class="section-title">ملاحظات الفحص</h4>
                  <p class="section-content">{{ medicalRecord.examination_notes }}</p>
                </div>
                
                <div v-if="medicalRecord.diagnosis" class="info-section">
                  <h4 class="section-title">التشخيص الأولي</h4>
                  <p class="section-content">{{ medicalRecord.diagnosis }}</p>
                </div>
                
                <div v-if="medicalRecord.treatment_plan" class="info-section">
                  <h4 class="section-title">خطة العلاج</h4>
                  <p class="section-content">{{ medicalRecord.treatment_plan }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Doctor Information Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">معلومات الطبيب</h3>
            </div>
            <div class="card-content">
              <div class="doctor-info">
                <div class="doctor-avatar">{{ medicalRecord.doctor?.name?.charAt(0) || '?' }}</div>
                <div class="doctor-details">
                  <h4 class="doctor-name">{{ medicalRecord.doctor?.name || 'غير محدد' }}</h4>
                  <span v-if="medicalRecord.doctor?.department" class="doctor-department">
                    {{ medicalRecord.doctor.department }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Components -->
        <div class="right-column">
          <!-- Diagnoses Component -->
          <div class="component-section">
            <DiagnosisList
              :diagnoses="medicalRecord.diagnoses || []"
              :medical-record-id="medicalRecord.id"
              @diagnosis-added="handleDiagnosisAdded"
              @diagnosis-updated="handleDiagnosisUpdated"
              @diagnosis-deleted="handleDiagnosisDeleted"
            />
          </div>

          <!-- Prescriptions Component -->
          <div class="component-section">
            <PrescriptionList
              :prescriptions="medicalRecord.prescriptions || []"
              :medical-record-id="medicalRecord.id"
              @prescription-added="handlePrescriptionAdded"
              @prescription-updated="handlePrescriptionUpdated"
              @prescription-deleted="handlePrescriptionDeleted"
              @prescription-discontinued="handlePrescriptionDiscontinued"
            />
          </div>

          <!-- Medical Tests Component -->
          <div class="component-section">
            <TestResultsList
              :tests="medicalRecord.medical_tests || []"
              :medical-record-id="medicalRecord.id"
              @test-added="handleTestAdded"
              @test-updated="handleTestUpdated"
              @test-deleted="handleTestDeleted"
              @results-updated="handleResultsUpdated"
            />
          </div>

          <!-- Medical Timeline Component -->
          <div class="component-section">
            <MedicalTimeline
              :timeline-items="getTimelineItems()"
            />
          </div>
        </div>
      </div>

      <!-- Attachments Section -->
      <div class="attachments-section">
        <div class="section-header">
          <h3 class="section-title">المرفقات والملفات</h3>
          <button v-if="canEdit" @click="showFileUpload = true" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            إضافة ملف
          </button>
        </div>
        
        <div v-if="medicalRecord.attachments && medicalRecord.attachments.length > 0" class="attachments-grid">
          <div v-for="attachment in medicalRecord.attachments" :key="attachment.id" class="attachment-card">
            <div class="attachment-icon">{{ getFileTypeIcon(attachment.file_type) }}</div>
            <div class="attachment-info">
              <h4 class="attachment-name">{{ attachment.file_name }}</h4>
              <p class="attachment-details">{{ formatFileSize(attachment.file_size) }} | {{ formatDate(attachment.uploaded_at) }}</p>
            </div>
            <div class="attachment-actions">
              <button @click="downloadAttachment(attachment)" class="action-btn download-btn" title="تحميل">⬇️</button>
              <button @click="viewAttachment(attachment)" class="action-btn view-btn" title="عرض">👁️</button>
              <button v-if="canDelete" @click="deleteAttachment(attachment)" class="action-btn delete-btn" title="حذف">🗑️</button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-attachments">
          <div class="empty-icon">📎</div>
          <p class="empty-text">لا توجد مرفقات لهذا السجل الطبي</p>
        </div>
      </div>

      <!-- File Upload Modal -->
      <div v-if="showFileUpload" class="file-upload-modal">
        <div class="modal-overlay" @click="showFileUpload = false"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">إضافة ملفات مرفقة</h3>
            <button @click="showFileUpload = false" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <FileUpload
              v-model="uploadedFiles"
              :accepted-types="acceptedFileTypes"
              :max-file-size="maxFileSize"
              @files-uploaded="handleFilesUploaded"
              @upload-error="handleUploadError"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMedicalRecordView } from '@/scripts/medical-records/medicalRecordView.js'
import { isOverdue } from '@/utils/medicalHelpers'
import DiagnosisList from '@/components/medical-records/DiagnosisList.vue'
import PrescriptionList from '@/components/medical-records/PrescriptionList.vue'
import TestResultsList from '@/components/medical-records/TestResultsList.vue'
import MedicalTimeline from '@/components/medical-records/MedicalTimeline.vue'
import FileUpload from '@/components/medical-records/FileUpload.vue'

// Use composable
const {
  loading,
  medicalRecord,
  error,
  user,
  recordId,
  canEdit,
  loadMedicalRecord,
  formatDate,
  formatDateTime,
  getStatusClass,
  getStatusText,
  getPriorityClass,
  getPriorityText,
  editRecord,
  printRecord,
  downloadRecord,
  shareRecord,
  addNote,
  addAttachment
} = useMedicalRecordView()

// Additional local state
const showFileUpload = ref(false)
const uploadedFiles = ref([])

// Constants
const acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx'
const maxFileSize = 10 * 1024 * 1024 // 10MB

const getStatusIcon = (status) => {
  const icons = {
    active: '🟢',
    completed: '✅',
    pending: '⏳',
    cancelled: '❌'
  }
  return icons[status] || '❓'
}

const getStatusTextDuplicate = (status) => {
  const texts = {
    active: 'نشط',
    completed: 'مكتمل',
    pending: 'في الانتظار',
    cancelled: 'ملغي'
  }
  return texts[status] || status
}

// getPriorityClass is imported from useMedicalRecordView()

// getPriorityText is imported from useMedicalRecordView()

const getFollowUpClass = (followUpDate) => {
  if (isOverdue(followUpDate)) {
    return 'follow-up-overdue'
  }
  return 'follow-up-normal'
}

const getGenderText = (gender) => {
  return gender === 'male' ? 'ذكر' : 'أنثى'
}

const getTimelineItems = () => {
  const items = []
  
  // Add examination
  if (medicalRecord.value) {
    items.push({
      id: `exam-${medicalRecord.value.id}`,
      type: 'examination',
      date: medicalRecord.value.examination_date,
      description: medicalRecord.value.chief_complaint,
      doctor: medicalRecord.value.doctor
    })
  }
  
  // Add diagnoses
  if (medicalRecord.value?.diagnoses) {
    medicalRecord.value.diagnoses.forEach(diagnosis => {
      items.push({
        id: `diagnosis-${diagnosis.id}`,
        type: 'diagnosis',
        date: diagnosis.diagnosis_date,
        description: diagnosis.diagnosis_name,
        doctor: medicalRecord.value.doctor,
        severity: diagnosis.severity,
        status: diagnosis.status
      })
    })
  }
  
  // Add prescriptions
  if (medicalRecord.value?.prescriptions) {
    medicalRecord.value.prescriptions.forEach(prescription => {
      items.push({
        id: `prescription-${prescription.id}`,
        type: 'prescription',
        date: prescription.prescribed_date,
        description: prescription.medication_name,
        doctor: medicalRecord.value.doctor,
        status: prescription.status
      })
    })
  }
  
  // Add tests
  if (medicalRecord.value?.medical_tests) {
    medicalRecord.value.medical_tests.forEach(test => {
      items.push({
        id: `test-${test.id}`,
        type: 'test',
        date: test.test_date,
        description: test.test_name,
        doctor: medicalRecord.value.doctor,
        status: test.status,
        results: test.results
      })
    })
  }
  
  // Add attachments
  if (medicalRecord.value?.attachments) {
    medicalRecord.value.attachments.forEach(attachment => {
      items.push({
        id: `attachment-${attachment.id}`,
        type: 'attachment',
        date: attachment.uploaded_at,
        description: attachment.file_name,
        staff: attachment.uploader,
        fileType: attachment.file_type,
        fileSize: attachment.file_size
      })
    })
  }
  
  return items
}

// Event handlers
const handleDiagnosisAdded = (diagnosis) => {
  if (!medicalRecord.value.diagnoses) {
    medicalRecord.value.diagnoses = []
  }
  medicalRecord.value.diagnoses.push(diagnosis)
}

const handleDiagnosisUpdated = (updatedDiagnosis) => {
  const index = medicalRecord.value.diagnoses.findIndex(d => d.id === updatedDiagnosis.id)
  if (index !== -1) {
    medicalRecord.value.diagnoses[index] = updatedDiagnosis
  }
}

const handleDiagnosisDeleted = (deletedDiagnosis) => {
  medicalRecord.value.diagnoses = medicalRecord.value.diagnoses.filter(d => d.id !== deletedDiagnosis.id)
}

const handlePrescriptionAdded = (prescription) => {
  if (!medicalRecord.value.prescriptions) {
    medicalRecord.value.prescriptions = []
  }
  medicalRecord.value.prescriptions.push(prescription)
}

const handlePrescriptionUpdated = (updatedPrescription) => {
  const index = medicalRecord.value.prescriptions.findIndex(p => p.id === updatedPrescription.id)
  if (index !== -1) {
    medicalRecord.value.prescriptions[index] = updatedPrescription
  }
}

const handlePrescriptionDeleted = (deletedPrescription) => {
  medicalRecord.value.prescriptions = medicalRecord.value.prescriptions.filter(p => p.id !== deletedPrescription.id)
}

const handlePrescriptionDiscontinued = (discontinuedPrescription) => {
  const index = medicalRecord.value.prescriptions.findIndex(p => p.id === discontinuedPrescription.id)
  if (index !== -1) {
    medicalRecord.value.prescriptions[index] = discontinuedPrescription
  }
}

const handleTestAdded = (test) => {
  if (!medicalRecord.value.medical_tests) {
    medicalRecord.value.medical_tests = []
  }
  medicalRecord.value.medical_tests.push(test)
}

const handleTestUpdated = (updatedTest) => {
  const index = medicalRecord.value.medical_tests.findIndex(t => t.id === updatedTest.id)
  if (index !== -1) {
    medicalRecord.value.medical_tests[index] = updatedTest
  }
}

const handleTestDeleted = (deletedTest) => {
  medicalRecord.value.medical_tests = medicalRecord.value.medical_tests.filter(t => t.id !== deletedTest.id)
}

const handleResultsUpdated = (updatedTest) => {
  const index = medicalRecord.value.medical_tests.findIndex(t => t.id === updatedTest.id)
  if (index !== -1) {
    medicalRecord.value.medical_tests[index] = updatedTest
  }
}

const handleFilesUploaded = (files) => {
  // Handle uploaded files
  console.log('Files uploaded:', files)
  showFileUpload.value = false
}

const handleUploadError = (error) => {
  console.error('Upload error:', error)
  alert('حدث خطأ أثناء رفع الملفات')
}

const downloadAttachment = (attachment) => {
  // Implement file download logic
  console.log('Downloading attachment:', attachment)
}

const viewAttachment = (attachment) => {
  // Implement file preview logic
  console.log('Viewing attachment:', attachment)
}

const deleteAttachment = (attachment) => {
  if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
    // Implement delete logic
    console.log('Deleting attachment:', attachment)
  }
}

// Lifecycle
onMounted(() => {
  loadMedicalRecord()
})
</script>

<style scoped>
@import '@/assets/css/medical-record-view.css';
</style>
