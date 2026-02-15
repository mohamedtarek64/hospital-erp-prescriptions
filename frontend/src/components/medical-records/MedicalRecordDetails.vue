<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            السجل الطبي - {{ record.patient?.name || 'مريض غير محدد' }}
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            رقم السجل: {{ record.id }} | تاريخ الإنشاء: {{ formatDate(record.created_at) }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            @click="handlePrint"
            :disabled="isPrinting"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <span v-if="isPrinting" class="animate-spin">⏳</span>
            <span v-else>🖨️</span>
            {{ isPrinting ? 'جاري الطباعة...' : 'طباعة' }}
          </button>
          
          <button
            @click="handleExport('pdf')"
            :disabled="isExporting"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <span v-if="isExporting" class="animate-spin">⏳</span>
            <span v-else>📄</span>
            {{ isExporting ? 'جاري التصدير...' : 'تصدير PDF' }}
          </button>
          
          <button
            v-if="canEdit"
            @click="handleEdit(record)"
            class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            ✏️ تعديل
          </button>
          
          <button
            v-if="canDelete"
            @click="confirmDelete"
            class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
          >
            🗑️ حذف
          </button>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div v-if="getRecordAlerts(record).length > 0" class="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
      <div class="flex items-center gap-3">
        <span class="text-yellow-600 text-lg">⚠️</span>
        <div class="flex-1">
          <div v-for="alert in getRecordAlerts(record)" :key="alert.type" class="text-sm text-yellow-800">
            {{ alert.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Status and Priority Bar -->
    <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Status -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">الحالة:</span>
            <span 
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                getStatusColor(record.status)
              ]"
            >
              {{ getStatusText(record.status) }}
            </span>
          </div>
          
          <!-- Priority -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">الأولوية:</span>
            <span 
              :class="[
                'px-2 py-1 rounded text-xs font-medium',
                getPriorityColor(record.priority)
              ]"
            >
              {{ getPriorityText(record.priority) }}
            </span>
          </div>
          
          <!-- Follow-up Status -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">المتابعة:</span>
            <span 
              :class="[
                'px-2 py-1 rounded text-xs font-medium',
                getFollowUpStatus(record.follow_up_date).color,
                getFollowUpStatus(record.follow_up_date).bgColor
              ]"
            >
              {{ getFollowUpStatus(record.follow_up_date).icon }} {{ getFollowUpStatus(record.follow_up_date).text }}
            </span>
          </div>
        </div>
        
        <!-- Record ID and Dates -->
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>رقم السجل: <span class="font-medium">{{ record.id }}</span></span>
          <span>تاريخ الفحص: <span class="font-medium">{{ formatDate(record.examination_date) }}</span></span>
          <span v-if="record.follow_up_date">موعد المتابعة: <span class="font-medium">{{ formatDate(record.follow_up_date) }}</span></span>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8 px-6" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <span class="flex items-center gap-2">
            {{ tab.icon }} {{ tab.name }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Patient and Doctor Info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Patient Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="text-blue-600 mr-2">👤</span>
              معلومات المريض
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">الاسم:</span>
                <span class="font-medium">{{ getPatientInfo(record)?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">العمر:</span>
                <span class="font-medium">{{ getPatientInfo(record)?.age }} سنة</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">الجنس:</span>
                <span class="font-medium">{{ getGenderText(getPatientInfo(record)?.gender) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">الهاتف:</span>
                <span class="font-medium">{{ getPatientInfo(record)?.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">البريد الإلكتروني:</span>
                <span class="font-medium">{{ getPatientInfo(record)?.email || 'غير محدد' }}</span>
              </div>
            </div>
          </div>

          <!-- Doctor Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="text-green-600 mr-2">👨‍⚕️</span>
              معلومات الطبيب
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">الاسم:</span>
                <span class="font-medium">{{ getDoctorInfo(record)?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">القسم:</span>
                <span class="font-medium">{{ getDoctorInfo(record)?.department }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">التخصص:</span>
                <span class="font-medium">{{ getDoctorInfo(record)?.specialization || 'غير محدد' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">الهاتف:</span>
                <span class="font-medium">{{ getDoctorInfo(record)?.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">البريد الإلكتروني:</span>
                <span class="font-medium">{{ getDoctorInfo(record)?.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Information -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span class="text-purple-600 mr-2">🏥</span>
            المعلومات الطبية
          </h3>
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">الشكوى الرئيسية:</h4>
              <p class="text-gray-900 bg-white p-3 rounded-md border">
                {{ record.chief_complaint || 'غير محدد' }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">التشخيص:</h4>
              <p class="text-gray-900 bg-white p-3 rounded-md border">
                {{ record.diagnosis || 'غير محدد' }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">خطة العلاج:</h4>
              <p class="text-gray-900 bg-white p-3 rounded-md border">
                {{ record.treatment_plan || 'غير محدد' }}
              </p>
            </div>
            <div v-if="record.notes">
              <h4 class="text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية:</h4>
              <p class="text-gray-900 bg-white p-3 rounded-md border">
                {{ record.notes }}
              </p>
            </div>
          </div>
        </div>

        <!-- Record Statistics -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span class="text-orange-600 mr-2">📊</span>
            إحصائيات السجل
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-2xl font-bold text-blue-600">{{ getRecordStats(record).diagnoses }}</div>
              <div class="text-sm text-gray-600">التشخيصات</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-2xl font-bold text-green-600">{{ getRecordStats(record).prescriptions }}</div>
              <div class="text-sm text-gray-600">الوصفات</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-2xl font-bold text-purple-600">{{ getRecordStats(record).tests }}</div>
              <div class="text-sm text-gray-600">الفحوصات</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-2xl font-bold text-orange-600">{{ getRecordStats(record).attachments }}</div>
              <div class="text-sm text-gray-600">المرفقات</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Diagnoses Tab -->
      <div v-if="activeTab === 'diagnoses'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">التشخيصات</h3>
          <span class="text-sm text-gray-600">{{ getDiagnosesInfo(record).length }} تشخيص</span>
        </div>
        
        <div v-if="getDiagnosesInfo(record).length > 0" class="space-y-4">
          <div
            v-for="diagnosis in getDiagnosesInfo(record)"
            :key="diagnosis.id"
            class="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h4 class="text-lg font-medium text-gray-900">{{ diagnosis.name }}</h4>
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getSeverityColor(diagnosis.severity)
                    ]"
                  >
                    {{ getSeverityText(diagnosis.severity) }}
                  </span>
                </div>
                <p v-if="diagnosis.description" class="text-gray-700 mb-2">{{ diagnosis.description }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span v-if="diagnosis.icdCode">رمز ICD: {{ diagnosis.icdCode }}</span>
                  <span v-if="diagnosis.date">التاريخ: {{ formatDate(diagnosis.date) }}</span>
                  <span v-if="diagnosis.confirmed" class="text-green-600">✓ مؤكد</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          لا توجد تشخيصات مسجلة
        </div>
      </div>

      <!-- Prescriptions Tab -->
      <div v-if="activeTab === 'prescriptions'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">الوصفات الطبية</h3>
          <span class="text-sm text-gray-600">{{ getPrescriptionsInfo(record).length }} وصفة</span>
        </div>
        
        <div v-if="getPrescriptionsInfo(record).length > 0" class="space-y-4">
          <div
            v-for="prescription in getPrescriptionsInfo(record)"
            :key="prescription.id"
            class="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h4 class="text-lg font-medium text-gray-900">{{ prescription.medication }}</h4>
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getPrescriptionStatusColor(prescription.status)
                    ]"
                  >
                    {{ getPrescriptionStatusText(prescription.status) }}
                  </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                  <div>الجرعة: <span class="font-medium">{{ prescription.dosage }}</span></div>
                  <div>التكرار: <span class="font-medium">{{ prescription.frequency }}</span></div>
                  <div>المدة: <span class="font-medium">{{ prescription.duration }}</span></div>
                  <div>المرات: <span class="font-medium">{{ prescription.refills }}</span></div>
                </div>
                <p v-if="prescription.instructions" class="text-gray-700">{{ prescription.instructions }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span v-if="prescription.startDate">تاريخ البداية: {{ formatDate(prescription.startDate) }}</span>
                  <span v-if="prescription.endDate">تاريخ الانتهاء: {{ formatDate(prescription.endDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          لا توجد وصفات طبية مسجلة
        </div>
      </div>

      <!-- Medical Tests Tab -->
      <div v-if="activeTab === 'tests'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">الفحوصات الطبية</h3>
          <span class="text-sm text-gray-600">{{ getMedicalTestsInfo(record).length }} فحص</span>
        </div>
        
        <div v-if="getMedicalTestsInfo(record).length > 0" class="space-y-4">
          <div
            v-for="test in getMedicalTestsInfo(record)"
            :key="test.id"
            class="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h4 class="text-lg font-medium text-gray-900">{{ test.name }}</h4>
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getTestStatusColor(test.status)
                    ]"
                  >
                    {{ getTestStatusText(test.status) }}
                  </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                  <div>النوع: <span class="font-medium">{{ test.type }}</span></div>
                  <div v-if="test.lab">المختبر: <span class="font-medium">{{ test.lab }}</span></div>
                  <div v-if="test.cost">التكلفة: <span class="font-medium">{{ test.cost }}</span></div>
                </div>
                <p v-if="test.notes" class="text-gray-700 mb-2">{{ test.notes }}</p>
                <div v-if="test.results" class="bg-gray-50 p-3 rounded-md">
                  <h5 class="font-medium text-gray-900 mb-1">النتائج:</h5>
                  <p class="text-gray-700">{{ test.results }}</p>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span v-if="test.orderedDate">تاريخ الطلب: {{ formatDate(test.orderedDate) }}</span>
                  <span v-if="test.completedDate">تاريخ الإكمال: {{ formatDate(test.completedDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          لا توجد فحوصات طبية مسجلة
        </div>
      </div>

      <!-- Timeline Tab -->
      <div v-if="activeTab === 'timeline'" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">الجدول الزمني</h3>
        
        <div v-if="getTimelineEvents(record).length > 0" class="space-y-4">
          <div
            v-for="event in getTimelineEvents(record)"
            :key="`${event.type}-${event.date}`"
            class="flex items-start gap-4"
          >
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-lg',
                event.bgColor
              ]"
            >
              {{ event.icon }}
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
              <p class="text-sm text-gray-600">{{ event.description }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(event.date) }}</p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          لا توجد أحداث مسجلة
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MedicalRecordDetailsManager } from '@/scripts/medical-records/medicalRecordDetailsManager'
import { 
  tabs,
  getSeverityColor,
  getSeverityText,
  getPrescriptionStatusColor,
  getPrescriptionStatusText,
  getTestStatusColor,
  getTestStatusText,
  getPriorityColor,
  formatDate,
  getStatusColor
} from '@/scripts/medical-records/medicalRecordDetailsUtils'

export default {
  name: 'MedicalRecordDetails',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete', 'export'],
  setup(props, { emit }) {
    const manager = new MedicalRecordDetailsManager()
    // const authStore = useAuthStore()
    
    const methods = manager.getMethods(props, emit, null)
    
    return {
      ...methods,
      tabs,
      formatDate,
      getStatusColor,
      getSeverityColor,
      getSeverityText,
      getPrescriptionStatusColor,
      getPrescriptionStatusText,
      getTestStatusColor,
      getTestStatusText,
      getPriorityColor
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/medical-records/medicalRecordDetails.css';
</style>
