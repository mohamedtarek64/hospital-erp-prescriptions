<template>
  <div class="medical-record-create">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إنشاء سجل طبي جديد</h1>
        <p class="page-description">إضافة سجل طبي جديد للمريض مع التفاصيل الكاملة</p>
      </div>
      <div class="header-actions">
        <button @click="$router.go(-1)" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          رجوع
        </button>
      </div>
    </div>

    <div class="create-form-container">
      <form @submit.prevent="handleSubmit" class="medical-record-form">
        <!-- Patient Information Section -->
        <div class="form-section">
          <h3 class="section-title">معلومات المريض</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="patient_id" class="form-label">اختيار المريض <span class="required">*</span></label>
              <div class="patient-selector">
                <input
                  v-model="searchQuery"
                  @input="searchPatients"
                  @focus="showPatientDropdown = true"
                  placeholder="ابحث عن المريض بالاسم أو رقم الهاتف"
                  class="form-input"
                  :class="{ 'error': errors.patient_id }"
                />
                <div v-if="showPatientDropdown && filteredPatients.length > 0" class="patient-dropdown">
                  <div
                    v-for="patient in filteredPatients"
                    :key="patient.id"
                    @click="selectPatient(patient)"
                    class="patient-option"
                  >
                    <div class="patient-info">
                      <span class="patient-name">{{ patient.name }}</span>
                      <span class="patient-details">{{ patient.phone }} | {{ patient.age }} سنة</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="selectedPatient" class="selected-patient">
                <div class="patient-card">
                  <div class="patient-avatar">{{ selectedPatient.name.charAt(0) }}</div>
                  <div class="patient-details">
                    <h4 class="patient-name">{{ selectedPatient.name }}</h4>
                    <p class="patient-info">{{ selectedPatient.phone }} | {{ selectedPatient.age }} سنة | {{ selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى' }}</p>
                  </div>
                  <button @click="removePatient" type="button" class="remove-patient-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <span v-if="errors.patient_id" class="error-message">{{ errors.patient_id }}</span>
            </div>

            <div class="form-group">
              <label for="appointment_id" class="form-label">رقم الموعد (اختياري)</label>
              <input
                v-model="form.appointment_id"
                type="text"
                id="appointment_id"
                placeholder="رقم الموعد إذا كان مرتبطاً بموعد"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Medical Information Section -->
        <div class="form-section">
          <h3 class="section-title">المعلومات الطبية</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="chief_complaint" class="form-label">الشكوى الرئيسية <span class="required">*</span></label>
              <textarea
                v-model="form.chief_complaint"
                id="chief_complaint"
                rows="3"
                placeholder="وصف الشكوى الرئيسية للمريض"
                class="form-textarea"
                :class="{ 'error': errors.chief_complaint }"
              ></textarea>
              <span v-if="errors.chief_complaint" class="error-message">{{ errors.chief_complaint }}</span>
            </div>

            <div class="form-group full-width">
              <label for="examination_notes" class="form-label">ملاحظات الفحص</label>
              <textarea
                v-model="form.examination_notes"
                id="examination_notes"
                rows="4"
                placeholder="ملاحظات الفحص البدني والنتائج"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label for="diagnosis" class="form-label">التشخيص الأولي</label>
              <textarea
                v-model="form.diagnosis"
                id="diagnosis"
                rows="3"
                placeholder="التشخيص الأولي أو المشتبه به"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label for="treatment_plan" class="form-label">خطة العلاج</label>
              <textarea
                v-model="form.treatment_plan"
                id="treatment_plan"
                rows="4"
                placeholder="خطة العلاج المقترحة والخطوات التالية"
                class="form-textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Follow-up Section -->
        <div class="form-section">
          <h3 class="section-title">المتابعة</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="follow_up_date" class="form-label">تاريخ المتابعة</label>
              <input
                v-model="form.follow_up_date"
                type="date"
                id="follow_up_date"
                class="form-input"
                :min="today"
              />
            </div>

            <div class="form-group">
              <label for="status" class="form-label">الحالة <span class="required">*</span></label>
              <select
                v-model="form.status"
                id="status"
                class="form-select"
                :class="{ 'error': errors.status }"
              >
                <option value="">اختر الحالة</option>
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
                <option value="pending">في الانتظار</option>
                <option value="cancelled">ملغي</option>
              </select>
              <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
            </div>

            <div class="form-group">
              <label for="priority" class="form-label">الأولوية</label>
              <select
                v-model="form.priority"
                id="priority"
                class="form-select"
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Additional Notes Section -->
        <div class="form-section">
          <h3 class="section-title">ملاحظات إضافية</h3>
          <div class="form-group full-width">
            <label for="additional_notes" class="form-label">ملاحظات إضافية</label>
            <textarea
              v-model="form.additional_notes"
              id="additional_notes"
              rows="3"
              placeholder="أي ملاحظات إضافية أو تعليمات خاصة"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button @click="$router.go(-1)" type="button" class="btn btn-outline">
            إلغاء
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'جاري الحفظ...' : 'إنشاء السجل الطبي' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'
import { MedicalRecordCreateManager } from '@/scripts/medical-records/medicalRecordCreateManager'

const router = useRouter()
const authStore = useAuthStore()
const medicalRecordsStore = useMedicalRecordsStore()

const medicalRecordCreateManager = new MedicalRecordCreateManager()

// Get reactive data and methods from manager
const {
  form,
  loading,
  errors,
  searchQuery,
  showPatientDropdown,
  filteredPatients,
  selectedPatient,
  today
} = medicalRecordCreateManager.getReactiveData()

const {
  searchPatients,
  selectPatient,
  removePatient,
  handleSubmit
} = medicalRecordCreateManager.getMethods(router, medicalRecordsStore, authStore)

// Lifecycle
onMounted(() => {
  medicalRecordCreateManager.initializeForm()
})
</script>

<style scoped>
@import '@/assets/css/medical-record-create.css';
</style>
