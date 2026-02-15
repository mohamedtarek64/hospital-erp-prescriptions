<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200">
    <!-- Form Header -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'تعديل السجل الطبي' : 'إضافة سجل طبي جديد' }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ isEditing ? 'قم بتعديل بيانات السجل الطبي' : 'أدخل بيانات السجل الطبي الجديد' }}
          </p>
        </div>
        
        <!-- Form Status -->
        <div class="flex items-center gap-3">
          <div class="text-sm text-gray-600">
            <span class="font-medium">الحالة:</span>
            <span :class="[
              'ml-2 px-2 py-1 rounded-full text-xs',
              formStatus.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ formStatus.isValid ? 'صحيح' : `${formStatus.errorCount} خطأ` }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="handleSubmit($emit)" class="p-6 space-y-6">
      <!-- Basic Information Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span class="text-blue-600 mr-2">📋</span>
          المعلومات الأساسية
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Patient Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              المريض <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.patient_id"
              @change="validateField('patient_id')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.patient_id ? 'border-red-300' : 'border-gray-300'
              ]"
            >
              <option value="">اختر المريض</option>
              <option
                v-for="patient in patients"
                :key="patient.id"
                :value="patient.id"
              >
                {{ patient.name }} - {{ patient.age }} سنة - {{ patient.gender === 'male' ? 'ذكر' : 'أنثى' }}
              </option>
            </select>
            <p v-if="errors.patient_id" class="mt-1 text-sm text-red-600">
              {{ errors.patient_id }}
            </p>
          </div>

          <!-- Doctor Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              الطبيب المعالج <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.doctor_id"
              @change="validateField('doctor_id')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.doctor_id ? 'border-red-300' : 'border-gray-300'
              ]"
            >
              <option value="">اختر الطبيب</option>
              <option
                v-for="doctor in filteredDoctors(form.department_id)"
                :key="doctor.id"
                :value="doctor.id"
              >
                {{ doctor.name }} - {{ doctor.department }}
              </option>
            </select>
            <p v-if="errors.doctor_id" class="mt-1 text-sm text-red-600">
              {{ errors.doctor_id }}
            </p>
          </div>

          <!-- Department -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              القسم
            </label>
            <select
              v-model="form.department_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر القسم</option>
              <option
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              الأولوية <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.priority"
              @change="validateField('priority')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.priority ? 'border-red-300' : 'border-gray-300'
              ]"
            >
              <option value="">اختر الأولوية</option>
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
            <p v-if="errors.priority" class="mt-1 text-sm text-red-600">
              {{ errors.priority }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              الحالة <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.status"
              @change="validateField('status')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.status ? 'border-red-300' : 'border-gray-300'
              ]"
            >
              <option value="">اختر الحالة</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="pending">في الانتظار</option>
              <option value="cancelled">ملغي</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">
              {{ errors.status }}
            </p>
          </div>
        </div>
      </div>

      <!-- Medical Information Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span class="text-green-600 mr-2">🏥</span>
          المعلومات الطبية
        </h3>
        
        <div class="space-y-4">
          <!-- Chief Complaint -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              الشكوى الرئيسية <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.chief_complaint"
              @input="validateField('chief_complaint')"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.chief_complaint ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="اكتب الشكوى الرئيسية للمريض..."
            ></textarea>
            <p v-if="errors.chief_complaint" class="mt-1 text-sm text-red-600">
              {{ errors.chief_complaint }}
            </p>
          </div>

          <!-- Diagnosis -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              التشخيص
            </label>
            <textarea
              v-model="form.diagnosis"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب التشخيص..."
            ></textarea>
          </div>

          <!-- Treatment Plan -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              خطة العلاج
            </label>
            <textarea
              v-model="form.treatment_plan"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب خطة العلاج..."
            ></textarea>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات إضافية..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Dates Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span class="text-purple-600 mr-2">📅</span>
          التواريخ
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Examination Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الفحص <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="form.examination_date"
              @change="validateField('examination_date')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.examination_date ? 'border-red-300' : 'border-gray-300'
              ]"
            />
            <p v-if="errors.examination_date" class="mt-1 text-sm text-red-600">
              {{ errors.examination_date }}
            </p>
          </div>

          <!-- Follow-up Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              موعد المتابعة
            </label>
            <input
              type="date"
              v-model="form.follow_up_date"
              @change="validateField('follow_up_date')"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.follow_up_date ? 'border-red-300' : 'border-gray-300'
              ]"
            />
            <p v-if="errors.follow_up_date" class="mt-1 text-sm text-red-600">
              {{ errors.follow_up_date }}
            </p>
          </div>
        </div>
      </div>

      <!-- Diagnoses Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <span class="text-orange-600 mr-2">🔍</span>
            التشخيصات
          </h3>
          <button
            type="button"
            @click="addDiagnosis"
            class="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors duration-200"
          >
            + إضافة تشخيص
          </button>
        </div>
        
        <div v-if="form.diagnoses && form.diagnoses.length > 0" class="space-y-3">
          <div
            v-for="(diagnosis, index) in form.diagnoses"
            :key="index"
            class="bg-white p-3 rounded-md border border-gray-200"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  v-model="diagnosis.name"
                  placeholder="اسم التشخيص"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  v-model="diagnosis.severity"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">خفيف</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="critical">حرج</option>
                </select>
                <input
                  v-model="diagnosis.icd_code"
                  placeholder="رمز ICD"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  v-model="diagnosis.description"
                  placeholder="وصف التشخيص"
                  rows="2"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="button"
                @click="removeDiagnosis(index)"
                class="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-6 text-gray-500">
          لا توجد تشخيصات مضافة
        </div>
      </div>

      <!-- Prescriptions Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <span class="text-green-600 mr-2">💊</span>
            الوصفات الطبية
          </h3>
          <button
            type="button"
            @click="addPrescription"
            class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            + إضافة وصفة
          </button>
        </div>
        
        <div v-if="form.prescriptions && form.prescriptions.length > 0" class="space-y-3">
          <div
            v-for="(prescription, index) in form.prescriptions"
            :key="index"
            class="bg-white p-3 rounded-md border border-gray-200"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  v-model="prescription.medication"
                  placeholder="اسم الدواء"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  v-model="prescription.dosage"
                  placeholder="الجرعة"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  v-model="prescription.frequency"
                  placeholder="التكرار"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  v-model="prescription.duration"
                  placeholder="المدة"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  v-model="prescription.instructions"
                  placeholder="تعليمات خاصة"
                  rows="2"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                ></textarea>
              </div>
              <button
                type="button"
                @click="removePrescription(index)"
                class="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-6 text-gray-500">
          لا توجد وصفات مضافة
        </div>
      </div>

      <!-- Medical Tests Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <span class="text-blue-600 mr-2">🔬</span>
            الفحوصات الطبية
          </h3>
          <button
            type="button"
            @click="addMedicalTest"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            + إضافة فحص
          </button>
        </div>
        
        <div v-if="form.medical_tests && form.medical_tests.length > 0" class="space-y-3">
          <div
            v-for="(test, index) in form.medical_tests"
            :key="index"
            class="bg-white p-3 rounded-md border border-gray-200"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  v-model="test.test_name"
                  placeholder="اسم الفحص"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  v-model="test.test_type"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">نوع الفحص</option>
                  <option value="blood">فحص دم</option>
                  <option value="urine">فحص بول</option>
                  <option value="xray">أشعة سينية</option>
                  <option value="ultrasound">أشعة فوق صوتية</option>
                  <option value="other">أخرى</option>
                </select>
                <select
                  v-model="test.status"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">في الانتظار</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
                <textarea
                  v-model="test.notes"
                  placeholder="ملاحظات"
                  rows="2"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="button"
                @click="removeMedicalTest(index)"
                class="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-6 text-gray-500">
          لا توجد فحوصات مضافة
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            إعادة تعيين
          </button>
          
          <button
            v-if="isEditing"
            type="button"
            @click="cancelEdit"
            class="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            إلغاء التعديل
          </button>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="isSubmitting || !formStatus.isValid"
            :class="[
              'px-6 py-2 text-white font-medium rounded-md transition-colors duration-200',
              isSubmitting || !formStatus.isValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            ]"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <span class="animate-spin">⏳</span>
              جاري الحفظ...
            </span>
            <span v-else>
              {{ isEditing ? 'تحديث السجل' : 'حفظ السجل' }}
            </span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { computed } from 'vue'
import { MedicalRecordFormManager } from '@/scripts/medical-records/medicalRecordFormManager'

export default {
  name: 'MedicalRecordForm',
  props: {
    record: {
      type: Object,
      default: null
    },
    patients: {
      type: Array,
      default: () => []
    },
    doctors: {
      type: Array,
      default: () => []
    },
    departments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const manager = new MedicalRecordFormManager()
    const formData = manager.initializeForm(props.record, props.patients, props.doctors, props.departments)
    
    // Computed properties
    const isEditing = computed(() => !!props.record)
    const formStatus = computed(() => manager.getFormStatus())
    
    return {
      ...formData,
      isEditing,
      formStatus
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/medical-records/medicalRecordForm.css';

/* Custom form styling */
.form-section {
  @apply bg-gray-50 rounded-lg p-4;
}

.form-section h3 {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

/* Input focus states */
input:focus,
select:focus,
textarea:focus {
  @apply ring-2 ring-blue-500 border-blue-500;
}

/* Button hover effects */
button:hover:not(:disabled) {
  @apply transform transition-all duration-200;
}

/* Form validation styles */
.error-input {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}

.success-input {
  @apply border-green-300 focus:ring-green-500 focus:border-green-500;
}
</style>
