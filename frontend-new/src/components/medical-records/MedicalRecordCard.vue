<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Header with patient info and status -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ record.patient?.name || 'مريض غير محدد' }}
          </h3>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span v-if="record.patient?.age">
              العمر: {{ record.patient.age }} سنة
            </span>
            <span v-if="record.patient?.gender">
              {{ getGenderText(record.patient.gender) }}
            </span>
            <span v-if="record.patient?.phone">
              {{ record.patient.phone }}
            </span>
          </div>
        </div>
        
        <!-- Status badge -->
        <div class="flex flex-col items-end gap-2">
          <span 
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium',
              getStatusColor(record.status)
            ]"
          >
            {{ getStatusText(record.status) }}
          </span>
          
          <!-- Priority indicator -->
          <div 
            v-if="record.priority"
            :class="[
              'px-2 py-1 rounded text-xs font-medium',
              getPriorityInfo(record.priority).bgColor,
              getPriorityInfo(record.priority).color
            ]"
          >
            {{ getPriorityInfo(record.priority).icon }} {{ getPriorityInfo(record.priority).text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts section -->
    <div v-if="getRecordAlerts(record).length > 0" class="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
      <div class="flex items-center gap-2">
        <span class="text-yellow-600">⚠️</span>
        <span class="text-sm text-yellow-800 font-medium">
          {{ getRecordAlerts(record)[0].text }}
        </span>
        <span v-if="getRecordAlerts(record).length > 1" class="text-xs text-yellow-600">
          +{{ getRecordAlerts(record).length - 1 }} تنبيهات أخرى
        </span>
      </div>
    </div>

    <!-- Main content -->
    <div class="p-4">
      <!-- Chief complaint -->
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">الشكوى الرئيسية:</h4>
        <p class="text-gray-900 text-sm leading-relaxed">
          {{ truncateText(record.chief_complaint || 'غير محدد', 120) }}
        </p>
      </div>

      <!-- Diagnosis and treatment -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">التشخيص:</h4>
          <p class="text-gray-900 text-sm leading-relaxed">
            {{ truncateText(record.diagnosis || 'غير محدد', 80) }}
          </p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">خطة العلاج:</h4>
          <p class="text-gray-900 text-sm leading-relaxed">
            {{ truncateText(record.treatment_plan || 'غير محدد', 80) }}
          </p>
        </div>
      </div>

      <!-- Doctor and department -->
      <div class="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 text-lg">👨‍⚕️</span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">
            {{ record.doctor?.name || 'طبيب غير محدد' }}
          </p>
          <p v-if="record.doctor?.department" class="text-xs text-gray-600">
            {{ record.doctor.department }}
          </p>
        </div>
      </div>

      <!-- Dates and follow-up -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">تاريخ الفحص:</h4>
          <p class="text-gray-900 text-sm">
            {{ record.examination_date ? formatDate(record.examination_date) : 'غير محدد' }}
          </p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">موعد المتابعة:</h4>
          <p 
            v-if="record.follow_up_date"
            :class="['text-sm', getFollowUpClass(record.follow_up_date)]"
          >
            {{ formatDate(record.follow_up_date) }}
            <span v-if="isOverdue(record.follow_up_date)" class="text-red-600 font-medium">
              (متأخر)
            </span>
          </p>
          <p v-else class="text-gray-500 text-sm">لا يوجد موعد متابعة</p>
        </div>
      </div>

      <!-- Record statistics -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="text-lg font-semibold text-blue-600">
            {{ record.diagnoses?.length || 0 }}
          </div>
          <div class="text-xs text-gray-600">تشخيص</div>
        </div>
        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="text-lg font-semibold text-green-600">
            {{ record.prescriptions?.length || 0 }}
          </div>
          <div class="text-xs text-gray-600">وصفة</div>
        </div>
        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="text-lg font-semibold text-purple-600">
            {{ record.medical_tests?.length || 0 }}
          </div>
          <div class="text-xs text-gray-600">فحص</div>
        </div>
        <div class="text-center p-2 bg-gray-50 rounded">
          <div class="text-lg font-semibold text-orange-600">
            {{ record.attachments?.length || 0 }}
          </div>
          <div class="text-xs text-gray-600">مرفق</div>
        </div>
      </div>
    </div>

    <!-- Footer with actions -->
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <!-- Last updated -->
        <div class="text-xs text-gray-500">
          آخر تحديث: {{ record.updated_at ? formatDate(record.updated_at) : 'غير محدد' }}
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="$emit('view', record)"
            class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
          >
            👁️ عرض
          </button>
          
          <button
            v-if="canEdit"
            @click="$emit('edit', record)"
            class="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200"
          >
            ✏️ تعديل
          </button>
          
          <button
            v-if="canDelete"
            @click="confirmDelete"
            class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
          >
            🗑️ حذف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MedicalRecordCardManager } from '@/scripts/medical-records/medicalRecordCardManager'
import { formatDate, isOverdue, getStatusColor } from '@/utils/medicalHelpers'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MedicalRecordCard',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'delete'],
  setup(props, { emit }) {
    const manager = new MedicalRecordCardManager()
    const authStore = useAuthStore()
    
    const methods = manager.getMethods(props, emit, authStore)
    
    return {
      ...methods,
      formatDate,
      isOverdue,
      getStatusColor,
      getPriorityInfo: manager.getPriorityInfo.bind(manager),
      getRecordAlerts: manager.getRecordAlerts.bind(manager)
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/medical-records/medicalRecordCard.css';

/* Custom scrollbar for long text */
.text-overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Transition effects */
.transition-shadow {
  transition: box-shadow 0.3s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>
