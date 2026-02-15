<template>
  <div class="prescription-form">
    <div class="form-header">
      <h3 class="form-title">{{ isEditing ? 'تعديل الوصفة الطبية' : 'وصفة طبية جديدة' }}</h3>
      <button @click="$emit('close')" class="btn-close">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <form @submit.prevent="prescriptionFormManager.handleSubmit" class="form-container">
      <!-- Patient Information Section -->
      <div class="form-section">
        <h4 class="section-title">معلومات المريض</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="patient" class="form-label">المريض *</label>
            <select 
              id="patient" 
              v-model="prescriptionFormManager.form.patientId" 
              class="form-select" 
              :class="{ 'error': prescriptionFormManager.errors.patientId }" 
              required
            >
              <option value="">اختر المريض</option>
              <option v-for="patient in prescriptionFormManager.patients" :key="patient.id" :value="patient.id">
                {{ patient.name }} - {{ patient.fileNumber }}
              </option>
            </select>
            <span v-if="prescriptionFormManager.errors.patientId" class="error-message">
              {{ prescriptionFormManager.errors.patientId }}
            </span>
          </div>
          <div class="form-group">
            <label for="doctor" class="form-label">الطبيب المعالج *</label>
            <select 
              id="doctor" 
              v-model="prescriptionFormManager.form.doctorId" 
              class="form-select" 
              :class="{ 'error': prescriptionFormManager.errors.doctorId }" 
              required
            >
              <option value="">اختر الطبيب</option>
              <option v-for="doctor in prescriptionFormManager.doctors" :key="doctor.id" :value="doctor.id">
                د. {{ doctor.name }} - {{ doctor.specialization }}
              </option>
            </select>
            <span v-if="prescriptionFormManager.errors.doctorId" class="error-message">
              {{ prescriptionFormManager.errors.doctorId }}
            </span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prescriptionDate" class="form-label">تاريخ الوصفة *</label>
            <input 
              id="prescriptionDate" 
              v-model="prescriptionFormManager.form.prescriptionDate" 
              type="date" 
              class="form-input" 
              :class="{ 'error': prescriptionFormManager.errors.prescriptionDate }" 
              required
            >
            <span v-if="prescriptionFormManager.errors.prescriptionDate" class="error-message">
              {{ prescriptionFormManager.errors.prescriptionDate }}
            </span>
          </div>
          <div class="form-group">
            <label for="priority" class="form-label">الأولوية</label>
            <select 
              id="priority" 
              v-model="prescriptionFormManager.form.priority" 
              class="form-select"
            >
              <option value="normal">عادية</option>
              <option value="urgent">عاجلة</option>
              <option value="emergency">طارئة</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="diagnosis" class="form-label">التشخيص</label>
            <textarea 
              id="diagnosis" 
              v-model="prescriptionFormManager.form.diagnosis" 
              class="form-textarea" 
              rows="3" 
              placeholder="التشخيص الطبي..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="notes" class="form-label">ملاحظات طبية</label>
            <textarea 
              id="notes" 
              v-model="prescriptionFormManager.form.notes" 
              class="form-textarea" 
              rows="3" 
              placeholder="أي ملاحظات طبية إضافية..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Medications Section -->
      <div class="form-section">
        <div class="section-header">
          <h4 class="section-title">الأدوية الموصوفة</h4>
          <button type="button" @click="prescriptionFormManager.addMedication()" class="btn-add-medication">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            إضافة دواء
          </button>
        </div>

        <div v-if="prescriptionFormManager.form.medications.length === 0" class="no-medications">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p class="no-medications-text">لا توجد أدوية موصوفة</p>
          <p class="no-medications-subtext">اضغط على "إضافة دواء" لبدء إضافة الأدوية</p>
        </div>

        <div v-else class="medications-list">
          <div 
            v-for="(medication, index) in prescriptionFormManager.form.medications" 
            :key="index" 
            class="medication-row"
          >
            <div class="medication-content">
              <div class="form-row">
                <div class="form-group">
                  <label :for="`medicationName-${index}`" class="form-label">اسم الدواء *</label>
                  <select 
                    :id="`medicationName-${index}`" 
                    v-model="medication.medicineId" 
                    class="form-select" 
                    :class="{ 'error': prescriptionFormManager.getMedicationError(index, 'medicineId') }" 
                    required
                  >
                    <option value="">اختر الدواء</option>
                    <option v-for="medicine in prescriptionFormManager.medicines" :key="medicine.id" :value="medicine.id">
                      {{ medicine.name }} - {{ medicine.genericName }}
                    </option>
                  </select>
                  <span v-if="prescriptionFormManager.getMedicationError(index, 'medicineId')" class="error-message">
                    {{ prescriptionFormManager.getMedicationError(index, 'medicineId') }}
                  </span>
                </div>
                <div class="form-group">
                  <label :for="`medicationDosage-${index}`" class="form-label">الجرعة *</label>
                  <input 
                    :id="`medicationDosage-${index}`" 
                    v-model="medication.dosage" 
                    type="text" 
                    class="form-input" 
                    :class="{ 'error': prescriptionFormManager.getMedicationError(index, 'dosage') }" 
                    placeholder="مثال: 500mg" 
                    required
                  >
                  <span v-if="prescriptionFormManager.getMedicationError(index, 'dosage')" class="error-message">
                    {{ prescriptionFormManager.getMedicationError(index, 'dosage') }}
                  </span>
                </div>
                <div class="form-group">
                  <label :for="`medicationFrequency-${index}`" class="form-label">التكرار *</label>
                  <select 
                    :id="`medicationFrequency-${index}`" 
                    v-model="medication.frequency" 
                    class="form-select" 
                    :class="{ 'error': prescriptionFormManager.getMedicationError(index, 'frequency') }" 
                    required
                  >
                    <option value="">اختر التكرار</option>
                    <option value="once">مرة واحدة يومياً</option>
                    <option value="twice">مرتين يومياً</option>
                    <option value="thrice">ثلاث مرات يومياً</option>
                    <option value="four">أربع مرات يومياً</option>
                    <option value="every6h">كل 6 ساعات</option>
                    <option value="every8h">كل 8 ساعات</option>
                    <option value="every12h">كل 12 ساعة</option>
                    <option value="as_needed">حسب الحاجة</option>
                  </select>
                  <span v-if="prescriptionFormManager.getMedicationError(index, 'frequency')" class="error-message">
                    {{ prescriptionFormManager.getMedicationError(index, 'frequency') }}
                  </span>
                </div>
                <div class="form-group">
                  <label :for="`medicationDuration-${index}`" class="form-label">مدة العلاج *</label>
                  <input 
                    :id="`medicationDuration-${index}`" 
                    v-model="medication.duration" 
                    type="text" 
                    class="form-input" 
                    :class="{ 'error': prescriptionFormManager.getMedicationError(index, 'duration') }" 
                    placeholder="مثال: 7 أيام" 
                    required
                  >
                  <span v-if="prescriptionFormManager.getMedicationError(index, 'duration')" class="error-message">
                    {{ prescriptionFormManager.getMedicationError(index, 'duration') }}
                  </span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label :for="`medicationInstructions-${index}`" class="form-label">تعليمات الاستخدام</label>
                  <textarea 
                    :id="`medicationInstructions-${index}`" 
                    v-model="medication.instructions" 
                    class="form-textarea" 
                    rows="2" 
                    placeholder="تعليمات خاصة بالدواء..."
                  ></textarea>
                </div>
                <div class="form-group">
                  <label :for="`medicationQuantity-${index}`" class="form-label">الكمية المطلوبة *</label>
                  <input 
                    :id="`medicationQuantity-${index}`" 
                    v-model.number="medication.quantity" 
                    type="number" 
                    class="form-input" 
                    :class="{ 'error': prescriptionFormManager.getMedicationError(index, 'quantity') }" 
                    min="1" 
                    required
                  >
                  <span v-if="prescriptionFormManager.getMedicationError(index, 'quantity')" class="error-message">
                    {{ prescriptionFormManager.getMedicationError(index, 'quantity') }}
                  </span>
                </div>
                <div class="medication-actions">
                  <button 
                    type="button" 
                    @click="prescriptionFormManager.removeMedication(index)" 
                    class="btn-remove-medication"
                    title="حذف الدواء"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prescription Summary -->
      <div class="form-section prescription-summary">
        <h4 class="section-title">ملخص الوصفة الطبية</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">عدد الأدوية:</span>
            <span class="summary-value">{{ prescriptionFormManager.form.medications.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">إجمالي الكمية:</span>
            <span class="summary-value">{{ prescriptionFormManager.totalQuantity }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">إجمالي السعر:</span>
            <span class="summary-value total-price">{{ prescriptionFormManager.totalAmount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">الحالة:</span>
            <span class="summary-value status-pending">قيد الانتظار</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          إلغاء
        </button>
        <button type="submit" class="btn-primary" :disabled="prescriptionFormManager.isSubmitting">
          <svg v-if="prescriptionFormManager.isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ isEditing ? 'تحديث الوصفة' : 'إنشاء الوصفة' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePrescriptionFormManager } from './PrescriptionForm.js'

const props = defineProps({
  prescription: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const prescriptionFormManager = usePrescriptionFormManager(props, emit)

const {
  isEditing,
  form,
  errors,
  isSubmitting,
  patients,
  doctors,
  medicines,
  totalQuantity,
  totalAmount
} = prescriptionFormManager

const {
  handleSubmit,
  addMedication,
  removeMedication,
  getMedicationError
} = prescriptionFormManager

onMounted(async () => {
  await prescriptionFormManager.initializeForm()
})
</script>

<style scoped>
@import './PrescriptionForm.css';
</style>
