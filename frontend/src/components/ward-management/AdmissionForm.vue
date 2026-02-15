<template>
  <div class="admission-form-overlay" v-if="show" @click="closeForm">
    <div class="admission-form" @click.stop>
      <div class="form-header">
        <h2 class="form-title">قبول مريض جديد</h2>
        <button @click="closeForm" class="close-btn">
          <i class="icon">✕</i>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="form-content">
        <div class="form-grid">
          <!-- Patient Selection -->
          <div class="form-group">
            <label class="form-label">المريض *</label>
            <select 
              v-model="form.patient_id" 
              class="form-select"
              required
              @change="onPatientChange"
            >
              <option value="">اختر المريض</option>
              <option 
                v-for="patient in patients" 
                :key="patient.id" 
                :value="patient.id"
              >
                {{ patient.name }} - {{ patient.medical_record_number }}
              </option>
            </select>
          </div>

          <!-- Bed Selection -->
          <div class="form-group">
            <label class="form-label">السرير *</label>
            <select 
              v-model="form.bed_id" 
              class="form-select"
              required
              @change="onBedChange"
            >
              <option value="">اختر السرير</option>
              <option 
                v-for="bed in availableBeds" 
                :key="bed.id" 
                :value="bed.id"
              >
                {{ bed.room.room_number }} - سرير {{ bed.bed_number }}
                ({{ getBedTypeText(bed.bed_type) }})
              </option>
            </select>
          </div>

          <!-- Admission Type -->
          <div class="form-group">
            <label class="form-label">نوع القبول *</label>
            <select v-model="form.admission_type" class="form-select" required>
              <option value="">اختر نوع القبول</option>
              <option value="emergency">طوارئ</option>
              <option value="elective">مجدول</option>
              <option value="transfer">نقل</option>
              <option value="observation">مراقبة</option>
            </select>
          </div>

          <!-- Referring Doctor -->
          <div class="form-group">
            <label class="form-label">الطبيب المحول</label>
            <select v-model="form.referring_doctor_id" class="form-select">
              <option value="">اختر الطبيب</option>
              <option 
                v-for="doctor in doctors" 
                :key="doctor.id" 
                :value="doctor.id"
              >
                د. {{ doctor.name }} - {{ doctor.specialization }}
              </option>
            </select>
          </div>

          <!-- Admission Date -->
          <div class="form-group">
            <label class="form-label">تاريخ القبول *</label>
            <input 
              v-model="form.admission_date" 
              type="date" 
              class="form-input"
              required
            />
          </div>

          <!-- Admission Time -->
          <div class="form-group">
            <label class="form-label">وقت القبول *</label>
            <input 
              v-model="form.admission_time" 
              type="time" 
              class="form-input"
              required
            />
          </div>

          <!-- Diagnosis -->
          <div class="form-group full-width">
            <label class="form-label">التشخيص الأولي</label>
            <textarea 
              v-model="form.diagnosis" 
              class="form-textarea"
              rows="3"
              placeholder="أدخل التشخيص الأولي للمريض..."
            ></textarea>
          </div>

          <!-- Notes -->
          <div class="form-group full-width">
            <label class="form-label">ملاحظات إضافية</label>
            <textarea 
              v-model="form.notes" 
              class="form-textarea"
              rows="2"
              placeholder="أي ملاحظات إضافية..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeForm" class="btn btn-secondary">
            إلغاء
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <span v-else>حفظ القبول</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// import { watch } from 'vue'
import { useAdmissionForm } from '@/scripts/ward-management/admissionForm'

/**
 * Component props
 */
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  patients: {
    type: Array,
    default: () => []
  },
  availableBeds: {
    type: Array,
    default: () => []
  },
  doctors: {
    type: Array,
    default: () => []
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['close', 'submit'])

// Get admission form functionality
const {
  isSubmitting,
  form,
  selectedPatient,
  selectedBed,
  getBedTypeText,
  onPatientChange,
  onBedChange,
  submitForm,
  closeForm,
  resetForm,
  watchShow
} = useAdmissionForm(props, emit)

// Setup watchers
watchShow()
</script>

<style scoped>
@import '@/assets/css/ward-management/admissionForm.css';
</style>
